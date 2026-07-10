import { apiClient } from './apiClient';
import type { IUser, IAuthResponse, ILoginRequest, IRegisterRequest } from './types';

export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post<IAuthResponse>('/auth/login', { email, password }),

  register: (name: string, email: string, password: string) =>
    apiClient.post<IAuthResponse>('/auth/register', { name, email, password }),

  me: () => apiClient.get<IUser>('/auth/me'),

  refresh: (refreshToken: string) =>
    apiClient.post<{ accessToken: string; refreshToken: string }>('/auth/refresh', { refreshToken }),
};