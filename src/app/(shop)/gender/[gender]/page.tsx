export const revalidate = 60; // 1 minute
import { Pagination, ProductGrid, Title } from "@/components";
import { redirect } from "next/navigation";
import { getPaginatedProductsWithImages } from "@/actions";
import { Gender } from "@prisma/client";

interface Props {
  params: {
    gender: string;
  };
  searchParams: {
    page?: string;
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { gender } = params;

  const page = searchParams.page ? parseInt(searchParams.page) : 1;

  const { products, currentPage, totalPages } =
    await getPaginatedProductsWithImages({ page, gender: gender as Gender });
  if (products.length === 0) {
    redirect(`/gender${gender}`);
  }

  const labels: Record<string, string> = {
    kid: "Barriga Llena",
    women: "Negro Sazón",
    men: "Santo Pecado",
    unisex: "para todos",
  };

  // if ( id === 'kid' ) {
  //   notFound()
  // }

  return (
    <>
      <Title
        title={`Articulos de ${labels[gender]}`}
        subtitle="Todos los productos"
        classname="mb-2"
      />
      <ProductGrid products={products} />
      <Pagination totalPages={totalPages} />
    </>
  );
}
