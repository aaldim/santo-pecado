"use server";

import prisma from "@/lib/prisma";
import { sleep } from "@/utils";

export const getStockBySlug = async (slug: string): Promise<number> => {
  try {
    const stock = await prisma.product.findUnique({
      where: {
        slug,
      },
      select: { inStock: true },
    });
    if (!stock) return 0;

    return stock.inStock ?? 0;
  } catch (error) {
    throw new Error("No se pudo cargar el stock por slug");
  }
};
