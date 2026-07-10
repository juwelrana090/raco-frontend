import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi } from '../api';
import { toast } from 'react-toastify';

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: {
      sku?: string;
      name?: string;
      description?: string;
      price?: number;
      stock?: number;
      imageUrl?: string;
      categoryId?: string;
      status?: string;
    } }) => {
      const { status: _status, ...payload } = data;
      return productsApi.update(id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update product');
    },
  });
}
