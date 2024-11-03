// components/DeleteButton.tsx
"use client";

import { deleteProduct } from "@/actions";

interface DeleteButtonProps {
  productId: string;
}

export default function DeleteButton({ productId }: DeleteButtonProps) {
  const handleDelete = async () => {
    await deleteProduct(productId);
    // Puedes agregar lógica para actualizar la interfaz después de eliminar el producto
  };

  return (
    <button onClick={handleDelete} className="btn-danger rounded">
      Eliminar
    </button>
  );
}
