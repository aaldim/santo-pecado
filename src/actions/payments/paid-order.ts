"use server";

import { auth } from "@/auth.config";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const PaidOrder = async (id: string) => {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
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
        isPaid: true,
        paidAt: new Date(),
      },
    });
    if (!order) {
      return {
        ok: false,
        message: "No se encontro la transaccion con el id " + id,
      };
    }

    revalidatePath(`orders/${id}`);

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
