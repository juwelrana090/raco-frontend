import { apiClient } from './apiClient';
import type { IUser, IAuthResponse } from './types';

export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post<IAuthResponse>('/auth/login', { email, password }),

  register: (name: string, email: string, password: string) =>
    apiClient.post<IAuthResponse>('/auth/register', { name, email, password }),

  refresh: (refreshToken: string) =>
    apiClient.post<{ accessToken: string; refreshToken: string }>(
      '/auth/refresh',
      { refreshToken }
    ),

  logout: (refreshToken: string) =>
    apiClient.post<void>('/auth/logout', { refreshToken }),

  validate: () => apiClient.get<IUser>('/auth/validate'),
};
