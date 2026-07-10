import { apiClient } from './apiClient';

export const storefrontApi = {
  // GET /products (public)
  getProducts: (params: Record<string, string | number | undefined>) => {
    const query = new URLSearchParams(
      Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== undefined && v !== '')
          .map(([k, v]) => [k, String(v)])
      )
    ).toString();
    return apiClient.get<{ items: any[]; total: number }>(
      `/products${query ? `?${query}` : ''}`
    );
  },

  getProduct: (id: string) => apiClient.get<any>(`/products/${id}`),

  // GET /products/:id/recommendations
  getRecommendations: (id: string, limit = 4) =>
    apiClient.get<{ items: any[] }>(`/products/${id}/recommendations?limit=${limit}`),

  // GET /categories (returns nested tree)
  getCategories: () => apiClient.get<any[]>('/categories'),

  getCategory: (id: string) => apiClient.get<any>(`/categories/${id}`),

  // GET /categories/:id/products
  getCategoryProducts: (id: string) =>
    apiClient.get<any>(`/categories/${id}/products`),
};
