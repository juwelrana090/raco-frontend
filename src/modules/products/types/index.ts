export interface IProduct {
  id: string;
  name: string;
  sku: string;
  description?: string;
  price: number;
  stock: number;
  status: 'active' | 'inactive';
  imageUrl?: string;
  category: {
    id: string;
    name: string;
  };
  categoryId: string;
  createdAt: string;
  updatedAt: string;
}

export interface IProductListResponse {
  products: IProduct[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IProductFilters {
  search?: string;
  status?: string;
  categoryId?: string;
  page?: number;
  limit?: number;
}
