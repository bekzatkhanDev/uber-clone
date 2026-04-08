// Django API calls with Bearer token — web + native via lib/storage
import * as storage from '@/lib/storage';

const AUTH_TOKEN_KEY = 'access-token';

const getApiBaseUrl = (): string => {
  const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (!baseUrl) {
    console.error('[API] EXPO_PUBLIC_API_BASE_URL not set');
    throw new Error('Set EXPO_PUBLIC_API_BASE_URL in .env');
  }
  return `${baseUrl}/api/v1`;
};

const API_BASE_URL = getApiBaseUrl();

export class ApiError extends Error {
  status: number;
  responseData: unknown;

  constructor(message: string, status: number, responseData?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.responseData = responseData;
  }
}

export const fetchAPI = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = await storage.getItem(AUTH_TOKEN_KEY);

  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };

  try {
    const response = await fetch(url, config);

    let responseData;
    try {
      responseData = await response.json();
    } catch {
      responseData = null;
    }

    if (!response.ok) {
      const error = new Error(
        responseData?.detail ||
          responseData?.error ||
          responseData?.message ||
          `HTTP ${response.status}: ${response.statusText}`
      );
      (error as any).status = response.status;
      (error as any).responseData = responseData;
      throw error;
    }

    return responseData;
  } catch (error) {
    console.error(`[API] ${endpoint} failed:`, error);
    throw error;
  }
};
