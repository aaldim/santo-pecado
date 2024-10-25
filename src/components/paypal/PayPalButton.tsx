"use client";
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import {
  CreateOrderData,
  CreateOrderActions,
  OnApproveData,
  OnApproveActions,
} from "@paypal/paypal-js";
import { paypalCheckPayment, setTransactionId } from "@/actions";

interface Props {
  orderId: string;
  amount: number;
}

export const PayPalButton = ({ orderId, amount }: Props) => {
  const [{ isPending }] = usePayPalScriptReducer();

  const roundedAmount = Math.round(amount * 100) / 100;

  if (isPending) {
    return (
      <div className="animate-pulse">
        <div className="h-12 bg-gray-500 rounded" />
        <div className="h-12 bg-gray-500 rounded mt-3" />
      </div>
    );
  }

  const createOrder = async (
    data: CreateOrderData,
    actions: CreateOrderActions
  ): Promise<string> => {
    // Crear la orden en PayPal
    const transactionId = await actions.order.create({
      purchase_units: [
        {
          invoice_id: "a87337e0-bb40-4467-b894-1d9900793595",
          amount: {
            currency_code: "USD",
            value: roundedAmount.toString(),
          },
        },
      ],
      intent: "CAPTURE",
    });

    // Guardar el id de la transacción en la base de datos
    const { ok } = await setTransactionId(orderId, transactionId);
    if (!ok) {
      throw new Error("Error al guardar el id de transacción");
    }

    return transactionId;
  };

  const onApprove = async (data: OnApproveData, actions: OnApproveActions) => {
    console.log("onApprove");

    // Captura la orden
    const details = await actions.order?.capture();
    if (!details) return;

    // Verifica el pago
    await paypalCheckPayment(details.id);
  };

  return (
    <div className="relative z-0">
      <PayPalButtons createOrder={createOrder} onApprove={onApprove} />
    </div>
  );
};
