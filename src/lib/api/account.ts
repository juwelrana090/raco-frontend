import { apiClient } from "@/lib/api/apiClient";

export const accountApi = {
  getMe: () => apiClient.get<any>("/users/me"),
  updateMe: (data: { name: string }) => apiClient.patch<any>("/users/me", data),
  getMyOrders: (params?: Record<string, string | number | undefined>) =>
    apiClient.get<{ items: any[]; total: number }>(
      `/users/me/orders?${new URLSearchParams((params || {}) as Record<string, string>)}`,
    ),
  getMyOrder: (id: string) => apiClient.get<any>(`/users/me/orders/${id}`),
  getMyPayments: (params?: Record<string, string | number | undefined>) =>
    apiClient.get<{ items: any[]; total: number }>(
      `/users/me/payments?${new URLSearchParams((params || {}) as Record<string, string>)}`,
    ),
};
