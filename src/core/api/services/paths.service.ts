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

function unwrap<T>(data: any): T {
  return (data as any)?.data ?? data;
}

export const pathsService = {
  getStats(): Promise<PathStats> {
    return apiClient
      .get(ENDPOINTS.PATHS.STATS)
      .then(({ data }) => unwrap<PathStats>(data));
  },

  getAll(params?: PathsQueryParams): Promise<PaginatedResponse<LearningPathListItem>> {
    return apiClient
      .get(ENDPOINTS.PATHS.LIST, { params })
      .then(({ data }) => unwrap<PaginatedResponse<LearningPathListItem>>(data));
  },

  getById(id: string): Promise<LearningPath> {
    return apiClient
      .get(ENDPOINTS.PATHS.DETAIL(id))
      .then(({ data }) => unwrap<LearningPath>(data));
  },

  create(payload: CreatePathRequest): Promise<LearningPath> {
    return apiClient
      .post(ENDPOINTS.PATHS.CREATE, payload)
      .then(({ data }) => unwrap<LearningPath>(data));
  },

  update(id: string, payload: UpdatePathRequest): Promise<LearningPath> {
    return apiClient
      .patch(ENDPOINTS.PATHS.UPDATE(id), payload)
      .then(({ data }) => unwrap<LearningPath>(data));
  },

  updateModules(id: string, modules: CreatePathRequest['modules']): Promise<LearningPath> {
    return apiClient
      .patch(ENDPOINTS.PATHS.UPDATE(id), { modules })
      .then(({ data }) => unwrap<LearningPath>(data));
  },

  reorderModules(id: string, orders: { id: string; order: number }[]): Promise<any> {
    return apiClient
      .patch(ENDPOINTS.PATHS.REORDER_MODULES(id), { orders })
      .then(({ data }) => unwrap(data));
  },

  publish(id: string): Promise<LearningPath> {
    return apiClient
      .patch(ENDPOINTS.PATHS.PUBLISH(id))
      .then(({ data }) => unwrap<LearningPath>(data));
  },

  unpublish(id: string): Promise<LearningPath> {
    return apiClient
      .patch(ENDPOINTS.PATHS.UNPUBLISH(id))
      .then(({ data }) => unwrap<LearningPath>(data));
  },

  delete(id: string): Promise<void> {
    return apiClient
      .delete(ENDPOINTS.PATHS.DELETE(id))
      .then(() => undefined);
  },
};
