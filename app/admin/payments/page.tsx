"use client";
import PaymentsLayout from "@/modules/payments/components/PaymentsLayout";
import { PaymentsProvider } from "@/modules/payments/contexts/PaymentsContext";

export default function PaymentsPage() {
  return (
    <PaymentsProvider>
      <PaymentsLayout />
    </PaymentsProvider>
  );
}
