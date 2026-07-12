"use client";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import Image from "next/image";
import dayjs from "dayjs";
import { accountApi } from "@/lib/api/account";
import { formatPrice } from "@/shared/utils/formatPrice";
import Badge from "@/shared/components/ui/badge/Badge";

interface IOrderProduct {
  id: string;
  name: string;
  imageUrl: string | null;
  price: number;
}

interface IOrderItem {
  id: string;
  product: IOrderProduct;
  quantity: number;
  price: number;
  subtotal: number;
}

interface IOrderDetail {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  total: number;
  createdAt: string;
  updatedAt: string;
  items: IOrderItem[];
  payment?: {
    id: string;
    amount: number;
    status: string;
    method: string;
    provider?: string;
    providerTxnId?: string;
  };
  payments?: Array<{
    id: string;
    amount: number;
    status: string;
    method: string;
    provider?: string;
    providerTxnId?: string;
  }>;
}

const statusColor: Record<string, "warning" | "success" | "error"> = {
  PENDING: "warning",
  PAID: "success",
  CANCELED: "error",
};

const paymentStatusColor: Record<string, "warning" | "success" | "error"> = {
  PENDING: "warning",
  SUCCESS: "success",
  FAILED: "error",
};

export default function AccountOrderDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const { data: order, isLoading } = useQuery({
    queryKey: ["account-order", id],
    queryFn: () => accountApi.getMyOrder(id),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="space-y-5">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-40 animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-800"
          />
        ))}
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20 text-gray-500 dark:text-gray-400">
        Order not found.
      </div>
    );
  }

  const o = order as IOrderDetail;
  const payment = o.payment ?? o.payments?.[0];

  return (
    <div className="space-y-5">
      <Link
        href="/orders"
        className="text-sm text-brand-500 hover:text-brand-600"
      >
        ← Back to Orders
      </Link>

      {/* Card 1 — Order Info */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
        <h3 className="mb-4 text-base font-semibold text-gray-800 dark:text-white/90">
          Order Info
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Order ID</p>
            <p className="mt-1 font-mono text-xs text-gray-800 dark:text-white/90">
              {o.id}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
            <div className="mt-1">
              <Badge color={statusColor[o.status] ?? "light"}>{o.status}</Badge>
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Date</p>
            <p className="mt-1 text-sm text-gray-800 dark:text-white/90">
              {dayjs(o.createdAt).format("DD MMM YYYY, HH:mm")}
            </p>
          </div>
        </div>
      </div>

      {/* Card 2 — Items */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
        <h3 className="mb-4 text-base font-semibold text-gray-800 dark:text-white/90">
          Order Items
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 text-left text-xs text-gray-500 dark:text-gray-400">
                <th className="pb-3 font-medium">Product</th>
                <th className="pb-3 font-medium text-right">Qty</th>
                <th className="pb-3 font-medium text-right">Unit Price</th>
                <th className="pb-3 font-medium text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {(o.items ?? []).map((item: IOrderItem) => (
                <tr key={item.id}>
                  <td className="py-3 font-medium text-gray-800 dark:text-white/90">
                    <div className="flex items-center gap-3">
                      {item.product?.imageUrl && (
                        <Image
                          src={item.product.imageUrl}
                          alt={item.product?.name}
                          width={40}
                          height={40}
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                      )}
                      <span>{item.product?.name ?? "Product"}</span>
                    </div>
                  </td>
                  <td className="py-3 text-right text-gray-600 dark:text-gray-300">
                    {item.quantity}
                  </td>
                  <td className="py-3 text-right text-gray-600 dark:text-gray-300">
                    {formatPrice(item.price)}
                  </td>
                  <td className="py-3 text-right font-medium text-gray-800 dark:text-white/90">
                    {formatPrice(item.subtotal ?? item.price * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-gray-200 dark:border-gray-800">
                <td
                  colSpan={3}
                  className="pt-3 text-right font-semibold text-gray-800 dark:text-white/90"
                >
                  Total
                </td>
                <td className="pt-3 text-right text-lg font-bold text-gray-800 dark:text-white/90">
                  {formatPrice(o.totalAmount ?? 0)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Card 3 — Payment */}
      {payment && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <h3 className="mb-4 text-base font-semibold text-gray-800 dark:text-white/90">
            Payment Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Provider
              </p>
              <div className="mt-1">
                <Badge
                  color={payment.provider === "STRIPE" ? "primary" : "success"}
                >
                  {payment.provider?.toLowerCase()}
                </Badge>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Transaction ID
              </p>
              <div className="mt-1 flex items-center gap-2">
                <span className="font-mono text-xs text-gray-800 dark:text-white/90">
                  {payment.providerTxnId
                    ? `${payment.providerTxnId.slice(0, 20)}...`
                    : "—"}
                </span>
                <button
                  onClick={() =>
                    navigator.clipboard.writeText(payment.providerTxnId ?? "")
                  }
                  className="text-xs text-brand-500 hover:text-brand-600"
                  title="Copy transaction ID"
                >
                  Copy
                </button>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
              <div className="mt-1">
                <Badge color={paymentStatusColor[payment.status] ?? "light"}>
                  {payment.status?.toLowerCase()}
                </Badge>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Amount</p>
              <p className="mt-1 text-sm font-semibold text-gray-800 dark:text-white/90">
                {formatPrice(payment.amount)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
