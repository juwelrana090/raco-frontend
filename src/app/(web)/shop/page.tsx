"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Pagination } from "antd";
import { storefrontApi } from "@/lib/api/storefront";
import ProductCard from "@/shared/components/storefront/ProductCard";

interface IProduct {
  id: string;
  name: string;
  sku?: string | undefined;
  description: string | null;
  price: number;
  stock: number;
  imageUrl: string | null;
  categoryId: string;
  category?: {
    id: string;
    name: string;
  };
}

interface IProductsResponse {
  products: IProduct[];
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
}

interface ICategory {
  id: string;
  name: string;
  children?: ICategory[];
}

function flattenCategories(cats: ICategory[]): ICategory[] {
  return cats.flatMap((c) => [c, ...flattenCategories(c.children ?? [])]);
}

function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [category, setCategory] = useState(searchParams.get("category") ?? "");
  const [page, setPage] = useState(Number(searchParams.get("page") ?? 1));

  const { data: productsData, isLoading } = useQuery({
    queryKey: ["storefront-shop", { search, category, page }],
    queryFn: () =>
      storefrontApi.getProducts({
        search: search || undefined,
        categoryId: category || undefined,
        page,
        limit: 12,
      }),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["storefront-categories"],
    queryFn: () => storefrontApi.getCategories(),
  });

  const products = (productsData as IProductsResponse | undefined)?.products ?? [];
  const total = (productsData as IProductsResponse | undefined)?.pagination?.total ?? 0;
  const categories = Array.isArray(categoriesData)
    ? flattenCategories(categoriesData as ICategory[])
    : [];

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    if (page > 1) params.set("page", String(page));
    router.replace(`/shop${params.toString() ? `?${params}` : ""}`, {
      scroll: false,
    });
  }, [search, category, page, router]);

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setPage(1);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Shop
        </h1>
      </div>

      {/* Filter bar */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
        <div className="flex flex-1 gap-3 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full h-10 pl-9 pr-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-800 dark:text-white/90 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0"
              />
            </svg>
          </div>

          {/* Category select */}
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="h-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 text-sm text-gray-700 dark:text-white/90 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Results count */}
        <p className="text-sm text-gray-500 dark:text-gray-400 shrink-0">
          <span className="font-semibold text-gray-800 dark:text-white/90">
            {total}
          </span>{" "}
          products found
        </p>
      </div>

      {/* Products grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="h-72 animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800"
            />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 py-20 text-center">
          <p className="text-lg font-semibold text-gray-800 dark:text-white/90">
            No products found
          </p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Try adjusting your search or filters
          </p>
          <button
            onClick={clearFilters}
            className="mt-6 rounded-xl bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 transition-colors"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="mt-8 flex justify-center">
            <Pagination
              current={page}
              total={total}
              pageSize={12}
              onChange={setPage}
              showSizeChanger={false}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-72 animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800"
              />
            ))}
          </div>
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}
