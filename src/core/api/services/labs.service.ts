// src/core/api/services/labs.service.ts
import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';
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
    const { data } = await apiClient.get<LabStats>(ENDPOINTS.LABS.STATS);
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
      ENDPOINTS.LABS.LIST,
      { params },
    );
    return data;
  },

  getById: async (id: string): Promise<Lab> => {
    const { data } = await apiClient.get<Lab>(ENDPOINTS.LABS.DETAIL(id));
    return data;
  },

  create: async (payload: CreateLabRequest): Promise<LabListItem> => {
    const { data } = await apiClient.post<LabListItem>(ENDPOINTS.LABS.CREATE, payload);
    return data;
  },

  update: async (id: string, payload: UpdateLabRequest): Promise<LabListItem> => {
    const { data } = await apiClient.patch<LabListItem>(ENDPOINTS.LABS.UPDATE(id), payload);
    return data;
  },

  publish: async (id: string) => {
    const { data } = await apiClient.patch(ENDPOINTS.LABS.PUBLISH(id));
    return data;
  },

  unpublish: async (id: string) => {
    const { data } = await apiClient.patch(ENDPOINTS.LABS.UNPUBLISH(id));
    return data;
  },

  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    const { data } = await apiClient.delete(ENDPOINTS.LABS.DELETE(id));
    return data;
  },
};
