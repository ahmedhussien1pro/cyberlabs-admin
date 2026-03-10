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

// Backend returns { data: T } for single items and { data: T[], meta: {...} } for lists.
// axios wraps the whole response so res.data = the backend payload.
function unwrapItem<T>(res: any): T {
  const payload = res?.data ?? res;
  return (payload?.data ?? payload) as T;
}

function unwrapList<T>(res: any): PaginatedResponse<T> {
  const payload = res?.data ?? res;
  if (payload?.data !== undefined && payload?.meta !== undefined) {
    return payload as PaginatedResponse<T>;
  }
  const arr = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
  return {
    data: arr,
    meta: { total: arr.length, page: 1, limit: arr.length || 20, totalPages: 1 },
  };
}

export const pathsService = {
  getStats(): Promise<PathStats> {
    return apiClient
      .get(ENDPOINTS.PATHS.STATS)
      .then((res) => unwrapItem<PathStats>(res));
  },

  getAll(params?: PathsQueryParams): Promise<PaginatedResponse<LearningPathListItem>> {
    return apiClient
      .get(ENDPOINTS.PATHS.LIST, { params })
      .then((res) => unwrapList<LearningPathListItem>(res));
  },

  getById(id: string): Promise<LearningPath> {
    return apiClient
      .get(ENDPOINTS.PATHS.DETAIL(id))
      .then((res) => unwrapItem<LearningPath>(res));
  },

  create(payload: CreatePathRequest): Promise<LearningPath> {
    return apiClient
      .post(ENDPOINTS.PATHS.CREATE, payload)
      .then((res) => unwrapItem<LearningPath>(res));
  },

  update(id: string, payload: UpdatePathRequest): Promise<LearningPath> {
    return apiClient
      .patch(ENDPOINTS.PATHS.UPDATE(id), payload)
      .then((res) => unwrapItem<LearningPath>(res));
  },

  updateModules(id: string, modules: CreatePathRequest['modules']): Promise<LearningPath> {
    return apiClient
      .patch(ENDPOINTS.PATHS.UPDATE(id), { modules })
      .then((res) => unwrapItem<LearningPath>(res));
  },

  reorderModules(id: string, orders: { id: string; order: number }[]): Promise<any> {
    return apiClient
      .patch(ENDPOINTS.PATHS.REORDER_MODULES(id), { orders })
      .then((res) => unwrapItem(res));
  },

  publish(id: string): Promise<LearningPath> {
    return apiClient
      .patch(ENDPOINTS.PATHS.PUBLISH(id))
      .then((res) => unwrapItem<LearningPath>(res));
  },

  unpublish(id: string): Promise<LearningPath> {
    return apiClient
      .patch(ENDPOINTS.PATHS.UNPUBLISH(id))
      .then((res) => unwrapItem<LearningPath>(res));
  },

  duplicate(id: string): Promise<LearningPath> {
    return apiClient
      .post(`/admin/paths/${id}/duplicate`)
      .then((res) => unwrapItem<LearningPath>(res));
  },

  delete(id: string): Promise<void> {
    return apiClient
      .delete(ENDPOINTS.PATHS.DELETE(id))
      .then(() => undefined);
  },
};
