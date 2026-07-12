"use client";
import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/lib/store/cartStore";
import { formatPrice } from "@/shared/utils/formatPrice";
import BoxIcon from "@/shared/icons/BoxIcon";

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalAmount } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <div className="flex justify-center mb-4">
          <BoxIcon />
        </div>
        <p className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Your cart is empty
        </p>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Browse our products and add items to your cart
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-block rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
        >
          Shop Now
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90 mb-6">
        Your Cart
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart items */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
            {items.map((item, index) => (
              <div
                key={item.productId}
                className={`flex items-center gap-4 p-4 ${
                  index < items.length - 1
                    ? "border-b border-gray-200 dark:border-gray-800"
                    : ""
                }`}
              >
                {/* Thumbnail */}
                <div className="h-16 w-16 shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      width={64}
                      height={64}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-gray-400">
                      <BoxIcon />
                    </div>
                  )}
                </div>

                {/* Name + SKU */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90 truncate">
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    SKU: {item.sku}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatPrice(item.price)} each
                  </p>
                </div>

                {/* Qty stepper */}
                <div className="flex items-center gap-1 rounded-lg border border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() =>
                      updateQuantity(item.productId, item.quantity - 1)
                    }
                    className="px-2 py-1 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-l-lg text-sm"
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-sm font-medium text-gray-800 dark:text-white/90">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() =>
                      updateQuantity(item.productId, item.quantity + 1)
                    }
                    className="px-2 py-1 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-r-lg text-sm"
                  >
                    +
                  </button>
                </div>

                {/* Subtotal */}
                <p className="w-24 text-right text-sm font-semibold text-gray-800 dark:text-white/90">
                  {formatPrice(item.price * item.quantity)}
                </p>

                {/* Remove */}
                <button
                  onClick={() => removeItem(item.productId)}
                  className="text-gray-400 hover:text-red-500 transition-colors ml-2"
                  aria-label="Remove item"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <h2 className="text-base font-semibold text-gray-800 dark:text-white/90 mb-4">
              Order Summary
            </h2>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex justify-between">
                <span>Items ({items.length})</span>
                <span>{items.reduce((s, i) => s + i.quantity, 0)} pcs</span>
              </div>
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(totalAmount())}</span>
              </div>
            </div>
            <div className="my-4 border-t border-gray-200 dark:border-gray-800" />
            <div className="flex justify-between text-xl font-bold text-gray-800 dark:text-white/90">
              <span>Total</span>
              <span>{formatPrice(totalAmount())}</span>
            </div>
            <Link
              href="/checkout"
              className="mt-5 block w-full rounded-lg bg-brand-500 py-3 text-center text-sm font-semibold text-white hover:bg-brand-600"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
