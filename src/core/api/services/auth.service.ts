import { apiClient } from '../client';
import { API_ENDPOINTS } from '../endpoints';
import type { LoginRequest, AuthResponse, User } from '@/core/types';

export const authService = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials,
    );
    return data;
  },

  getMe: async (): Promise<User> => {
    const { data } = await apiClient.get<User>(API_ENDPOINTS.AUTH.ME);
    return data;
  },

  verifyAdminHealth: async (): Promise<any> => {
    const { data } = await apiClient.get(API_ENDPOINTS.ADMIN.HEALTH);
    return data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
  },
};
