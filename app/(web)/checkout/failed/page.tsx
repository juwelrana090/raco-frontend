"use client";
import Link from "next/link";

export default function CheckoutFailedPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-20 text-center">
      <div className="flex justify-center mb-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-error-50 dark:bg-error-500/10">
          <svg
            className="h-10 w-10 text-error-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
      </div>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">
        Payment Failed
      </h2>
      <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
        Something went wrong with your payment. Please try again.
      </p>
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          href="/checkout"
          className="rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"
        >
          Try Again
        </Link>
        <Link
          href="/account/orders"
          className="rounded-lg border border-gray-300 dark:border-gray-700 px-6 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          View Orders
        </Link>
      </div>
    </div>
  );
}
