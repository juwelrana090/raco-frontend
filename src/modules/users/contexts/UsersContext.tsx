"use client";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useFetchUsers } from "../hooks/useFetchUsers";
import type { IUser, IUsersFilters } from "../types";

interface UsersContextValue {
  users: IUser[];
  total: number;
  page: number;
  totalPages: number;
  isLoading: boolean;
  filters: IUsersFilters;
  setSearch: (search: string) => void;
  setRole: (role: string) => void;
  setPage: (page: number) => void;
}

const UsersContext = createContext<UsersContextValue | null>(null);

export function UsersProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<IUsersFilters>({
    page: 1,
    limit: 10,
  });

  const { data, isLoading } = useFetchUsers(filters);

  const setSearch = useCallback((search: string) => {
    setFilters((prev) => ({ ...prev, search, page: 1 }));
  }, []);

  const setRole = useCallback((role: string) => {
    setFilters((prev) => ({ ...prev, role, page: 1 }));
  }, []);

  const setPage = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  const items: IUser[] = (data as { items?: IUser[]; total?: number })?.items ?? [];
  const total: number = (data as { items?: IUser[]; total?: number })?.total ?? 0;
  const limit = filters.limit ?? 10;
  const totalPages = Math.ceil(total / limit);

  return (
    <UsersContext.Provider
      value={{
        users: items,
        total,
        page: filters.page ?? 1,
        totalPages,
        isLoading,
        filters,
        setSearch,
        setRole,
        setPage,
      }}
    >
      {children}
    </UsersContext.Provider>
  );
}

export function useUsers() {
  const context = useContext(UsersContext);
  if (!context) {
    throw new Error("useUsers must be used within a UsersProvider");
  }
  return context;
}
