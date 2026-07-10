"use client";
import OrdersFilters from "./OrdersFilters";
import OrdersTable from "./OrdersTable";

export default function OrdersLayout() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
          Orders
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          View and manage customer orders
        </p>
      </div>
      <OrdersFilters />
      <OrdersTable />
    </div>
  );
}
