export interface ICategory {
  id: string;
  name: string;
  description?: string | null;
  parentId?: string | null;
  imageUrl?: string | null;
  fileManagerId?: number | null;
  children?: ICategory[];
  createdAt: string;
  updatedAt: string;
}

export interface ICategoryFilters {
  search?: string;
  page?: number;
  limit?: number;
}
