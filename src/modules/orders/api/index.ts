import { apiClient } from '@/lib/api/apiClient';
import type { IOrder, IOrderListResponse } from '../types';

export const ordersApi = {
  getAll: (filters?: { status?: string; page?: number; limit?: number }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.limit) params.append('limit', String(filters.limit));
    const q = params.toString();
    return apiClient.get<IOrderListResponse>(`/orders${q ? `?${q}` : ''}`);
  },

  getById: (id: string) => apiClient.get<IOrder>(`/orders/${id}`),

  create: (items: { productId: string; quantity: number }[]) =>
    apiClient.post<IOrder>('/orders', { items }),

  checkout: (id: string, provider: 'STRIPE' | 'BKASH') =>
    apiClient.post<any>(`/orders/${id}/checkout`, { provider }),

  cancel: (id: string) => apiClient.delete<IOrder>(`/orders/${id}`),
};
