import { apiClient } from '../client';
import { API_ENDPOINTS } from '../endpoints';
import type {
  PaginatedResponse,
  CourseListItem,
  Course,
  CourseStats,
  CreateCourseRequest,
  UpdateCourseRequest,
} from '@/core/types';

export const coursesService = {
  getStats: async (): Promise<CourseStats> => {
    const { data } = await apiClient.get<CourseStats>(API_ENDPOINTS.ADMIN_COURSES.STATS);
    return data;
  },

  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    difficulty?: string;
    isPublished?: boolean;
  }): Promise<PaginatedResponse<CourseListItem>> => {
    const { data } = await apiClient.get<PaginatedResponse<CourseListItem>>(
      API_ENDPOINTS.ADMIN_COURSES.LIST,
      { params }
    );
    return data;
  },

  getById: async (id: string): Promise<Course> => {
    const { data } = await apiClient.get<Course>(API_ENDPOINTS.ADMIN_COURSES.DETAIL(id));
    return data;
  },

  create: async (payload: CreateCourseRequest): Promise<CourseListItem> => {
    const { data } = await apiClient.post<CourseListItem>(
      API_ENDPOINTS.ADMIN_COURSES.CREATE,
      payload
    );
    return data;
  },

  update: async (id: string, payload: UpdateCourseRequest): Promise<CourseListItem> => {
    const { data } = await apiClient.patch<CourseListItem>(
      API_ENDPOINTS.ADMIN_COURSES.UPDATE(id),
      payload
    );
    return data;
  },

  publish: async (id: string): Promise<{ id: string; slug: string; title: string; isPublished: boolean }> => {
    const { data } = await apiClient.patch(API_ENDPOINTS.ADMIN_COURSES.PUBLISH(id));
    return data;
  },

  unpublish: async (id: string): Promise<{ id: string; slug: string; title: string; isPublished: boolean }> => {
    const { data } = await apiClient.patch(API_ENDPOINTS.ADMIN_COURSES.UNPUBLISH(id));
    return data;
  },

  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    const { data } = await apiClient.delete(API_ENDPOINTS.ADMIN_COURSES.DELETE(id));
    return data;
  },
};
