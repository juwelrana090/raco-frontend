'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { categoryApi, type ICategory, type ICreateCategoryRequest, type IUpdateCategoryRequest } from '@/lib/api/categories';
import { toast } from 'react-toastify';

export function useCategories(params?: { page?: number; limit?: number; search?: string }) {
  return useQuery({
    queryKey: ['categories', params],
    queryFn: () => categoryApi.getAll(),
  });
}

export function useCategory(id: string) {
  return useQuery({
    queryKey: ['category', id],
    queryFn: () => categoryApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ICreateCategoryRequest) => categoryApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create category');
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: IUpdateCategoryRequest }) =>
      categoryApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update category');
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => categoryApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete category');
    },
  });
}