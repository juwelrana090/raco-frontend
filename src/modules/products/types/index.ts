export interface IProduct {
  id: string;
  name: string;
  sku: string;
  description?: string | null;
  price: number;
  stock: number;
  imageUrl?: string | null;
  fileManagerId?: number | null;
  categoryId: string;
  category?: {
    id: string;
    name: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface IProductPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface IProductListResponse {
  products: IProduct[];
  pagination: IProductPagination;
}

export interface IProductFilters {
  search?: string;
  categoryId?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
