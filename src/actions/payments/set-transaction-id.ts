"use server";

import { auth } from "@/auth.config";
import prisma from "@/lib/prisma";

export const setTransactionId = async (id: string, transactionId: string) => {
  const session = await auth();
  if (!session?.user) {
    return {
      ok: false,
      message: "Not authenticated",
    };
  }

  try {
    const order = await prisma.order.update({
      where: {
        id,
      },
      data: {
        transactionId,
      },
    });
    if (!order) {
      return {
        ok: false,
        message: "No se encontro la transaccion con el id " + id,
      };
    }

    return {
      ok: true,
    };
  } catch (error) {
    return {
      ok: false,
      message: "No se pudo actualizar la transaccion con el id " + id,
    };
  }
};
