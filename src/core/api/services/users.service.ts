// src/core/api/services/users.service.ts
import { apiClient } from '../client';
import { API_ENDPOINTS } from '../endpoints';
import type {
  PaginatedResponse,
  UserListItem,
  User,
  UserStats,
  UpdateUserRoleRequest,
} from '@/core/types';

function unwrap<T>(data: any): T {
  return (data as any)?.data ?? data;
}

export const usersService = {
  getStats: async (): Promise<UserStats> => {
    const { data } = await apiClient.get<UserStats>(API_ENDPOINTS.USERS.STATS);
    return unwrap<UserStats>(data);
  },

  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    isActive?: boolean;
  }): Promise<PaginatedResponse<UserListItem>> => {
    const { data } = await apiClient.get<PaginatedResponse<UserListItem>>(
      API_ENDPOINTS.USERS.LIST,
      { params },
    );
    return unwrap<PaginatedResponse<UserListItem>>(data);
  },

  getById: async (id: string): Promise<User> => {
    const { data } = await apiClient.get<User>(API_ENDPOINTS.USERS.DETAIL(id));
    return unwrap<User>(data);
  },

  updateRole: async (id: string, payload: UpdateUserRoleRequest): Promise<User> => {
    const { data } = await apiClient.patch<User>(
      API_ENDPOINTS.USERS.ROLE(id),
      payload,
    );
    return unwrap<User>(data);
  },

  suspend: async (id: string, reason?: string): Promise<User> => {
    const body = reason ? { reason } : {};
    const { data } = await apiClient.patch<User>(
      API_ENDPOINTS.USERS.SUSPEND(id),
      body,
    );
    return unwrap<User>(data);
  },

  unsuspend: async (id: string): Promise<User> => {
    const { data } = await apiClient.patch<User>(API_ENDPOINTS.USERS.SUSPEND(id));
    return unwrap<User>(data);
  },
};
