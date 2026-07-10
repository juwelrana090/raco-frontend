import { apiClient } from '@/lib/api/apiClient';
import type { IProduct, IProductListResponse, IProductFilters } from '../types';

export const productsApi = {
  getAll: (filters?: IProductFilters) => {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.categoryId) params.append('categoryId', filters.categoryId);
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.limit) params.append('limit', String(filters.limit));
    const query = params.toString();
    return apiClient.get<IProductListResponse>(`/products${query ? `?${query}` : ''}`);
  },

  getById: (id: string) =>
    apiClient.get<IProduct>(`/products/${id}`),

  create: (data: { name: string; sku: string; description?: string; price: number; stock: number; status: string; categoryId: string }) =>
    apiClient.post<IProduct>('/products', data),

  update: (id: string, data: { name?: string; sku?: string; description?: string; price?: number; stock?: number; status?: string; categoryId?: string }) =>
    apiClient.patch<IProduct>(`/products/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<void>(`/products/${id}`),

  uploadImage: (id: string, file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return apiClient.post<IProduct>(`/products/${id}/image`, formData as unknown as BodyInit);
  },
};
