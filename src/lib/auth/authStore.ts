import { create } from 'zustand';
import Cookies from 'js-cookie';
import type { IUser } from '@/lib/api/types';

interface AuthStore {
  user: IUser | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: IUser, token: string, refreshToken: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: Cookies.get('raco_token') ?? null,
  isAuthenticated: !!Cookies.get('raco_token'),
  setAuth: (user, token, refreshToken) => {
    Cookies.set('raco_token', token, { expires: 1, sameSite: 'strict' });
    Cookies.set('raco_refresh', refreshToken, { expires: 7, sameSite: 'strict' });
    set({ user, token, isAuthenticated: true });
  },
  clearAuth: () => {
    Cookies.remove('raco_token');
    Cookies.remove('raco_refresh');
    set({ user: null, token: null, isAuthenticated: false });
  },
}));