'use client';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useCartStore } from '@/lib/store/cartStore';
import { formatPrice } from '@/shared/utils/formatPrice';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    stock: number;
    sku?: string;
    imageUrl?: string | null;
    category?: { name: string } | null;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const [hovered, setHovered] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock === 0) return;
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      imageUrl: product.imageUrl,
      sku: product.sku ?? product.id,
    });
    toast.success('Added to cart!');
  };

  return (
    <Link href={`/shop/${product.id}`}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="group bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
      >
        {/* Image area */}
        <div className="relative h-56 w-full bg-gray-50 dark:bg-gray-800 overflow-hidden">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
              <svg className="h-16 w-16 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          )}

          {/* Out of stock badge */}
          {product.stock === 0 && (
            <div className="absolute top-3 left-3">
              <span className="rounded-lg bg-gray-800/80 backdrop-blur-sm px-2 py-1 text-xs font-semibold text-white">
                Out of Stock
              </span>
            </div>
          )}

          {/* Add to cart overlay */}
          <div className={`absolute inset-x-0 bottom-0 transition-all duration-300 ${hovered && product.stock > 0 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'}`}>
            <button
              onClick={handleAddToCart}
              className="w-full bg-brand-500 hover:bg-brand-600 py-3 text-sm font-semibold text-white transition-colors"
            >
              Add to Cart
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-4">
          {product.category && (
            <p className="text-xs font-medium text-brand-500 dark:text-brand-400 uppercase tracking-wide mb-1">
              {product.category.name}
            </p>
          )}
          <p className="text-sm font-semibold text-gray-800 dark:text-white/90 line-clamp-2 min-h-[2.5rem]">
            {product.name}
          </p>
          <div className="mt-3 flex items-center justify-between">
            <p className="text-lg font-bold text-brand-500 dark:text-brand-400">
              {formatPrice(product.price)}
            </p>
            {product.stock > 0 && product.stock <= 10 && (
              <span className="text-xs text-orange-500 font-medium">
                Only {product.stock} left
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
