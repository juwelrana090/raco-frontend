"use client";
import OrdersLayout from "./OrdersLayout";
import { OrdersProvider } from "../contexts/OrdersContext";

export default function OrdersPage() {
  return (
    <OrdersProvider>
      <OrdersLayout />
    </OrdersProvider>
  );
}
