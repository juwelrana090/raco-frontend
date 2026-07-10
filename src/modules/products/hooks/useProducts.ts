'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { productApi, type IProduct, type IProductFilters } from '@/lib/api/products';
import { toast } from 'react-toastify';

export function useProducts(params?: IProductFilters) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productApi.getAll(params),
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => productApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      sku: string;
      name: string;
      description?: string;
      price: number;
      stock: number;
      imageUrl?: string;
      categoryId: string;
    }) => productApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Product created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create product');
    },
  });
}

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
    } }) =>
      productApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Product updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update product');
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Product deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete product');
    },
  });
}
