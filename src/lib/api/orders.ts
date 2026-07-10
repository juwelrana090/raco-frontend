import { apiClient } from "./apiClient";

export type OrderStatus = "PENDING" | "PAID" | "CANCELED";

export interface IOrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number; // in poisha
  subtotal: number;
  createdAt: string;
}

export interface IOrder {
  id: string;
  userId: string;
  items: IOrderItem[];
  totalAmount: number; // in poisha
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface IOrderListResponse {
  items: IOrder[];
  total: number;
  page: number;
  limit: number;
}

export const orderApi = {
  // GET /orders/admin/all — admin list
  getAll: (filters?: { status?: string; page?: number; limit?: number }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.page) params.append("page", String(filters.page));
    if (filters?.limit) params.append("limit", String(filters.limit));
    const q = params.toString();
    return apiClient.get<IOrderListResponse>(
      `/orders/admin/all${q ? `?${q}` : ""}`,
    );
  },

  // GET /orders/:id
  getById: (id: string) => apiClient.get<IOrder>(`/orders/${id}`),

  // POST /orders — create order from cart
  create: (items: { productId: string; quantity: number }[]) =>
    apiClient.post<IOrder>("/orders", { items }),

  // POST /orders/:id/checkout — initiate payment
  checkout: (id: string, provider: "STRIPE" | "BKASH") =>
    apiClient.post<any>(`/orders/${id}/checkout`, { provider }),

  // DELETE /orders/:id — cancel order (PENDING only)
  cancel: (id: string) => apiClient.delete<IOrder>(`/orders/${id}`),

  // There is currently no backend endpoint for manual admin status updates.
  updateStatus: (_id: string, _status: OrderStatus) =>
    Promise.reject(new Error("Order status update endpoint not yet available")),
};
