// src/core/api/services/courses.service.ts
import { apiClient } from '../client';
import { API_ENDPOINTS } from '../endpoints';
import type {
  PaginatedResponse,
  CourseListItem,
  Course,
  CourseStats,
  CreateCourseRequest,
  UpdateCourseRequest,
  CourseState,
} from '@/core/types';

export interface CourseLabItem {
  order: number;
  lab: {
    id: string;
    title: string;
    ar_title?: string;
    slug: string;
    difficulty: string;
    category: string;
    duration?: number;
    xpReward: number;
    pointsReward: number;
    isPublished: boolean;
    imageUrl?: string;
    executionMode: string;
  };
}

export interface CurriculumSection {
  id?: string;
  title: string;
  ar_title?: string;
  description?: string;
  ar_description?: string;
  order?: number;
  lessons?: CurriculumLesson[];
}

export interface CurriculumLesson {
  id?: string;
  title: string;
  ar_title?: string;
  type: string;
  content?: string;
  videoUrl?: string;
  duration?: number;
  order?: number;
}

export const coursesService = {
  getStats: async (): Promise<CourseStats> => {
    const { data } = await apiClient.get<CourseStats>(
      API_ENDPOINTS.ADMIN_COURSES.STATS,
    );
    return data;
  },

  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    difficulty?: string;
    category?: string;
    access?: string;
    state?: string;
    isPublished?: boolean;
  }): Promise<PaginatedResponse<CourseListItem>> => {
    const { data } = await apiClient.get<PaginatedResponse<CourseListItem>>(
      API_ENDPOINTS.ADMIN_COURSES.LIST,
      { params },
    );
    return data;
  },

  getById: async (id: string): Promise<Course> => {
    const { data } = await apiClient.get<Course>(
      API_ENDPOINTS.ADMIN_COURSES.DETAIL(id),
    );
    return data;
  },

  create: async (payload: CreateCourseRequest): Promise<CourseListItem> => {
    const { data } = await apiClient.post<CourseListItem>(
      API_ENDPOINTS.ADMIN_COURSES.CREATE,
      payload,
    );
    return data;
  },

  update: async (
    id: string,
    payload: UpdateCourseRequest,
  ): Promise<CourseListItem> => {
    const { data } = await apiClient.patch<CourseListItem>(
      API_ENDPOINTS.ADMIN_COURSES.UPDATE(id),
      payload,
    );
    return data;
  },

  publish: async (id: string) => {
    const { data } = await apiClient.patch(
      API_ENDPOINTS.ADMIN_COURSES.PUBLISH(id),
    );
    return data;
  },

  unpublish: async (id: string) => {
    const { data } = await apiClient.patch(
      API_ENDPOINTS.ADMIN_COURSES.UNPUBLISH(id),
    );
    return data;
  },

  // ✅ NEW — update state to PUBLISHED | DRAFT | COMING_SOON
  updateState: async (
    id: string,
    state: CourseState,
  ): Promise<CourseListItem> => {
    const { data } = await apiClient.patch<CourseListItem>(
      API_ENDPOINTS.ADMIN_COURSES.STATE(id),
      { state },
    );
    return data;
  },

  delete: async (id: string): Promise<{ success: boolean }> => {
    const { data } = await apiClient.delete(
      API_ENDPOINTS.ADMIN_COURSES.DELETE(id),
    );
    return data;
  },

  // ── Curriculum Management ────────────────────────────────────────────

  // ✅ NEW — GET /admin/courses/:id/curriculum
  getCurriculum: async (
    id: string,
  ): Promise<{ sections: CurriculumSection[] }> => {
    const { data } = await apiClient.get(
      API_ENDPOINTS.ADMIN_COURSES.CURRICULUM(id),
    );
    return data;
  },

  // ✅ NEW — PUT /admin/courses/:id/curriculum
  updateCurriculum: async (
    id: string,
    topics: object[],
  ): Promise<{ success: boolean }> => {
    const { data } = await apiClient.put(
      API_ENDPOINTS.ADMIN_COURSES.CURRICULUM(id),
      { topics },
    );
    return data;
  },

  // ── CourseLab Management ──────────────────────────────────────────

  getCourseLabs: async (courseId: string): Promise<CourseLabItem[]> => {
    const { data } = await apiClient.get<CourseLabItem[]>(
      API_ENDPOINTS.ADMIN_COURSES.LABS(courseId),
    );
    return data;
  },

  attachLab: async (
    courseId: string,
    labId: string,
  ): Promise<CourseLabItem> => {
    const { data } = await apiClient.post<CourseLabItem>(
      API_ENDPOINTS.ADMIN_COURSES.ATTACH_LAB(courseId, labId),
    );
    return data;
  },

  detachLab: async (
    courseId: string,
    labId: string,
  ): Promise<{ success: boolean; message: string }> => {
    const { data } = await apiClient.delete(
      API_ENDPOINTS.ADMIN_COURSES.DETACH_LAB(courseId, labId),
    );
    return data;
  },

  reorderLabs: async (
    courseId: string,
    labIds: string[],
  ): Promise<{ success: boolean }> => {
    const { data } = await apiClient.patch(
      API_ENDPOINTS.ADMIN_COURSES.REORDER_LABS(courseId),
      { labIds },
    );
    return data;
  },
};
