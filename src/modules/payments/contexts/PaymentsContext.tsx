"use client";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useFetchPayments } from "../hooks/useFetchPayments";
import type { IPayment, IPaymentFilters } from "../types";

interface PaymentsContextValue {
  payments: IPayment[];
  total: number;
  page: number;
  totalPages: number;
  isLoading: boolean;
  filters: IPaymentFilters;
  setStatus: (status: string) => void;
  setProvider: (provider: string) => void;
  setPage: (page: number) => void;
}

const PaymentsContext = createContext<PaymentsContextValue | null>(null);

export function PaymentsProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<IPaymentFilters>({
    page: 1,
    limit: 10,
  });

  const { data, isLoading } = useFetchPayments(filters);

  const setStatus = useCallback((status: string) => {
    setFilters((prev) => ({ ...prev, status, page: 1 }));
  }, []);

  const setProvider = useCallback((provider: string) => {
    setFilters((prev) => ({ ...prev, provider, page: 1 }));
  }, []);

  const setPage = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  return (
    <PaymentsContext.Provider
      value={{
        payments: data?.items ?? [],
        total: data?.total ?? 0,
        page: data?.page ?? 1,
        totalPages: data
          ? Math.ceil((data.total ?? 0) / (data.limit || 10))
          : 0,
        isLoading,
        filters,
        setStatus,
        setProvider,
        setPage,
      }}
    >
      {children}
    </PaymentsContext.Provider>
  );
}

export function usePayments() {
  const context = useContext(PaymentsContext);
  if (!context) {
    throw new Error("usePayments must be used within a PaymentsProvider");
  }
  return context;
}
