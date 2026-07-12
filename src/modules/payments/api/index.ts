import { apiClient } from "@/lib/api/apiClient";
import type { IPayment, IPaymentListResponse } from "../types";

export const paymentsApi = {
  getAll: (filters?: {
    status?: string;
    provider?: string;
    page?: number;
    limit?: number;
  }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.provider) params.append("provider", filters.provider);
    if (filters?.page) params.append("page", String(filters.page));
    if (filters?.limit) params.append("limit", String(filters.limit));
    const q = params.toString();
    return apiClient.get<IPaymentListResponse>(
      `/payments/admin/all${q ? `?${q}` : ""}`,
    );
  },

  getById: (id: string) => apiClient.get<IPayment>(`/payments/${id}`),

  getByOrderId: (orderId: string) =>
    apiClient.get<IPayment[]>(`/payments/order/${orderId}`),

  create: (orderId: string, provider: "STRIPE" | "BKASH") =>
    apiClient.post<{ payment: IPayment }>("/payments", { orderId, provider }),
};
