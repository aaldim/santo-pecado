"use server";

import { auth } from "@/auth.config";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";


export const deleteProduct = async (productId: string) => {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return {
      ok: false,
      message: "Not authenticated",
    };
  }

  try {
    const deletedProduct = await prisma.product.delete({
      where: {
        id: productId,
      },
    });

    revalidatePath(`/admin/products`);
    revalidatePath(`/admin/product/${deletedProduct.slug}`);
    revalidatePath(`/product/${deletedProduct.slug}`);
  } catch (error) {
    return {
      ok: false,
      message: "Error deleting image",
    };
  }
};
