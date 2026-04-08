// Global auth state (Zustand) — uses lib/storage for web + native compatibility
import { create } from 'zustand';
import * as storage from '@/lib/storage';

const AUTH_TOKEN_KEY = 'access-token';
const REFRESH_TOKEN_KEY = 'refresh-token';
const USER_ROLES_KEY = 'user-roles';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;

  setAuthenticated: (value: boolean) => void;
  setLoading: (value: boolean) => void;
  initialize: () => Promise<void>;
  clearAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isLoading: true,
  isInitialized: false,

  setAuthenticated: (value: boolean) => set({ isAuthenticated: value }),
  setLoading: (value: boolean) => set({ isLoading: value }),

  initialize: async () => {
    try {
      set({ isLoading: true });
      const token = await storage.getItem(AUTH_TOKEN_KEY);
      set({
        isAuthenticated: !!token,
        isLoading: false,
        isInitialized: true,
      });
    } catch (error) {
      console.error('[AuthStore] Initialize error:', error);
      set({ isAuthenticated: false, isLoading: false, isInitialized: true });
    }
  },

  clearAuth: async () => {
    try {
      await storage.removeItem(AUTH_TOKEN_KEY);
      await storage.removeItem(REFRESH_TOKEN_KEY);
      await storage.removeItem(USER_ROLES_KEY);
    } catch (error) {
      console.error('[AuthStore] Clear auth error:', error);
    } finally {
      set({ isAuthenticated: false });
    }
  },
}));
