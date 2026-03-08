import apiClient from '../axios-client';
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
  // GET /admin/paths/stats
  getStats(): Promise<PathStats> {
    return apiClient.get('/admin/paths/stats').then((r) => r.data);
  },

  // GET /admin/paths
  getAll(params?: PathsQueryParams): Promise<PaginatedResponse<LearningPathListItem>> {
    return apiClient.get('/admin/paths', { params }).then((r) => r.data);
  },

  // GET /admin/paths/:id
  getById(id: string): Promise<LearningPath> {
    return apiClient.get(`/admin/paths/${id}`).then((r) => r.data);
  },

  // POST /admin/paths
  create(data: CreatePathRequest): Promise<LearningPath> {
    return apiClient.post('/admin/paths', data).then((r) => r.data);
  },

  // PATCH /admin/paths/:id
  update(id: string, data: UpdatePathRequest): Promise<LearningPath> {
    return apiClient.patch(`/admin/paths/${id}`, data).then((r) => r.data);
  },

  // PATCH /admin/paths/:id/publish
  publish(id: string): Promise<LearningPath> {
    return apiClient.patch(`/admin/paths/${id}/publish`).then((r) => r.data);
  },

  // PATCH /admin/paths/:id/unpublish
  unpublish(id: string): Promise<LearningPath> {
    return apiClient.patch(`/admin/paths/${id}/unpublish`).then((r) => r.data);
  },

  // DELETE /admin/paths/:id
  delete(id: string): Promise<void> {
    return apiClient.delete(`/admin/paths/${id}`).then((r) => r.data);
  },
};
