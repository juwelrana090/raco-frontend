import { apiClient } from "./apiClient";

interface IProduct {
  id: string;
  name: string;
  sku?: string;
  description: string | null;
  price: number;
  stock: number;
  categoryId: string;
  category?: {
    id: string;
    name: string;
  };
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ICategory {
  id: string;
  name: string;
  parentId: string | null;
  imageUrl: string | null;
  fileManagerId: string | null;
  createdAt: string;
  updatedAt: string;
  children?: ICategory[];
}

export const storefrontApi = {
  // GET /products (public)
  getProducts: (params: Record<string, string | number | undefined>) => {
    const query = new URLSearchParams(
      Object.fromEntries(
        Object.entries(params)
          .filter(([, v]) => v !== undefined && v !== "")
          .map(([k, v]) => [k, String(v)]),
      ),
    ).toString();
    return apiClient.get<{
      products: IProduct[];
      pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    }>(`/products${query ? `?${query}` : ""}`);
  },

  getProduct: (id: string) => apiClient.get<IProduct>(`/products/${id}`),

  // GET /products/:id/recommendations
  getRecommendations: (id: string, limit = 4) =>
    apiClient.get<{ items: IProduct[] }>(
      `/products/${id}/recommendations?limit=${limit}`,
    ),

  // GET /categories (returns nested tree)
  getCategories: () => apiClient.get<ICategory[]>("/categories"),

  getCategory: (id: string) => apiClient.get<ICategory>(`/categories/${id}`),

  // GET /categories/:id/products
  getCategoryProducts: (id: string) =>
    apiClient.get<{ products: IProduct[] }>(`/categories/${id}/products`),
};
