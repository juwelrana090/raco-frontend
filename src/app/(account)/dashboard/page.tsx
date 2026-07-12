"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { accountApi } from "@/lib/api/account";
import { useAuthStore } from "@/lib/auth/authStore";
import { formatPrice } from "@/shared/utils/formatPrice";
import Badge from "@/shared/components/ui/badge/Badge";

const statusColor: Record<string, "warning" | "success" | "error"> = {
  PENDING: "warning",
  PAID: "success",
  CANCELED: "error",
};

export default function AccountDashboardPage() {
  const { user } = useAuthStore();

  const { data: allOrdersData } = useQuery({
    queryKey: ["account-orders-total"],
    queryFn: () => accountApi.getMyOrders({ limit: 1 }),
  });

  const { data: recentOrdersData, isLoading: recentLoading } = useQuery({
    queryKey: ["account-orders-recent"],
    queryFn: () => accountApi.getMyOrders({ limit: 5 }),
  });

  const { data: pendingData } = useQuery({
    queryKey: ["account-orders-pending"],
    queryFn: () => accountApi.getMyOrders({ status: "PENDING", limit: 1 }),
  });

  const allOrders = Array.isArray(allOrdersData)
    ? allOrdersData
    : [];
  const pendingOrdersList = Array.isArray(pendingData)
    ? pendingData
    : [];
  const recentOrders = Array.isArray(recentOrdersData)
    ? recentOrdersData
    : [];

  const totalOrders = allOrders.length;
  const pendingOrders = pendingOrdersList.length;

  const totalSpent = recentOrders
    .filter((o) => o.status === "PAID")
    .reduce((sum, o) => sum + (o.totalAmount ?? 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">
          Welcome back, {user?.name ?? "there"}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Manage your orders and account settings
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Total Orders
          </p>
          <p className="mt-2 text-3xl font-bold text-gray-800 dark:text-white/90">
            {totalOrders}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Total Spent
          </p>
          <p className="mt-2 text-3xl font-bold text-gray-800 dark:text-white/90">
            {formatPrice(totalSpent)}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Pending Orders
          </p>
          <p className="mt-2 text-3xl font-bold text-gray-800 dark:text-white/90">
            {pendingOrders}
          </p>
        </div>
      </div>

      {/* Recent orders */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
        <h3 className="text-base font-semibold text-gray-800 dark:text-white/90 mb-4">
          Recent Orders
        </h3>
        {recentLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-10 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800"
              />
            ))}
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No orders yet.
            </p>
            <Link
              href="/shop"
              className="mt-3 inline-block rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800 text-left text-xs text-gray-500 dark:text-gray-400">
                    <th className="pb-3 font-medium">Order ID</th>
                    <th className="pb-3 font-medium">Total</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="py-3 font-mono text-xs text-gray-500 dark:text-gray-400">
                        #{order.id?.slice(0, 8)}
                      </td>
                      <td className="py-3 font-medium text-gray-800 dark:text-white/90">
                        {formatPrice(order.totalAmount ?? 0)}
                      </td>
                      <td className="py-3">
                        <Badge color={statusColor[order.status] ?? "light"}>
                          {order.status?.toLowerCase()}
                        </Badge>
                      </td>
                      <td className="py-3 text-gray-500 dark:text-gray-400">
                        {dayjs(order.createdAt).format("DD MMM YYYY")}
                      </td>
                      <td className="py-3">
                        <Link
                          href={`/orders/${order.id}`}
                          className="text-brand-500 hover:text-brand-600"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 text-right">
              <Link
                href="/orders"
                className="text-sm text-brand-500 hover:text-brand-600"
              >
                View all orders →
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
