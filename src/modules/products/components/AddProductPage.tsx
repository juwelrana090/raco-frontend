"use client";
import { useRouter } from "next/navigation";
import AddProductForm from "./AddProductForm";

export default function AddProductPage() {
  const router = useRouter();

  const categories: Array<{ id: string; name: string; children?: Array<{ id: string; name: string }> }> = [];

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/admin/products")}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-white/5"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
            />
          </svg>
        </button>
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            Add Product
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Create a new product
          </p>
        </div>
      </div>
      <AddProductForm categories={categories} />
    </div>
  );
}
