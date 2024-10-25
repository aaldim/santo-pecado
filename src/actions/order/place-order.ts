"use server";

import { auth } from "@/auth.config";
import { Address, Size } from "@/interfaces";
import prisma from "@/lib/prisma";

interface ProductToOrder {
  productId: string;
  quantity: number;
  size: Size;
}

export const placeOrder = async (
  productIds: ProductToOrder[],
  address: Address
) => {
  const session = await auth();
  const userId = session?.user.id;

  // 1. Verificacion de usuario
  if (!userId) {
    return {
      ok: false,
      error: "No hay sesion de usuario",
    };
  }

  // 2. Obtener informacion de usuarios
  // Nota: podemos llevar 2+ productos con el mismo ID

  const products = await prisma.product.findMany({
    where: {
      id: {
        in: productIds.map((product) => product.productId),
      },
    },
  });

  // 3. Calcular montos // encabezado
  const itemsInOrder = productIds.reduce((count, p) => count + p.quantity, 0);

  // 4. Totales de tax, subtotal y total
  const { subTotal, tax, total } = productIds.reduce(
    (totals, item) => {
      const productQuantity = item.quantity;
      const product = products.find((product) => product.id === item.productId);
      if (!product)
        throw new Error(`Producto ${item.productId} no encontrado - 500`);

      const subTotal = product.price * productQuantity;
      totals.subTotal += subTotal;
      totals.tax += subTotal * 0.12;
      totals.total += subTotal * 1.12;

      return totals;
    },
    { subTotal: 0, tax: 0, total: 0 }
  );

  try {
    const prismaTx = await prisma.$transaction(async (tx) => {
      // 1. Actualizar el stock de los productos
      const updatedProductsPromises = products.map((product) => {
        // Acumular Valores
        const productQuantity = productIds
          .filter((p) => p.productId === product.id)
          .reduce((acc, item) => acc + item.quantity, 0);

        if (productQuantity === 0)
          throw new Error(`Producto ${product.id} no tiene cantidad - 500`);

        return tx.product.update({
          where: {
            id: product.id,
          },
          data: {
            inStock: {
              decrement: productQuantity,
            },
          },
        });
      });

      const updatedProducts = await Promise.all(updatedProductsPromises);
      // Verficar valores negativos en la existencia = no hay stock
      updatedProducts.forEach((product) => {
        if (product.inStock < 0)
          throw new Error(`Producto ${product.title} no tiene stock suficiente`);
      });

      // 2. Crear la orden - Encabezado - Detalle
      const order = await tx.order.create({
        data: {
          userId,
          total,
          tax,
          subTotal,
          itemsInOrder,
          OrderItem: {
            createMany: {
              data: productIds.map((p) => ({
                quantity: p.quantity,
                size: p.size,
                productId: p.productId,
                price:
                  products.find((product) => product.id === p.productId)
                    ?.price ?? 0,
              })),
            },
          },
        },
      });
      // 3. Crear la direccion de la orden

      const orderAdress = await tx.orderAddress.create({
        data: {
          firstName: address.firstName,
          lastName: address.lastName,
          address: address.address,
          address2: address.address2,
          postalCode: address.postalCode,
          city: address.city,
          phone: address.phone,
          countryId: address.country,
          orderId: order.id,
        },
      });

      return {
        updatedProducts,
        order,
        orderAdress,
      };
    });

    return {
      ok: true,
      message: "Orden creada",
      order: prismaTx.order,
      prismaTx,
    };
  } catch (error: any) {
    return {
      ok: false,
      message: error?.message,
    };
  }
};
