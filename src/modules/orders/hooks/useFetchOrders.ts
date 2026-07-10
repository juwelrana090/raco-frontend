import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '../api';
import type { IOrderFilters } from '../types';

export function useFetchOrders(filters?: IOrderFilters) {
  return useQuery({
    queryKey: ['orders', filters],
    queryFn: () => ordersApi.getAll(filters),
  });
}

export function useFetchOrder(id: string) {
  return useQuery({
    queryKey: ['orders', id],
    queryFn: () => ordersApi.getById(id),
    enabled: !!id,
  });
}
