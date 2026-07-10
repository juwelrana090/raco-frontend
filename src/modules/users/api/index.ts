import { apiClient } from "@/lib/api/apiClient";
import type { IUser } from "../types";

export const usersAdminApi = {
  getAll: (params?: Record<string, any>) => {
    const p = new URLSearchParams();
    if (params?.page) p.append("page", String(params.page));
    if (params?.limit) p.append("limit", String(params.limit));
    if (params?.role) p.append("role", String(params.role));
    if (params?.search) p.append("search", String(params.search));
    const q = p.toString();
    return apiClient.get<{
      items: IUser[];
      total: number;
      page: number;
      limit: number;
    }>(`/users${q ? `?${q}` : ""}`);
  },

  getById: (id: string) => apiClient.get<IUser>(`/users/${id}`),

  getOrders: async (_id: string) => {
    // No dedicated GET /users/:id/orders endpoint yet.
    return Promise.resolve({ items: [] as any[], total: 0 });
  },
};
