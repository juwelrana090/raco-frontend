import { apiClient } from '@/lib/api/apiClient';
import type { IPayment, IPaymentListResponse } from '../types';

export const paymentsApi = {
  getAll: (filters?: { search?: string; status?: string; provider?: string; page?: number; limit?: number }) => {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.provider) params.append('provider', filters.provider);
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.limit) params.append('limit', String(filters.limit));
    const query = params.toString();
    return apiClient.get<IPaymentListResponse>(`/payments${query ? `?${query}` : ''}`);
  },
};
