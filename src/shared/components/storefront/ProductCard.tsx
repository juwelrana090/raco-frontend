import Link from "next/link";
import Badge from "@/shared/components/ui/badge/Badge";
import BoxIcon from "@/shared/icons/BoxIcon";
import { formatPrice } from "@/shared/utils/formatPrice";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    stock: number;
    imageUrl?: string | null;
    category?: { name: string } | null;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/shop/${product.id}`}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
        {/* Image area */}
        <div className="relative h-50 w-full bg-gray-100 dark:bg-gray-800">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-gray-300 dark:text-gray-600">
              <BoxIcon />
            </div>
          )}
          {product.stock === 0 && (
            <div className="absolute top-2 right-2">
              <Badge color="error">Out of Stock</Badge>
            </div>
          )}
        </div>
        {/* Body */}
        <div className="p-4">
          {product.category && (
            <Badge variant="light" color="primary" size="sm">
              {product.category.name}
            </Badge>
          )}
          <p className="mt-1 text-sm font-semibold text-gray-800 dark:text-white/90 line-clamp-2">
            {product.name}
          </p>
          <p className="mt-1 text-lg font-bold text-brand-500">
            {formatPrice(product.price)}
          </p>
        </div>
      </div>
    </Link>
  );
}
