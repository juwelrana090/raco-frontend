"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  return (
    <div className="mx-auto max-w-7xl px-4 py-20 text-center">
      <div className="flex justify-center mb-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success-50 dark:bg-success-500/10">
          <svg
            className="h-10 w-10 text-success-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      </div>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">
        Payment Successful!
      </h2>
      <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
        Your order has been placed successfully.
      </p>
      {orderId && (
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Order{" "}
          <span className="font-mono text-gray-700 dark:text-gray-300">
            #{orderId.slice(0, 8)}
          </span>
        </p>
      )}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          href="/orders"
          className="rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"
        >
          View My Orders
        </Link>
        <Link
          href="/shop"
          className="rounded-lg border border-gray-300 dark:border-gray-700 px-6 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
