"use client";
import PaymentsFilters from "./PaymentsFilters";
import PaymentsTable from "./PaymentsTable";

export default function PaymentsLayout() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
          Payments
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          View payment transactions
        </p>
      </div>
      <PaymentsFilters />
      <PaymentsTable />
    </div>
  );
}
