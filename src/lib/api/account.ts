import { apiClient } from "./apiClient";

export interface IUser {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface IOrder {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  totalAmount: number; // in poisha - for consistency with orders API
  createdAt: string;
  updatedAt: string;
  items?: Array<{
    id: string;
    product: {
      id: string;
      name: string;
      imageUrl: string | null;
      price: number;
    };
    quantity: number;
    price: number;
    subtotal: number;
  }>;
}

export interface IPayment {
  id: string;
  amount: number;
  status: string;
  method: string;
  provider?: string;
  providerTxnId?: string;
  orderId?: string;
  createdAt: string;
  updatedAt?: string;
}

export const accountApi = {
  // GET /users/me
  getMe: () => apiClient.get<IUser>("/users/me"),

  // PUT /users/me (backend uses PUT not PATCH)
  updateMe: (data: { name?: string; email?: string }) =>
    apiClient.put<IUser>("/users/me", data),

  // GET /users/me/orders
  getMyOrders: (params?: Record<string, string | number | undefined>) => {
    const query = new URLSearchParams(
      Object.fromEntries(
        Object.entries(params || {})
          .filter(([, v]) => v !== undefined)
          .map(([k, v]) => [k, String(v)]),
      ),
    ).toString();
    return apiClient.get<IOrder[]>(`/users/me/orders${query ? `?${query}` : ""}`);
  },

  // GET /orders/:id — not /users/me/orders/:id (no such endpoint)
  getMyOrder: (id: string) => apiClient.get<IOrder>(`/orders/${id}`),

  // GET /users/me/payments
  getMyPayments: (params?: Record<string, string | number | undefined>) => {
    const query = new URLSearchParams(
      Object.fromEntries(
        Object.entries(params || {})
          .filter(([, v]) => v !== undefined)
          .map(([k, v]) => [k, String(v)]),
      ),
    ).toString();
    return apiClient.get<IPayment[]>(
      `/users/me/payments${query ? `?${query}` : ""}`,
    );
  },
};
