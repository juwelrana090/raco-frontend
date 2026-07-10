'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { orderApi, type IOrder, type OrderStatus } from '@/lib/api/orders';
import { toast } from 'react-toastify';

export function useOrders(params?: { page?: number; limit?: number; status?: OrderStatus }) {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: () => orderApi.getAll(params),
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => orderApi.getById(id),
    enabled: !!id,
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      orderApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order status updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update order status');
    },
  });
}
