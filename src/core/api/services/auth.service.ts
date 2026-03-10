// src/core/api/services/auth.service.ts
import { apiClient } from '../client';
import { API_ENDPOINTS } from '../endpoints';
import type { LoginRequest, AuthResponse, User } from '@/core/types';

export const authService = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials,
    );
    // Backend may return { data: { accessToken, user } } or { accessToken, user } directly
    const payload = (data as any)?.data ?? data;
    return payload as AuthResponse;
  },

  getMe: async (): Promise<User> => {
    const { data } = await apiClient.get<User>(API_ENDPOINTS.AUTH.ME);
    const payload = (data as any)?.data ?? data;
    return payload as User;
  },

  /**
   * Verifies that the current token belongs to an ADMIN user.
   * Calls GET /admin/health which is protected by AdminGuard on the backend.
   * Returns 403 for non-admin authenticated users.
   */
  verifyAdminHealth: async (): Promise<any> => {
    const { data } = await apiClient.get(API_ENDPOINTS.ADMIN.HEALTH);
    return data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
  },
};
