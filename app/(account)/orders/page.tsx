"use client";
import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Pagination } from "antd";
import dayjs from "dayjs";
import { accountApi } from "@/lib/api/account";
import { formatPrice } from "@/shared/utils/formatPrice";
import Badge from "@/shared/components/ui/badge/Badge";
import BoxIcon from "@/shared/icons/BoxIcon";

const statusColor: Record<string, "warning" | "success" | "error"> = {
  pending: "warning",
  paid: "success",
  canceled: "error",
};

const statusOptions = [
  { value: "", label: "All Status" },
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "canceled", label: "Canceled" },
];

export default function AccountOrdersPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["account-orders", { page, status }],
    queryFn: () =>
      accountApi.getMyOrders({
        page,
        limit: 10,
        status: status || undefined,
      }),
  });

  const orders: any[] = (data as any)?.items ?? [];
  const total: number = (data as any)?.total ?? 0;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            My Orders
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {total} total orders
          </p>
        </div>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/20 dark:focus:border-brand-800 h-10 rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-sm text-gray-800 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
        {isLoading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-10 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800"
              />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="py-20 text-center">
            <div className="flex justify-center mb-4 text-gray-300 dark:text-gray-600">
              <BoxIcon />
            </div>
            <p className="text-sm font-semibold text-gray-800 dark:text-white/90">
              No orders yet
            </p>
            <Link
              href="/shop"
              className="mt-4 inline-block rounded-lg bg-brand-500 px-5 py-2 text-sm font-medium text-white hover:bg-brand-600"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800 text-left text-xs text-gray-500 dark:text-gray-400">
                  <th className="px-5 py-3 font-medium">Order ID</th>
                  <th className="px-5 py-3 font-medium">Items</th>
                  <th className="px-5 py-3 font-medium">Total</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-5 py-4 font-mono text-xs text-gray-500 dark:text-gray-400">
                      {order.shortId ?? order.id?.slice(0, 8)}...
                    </td>
                    <td className="px-5 py-4 text-gray-600 dark:text-gray-300">
                      {order.items?.length ?? 0}
                    </td>
                    <td className="px-5 py-4 font-medium text-gray-800 dark:text-white/90">
                      {formatPrice(order.total)}
                    </td>
                    <td className="px-5 py-4">
                      <Badge color={statusColor[order.status] ?? "light"}>
                        {order.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-gray-500 dark:text-gray-400">
                      {dayjs(order.createdAt).format("DD MMM YYYY")}
                    </td>
                    <td className="px-5 py-4">
                      <Link
                        href={`/account/orders/${order.id}`}
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
        )}
      </div>

      {total > 10 && (
        <div className="flex justify-center">
          <Pagination
            current={page}
            total={total}
            pageSize={10}
            onChange={setPage}
            showSizeChanger={false}
          />
        </div>
      )}
    </div>
  );
}
