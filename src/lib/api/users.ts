import { apiClient } from "./apiClient";
import type { IUser } from "./types";

export interface IUsersListResponse {
  items: IUser[];
  total: number;
  page: number;
  limit: number;
}

export const userApi = {
  list: (params?: {
    page?: number;
    limit?: number;
    role?: string;
    search?: string;
  }) => {
    const p = new URLSearchParams();
    if (params?.page) p.append("page", String(params.page));
    if (params?.limit) p.append("limit", String(params.limit));
    if (params?.role) p.append("role", params.role);
    if (params?.search) p.append("search", params.search);
    const q = p.toString();
    return apiClient.get<IUsersListResponse>(`/users${q ? `?${q}` : ""}`);
  },

  getById: (id: string) => apiClient.get<IUser>(`/users/${id}`),

  updateRole: (_id: string, _role: "USER" | "ADMIN") =>
    Promise.reject(new Error("Role update endpoint not yet available")),
};
