import { apiClient } from '@/lib/api/apiClient';
import type { IOrder, IOrderListResponse } from '../types';

export const ordersApi = {
  getAll: (filters?: { search?: string; status?: string; page?: number; limit?: number }) => {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.limit) params.append('limit', String(filters.limit));
    const query = params.toString();
    return apiClient.get<IOrderListResponse>(`/orders${query ? `?${query}` : ''}`);
  },

  getById: (id: string) =>
    apiClient.get<IOrder>(`/orders/${id}`),
};
