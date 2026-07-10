import { apiClient } from '@/lib/api/apiClient';
import type { ICategory, ICategoryListResponse } from '../types';

export const categoriesApi = {
  getAll: (search?: string) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    const query = params.toString();
    return apiClient.get<ICategoryListResponse>(`/categories${query ? `?${query}` : ''}`);
  },

  getTree: () =>
    apiClient.get<ICategory[]>('/categories/tree'),

  getById: (id: string) =>
    apiClient.get<ICategory>(`/categories/${id}`),

  create: (data: { name: string; description?: string; parentId?: string }) =>
    apiClient.post<ICategory>('/categories', data),

  update: (id: string, data: { name?: string; description?: string; parentId?: string }) =>
    apiClient.patch<ICategory>(`/categories/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<void>(`/categories/${id}`),
};
