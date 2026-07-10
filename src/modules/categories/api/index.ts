import { apiClient } from '@/lib/api/apiClient';
import type { ICategory } from '../types';

export const categoriesApi = {
  getAll: (search?: string) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    const query = params.toString();
    return apiClient.get<ICategory[]>(`/categories${query ? `?${query}` : ''}`);
  },

  getTree: () => apiClient.get<ICategory[]>('/categories'),

  getById: (id: string) => apiClient.get<ICategory>(`/categories/${id}`),

  getCategoryProducts: (id: string) =>
    apiClient.get<any>(`/categories/${id}/products`),

  create: (data: { name: string; description?: string; parentId?: string }) =>
    apiClient.post<ICategory>('/categories', data),

  update: (id: string, data: { name?: string; description?: string; parentId?: string }) =>
    apiClient.patch<ICategory>(`/categories/${id}`, data),

  delete: (id: string) => apiClient.delete<void>(`/categories/${id}`),
};
