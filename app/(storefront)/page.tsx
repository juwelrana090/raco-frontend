"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { storefrontApi } from "@/lib/api/storefront";
import ProductCard from "@/shared/components/storefront/ProductCard";

export default function HomePage() {
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ["storefront-featured"],
    queryFn: () =>
      storefrontApi.getProducts({ limit: 8, status: "ACTIVE" } as any),
  });

  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ["storefront-categories"],
    queryFn: () => storefrontApi.getCategories(),
  });

  const products: any[] = (productsData as any)?.items ?? [];
  const categories: any[] = Array.isArray(categoriesData)
    ? (categoriesData as any[]).filter((c: any) => !c.parentId)
    : [];

  return (
    <div>
      {/* Hero */}
      <section className="bg-brand-500 text-white py-20 px-4 text-center">
        <h1 className="text-4xl font-bold">Shop the Best Products</h1>
        <p className="text-lg mt-4 opacity-90">
          Quality products, great prices, fast delivery
        </p>
        <Link
          href="/shop"
          className="bg-white text-brand-500 hover:bg-gray-100 rounded-lg px-8 py-3 font-semibold mt-8 inline-block"
        >
          Shop Now
        </Link>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 space-y-12">
        {/* Featured Products */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white/90 mb-6">
            Featured Products
          </h2>
          {productsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-72 animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-800"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>

        {/* Categories */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white/90 mb-6">
            Shop by Category
          </h2>
          {categoriesLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-24 animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-800"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {categories.map((cat: any) => (
                <Link key={cat.id} href={`/shop?category=${cat.id}`}>
                  <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 text-center hover:border-brand-500 cursor-pointer transition-colors">
                    <p className="text-sm font-semibold text-gray-800 dark:text-white/90">
                      {cat.name}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
