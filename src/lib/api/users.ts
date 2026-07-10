import { apiClient } from './apiClient';
import type { IUser } from './types';

export const userApi = {
  list: async (params?: { page?: number; limit?: number }) => {
    // NOTE: There is no GET /users (admin list) endpoint in the backend spec.
    // The admin users page will be empty until backend adds this endpoint.
    console.warn('GET /users admin list endpoint not yet available in backend');
    return Promise.resolve({ users: [] as IUser[], total: 0, page: 1, limit: 10 });
  },

  getById: (id: string) => {
    // NOTE: No GET /users/:id endpoint exists. Only /users/me.
    console.warn('GET /users/:id endpoint not available in backend');
    return Promise.resolve(null as unknown as IUser);
  },

  updateRole: (id: string, role: 'USER' | 'ADMIN') => {
    // NOTE: No PATCH /users/:id/role endpoint exists in the backend spec.
    console.warn('PATCH /users/:id/role endpoint not available in backend');
    return Promise.resolve(null as unknown as IUser);
  },
};
