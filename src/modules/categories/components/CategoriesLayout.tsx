"use client";
import { useRouter } from "next/navigation";
import CategoriesFilters from "./CategoriesFilters";
import CategoriesTable from "./CategoriesTable";

export default function CategoriesLayout() {
  const router = useRouter();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            Categories
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage product categories
          </p>
        </div>
        <button
          onClick={() => router.push("/admin/categories/add")}
          className="bg-brand-500 hover:bg-brand-600 inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          Add Category
        </button>
      </div>
      <CategoriesFilters />
      <CategoriesTable />
    </div>
  );
}
