"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Link from "next/link";
import { useAuthStore } from "@/lib/auth/authStore";
import { useCartStore } from "@/lib/store/cartStore";
import { apiClient } from "@/lib/api/apiClient";
import { formatPrice } from "@/shared/utils/formatPrice";

type Provider = "STRIPE" | "BKASH";

interface IOrderResponse {
  id: string;
  data?: {
    id: string;
  };
}

interface ICheckoutResponse {
  clientSecret?: string;
  data?: {
    clientSecret?: string;
    bkashURL?: string;
    paymentUrl?: string;
  };
  bkashURL?: string;
  paymentUrl?: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { items, totalAmount, clearCart } = useCartStore();
  const [provider, setProvider] = useState<Provider>("STRIPE");
  const [loading, setLoading] = useState(false);

  if (!isAuthenticated) {
    if (typeof window !== "undefined") {
      router.replace("/auth/login?redirect=/checkout");
    }
    return null;
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <p className="text-lg text-gray-500 dark:text-gray-400">
          Your cart is empty.
        </p>
        <Link
          href="/shop"
          className="mt-4 inline-block rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
        >
          Shop Now
        </Link>
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const orderPayload = {
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
      };
      const order = await apiClient.post<IOrderResponse>("/orders", orderPayload);
      const orderId = order.id ?? order.data?.id;

      const checkout = await apiClient.post<ICheckoutResponse>(
        `/orders/${orderId}/checkout`,
        { provider },
      );

      clearCart();

      if (provider === "STRIPE") {
        const secret =
          checkout.clientSecret ??
          checkout.data?.clientSecret;
        router.push(
          `/checkout/success?orderId=${orderId}${secret ? `&secret=${secret}` : ""}`,
        );
      } else {
        const bkashUrl =
          checkout.bkashURL ??
          checkout.data?.bkashURL ??
          checkout.paymentUrl ??
          checkout.data?.paymentUrl;
        if (bkashUrl) {
          window.location.href = bkashUrl;
        } else {
          router.push(`/checkout/success?orderId=${orderId}`);
        }
      }
    } catch (err) {
      const error = err as Error;
      toast.error(error.message ?? "Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const cardBase = "rounded-2xl border-2 p-5 cursor-pointer transition-all";
  const cardUnselected = `${cardBase} border-gray-200 hover:border-brand-300 dark:border-gray-700`;
  const cardSelected = `${cardBase} border-brand-500 ring-2 ring-brand-500/20`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90 mb-6">
        Checkout
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left — Order summary */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="text-base font-semibold text-gray-800 dark:text-white/90 mb-4">
            Order Summary
          </h2>
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.productId}
                className="flex items-center justify-between text-sm"
              >
                <div>
                  <p className="font-medium text-gray-800 dark:text-white/90">
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatPrice(item.price)} × {item.quantity}
                  </p>
                </div>
                <span className="font-semibold text-gray-800 dark:text-white/90">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
          <div className="my-4 border-t border-gray-200 dark:border-gray-800" />
          <div className="flex justify-between text-base font-bold text-gray-800 dark:text-white/90">
            <span>Total</span>
            <span>{formatPrice(totalAmount())}</span>
          </div>
        </div>

        {/* Right — Payment method */}
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-gray-800 dark:text-white/90">
            Select Payment Method
          </h2>

          {/* Stripe */}
          <div
            className={provider === "STRIPE" ? cardSelected : cardUnselected}
            onClick={() => setProvider("STRIPE")}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-500/10">
                <svg
                  className="h-5 w-5 text-brand-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-white/90">
                  Stripe
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Pay with credit/debit card
                </p>
              </div>
            </div>
          </div>

          {/* bKash */}
          <div
            className={provider === "BKASH" ? cardSelected : cardUnselected}
            onClick={() => setProvider("BKASH")}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-50 dark:bg-pink-500/10">
                <span className="text-sm font-bold text-pink-600">bK</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-white/90">
                  bKash
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Mobile banking payment
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={loading}
            className="mt-2 w-full rounded-lg bg-brand-500 py-3 text-sm font-semibold text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Placing Order..." : "Place Order"}
          </button>
        </div>
      </div>
    </div>
  );
}
