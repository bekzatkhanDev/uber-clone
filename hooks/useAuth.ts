// Auth: register, login, logout, token helpers (web + native via lib/storage)
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as storage from '@/lib/storage';
import { fetchAPI } from '@/lib/fetch';
import { useAuthStore } from '@/store/authStore';

const AUTH_TOKEN_KEY = 'access-token';
const REFRESH_TOKEN_KEY = 'refresh-token';
const USER_ROLES_KEY = 'user-roles';

// ─── Role helpers ────────────────────────────────────────────────────────────

export const saveUserRoles = async (roles: string[]): Promise<void> => {
  await storage.setItem(USER_ROLES_KEY, JSON.stringify(roles));
};

export const getUserRoles = async (): Promise<string[]> => {
  try {
    const raw = await storage.getItem(USER_ROLES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const removeUserRoles = async (): Promise<void> => {
  await storage.removeItem(USER_ROLES_KEY);
};

// ─── Access token ─────────────────────────────────────────────────────────────

export const getAuthToken = (): Promise<string | null> =>
  storage.getItem(AUTH_TOKEN_KEY);

export const setAuthToken = (token: string): Promise<void> =>
  storage.setItem(AUTH_TOKEN_KEY, token);

export const removeAuthToken = (): Promise<void> =>
  storage.removeItem(AUTH_TOKEN_KEY);

// ─── Refresh token ───────────────────────────────────────────────────────────

export const getRefreshToken = (): Promise<string | null> =>
  storage.getItem(REFRESH_TOKEN_KEY);

export const setRefreshToken = (token: string): Promise<void> =>
  storage.setItem(REFRESH_TOKEN_KEY, token);

export const removeRefreshToken = (): Promise<void> =>
  storage.removeItem(REFRESH_TOKEN_KEY);

// ─── Mutations ───────────────────────────────────────────────────────────────

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
      if (data.user?.roles) {
        await saveUserRoles(data.user.roles);
      }
      setAuthenticated(true);
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
};

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
      if (data.refresh) await setRefreshToken(data.refresh);
    },
  });
};

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
      await removeUserRoles();
      setAuthenticated(false);
      queryClient.clear();
    },
    onError: async () => {
      await removeAuthToken();
      await removeRefreshToken();
      await removeUserRoles();
      setAuthenticated(false);
      queryClient.clear();
    },
  });
};

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
