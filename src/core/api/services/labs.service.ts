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

export const labsService = {
  getStats: async (): Promise<LabStats> => {
    const { data } = await apiClient.get<LabStats>(API_ENDPOINTS.ADMIN_LABS.STATS);
    return data;
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
    const { data } = await apiClient.get<PaginatedResponse<LabListItem>>(
      API_ENDPOINTS.ADMIN_LABS.LIST,
      { params }
    );
    return data;
  },

  getById: async (id: string): Promise<Lab> => {
    const { data } = await apiClient.get<Lab>(API_ENDPOINTS.ADMIN_LABS.DETAIL(id));
    return data;
  },

  create: async (payload: CreateLabRequest): Promise<LabListItem> => {
    const { data } = await apiClient.post<LabListItem>(
      API_ENDPOINTS.ADMIN_LABS.CREATE,
      payload
    );
    return data;
  },

  update: async (id: string, payload: UpdateLabRequest): Promise<LabListItem> => {
    const { data } = await apiClient.patch<LabListItem>(
      API_ENDPOINTS.ADMIN_LABS.UPDATE(id),
      payload
    );
    return data;
  },

  publish: async (id: string): Promise<{ id: string; slug: string; title: string; isPublished: boolean }> => {
    const { data } = await apiClient.patch(API_ENDPOINTS.ADMIN_LABS.PUBLISH(id));
    return data;
  },

  unpublish: async (id: string): Promise<{ id: string; slug: string; title: string; isPublished: boolean }> => {
    const { data } = await apiClient.patch(API_ENDPOINTS.ADMIN_LABS.UNPUBLISH(id));
    return data;
  },

  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    const { data } = await apiClient.delete(API_ENDPOINTS.ADMIN_LABS.DELETE(id));
    return data;
  },
};
