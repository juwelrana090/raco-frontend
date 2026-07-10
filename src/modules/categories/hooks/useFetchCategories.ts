import { useQuery } from '@tanstack/react-query';
import { categoriesApi } from '../api';

export function useFetchCategories(search?: string) {
  return useQuery({
    queryKey: ['categories', search],
    queryFn: () => categoriesApi.getAll(search),
  });
}

export function useFetchCategoryTree() {
  return useQuery({
    queryKey: ['categories', 'tree'],
    queryFn: () => categoriesApi.getTree(),
  });
}

export function useFetchCategory(id: string) {
  return useQuery({
    queryKey: ['categories', id],
    queryFn: () => categoriesApi.getById(id),
    enabled: !!id,
  });
}
