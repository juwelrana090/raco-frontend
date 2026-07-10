'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userApi } from '@/lib/api/users';
import type { IUser } from '@/lib/api/types';
import { toast } from 'react-toastify';

export function useUsers(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => userApi.list(params),
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => userApi.getById(id),
    enabled: !!id,
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: 'USER' | 'ADMIN' }) =>
      userApi.updateRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User role updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update user role');
    },
  });
}
