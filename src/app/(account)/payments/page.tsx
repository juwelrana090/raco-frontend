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

const statusColor: Record<string, "warning" | "success" | "error" | "light"> = {
  PENDING: "warning",
  SUCCESS: "success",
  FAILED: "error",
  REFUNDED: "light",
};

const providerOptions = [
  { value: "", label: "All Providers" },
  { value: "STRIPE", label: "Stripe" },
  { value: "BKASH", label: "bKash" },
];

const statusOptions = [
  { value: "", label: "All Status" },
  { value: "PENDING", label: "Pending" },
  { value: "SUCCESS", label: "Success" },
  { value: "FAILED", label: "Failed" },
  { value: "REFUNDED", label: "Refunded" },
];

export default function AccountPaymentsPage() {
  const [page, setPage] = useState(1);
  const [provider, setProvider] = useState("");
  const [status, setStatus] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["account-payments", { page, provider, status }],
    queryFn: () =>
      accountApi.getMyPayments({
        page,
        limit: 10,
        provider: provider || undefined,
        status: status || undefined,
      }),
  });

  const payments: any[] = Array.isArray(data) ? (data as any[]) : [];
  const total: number = payments.length;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            Payment History
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {total} total payments
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={provider}
            onChange={(e) => {
              setProvider(e.target.value);
              setPage(1);
            }}
            className="shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/20 dark:focus:border-brand-800 h-10 rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-sm text-gray-800 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
          >
            {providerOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
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
        ) : payments.length === 0 ? (
          <div className="py-20 text-center">
            <div className="flex justify-center mb-4 text-gray-300 dark:text-gray-600">
              <BoxIcon />
            </div>
            <p className="text-sm font-semibold text-gray-800 dark:text-white/90">
              No payment history yet
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
                  <th className="px-5 py-3 font-medium">#</th>
                  <th className="px-5 py-3 font-medium">Transaction ID</th>
                  <th className="px-5 py-3 font-medium">Order ID</th>
                  <th className="px-5 py-3 font-medium">Provider</th>
                  <th className="px-5 py-3 font-medium">Amount</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {payments.map((payment, index) => (
                  <tr key={payment.id}>
                    <td className="px-5 py-4 text-gray-500 dark:text-gray-400">
                      {(page - 1) * 10 + index + 1}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-gray-600 dark:text-gray-300">
                          {payment.providerTxnId
                            ? `${payment.providerTxnId.slice(0, 12)}...`
                            : "—"}
                        </span>
                        <button
                          onClick={() =>
                            navigator.clipboard.writeText(
                              payment.providerTxnId ?? "",
                            )
                          }
                          className="text-gray-400 hover:text-brand-500"
                          title="Copy"
                        >
                          <svg
                            className="h-3.5 w-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <Link
                        href={`/orders/${payment.orderId}`}
                        className="font-mono text-xs text-brand-500 hover:text-brand-600"
                      >
                        {payment.orderId?.slice(0, 8)}
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <Badge
                        color={
                          payment.provider === "STRIPE" ? "primary" : "success"
                        }
                      >
                        {payment.provider?.toLowerCase()}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 font-medium text-gray-800 dark:text-white/90">
                      {formatPrice(payment.amount)}
                    </td>
                    <td className="px-5 py-4">
                      <Badge color={statusColor[payment.status] ?? "light"}>
                        {payment.status?.toLowerCase()}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-gray-500 dark:text-gray-400">
                      {dayjs(payment.createdAt).format("DD MMM YYYY")}
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
