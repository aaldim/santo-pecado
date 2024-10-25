"use server";

import { v2 as cloudinary } from "cloudinary";

import prisma from "@/lib/prisma";
import { Gender, Product, Size } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

cloudinary.config(process.env.CLOUDINARY_URL ?? "");

const productSchema = z.object({
  id: z.string().uuid().optional().nullable(),
  title: z.string().min(3).max(50),
  slug: z.string().min(3).max(255),
  description: z.string(),
  price: z.coerce
    .number()
    .min(0)
    .transform((val) => val.toFixed(2)),
  inStock: z.coerce
    .number()
    .min(0)
    .transform((val) => val.toFixed(0)),
  categoryId: z.string().uuid(),
  sizes: z.coerce.string().transform((val) => val.split(",")),
  tags: z.string(),
  gender: z.nativeEnum(Gender),
});

export const createUpdateProduct = async (formData: FormData) => {
  const data = Object.fromEntries(formData);
  const productParsed = productSchema.safeParse(data);

  if (!productParsed.success) {
    console.log(productParsed.error);
    return {
      ok: false,
    };
  }

  const product = productParsed.data;

  product.slug = product.slug.toLowerCase().replace(/ /g, "-").trim();

  const { id, ...rest } = product;

  try {
    const prismaTrx = prisma.$transaction(async (tx) => {
      let product: Product;
      const tagsArray = rest.tags
        .split(",")
        .map((tag) => tag.trim().toLowerCase());
      if (id) {
        product = await tx.product.update({
          where: {
            id,
          },
          data: {
            ...rest,
            inStock: parseInt(rest.inStock, 10),
            price: parseFloat(rest.price),
            sizes: {
              set: rest.sizes as Size[],
            },
            tags: {
              set: tagsArray,
            },
          },
        });

        console.log({ product });
      } else {
        product = await tx.product.create({
          data: {
            ...rest,
            inStock: parseInt(rest.inStock, 10),
            price: parseFloat(rest.price),
            sizes: {
              set: rest.sizes as Size[],
            },
            tags: {
              set: tagsArray,
            },
          },
        });
      }

      // Proceso de carga y guardado de imagenes
      // Recorrer las imagenes y guardarlas
      if (formData.getAll("images")) {
        // [https://url.jpg, https://url2.jpg]
        const images = await uploadImage(formData.getAll("images") as File[]);
        if (!images) {
          throw new Error("Error al subir las imagenes");
        }
        await tx.productImage.createMany({
          data: images.map((url) => ({
            url: url!,
            productId: product.id,
          })),
        });
      }

      return { product };
    });

    revalidatePath("admin/products");
    revalidatePath(`admin/product/${(await prismaTrx).product.slug}`);
    revalidatePath(`product/${(await prismaTrx).product.slug}`);

    return {
      ok: true,
      product: (await prismaTrx).product,
    };
  } catch (error) {
    return {
      ok: false,
      message: "Error al guardar el producto",
    };
  }
};

const uploadImage = async (images: File[]) => {
  try {
    const uploadPromises = images.map(async (image) => {
      try {
        const buffer = await image.arrayBuffer();
        const base64Image = Buffer.from(buffer).toString("base64");

        const uploadedImage = await cloudinary.uploader.upload(
          `data:image/jpeg;base64,${base64Image}`
        );
        return uploadedImage.secure_url;
      } catch (error) {
        console.log({ error });
        return null;
      }
    });

    const uploadedImages = await Promise.all(uploadPromises);
    return uploadedImages;
  } catch (error) {
    console.log({ error });
    return null;
  }
};
