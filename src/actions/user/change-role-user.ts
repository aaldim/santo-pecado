"use server";

import { auth } from "@/auth.config";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const changeRoleUser = async (userId: string, role: string) => {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return {
      ok: false,
      message: "Not authenticated",
    };
  }

  try {
    const newRole = role === "admin" ? "admin" : "user";
    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        role: newRole,
      },
    });

    revalidatePath("/admin/users");

    return {
      ok: true,
    };
  } catch (error) {
    return {
      ok: false,
      message: "No se pudo actualizar el rol del usuario con el id " + userId,
    };
  }
};
