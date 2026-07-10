"use client";
import { useParams } from "next/navigation";
import { useFetchOrder } from "@/modules/orders/hooks/useFetchOrders";
import Badge from "@/shared/components/ui/badge/Badge";
import dayjs from "dayjs";

function formatPrice(price: number): string {
  return `৳ ${(price / 100).toLocaleString()}`;
}

const statusColor: Record<string, "warning" | "success" | "error"> = {
  PENDING: "warning",
  PAID: "success",
  CANCELED: "error",
};

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;
  const { data: order, isLoading } = useFetchOrder(orderId);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400">
        Order not found
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
          Order #{order.id?.slice(0, 8)}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Order details and status
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <h3 className="mb-3 text-sm font-medium text-gray-500 dark:text-gray-400">
            User
          </h3>
          <p className="text-sm font-medium text-gray-800 dark:text-white/90">
            {order.userId}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <h3 className="mb-3 text-sm font-medium text-gray-500 dark:text-gray-400">
            Status
          </h3>
          <div className="flex items-center gap-2">
            <Badge color={statusColor[order.status] ?? "light"}>
              {order.status?.toLowerCase()}
            </Badge>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <h3 className="mb-3 text-sm font-medium text-gray-500 dark:text-gray-400">
            Date
          </h3>
          <p className="text-sm text-gray-800 dark:text-white/90">
            {dayjs(order.createdAt).format("MMMM D, YYYY h:mm A")}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
        <h3 className="mb-4 text-base font-semibold text-gray-800 dark:text-white/90">
          Order Items
        </h3>
        <div className="space-y-3">
          {(order.items ?? []).map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-lg border border-gray-100 p-3 dark:border-gray-800"
            >
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {item.productId}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Qty: {item.quantity}
                </p>
              </div>
              <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                {formatPrice(item.subtotal ?? item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-800">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Total
          </span>
          <span className="text-lg font-semibold text-gray-800 dark:text-white/90">
            {formatPrice(order.totalAmount ?? 0)}
          </span>
        </div>
      </div>
    </div>
  );
}
