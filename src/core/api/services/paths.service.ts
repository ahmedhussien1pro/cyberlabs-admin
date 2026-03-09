import { apiClient } from '../client';
import { API_ENDPOINTS } from '../endpoints';
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
    return apiClient.get(API_ENDPOINTS.ADMIN_PATHS.STATS).then((r) => r.data);
  },

  getAll(
    params?: PathsQueryParams,
  ): Promise<PaginatedResponse<LearningPathListItem>> {
    return apiClient
      .get(API_ENDPOINTS.ADMIN_PATHS.LIST, { params })
      .then((r) => r.data);
  },

  getById(id: string): Promise<LearningPath> {
    return apiClient
      .get(API_ENDPOINTS.ADMIN_PATHS.DETAIL(id))
      .then((r) => r.data);
  },

  create(data: CreatePathRequest): Promise<LearningPath> {
    return apiClient
      .post(API_ENDPOINTS.ADMIN_PATHS.CREATE, data)
      .then((r) => r.data);
  },

  update(id: string, data: UpdatePathRequest): Promise<LearningPath> {
    return apiClient
      .patch(API_ENDPOINTS.ADMIN_PATHS.UPDATE(id), data)
      .then((r) => r.data);
  },

  // ← Method جديد: يبعت الـ modules array كاملة للـ backend
  updateModules(
    id: string,
    modules: CreatePathRequest['modules'],
  ): Promise<LearningPath> {
    return apiClient
      .patch(API_ENDPOINTS.ADMIN_PATHS.UPDATE(id), { modules })
      .then((r) => r.data);
  },

  publish(id: string): Promise<LearningPath> {
    return apiClient
      .patch(API_ENDPOINTS.ADMIN_PATHS.PUBLISH(id))
      .then((r) => r.data);
  },

  unpublish(id: string): Promise<LearningPath> {
    return apiClient
      .patch(API_ENDPOINTS.ADMIN_PATHS.UNPUBLISH(id))
      .then((r) => r.data);
  },

  delete(id: string): Promise<void> {
    return apiClient
      .delete(API_ENDPOINTS.ADMIN_PATHS.DELETE(id))
      .then((r) => r.data);
  },
};
