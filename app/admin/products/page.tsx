"use client";
import ProductsLayout from "@/modules/products/components/ProductsLayout";
import { ProductsProvider } from "@/modules/products/contexts/ProductsContext";

export default function ProductsPage() {
  return (
    <ProductsProvider>
      <ProductsLayout />
    </ProductsProvider>
  );
}
