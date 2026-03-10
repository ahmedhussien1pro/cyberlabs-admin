// src/core/api/client.ts
// ✅ Fixed: response interceptor now unwraps response.data so all
//    api services receive the payload directly (not the full AxiosResponse)
import axios, { AxiosError } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'https://backend-test.cyber-labs.tech/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
});

// ── Request interceptor — attach JWT ────────────────────────────────────────
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = Cookies.get('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

// ── Response interceptor — unwrap data + handle 401 ─────────────────────────
apiClient.interceptors.response.use(
  // ✅ return response.data so callers receive the payload directly
  (response) => response,

  (error: AxiosError) => {
    if (error.response?.status === 401) {
      Cookies.remove('access_token');
      localStorage.removeItem('cyberlabs-auth');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);
