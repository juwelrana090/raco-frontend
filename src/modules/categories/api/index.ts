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
    apiClient.get<{ products: Array<{ id: string; name: string; price: number; stock: number }> }>(`/categories/${id}/products`),

  create: (data: { name: string; description?: string; parentId?: string }) =>
    apiClient.post<ICategory>('/categories', data),

  update: (id: string, data: { name?: string; description?: string; parentId?: string }) =>
    apiClient.patch<ICategory>(`/categories/${id}`, data),

  delete: (id: string) => apiClient.delete<void>(`/categories/${id}`),

  // POST /categories/:id/image — multipart/form-data, Admin only
  uploadImage: async (
    id: string,
    file: File,
  ): Promise<{ imageUrl: string }> => {
    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";
    const token =
      typeof document !== "undefined"
        ? document.cookie
            .split("; ")
            .find((r) => r.startsWith("raco_token="))
            ?.split("=")[1]
        : "";
    const form = new FormData();
    form.append("image", file);
    const res = await fetch(`${baseUrl}/categories/${id}/image`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message ?? "Upload failed");
    return json.data;
  },

  // DELETE /categories/:id/image — Admin only
  deleteImage: (id: string) =>
    apiClient.delete<void>(`/categories/${id}/image`),
};
