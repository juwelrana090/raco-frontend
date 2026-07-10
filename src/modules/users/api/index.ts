import { apiClient } from "@/lib/api/apiClient";
import type { IUser } from "../types";

export const usersAdminApi = {
  getAll: (_params?: Record<string, any>) => {
    console.warn('GET /users admin list endpoint not yet available in backend');
    return Promise.resolve({ items: [] as IUser[], total: 0 });
  },

  getById: (_id: string) => {
    console.warn('GET /users/:id endpoint not available in backend');
    return Promise.resolve(null as unknown as IUser);
  },

  getOrders: (_id: string) => {
    console.warn('GET /users/:id/orders endpoint not available in backend');
    return Promise.resolve({ items: [] as any[], total: 0 });
  },
};
