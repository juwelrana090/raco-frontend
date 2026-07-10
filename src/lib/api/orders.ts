import { apiClient } from './apiClient';

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';

export interface IOrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number; // in poisha
  productImage?: string;
}

export interface IOrder {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  items: IOrderItem[];
  totalAmount: number; // in poisha
  status: OrderStatus;
  shippingAddress: string;
  paymentMethod: string;
  paymentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IOrderListResponse {
  orders: IOrder[];
  total: number;
  page: number;
  limit: number;
}

export const orderApi = {
  // GET /orders — returns CURRENT USER's orders (not all orders)
  // NOTE: Backend has no admin "all orders" endpoint yet.
  // Admin view uses same endpoint scoped to admin user's own orders.
  getAll: (filters?: { status?: string; page?: number; limit?: number }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.limit) params.append('limit', String(filters.limit));
    const q = params.toString();
    return apiClient.get<IOrderListResponse>(`/orders${q ? `?${q}` : ''}`);
  },

  // GET /orders/:id
  getById: (id: string) => apiClient.get<IOrder>(`/orders/${id}`),

  // POST /orders — create order from cart
  create: (items: { productId: string; quantity: number }[]) =>
    apiClient.post<IOrder>('/orders', { items }),

  // POST /orders/:id/checkout — initiate payment
  checkout: (id: string, provider: 'STRIPE' | 'BKASH') =>
    apiClient.post<any>(`/orders/${id}/checkout`, { provider }),

  // DELETE /orders/:id — cancel order (PENDING only)
  cancel: (id: string) => apiClient.delete<IOrder>(`/orders/${id}`),

  // PATCH /orders/:id/status — update order status (admin only)
  updateStatus: (id: string, status: OrderStatus) =>
    apiClient.patch<IOrder>(`/orders/${id}/status`, { status }),
};
