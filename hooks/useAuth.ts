// Регистрация, вход, выход, хранение токенов
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';
import { fetchAPI } from '@/lib/fetch';
import { useAuthStore } from '@/store/authStore';

const AUTH_TOKEN_KEY = 'access-token';
const REFRESH_TOKEN_KEY = 'refresh-token';

// Access-токен
export const getAuthToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error('[Auth] Error getting access token:', error);
    return null;
  }
};

export const setAuthToken = async (token: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
  } catch (error) {
    console.error('[Auth] Error setting access token:', error);
    throw error;
  }
};

export const removeAuthToken = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error('[Auth] Error removing access token:', error);
  }
};

// Refresh-токен
export const getRefreshToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('[Auth] Error getting refresh token:', error);
    return null;
  }
};

export const setRefreshToken = async (token: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
  } catch (error) {
    console.error('[Auth] Error setting refresh token:', error);
    throw error;
  }
};

export const removeRefreshToken = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('[Auth] Error removing refresh token:', error);
  }
};

// Регистрация
export const useRegister = () => {
  return useMutation({
    mutationFn: ({
      phone,
      password,
      first_name,
      last_name,
    }: {
      phone: string;
      password: string;
      first_name?: string;
      last_name?: string;
    }) =>
      fetchAPI('/auth/register/', {
        method: 'POST',
        body: JSON.stringify({
          phone,
          password,
          password2: password,
          first_name: first_name || '',
          last_name: last_name || '',
          role: 'customer',
        }),
      }),
  });
};

// Вход
export const useLogin = () => {
  const queryClient = useQueryClient();
  const { setAuthenticated } = useAuthStore();

  return useMutation({
    mutationFn: ({ phone, password }: { phone: string; password: string }) =>
      fetchAPI('/auth/login/', {
        method: 'POST',
        body: JSON.stringify({ phone, password }),
      }),
    onSuccess: async (data) => {
      await setAuthToken(data.access);
      await setRefreshToken(data.refresh);
      setAuthenticated(true);
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
};

// Обновление токена (refresh)
export const useRefreshToken = () => {
  return useMutation({
    mutationFn: async () => {
      const refresh = await getRefreshToken();
      return fetchAPI('/auth/refresh/', {
        method: 'POST',
        body: JSON.stringify({ refresh }),
      });
    },
    onSuccess: async (data) => {
      await setAuthToken(data.access);
      if (data.refresh) {
        await setRefreshToken(data.refresh);
      }
    },
  });
};

// Выход (отправляем refresh на бэк для чёрного списка)
export const useLogout = () => {
  const queryClient = useQueryClient();
  const { setAuthenticated } = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      const refresh = await getRefreshToken();
      return fetchAPI('/auth/logout/', {
        method: 'POST',
        body: JSON.stringify({ refresh }),
      });
    },
    onSuccess: async () => {
      await removeAuthToken();
      await removeRefreshToken();
      setAuthenticated(false);
      queryClient.clear();
    },
    onError: async () => {
      await removeAuthToken();
      await removeRefreshToken();
      setAuthenticated(false);
      queryClient.clear();
    },
  });
};

// Проверка авторизации (для сплэша)
export const useAuthCheck = () => {
  return useQuery({
    queryKey: ['auth', 'check'],
    queryFn: async () => {
      const token = await getAuthToken();
      return !!token;
    },
    staleTime: 0,
    gcTime: 0,
  });
};
