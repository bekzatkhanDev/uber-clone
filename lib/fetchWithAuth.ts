// Запросы к API с автоматическим обновлением токена при 401
import { router } from 'expo-router';
import { getAuthToken, getRefreshToken, removeAuthToken, removeRefreshToken, removeUserRoles, setAuthToken, setRefreshToken } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

// Обновить access-токен по refresh-токену
const refreshAccessToken = async (): Promise<boolean> => {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;

  refreshPromise = (async () => {
    try {
      const refresh = await getRefreshToken();

      if (!refresh) {
        console.log('[fetchWithAuth] Нет refresh-токена');
        return false;
      }

      const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8000';
      const response = await fetch(`${baseUrl}/api/v1/auth/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh }),
      });

      if (!response.ok) {
        console.log('[fetchWithAuth] Обновление токена не удалось:', response.status);
        return false;
      }

      const data = await response.json();

      await setAuthToken(data.access);
      if (data.refresh) {
        await setRefreshToken(data.refresh);
      }

      console.log('[fetchWithAuth] Токен обновлён');
      return true;
    } catch (error) {
      console.error('[fetchWithAuth] Ошибка обновления токена:', error);
      return false;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

// Выход: чистим токены и редирект на экран входа (вызывается вне React — используем getState)
const handleLogout = async () => {
  await removeAuthToken();
  await removeRefreshToken();
  await removeUserRoles();
  useAuthStore.getState().setAuthenticated(false);
  router.replace('/(auth)/welcome');
};

// fetch с подстановкой Bearer-токена и повторной попыткой после обновления при 401
export const fetchWithAuth = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
  const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8000';
  const url = `${baseUrl}/api/v1${endpoint}`;

  let token = await getAuthToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401 && token) {
    console.log('[fetchWithAuth] 401, пробуем обновить токен...');

    const refreshSuccess = await refreshAccessToken();

    if (refreshSuccess) {
      token = await getAuthToken();
      headers['Authorization'] = `Bearer ${token}`;

      response = await fetch(url, {
        ...options,
        headers,
      });
    } else {
      console.log('[fetchWithAuth] Обновление не удалось, выход');
      await handleLogout();
      throw new Error('Сессия истекла. Войдите снова.');
    }
  }

  let responseData;
  try {
    responseData = await response.json();
  } catch {
    responseData = null;
  }

  if (!response.ok) {
    // Try to extract the most useful human-readable message from DRF responses
    let message =
      responseData?.detail ||
      responseData?.error ||
      responseData?.message;

    // DRF field-level errors: { field: ["msg", ...], non_field_errors: [...] }
    if (!message && responseData && typeof responseData === 'object') {
      const allMessages = Object.values(responseData as Record<string, any>)
        .flat()
        .filter((v) => typeof v === 'string');
      if (allMessages.length > 0) message = allMessages.join(' ');
    }

    const error = new Error(message || `HTTP ${response.status}: ${response.statusText}`);
    (error as any).status = response.status;
    (error as any).responseData = responseData;
    throw error;
  }

  return responseData;
};

export const isAuthenticated = async (): Promise<boolean> => {
  const token = await getAuthToken();
  return !!token;
};
