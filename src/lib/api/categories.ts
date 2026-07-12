import { apiClient } from './apiClient';

export interface ICategory {
  id: string;
  name: string;
  description: string | null;
  parentId: string | null;
  imageUrl: string | null; // ← ADD: category image CDN URL
  fileManagerId: number | null; // ← ADD: FK to file_manager table
  parent: ICategory | null;
  children?: ICategory[];
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ICategoryListResponse {
  categories: ICategory[];
  total: number;
  page: number;
  limit: number;
}

export interface ICategoryProduct {
  id: string;
  name: string;
  price: number;
  imageUrl: string | null;
  categoryId: string;
}

export interface ICreateCategoryRequest {
  name: string;
  description?: string;
  parentId?: string;
}

export interface IUpdateCategoryRequest {
  name?: string;
  description?: string;
  parentId?: string;
}

export const categoryApi = {
  // GET /categories — returns full nested tree (array of root categories with children)
  getAll: () => apiClient.get<ICategory[]>('/categories'),

  // Alias for getAll — same endpoint, same data
  getTree: () => apiClient.get<ICategory[]>('/categories'),

  getById: (id: string) => apiClient.get<ICategory>(`/categories/${id}`),

  // GET /categories/:id/products
  getCategoryProducts: (id: string) =>
    apiClient.get<ICategoryProduct[]>(`/categories/${id}/products`),

  create: (data: ICreateCategoryRequest) =>
    apiClient.post<ICategory>('/categories', data),

  update: (id: string, data: IUpdateCategoryRequest) =>
    apiClient.patch<ICategory>(`/categories/${id}`, data),

  delete: (id: string) => apiClient.delete<void>(`/categories/${id}`),

  // POST /categories/:id/image — multipart/form-data, Admin only
  // Must use raw fetch — apiClient forces JSON Content-Type
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