import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

const rawApiUrl = (import.meta.env.VITE_API_URL as string | undefined)?.trim() || 'http://localhost:3000/api/v1';
const cleanApiUrl = rawApiUrl.replace(/\/+$/, '');
const API_URL = cleanApiUrl.endsWith('/api/v1') ? cleanApiUrl : `${cleanApiUrl}/api/v1`;

let accessToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler;
}

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (accessToken) {
    config.headers.set('Authorization', `Bearer ${accessToken}`);
  }
  return config;
});

interface RetryableConfig extends InternalAxiosRequestConfig {
  _retried?: boolean;
}

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = axios
      .post<{ data: { accessToken: string } }>(`${API_URL}/auth/refresh`, null, { withCredentials: true })
      .then((response) => response.data.data.accessToken)
      .catch(() => null)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetryableConfig | undefined;

    if (error.response?.status === 401 && config && !config._retried && !config.url?.includes('/auth/')) {
      config._retried = true;
      const newToken = await refreshAccessToken();
      if (newToken) {
        setAccessToken(newToken);
        config.headers.set('Authorization', `Bearer ${newToken}`);
        return apiClient(config);
      }
      onUnauthorized?.();
    }

    return Promise.reject(error);
  },
);

/** Every backend response is enveloped as { data: T }; unwrap it here. */
export function unwrap<T>(response: { data: { data: T } }): T {
  return response.data.data;
}
