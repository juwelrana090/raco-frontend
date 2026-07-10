import { apiClient } from "@/lib/api/apiClient";
import type { IUser } from "../types";

export const usersAdminApi = {
  getAll: (params: Record<string, string | number | undefined>) =>
    apiClient.get<{ items: IUser[]; total: number }>(
      `/users?${new URLSearchParams(params as Record<string, string>)}`,
    ),
  getById: (id: string) => apiClient.get<IUser>(`/users/${id}`),
  getOrders: (id: string) =>
    apiClient.get<{ items: any[]; total: number }>(`/users/${id}/orders`),
};
