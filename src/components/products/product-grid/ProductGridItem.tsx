'use client'

import { Product } from "@/interfaces"
import Image from "next/image";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import { currencyFormat } from '@/utils';

interface Props {
    product: Product;
}

export const ProductGridItem = ({ product }: Props) => {
    console.log(product.images[0])

    useEffect(() => {}, [product])

    const [displayImage, setdisplayImage] = useState( product.images[0] )


  return (
    <div className="rounded-md overflow-hidden fade-in">
        <Link href={ `/product/${ product.slug }` } >
        <Image 
            src={product.images[0]}
            alt={ product.title }
            className="w-full object-cover rounded"
            width={ 500 }
            height={ 500 }
            onMouseEnter={ () => setdisplayImage(product.images[1]) }
            onMouseLeave={ () => setdisplayImage(product.images[0]) }
        />
        </Link>
        

        <div className="p-4 flex flex-col">
            <Link 
            className="hover:text-blue-600"
            href={ `/product/${ product.slug }` }>
                { product.title }
            </Link>
            <span className="font-bold">{ currencyFormat(product.price) }</span>
        </div>
    </div>
  )
}
