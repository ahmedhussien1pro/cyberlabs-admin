// src/core/api/services/paths.service.ts
import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';
import type {
  LearningPath,
  LearningPathListItem,
  PathStats,
  CreatePathRequest,
  UpdatePathRequest,
  PaginatedResponse,
} from '@/core/types/api.types';

export interface PathsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  isPublished?: boolean;
}

export const pathsService = {
  getStats(): Promise<PathStats> {
    return apiClient.get(ENDPOINTS.PATHS.STATS).then((r) => r.data);
  },

  getAll(
    params?: PathsQueryParams,
  ): Promise<PaginatedResponse<LearningPathListItem>> {
    return apiClient.get(ENDPOINTS.PATHS.LIST, { params }).then((r) => r.data);
  },

  getById(id: string): Promise<LearningPath> {
    return apiClient.get(ENDPOINTS.PATHS.DETAIL(id)).then((r) => r.data);
  },

  create(data: CreatePathRequest): Promise<LearningPath> {
    return apiClient.post(ENDPOINTS.PATHS.CREATE, data).then((r) => r.data);
  },

  update(id: string, data: UpdatePathRequest): Promise<LearningPath> {
    return apiClient
      .patch(ENDPOINTS.PATHS.UPDATE(id), data)
      .then((r) => r.data);
  },

  updateModules(
    id: string,
    modules: CreatePathRequest['modules'],
  ): Promise<LearningPath> {
    return apiClient
      .patch(ENDPOINTS.PATHS.UPDATE(id), { modules })
      .then((r) => r.data);
  },

  // Reorder modules — PATCH /admin/paths/:id/modules/reorder
  reorderModules(
    id: string,
    orders: { id: string; order: number }[],
  ): Promise<any> {
    return apiClient
      .patch(ENDPOINTS.PATHS.REORDER_MODULES(id), { orders })
      .then((r) => r.data);
  },

  publish(id: string): Promise<LearningPath> {
    return apiClient.patch(ENDPOINTS.PATHS.PUBLISH(id)).then((r) => r.data);
  },

  unpublish(id: string): Promise<LearningPath> {
    return apiClient.patch(ENDPOINTS.PATHS.UNPUBLISH(id)).then((r) => r.data);
  },

  delete(id: string): Promise<void> {
    return apiClient.delete(ENDPOINTS.PATHS.DELETE(id)).then((r) => r.data);
  },
};
