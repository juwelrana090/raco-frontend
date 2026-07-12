import { apiClient } from "./apiClient";

export interface IProduct {
  id: string;
  name: string;
  sku: string;
  description: string | null;
  price: number; // stored in poisha (100 poisha = 1 BDT)
  stock: number;
  categoryId: string;
  category: {
    id: string;
    name: string;
  };
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IProductListResponse {
  products: IProduct[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface IProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
}

function buildQuery(filters?: IProductFilters | Record<string, string | number | undefined>): string {
  if (!filters) return "";
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== "" && v !== null) params.append(k, String(v));
  });
  const q = params.toString();
  return q ? `?${q}` : "";
}

export const productApi = {
  // GET /products (public — no auth needed for listing)
  getAll: (filters?: IProductFilters) =>
    apiClient.get<IProductListResponse>(`/products${buildQuery(filters)}`),

  getById: (id: string) => apiClient.get<IProduct>(`/products/${id}`),

  // GET /products/:id/recommendations
  getRecommendations: (id: string, limit?: number) =>
    apiClient.get<IProduct[]>(
      `/products/${id}/recommendations${limit ? `?limit=${limit}` : ""}`,
    ),

  // POST /products — Admin only
  // Fields: sku*, name*, description, price*, stock*, imageUrl, categoryId*
  // NO 'status' field in backend DTO
  create: (data: {
    sku: string;
    name: string;
    description?: string;
    price: number;
    stock: number;
    imageUrl?: string;
    categoryId: string;
  }) => apiClient.post<IProduct>("/products", data),

  // PATCH /products/:id — Admin only
  update: (
    id: string,
    data: {
      sku?: string;
      name?: string;
      description?: string;
      price?: number;
      stock?: number;
      imageUrl?: string;
      categoryId?: string;
    },
  ) => apiClient.patch<IProduct>(`/products/${id}`, data),

  // DELETE /products/:id — Admin only
  delete: (id: string) => apiClient.delete<void>(`/products/${id}`),

  // POST /products/:id/image — multipart/form-data, Admin only
  // Must use raw fetch — apiClient forces application/json Content-Type
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
    const res = await fetch(`${baseUrl}/products/${id}/image`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message ?? "Upload failed");
    return json.data;
  },

  // DELETE /products/:id/image — Admin only
  deleteImage: (id: string) => apiClient.delete<void>(`/products/${id}/image`),
};
