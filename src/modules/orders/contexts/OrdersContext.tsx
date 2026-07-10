"use client";
import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { useFetchOrders } from "../hooks/useFetchOrders";
import type { IOrder, IOrderFilters } from "../types";

interface OrdersContextValue {
  orders: IOrder[];
  total: number;
  page: number;
  totalPages: number;
  isLoading: boolean;
  filters: IOrderFilters;
  setSearch: (search: string) => void;
  setStatus: (status: string) => void;
  setPage: (page: number) => void;
}

const OrdersContext = createContext<OrdersContextValue | null>(null);

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<IOrderFilters>({
    page: 1,
    limit: 10,
  });

  const { data, isLoading } = useFetchOrders(filters);

  const setSearch = useCallback((search: string) => {
    setFilters((prev) => ({ ...prev, search, page: 1 }));
  }, []);

  const setStatus = useCallback((status: string) => {
    setFilters((prev) => ({ ...prev, status, page: 1 }));
  }, []);

  const setPage = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  return (
    <OrdersContext.Provider
      value={{
        orders: data?.orders ?? [],
        total: data?.total ?? 0,
        page: data?.page ?? 1,
        totalPages: data?.totalPages ?? 0,
        isLoading,
        filters,
        setSearch,
        setStatus,
        setPage,
      }}
    >
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrdersContext);
  if (!context) {
    throw new Error("useOrders must be used within an OrdersProvider");
  }
  return context;
}
