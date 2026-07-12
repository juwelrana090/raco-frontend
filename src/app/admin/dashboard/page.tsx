"use client";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { apiClient } from "@/lib/api/apiClient";

interface IProductListResponse {
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
  data: Array<{
    id: string;
    name: string;
    price: number;
    stock: number;
  }>;
}

export default function DashboardPage() {
  const { data: productsData } = useQuery({
    queryKey: ["admin-stats-products"],
    queryFn: () => apiClient.get<IProductListResponse>("/products?limit=1"),
  });

  const stats = [
    {
      label: "Total Products",
      value: (productsData as IProductListResponse | undefined)?.pagination?.total ?? "-",
      href: "/admin/products",
      color: "text-brand-500",
    },
    {
      label: "Orders",
      value: "-",
      href: "/admin/orders",
      color: "text-success-600",
    },
    {
      label: "Payments",
      value: "-",
      href: "/admin/payments",
      color: "text-warning-600",
    },
    {
      label: "Users",
      value: "-",
      href: "/admin/users",
      color: "text-error-600",
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
          Dashboard
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Welcome to Raco Admin
        </p>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}>
            <div className="cursor-pointer rounded-2xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {s.label}
              </p>
              <p className={`mt-1 text-3xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
