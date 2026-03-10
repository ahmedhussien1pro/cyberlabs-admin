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

function unwrapItem<T>(res: any): T {
  const payload = res?.data ?? res;
  return (payload?.data ?? payload) as T;
}

function unwrapList<T>(res: any): PaginatedResponse<T> {
  const payload = res?.data ?? res;
  if (payload?.data !== undefined && payload?.meta !== undefined) {
    return payload as PaginatedResponse<T>;
  }
  const arr = Array.isArray(payload?.data)
    ? payload.data
    : Array.isArray(payload)
    ? payload
    : [];
  return {
    data: arr,
    meta: { total: arr.length, page: 1, limit: arr.length || 20, totalPages: 1 },
  };
}

export const usersService = {
  getStats: async (): Promise<UserStats> => {
    const res = await apiClient.get(API_ENDPOINTS.USERS.STATS);
    const payload = res?.data ?? res;
    return (payload?.data ?? payload) as UserStats;
  },

  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    isActive?: boolean;
  }): Promise<PaginatedResponse<UserListItem>> => {
    const res = await apiClient.get(API_ENDPOINTS.USERS.LIST, { params });
    return unwrapList<UserListItem>(res);
  },

  getById: async (id: string): Promise<User> => {
    const res = await apiClient.get(API_ENDPOINTS.USERS.DETAIL(id));
    return unwrapItem<User>(res);
  },

  updateRole: async (id: string, payload: UpdateUserRoleRequest): Promise<User> => {
    const res = await apiClient.patch(API_ENDPOINTS.USERS.ROLE(id), payload);
    return unwrapItem<User>(res);
  },

  suspend: async (id: string, reason?: string): Promise<User> => {
    const body = reason ? { reason } : {};
    const res = await apiClient.patch(API_ENDPOINTS.USERS.SUSPEND(id), body);
    return unwrapItem<User>(res);
  },

  unsuspend: async (id: string): Promise<User> => {
    const res = await apiClient.patch(`/admin/users/${id}/unsuspend`);
    return unwrapItem<User>(res);
  },

  /** GET /admin/users/:id/activity */
  getActivity: async (
    id: string,
    params?: { type?: string; limit?: number; page?: number },
  ): Promise<{ items: any[]; total: number }> => {
    const res = await apiClient.get(API_ENDPOINTS.USERS.ACTIVITY(id), { params });
    const payload = res?.data ?? res;
    // backend may return { data: { items, total } } or { items, total } directly
    const inner = payload?.data ?? payload;
    const items = inner?.items ?? inner?.data ?? (Array.isArray(inner) ? inner : []);
    const total = inner?.total ?? items.length;
    return { items, total };
  },
};
