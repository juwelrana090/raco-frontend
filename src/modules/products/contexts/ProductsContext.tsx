"use client";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useFetchProducts } from "../hooks/useFetchProducts";
import type { IProduct, IProductFilters } from "../types";

interface ProductsContextValue {
  products: IProduct[];
  total: number;
  page: number;
  totalPages: number;
  isLoading: boolean;
  filters: IProductFilters;
  setFilters: (filters: IProductFilters) => void;
  setSearch: (search: string) => void;
  setCategory: (categoryId: string) => void;
  setPage: (page: number) => void;
  refetch: () => void;
}

const ProductsContext = createContext<ProductsContextValue | null>(null);

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<IProductFilters>({
    page: 1,
    limit: 10,
  });
  const { data, isLoading, refetch } = useFetchProducts(filters);

  const setSearch = useCallback(
    (search: string) => setFilters((p) => ({ ...p, search, page: 1 })),
    [],
  );
  const setCategory = useCallback(
    (categoryId: string) => setFilters((p) => ({ ...p, categoryId, page: 1 })),
    [],
  );
  const setPage = useCallback(
    (page: number) => setFilters((p) => ({ ...p, page })),
    [],
  );

  return (
    <ProductsContext.Provider
      value={{
        products: data?.products ?? [],
        total: data?.pagination?.total ?? 0,
        page: data?.pagination?.page ?? 1,
        totalPages: data?.pagination?.totalPages ?? 0,
        isLoading,
        filters,
        setFilters,
        setSearch,
        setCategory,
        setPage,
        refetch,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductsContext);
  if (!context)
    throw new Error("useProducts must be used within a ProductsProvider");
  return context;
}
