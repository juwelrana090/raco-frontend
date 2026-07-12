"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import Link from "next/link";
import Image from "next/image";
import { storefrontApi } from "@/lib/api/storefront";
import { useCartStore } from "@/lib/store/cartStore";
import { formatPrice } from "@/shared/utils/formatPrice";
import Badge from "@/shared/components/ui/badge/Badge";
import BoxIcon from "@/shared/icons/BoxIcon";

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

export default function ProductDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [qty, setQty] = useState(1);
  const addItem = useCartStore((s) => s.addItem);

  const { data: product, isLoading } = useQuery({
    queryKey: ["storefront-product", id],
    queryFn: () => storefrontApi.getProduct(id),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-pulse">
          <div className="aspect-square rounded-2xl bg-gray-200 dark:bg-gray-800" />
          <div className="space-y-4">
            <div className="h-6 w-24 rounded-lg bg-gray-200 dark:bg-gray-800" />
            <div className="h-10 w-3/4 rounded-lg bg-gray-200 dark:bg-gray-800" />
            <div className="h-8 w-32 rounded-lg bg-gray-200 dark:bg-gray-800" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <p className="text-lg text-gray-500">Product not found.</p>
        <Link
          href="/shop"
          className="mt-4 inline-block text-brand-500 hover:text-brand-600"
        >
          ← Back to Shop
        </Link>
      </div>
    );
  }

  const p = product as IProduct;
  const inStock = p.stock > 0;

  const handleAddToCart = () => {
    addItem({
      productId: p.id,
      name: p.name,
      price: p.price,
      quantity: qty,
      imageUrl: p.imageUrl,
      sku: p.sku ?? p.id,
    });
    toast.success("Added to cart");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left — Image */}
        <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          {p.imageUrl ? (
            <Image
              src={p.imageUrl}
              alt={p.name}
              width={400}
              height={400}
              className="h-full w-full object-cover rounded-2xl"
            />
          ) : (
            <div className="text-gray-300 dark:text-gray-600">
              <BoxIcon />
            </div>
          )}
        </div>

        {/* Right — Details */}
        <div>
          {p.category && (
            <span className="inline-block rounded-full bg-brand-50 text-brand-500 dark:bg-brand-500/10 dark:text-brand-400 px-3 py-1 text-xs font-medium">
              {p.category.name}
            </span>
          )}
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
            {p.name}
          </h1>
          <p className="text-2xl font-bold text-brand-500 mt-2">
            {formatPrice(p.price)}
          </p>
          <div className="mt-2">
            <Badge color={inStock ? "success" : "error"}>
              {inStock ? `In Stock (${p.stock})` : "Out of Stock"}
            </Badge>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-800 my-4" />

          {p.description && (
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              {p.description}
            </p>
          )}

          {/* Quantity selector */}
          {inStock && (
            <div className="mt-6 flex items-center gap-4">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Qty:
              </span>
              <div className="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-l-lg"
                >
                  −
                </button>
                <span className="w-10 text-center text-sm font-medium text-gray-800 dark:text-white/90">
                  {qty}
                </span>
                <button
                  onClick={() => setQty((q) => Math.min(p.stock, q + 1))}
                  className="px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-r-lg"
                >
                  +
                </button>
              </div>
            </div>
          )}

          <button
            onClick={handleAddToCart}
            disabled={!inStock}
            className="mt-6 w-full rounded-lg bg-brand-500 py-3 text-sm font-semibold text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {inStock ? "Add to Cart" : "Out of Stock"}
          </button>
        </div>
      </div>
    </div>
  );
}
