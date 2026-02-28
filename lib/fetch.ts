// Вызовы Django API с подстановкой токена из SecureStore
import * as SecureStore from "expo-secure-store";

const AUTH_TOKEN_KEY = "access-token";

const getApiBaseUrl = (): string => {
  const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (!baseUrl) {
    console.error("[API] EXPO_PUBLIC_API_BASE_URL не задан");
    throw new Error("Укажите EXPO_PUBLIC_API_BASE_URL в .env");
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

// Универсальный fetch к API: сам подставляет Bearer-токен из хранилища
export const fetchAPI = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);

  const config: RequestInit = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  };

  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }

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