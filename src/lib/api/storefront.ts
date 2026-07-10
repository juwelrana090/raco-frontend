import { apiClient } from "@/lib/api/apiClient";

export const storefrontApi = {
  getProducts: (params: Record<string, string | number | undefined>) =>
    apiClient.get<{ items: any[]; total: number }>(
      `/products?${new URLSearchParams(params as Record<string, string>)}`,
    ),
  getProduct: (id: string) => apiClient.get<any>(`/products/${id}`),
  getCategories: () => apiClient.get<any[]>("/categories"),
  getCategory: (id: string) => apiClient.get<any>(`/categories/${id}`),
};
