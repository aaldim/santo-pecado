"use client";

import { ProductImage, QuantitySelector } from "@/components";
import { useCartStore } from "@/store";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { currencyFormat } from '../../../../utils/currencyFormat';

export const ProductsInCart = () => {
  const removeProductFromCart = useCartStore((state) => state.removeProduct);
  const updateProductQuantity = useCartStore(
    (state) => state.updateProductQuantity
  );
  const productsInCart = useCartStore((state) => state.cart);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    setLoaded(true);
  }, []);

  if (!loaded) {
    return <p>Loading...</p>;
  }
  return (
    <>
      {productsInCart.map((product) => (
        <div key={`${product.slug}-${product.size}`} className="flex mb-5">
          <ProductImage
            src={product.image}
            width={100}
            height={100}
            style={{
              width: "100px",
              height: "100px",
            }}
            alt={product.title}
            className="mr-5 rounded"
          />

          <div>
            <Link
              className="hover:underline cursor-pointer"
              href={`/product/${product.slug}`}
            >
              {product.size} - {product.title}
            </Link>
            <p>{currencyFormat(product.price)}</p>
            <QuantitySelector
              quantity={ product.quantity }
              onQuantityChanged={(quantity) => updateProductQuantity(product, quantity)}
            />
            <button 
            onClick={ () => removeProductFromCart(product) }
            className="underline mt-3">Remover</button>
          </div>
        </div>
      ))}
    </>
  );
};
