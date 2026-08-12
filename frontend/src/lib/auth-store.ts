import { create } from 'zustand';
import { User } from '@/types';
import { api } from './api';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  initAuth: () => Promise<void>;
  login: (credentials: { email: string; password: string }) => Promise<any>;
  register: (data: { name: string; email: string; password: string }) => Promise<any>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,

  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),

  initAuth: async () => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('accessToken');
    if (!token) {
      set({ user: null, token: null, isLoading: false });
      return;
    }

    try {
      const user: any = await api.get('/auth/me');
      set({ user: user as User, token, isLoading: false });
    } catch {
      localStorage.removeItem('accessToken');
      set({ user: null, token: null, isLoading: false });
    }
  },

  login: async (credentials) => {
    set({ isLoading: true });
    try {
      const data: any = await api.post('/auth/login', credentials);
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', data.accessToken);
      }
      set({ user: data.user, token: data.accessToken, isLoading: false });
      return data;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (registerData) => {
    set({ isLoading: true });
    try {
      const data: any = await api.post('/auth/register', registerData);
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', data.accessToken);
      }
      set({ user: data.user, token: data.accessToken, isLoading: false });
      return data;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Ignore network errors on logout
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
    }
    set({ user: null, token: null });
  },
}));
