// Глобальное состояние авторизации (Zustand)
import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

const AUTH_TOKEN_KEY = 'access-token';
const REFRESH_TOKEN_KEY = 'refresh-token';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;

  setAuthenticated: (value: boolean) => void;
  setLoading: (value: boolean) => void;
  initialize: () => Promise<void>;
  clearAuth: () => Promise<void>;
}

// Хелперы токенов (дублируем здесь, чтобы не тянуть useAuth и не создавать циклы)
const getAuthToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error('[AuthStore] Error getting access token:', error);
    return null;
  }
};

const removeAuthToken = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error('[AuthStore] Error removing access token:', error);
  }
};

const removeRefreshToken = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('[AuthStore] Error removing refresh token:', error);
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isLoading: true,
  isInitialized: false,

  setAuthenticated: (value: boolean) => set({ isAuthenticated: value }),
  setLoading: (value: boolean) => set({ isLoading: value }),

  initialize: async () => {
    try {
      set({ isLoading: true });
      const token = await getAuthToken();
      set({ 
        isAuthenticated: !!token, 
        isLoading: false,
        isInitialized: true 
      });
    } catch (error) {
      console.error('[AuthStore] Initialize error:', error);
      set({ 
        isAuthenticated: false, 
        isLoading: false,
        isInitialized: true 
      });
    }
  },

  clearAuth: async () => {
    try {
      await removeAuthToken();
      await removeRefreshToken();
    } catch (error) {
      console.error('[AuthStore] Clear auth error:', error);
    } finally {
      set({ isAuthenticated: false });
    }
  },
}));
