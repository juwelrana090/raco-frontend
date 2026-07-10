"use client";
import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { useFetchCategories } from "../hooks/useFetchCategories";
import type { ICategory } from "../types";

interface CategoriesContextValue {
  categories: ICategory[];
  total: number;
  isLoading: boolean;
  search: string;
  setSearch: (search: string) => void;
  refetch: () => void;
}

const CategoriesContext = createContext<CategoriesContextValue | null>(null);

export function CategoriesProvider({ children }: { children: ReactNode }) {
  const [search, setSearch] = useState("");
  const { data, isLoading, refetch } = useFetchCategories(search);

  return (
    <CategoriesContext.Provider
      value={{
        categories: data?.categories ?? [],
        total: data?.total ?? 0,
        isLoading,
        search,
        setSearch,
        refetch,
      }}
    >
      {children}
    </CategoriesContext.Provider>
  );
}

export function useCategories() {
  const context = useContext(CategoriesContext);
  if (!context) {
    throw new Error("useCategories must be used within a CategoriesProvider");
  }
  return context;
}
