"use server";

import { auth } from "@/auth.config";
import prisma from "@/lib/prisma";

export const getOrderById = async (orderId: string) => {
  const session = await auth();
  if (!session) {
    return {
      ok: false,
      message: "Debe estar autenticado para realizar esta acción",
    };
  }
  try {
    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
      include: {
        OrderAddress: true,
        OrderItem: {
          select: {
            price: true,
            quantity: true,
            size: true,
            product: {
              select: {
                title: true,
                slug: true,
                ProductImage: {
                  select: {
                    url: true,
                  },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });

    if (!order) throw new Error("Order not found");

    if (session.user.role === "user") {
      if (order.userId !== session.user.id) {
        return {
          ok: false,
          message: "No tiene permisos para ver esta orden",
        };
      }
    }

    // const OrderItemsPromises = order?.OrderItem.map(async (item) => {
    //   const product = await prisma.product.findFirst({
    //     where: {
    //       id: item.productId,
    //     },
    //     include: {
    //       ProductImage: true,
    //     },
    //   });
    //   console.log({ product });
    //   const productWithFirstImage = {
    //     ...product, // Tomamos el primer producto (si hay más de uno)
    //     ProductImage: product?.ProductImage[0].url || null, // Tomamos el primer ProductImage, o null si no hay
    //   };
    //   console.log({ productWithFirstImage });

    //   return productWithFirstImage;
    // });

    // const OrderItems = await Promise.all(OrderItemsPromises);

    // return {
    //   ok: true,
    //   order: {
    //     ...order,
    //     OrderItem: OrderItems,
    //   },
    // };
    return {
      ok: true,
      order,
    };
  } catch (error) {
    console.error(error);
    return {
      ok: false,
      error: "No se pudo obtener la orden",
    };
  }
};
