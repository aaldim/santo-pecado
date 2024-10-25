"use client";
import { getStockBySlug } from "@/actions";
import { titleFont } from "@/config/fonts";
import { useEffect, useState } from "react";

interface Props {
  slug: string;
}

export const StockLabel = ({ slug }: Props) => {
  const [stock, setStock] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getStock = async () => {
      const inStock = await getStockBySlug(slug);
      setStock(inStock);
      setIsLoading(false);
    };
    getStock();
  }, [slug]); // Añadir 'slug' como dependencia

  return (
    <>
      {isLoading ? (
        <h1
          className={` ${titleFont.className} antialised font-bold bg-gray-200 text-md animate-pulse`}
        >
          &nbsp;
        </h1>
      ) : (
        <h1 className={` ${titleFont.className} antialised font-bold text-md`}>
          Stock: {stock}
        </h1>
      )}
    </>
  );
};
