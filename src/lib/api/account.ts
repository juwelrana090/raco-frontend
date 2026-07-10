import { apiClient } from './apiClient';

export const accountApi = {
  // GET /users/me
  getMe: () => apiClient.get<any>('/users/me'),

  // PUT /users/me (backend uses PUT not PATCH)
  updateMe: (data: { name?: string; email?: string }) =>
    apiClient.put<any>('/users/me', data),

  // GET /users/me/orders
  getMyOrders: (params?: Record<string, string | number | undefined>) => {
    const query = new URLSearchParams(
      Object.fromEntries(
        Object.entries(params || {}).filter(([, v]) => v !== undefined)
          .map(([k, v]) => [k, String(v)])
      )
    ).toString();
    return apiClient.get<{ items: any[]; total: number }>(
      `/users/me/orders${query ? `?${query}` : ''}`
    );
  },

  // GET /orders/:id — not /users/me/orders/:id (no such endpoint)
  getMyOrder: (id: string) => apiClient.get<any>(`/orders/${id}`),

  // GET /users/me/payments
  getMyPayments: (params?: Record<string, string | number | undefined>) => {
    const query = new URLSearchParams(
      Object.fromEntries(
        Object.entries(params || {}).filter(([, v]) => v !== undefined)
          .map(([k, v]) => [k, String(v)])
      )
    ).toString();
    return apiClient.get<{ items: any[]; total: number }>(
      `/users/me/payments${query ? `?${query}` : ''}`
    );
  },
};
