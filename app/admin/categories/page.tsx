"use client";
import CategoriesLayout from "@/modules/categories/components/CategoriesLayout";
import { CategoriesProvider } from "@/modules/categories/contexts/CategoriesContext";

export default function CategoriesPage() {
  return (
    <CategoriesProvider>
      <CategoriesLayout />
    </CategoriesProvider>
  );
}
