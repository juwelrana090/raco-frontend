"use client";
import Link from "next/link";
import { useAuthStore } from "@/lib/auth/authStore";
import { useCartStore } from "@/lib/store/cartStore";

export default function StorefrontHeader() {
  const { isAuthenticated, user, clearAuth } = useAuthStore();
  const totalItems = useCartStore((s) => s.totalItems());

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="mx-auto max-w-7xl px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-brand-500">
          Raco
        </Link>

        {/* Center nav */}
        <nav className="hidden sm:flex items-center gap-6">
          <Link
            href="/"
            className="text-sm text-gray-700 hover:text-brand-500 dark:text-gray-300 dark:hover:text-brand-400"
          >
            Home
          </Link>
          <Link
            href="/shop"
            className="text-sm text-gray-700 hover:text-brand-500 dark:text-gray-300 dark:hover:text-brand-400"
          >
            Shop
          </Link>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Cart icon */}
          <Link
            href="/cart"
            className="relative p-2 text-gray-700 dark:text-gray-300 hover:text-brand-500 dark:hover:text-brand-400"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m12-9l2 9m-9-4h4"
              />
            </svg>
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                {totalItems}
              </span>
            )}
          </Link>

          {/* Auth */}
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {user?.name}
              </span>
              <button
                onClick={clearAuth}
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
