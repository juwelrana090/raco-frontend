import { useQuery } from "@tanstack/react-query";
import { usersAdminApi } from "../api";
import type { IUsersFilters } from "../types";

export function useFetchUsers(filters?: IUsersFilters) {
  return useQuery({
    queryKey: ["admin-users", filters],
    queryFn: () =>
      usersAdminApi.getAll(
        filters as Record<string, string | number | undefined>,
      ),
  });
}

export function useFetchUser(id: string) {
  return useQuery({
    queryKey: ["admin-users", id],
    queryFn: () => usersAdminApi.getById(id),
    enabled: !!id,
  });
}

export function useFetchUserOrders(id: string) {
  return useQuery({
    queryKey: ["admin-users", id, "orders"],
    queryFn: () => usersAdminApi.getOrders(id),
    enabled: !!id,
  });
}
