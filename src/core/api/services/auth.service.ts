import { apiClient } from '../client';
import { API_ENDPOINTS } from '../endpoints';
import type { LoginRequest, AuthResponse, User } from '@/core/types';

export const authService = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials);
    return data;
  },

  getMe: async (): Promise<User> => {
    const { data } = await apiClient.get<User>(API_ENDPOINTS.AUTH.ME);
    return data;
  },

  /**
   * Verifies that the current token belongs to an ADMIN user.
   * Calls GET /admin/health which is protected by AdminGuard on the backend.
   * Returns 403 for non-admin authenticated users.
   * Must be called after storing the access_token cookie and before granting dashboard access.
   */
  verifyAdminHealth: async (): Promise<any> => {
    const { data } = await apiClient.get(API_ENDPOINTS.ADMIN.HEALTH);
    return data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
  },
};
