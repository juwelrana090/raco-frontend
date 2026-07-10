export interface ICategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string | null;
  parent?: ICategory | null;
  children?: ICategory[];
  productCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ICategoryListResponse {
  categories: ICategory[];
  total: number;
}

export interface ICategoryFilters {
  search?: string;
  page?: number;
  limit?: number;
}
