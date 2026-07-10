"use client";
import OrdersLayout from "@/modules/orders/components/OrdersLayout";
import { OrdersProvider } from "@/modules/orders/contexts/OrdersContext";

export default function OrdersPage() {
  return (
    <OrdersProvider>
      <OrdersLayout />
    </OrdersProvider>
  );
}
