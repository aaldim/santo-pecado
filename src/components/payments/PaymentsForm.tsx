"use client";

import { useSession } from "next-auth/react";
import { PayPalButton } from "../paypal/PayPalButton";
import { PaidOrder } from "@/actions";

interface Props {
  total: number;
  id: string;
}

export const PaymentsForm = ({ total, id }: Props) => {
  const { data: session } = useSession({ required: true });

  const checkPaidOrder = async (id: string) => {
    const { ok } = await PaidOrder(id);

    if (!ok) {
      alert("Error al marcar la orden como pagada");
    }
  };

  return (
    <>
      {session?.user.role === "admin" && (
        <>
          <button
            onClick={() => checkPaidOrder(id)}
            className="w-full h-12 bg-green-700 text-white rounded mt-2 mb-4 hover:bg-green-500 hover:text-black"
          >
            <span className="mx-2">Marcar como pagada</span>
          </button>
        </>
      )}
      <PayPalButton amount={total} orderId={id} />
      <div className="mt-2">
        * Si tu pago es en efectivo dirigete al mostrador para realizar tu pago
      </div>
    </>
  );
};
