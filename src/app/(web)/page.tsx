"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
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
  parentId: string | null;
}

const CATEGORY_ICONS: Record<string, string> = {
  default: "📦",
  electronics: "💻",
  clothing: "👗",
  phones: "📱",
  laptops: "💻",
  bags: "👜",
  shoes: "👟",
  accessories: "⌚",
  books: "📚",
  sports: "⚽",
};

function getCategoryIcon(name: string): string {
  const key = name.toLowerCase();
  return (
    Object.entries(CATEGORY_ICONS).find(([k]) => key.includes(k))?.[1] ??
    CATEGORY_ICONS.default
  );
}

export default function HomePage() {
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ["storefront-featured"],
    queryFn: () =>
      storefrontApi.getProducts({ limit: 8 }),
  });

  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ["storefront-categories"],
    queryFn: () => storefrontApi.getCategories(),
  });

  const products = (productsData as IProductsResponse | undefined)?.products ?? [];
  const categories = Array.isArray(categoriesData)
    ? (categoriesData as ICategory[]).filter((c) => !c.parentId)
    : [];

  return (
    <div className="pb-16">
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-brand-900 to-gray-900 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-brand-500 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 rounded-full bg-purple-500 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-20 lg:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left text */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-brand-500/20 border border-brand-500/30 px-4 py-1.5 text-sm text-brand-300 mb-6">
                <span className="h-2 w-2 rounded-full bg-brand-400 animate-pulse" />
                New arrivals every week
              </div>
              <h1 className="text-4xl lg:text-6xl font-extrabold leading-tight tracking-tight">
                Shop the
                <span className="text-brand-400"> Best </span>
                Products
              </h1>
              <p className="mt-6 text-lg text-gray-300 leading-relaxed max-w-md">
                Discover thousands of quality products at great prices. Fast
                delivery, easy returns, and exceptional customer service.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 rounded-xl bg-brand-500 hover:bg-brand-400 px-8 py-3.5 text-sm font-bold text-white transition-all hover:shadow-lg hover:shadow-brand-500/30"
                >
                  Shop Now
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
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </Link>
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 px-8 py-3.5 text-sm font-semibold text-white transition-all backdrop-blur-sm"
                >
                  Browse Categories
                </Link>
              </div>
              {/* Stats */}
              <div className="mt-12 flex gap-8">
                {[
                  { value: "10K+", label: "Products" },
                  { value: "99%", label: "Happy Customers" },
                  { value: "Fast", label: "Delivery" },
                ].map((s) => (
                  <div key={s.label}>
                    <p className="text-2xl font-extrabold text-white">
                      {s.value}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right visual */}
            <div className="hidden lg:flex items-center justify-center">
              <div className="relative">
                <div className="w-80 h-80 rounded-3xl bg-gradient-to-br from-brand-500/30 to-purple-500/20 border border-white/10 flex items-center justify-center backdrop-blur-sm">
                  <div className="text-9xl select-none">🛍️</div>
                </div>
                {/* Floating cards */}
                <div className="absolute -top-4 -right-8 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-3 text-sm">
                  <p className="text-white font-semibold">Free Shipping</p>
                  <p className="text-gray-300 text-xs">
                    On orders above ৳2,000
                  </p>
                </div>
                <div className="absolute -bottom-4 -left-8 rounded-2xl bg-brand-500/20 backdrop-blur-md border border-brand-500/30 p-3 text-sm">
                  <p className="text-white font-semibold">🔒 Secure Payment</p>
                  <p className="text-gray-300 text-xs">
                    Stripe & bKash accepted
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES BAR ─────────────────────────────────────── */}
      <section className="border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-gray-100 dark:divide-gray-800">
            {[
              {
                icon: "🚚",
                title: "Free Delivery",
                sub: "On orders over ৳2,000",
              },
              { icon: "🔄", title: "Easy Returns", sub: "7 day return policy" },
              { icon: "🔒", title: "Secure Checkout", sub: "Stripe & bKash" },
              { icon: "💬", title: "24/7 Support", sub: "Always here to help" },
            ].map((f) => (
              <div key={f.title} className="flex items-center gap-3 px-6 py-5">
                <span className="text-2xl">{f.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-white/90">
                    {f.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {f.sub}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 space-y-16 pt-16">
        {/* ── CATEGORIES ───────────────────────────────────────── */}
        <section>
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-brand-500 mb-1">
                Explore
              </p>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Shop by Category
              </h2>
            </div>
            <Link
              href="/shop"
              className="text-sm font-medium text-brand-500 hover:text-brand-600 flex items-center gap-1"
            >
              View all
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
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>

          {categoriesLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-28 animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.slice(0, 6).map((cat, i) => {
                const colors = [
                  "from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-100 dark:border-blue-800/30",
                  "from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-100 dark:border-purple-800/30",
                  "from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-100 dark:border-green-800/30",
                  "from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-100 dark:border-orange-800/30",
                  "from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 border-pink-100 dark:border-pink-800/30",
                  "from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20 border-teal-100 dark:border-teal-800/30",
                ];
                return (
                  <Link key={cat.id} href={`/shop?category=${cat.id}`}>
                    <div
                      className={`group flex flex-col items-center justify-center gap-2 rounded-2xl bg-gradient-to-br ${colors[i % colors.length]} border p-5 text-center transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer`}
                    >
                      <span className="text-3xl">
                        {getCategoryIcon(cat.name)}
                      </span>
                      <p className="text-xs font-semibold text-gray-700 dark:text-gray-200 line-clamp-2">
                        {cat.name}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* ── FEATURED PRODUCTS ─────────────────────────────────── */}
        <section>
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-brand-500 mb-1">
                This Week
              </p>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Featured Products
              </h2>
            </div>
            <Link
              href="/shop"
              className="text-sm font-medium text-brand-500 hover:text-brand-600 flex items-center gap-1"
            >
              See all
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
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>

          {productsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-72 animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800"
                />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 py-20 text-center">
              <p className="text-gray-400">No products yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>

        {/* ── PROMO BANNER ─────────────────────────────────────── */}
        <section className="rounded-3xl bg-gradient-to-r from-brand-500 to-brand-700 p-8 lg:p-12 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-1/3 w-40 h-40 rounded-full bg-white/5 translate-y-1/2" />
          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-brand-200 text-sm font-semibold uppercase tracking-widest mb-2">
                Limited Time Offer
              </p>
              <h2 className="text-3xl lg:text-4xl font-extrabold leading-tight">
                Pay with bKash & Get Instant Discount
              </h2>
              <p className="mt-3 text-brand-100 text-sm leading-relaxed max-w-md">
                Use bKash mobile banking at checkout for a seamless and fast
                payment experience.
              </p>
            </div>
            <div className="flex justify-start lg:justify-end">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 rounded-xl bg-white text-brand-600 hover:bg-brand-50 px-8 py-4 text-sm font-bold transition-all hover:shadow-lg"
              >
                Shop Now
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
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
