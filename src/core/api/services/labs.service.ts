// src/core/api/services/labs.service.ts
import { apiClient } from '../client';
import { API_ENDPOINTS } from '../endpoints';
import type {
  PaginatedResponse,
  LabListItem,
  Lab,
  LabStats,
  CreateLabRequest,
  UpdateLabRequest,
} from '@/core/types';

// Backend returns { data: T } for single items and { data: T[], meta: {...} } for lists.
// axios wraps the whole response so res.data = the backend payload.
function unwrapItem<T>(res: any): T {
  const payload = res?.data ?? res;
  return (payload?.data ?? payload) as T;
}

function unwrapList<T>(res: any): PaginatedResponse<T> {
  const payload = res?.data ?? res;
  // payload = { data: T[], meta: {...} } from backend
  if (payload?.data !== undefined && payload?.meta !== undefined) {
    return payload as PaginatedResponse<T>;
  }
  // fallback: payload is the array itself
  const arr = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
  return {
    data: arr,
    meta: { total: arr.length, page: 1, limit: arr.length || 20, totalPages: 1 },
  };
}

export const labsService = {
  getStats: async (): Promise<LabStats> => {
    const res = await apiClient.get(API_ENDPOINTS.ADMIN_LABS.STATS);
    return unwrapItem<LabStats>(res);
  },

  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    difficulty?: string;
    category?: string;
    executionMode?: string;
    isPublished?: boolean;
  }): Promise<PaginatedResponse<LabListItem>> => {
    const res = await apiClient.get(API_ENDPOINTS.ADMIN_LABS.LIST, { params });
    return unwrapList<LabListItem>(res);
  },

  getById: async (id: string): Promise<Lab> => {
    const res = await apiClient.get(API_ENDPOINTS.ADMIN_LABS.DETAIL(id));
    return unwrapItem<Lab>(res);
  },

  create: async (payload: CreateLabRequest): Promise<LabListItem> => {
    const res = await apiClient.post(API_ENDPOINTS.ADMIN_LABS.CREATE, payload);
    return unwrapItem<LabListItem>(res);
  },

  update: async (id: string, payload: UpdateLabRequest): Promise<LabListItem> => {
    const res = await apiClient.patch(API_ENDPOINTS.ADMIN_LABS.UPDATE(id), payload);
    return unwrapItem<LabListItem>(res);
  },

  publish: async (id: string): Promise<{ id: string; slug: string; title: string; isPublished: boolean }> => {
    const res = await apiClient.patch(API_ENDPOINTS.ADMIN_LABS.PUBLISH(id));
    return unwrapItem(res);
  },

  unpublish: async (id: string): Promise<{ id: string; slug: string; title: string; isPublished: boolean }> => {
    const res = await apiClient.patch(API_ENDPOINTS.ADMIN_LABS.UNPUBLISH(id));
    return unwrapItem(res);
  },

  duplicate: async (id: string): Promise<LabListItem> => {
    const res = await apiClient.post(`/admin/labs/${id}/duplicate`);
    return unwrapItem<LabListItem>(res);
  },

  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    const res = await apiClient.delete(API_ENDPOINTS.ADMIN_LABS.DELETE(id));
    return unwrapItem(res);
  },
};
