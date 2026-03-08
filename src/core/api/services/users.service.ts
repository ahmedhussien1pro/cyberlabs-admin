import { apiClient } from '../client';
import { API_ENDPOINTS } from '../endpoints';
import type {
  PaginatedResponse,
  UserListItem,
  User,
  UserStats,
  UpdateUserRoleRequest,
} from '@/core/types';

export const usersService = {
  getStats: async (): Promise<UserStats> => {
    const { data } = await apiClient.get<UserStats>(API_ENDPOINTS.ADMIN_USERS.STATS);
    return data;
  },

  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    isActive?: boolean;
  }): Promise<PaginatedResponse<UserListItem>> => {
    const { data } = await apiClient.get<PaginatedResponse<UserListItem>>(
      API_ENDPOINTS.ADMIN_USERS.LIST,
      { params }
    );
    return data;
  },

  getById: async (id: string): Promise<User> => {
    const { data } = await apiClient.get<User>(API_ENDPOINTS.ADMIN_USERS.DETAIL(id));
    return data;
  },

  updateRole: async (id: string, payload: UpdateUserRoleRequest): Promise<User> => {
    const { data } = await apiClient.patch<User>(
      API_ENDPOINTS.ADMIN_USERS.UPDATE_ROLE(id),
      payload
    );
    return data;
  },

  suspend: async (id: string, reason?: string): Promise<User> => {
    const { data } = await apiClient.patch<User>(
      API_ENDPOINTS.ADMIN_USERS.SUSPEND(id),
      { reason }
    );
    return data;
  },

  unsuspend: async (id: string): Promise<User> => {
    const { data } = await apiClient.patch<User>(API_ENDPOINTS.ADMIN_USERS.UNSUSPEND(id));
    return data;
  },
};
