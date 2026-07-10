import { apiClient } from './apiClient';

export interface ICategory {
  id: string;
  name: string;
  description: string | null;
  parentId: string | null;
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
    apiClient.get<any>(`/categories/${id}/products`),

  create: (data: ICreateCategoryRequest) =>
    apiClient.post<ICategory>('/categories', data),

  update: (id: string, data: IUpdateCategoryRequest) =>
    apiClient.patch<ICategory>(`/categories/${id}`, data),

  delete: (id: string) => apiClient.delete<void>(`/categories/${id}`),
};
