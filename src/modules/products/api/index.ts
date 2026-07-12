import { apiClient } from '@/lib/api/apiClient';
import type { IProduct, IProductListResponse, IProductFilters } from '../types';

function buildQuery(filters?: IProductFilters | Record<string, string | number | undefined>): string {
  if (!filters) return '';
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== '' && v !== null) params.append(k, String(v));
  });
  const q = params.toString();
  return q ? `?${q}` : '';
}

export const productsApi = {
  getAll: (filters?: IProductFilters) =>
    apiClient.get<IProductListResponse>(`/products${buildQuery(filters)}`),

  getById: (id: string) => apiClient.get<IProduct>(`/products/${id}`),

  getRecommendations: (id: string, limit?: number) =>
    apiClient.get<{ products: IProduct[] }>(`/products/${id}/recommendations${limit ? `?limit=${limit}` : ''}`),

  create: (data: {
    sku: string;
    name: string;
    description?: string;
    price: number;
    stock: number;
    imageUrl?: string;
    categoryId: string;
  }) => apiClient.post<IProduct>('/products', data),

  update: (id: string, data: {
    sku?: string;
    name?: string;
    description?: string;
    price?: number;
    stock?: number;
    imageUrl?: string;
    categoryId?: string;
  }) => apiClient.patch<IProduct>(`/products/${id}`, data),

  delete: (id: string) => apiClient.delete<void>(`/products/${id}`),

  uploadImage: async (id: string, file: File): Promise<{ imageUrl: string }> => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';
    const token = typeof document !== 'undefined'
      ? document.cookie.split('; ').find(r => r.startsWith('raco_token='))?.split('=')[1]
      : '';
    const form = new FormData();
    form.append('image', file);
    const res = await fetch(`${baseUrl}/products/${id}/image`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message ?? 'Upload failed');
    return json.data;
  },

  deleteImage: (id: string) => apiClient.delete<void>(`/products/${id}/image`),
};
