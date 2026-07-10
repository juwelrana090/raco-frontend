import { useQuery } from '@tanstack/react-query';
import { productsApi } from '../api';
import type { IProductFilters } from '../types';

export function useFetchProducts(filters?: IProductFilters) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => productsApi.getAll(filters),
  });
}

export function useFetchProduct(id: string) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => productsApi.getById(id),
    enabled: !!id,
  });
}
