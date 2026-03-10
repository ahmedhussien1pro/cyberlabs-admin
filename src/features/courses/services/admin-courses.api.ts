// src/features/courses/services/admin-courses.api.ts
import { adminApiClient } from '@/core/api/admin-client';
import type {
  AdminCourse,
  AdminCourseUpdateDto,
  AdminCoursesListResponse,
  AdminCourseStats,
  CurriculumData,
  CourseState,
} from '../types/admin-course.types';

export interface AdminCourseListParams {
  page?: number;
  limit?: number;
  search?: string;
  state?: CourseState | 'all';
  difficulty?: string;
}

export const adminCoursesApi = {
  // ── List ─────────────────────────────────────────────────────────
  list: async (
    params: AdminCourseListParams = {},
  ): Promise<AdminCoursesListResponse> => {
    const query: Record<string, any> = {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
    };
    if (params.search) query.search = params.search;
    if (params.state && params.state !== 'all') query.state = params.state;
    if (params.difficulty) query.difficulty = params.difficulty;
    const res = await adminApiClient.get('/admin/courses', { params: query });
    return res.data ?? res;
  },

  // ── Stats ────────────────────────────────────────────────────────
  getStats: async (): Promise<AdminCourseStats> => {
    const res = await adminApiClient.get('/admin/courses/stats');
    return res.data ?? res;
  },

  // ── Get Single ───────────────────────────────────────────────────
  getBySlug: async (slug: string): Promise<AdminCourse> => {
    const res = await adminApiClient.get(`/admin/courses/${slug}`);
    return res.data ?? res;
  },

  getById: async (id: string): Promise<AdminCourse> => {
    const res = await adminApiClient.get(`/admin/courses/by-id/${id}`);
    return res.data ?? res;
  },

  // ── Create ───────────────────────────────────────────────────────
  create: async (data: Partial<AdminCourse>): Promise<AdminCourse> => {
    const res = await adminApiClient.post('/admin/courses', data);
    return res.data ?? res;
  },

  // ── Update Metadata ──────────────────────────────────────────────
  update: async (
    id: string,
    data: AdminCourseUpdateDto,
  ): Promise<AdminCourse> => {
    const res = await adminApiClient.patch(`/admin/courses/${id}`, data);
    return res.data ?? res;
  },

  // ── State Management (PUBLISHED / DRAFT / COMING_SOON) ──────────
  // ✅ يكتب على Course.state — وليس boolean toggle
  setState: async (id: string, state: CourseState): Promise<AdminCourse> => {
    const res = await adminApiClient.patch(`/admin/courses/${id}`, { state });
    return res.data ?? res;
  },

  // ── Delete ───────────────────────────────────────────────────────
  delete: async (id: string): Promise<void> => {
    await adminApiClient.delete(`/admin/courses/${id}`);
  },

  // ── Curriculum ───────────────────────────────────────────────────
  // يستخدم نفس endpoint المنصة للقراءة
  getCurriculum: async (slug: string): Promise<CurriculumData> => {
    const res = await adminApiClient.get(`/courses/${slug}/curriculum`);
    const payload = res.data ?? res;
    return {
      topics: Array.isArray(payload?.topics) ? payload.topics : [],
      totalTopics: Number(payload?.totalTopics) || 0,
      landingData: payload?.landingData ?? null,
    };
  },

  // يحفظ الـ curriculum عبر admin endpoint
  saveCurriculum: async (courseId: string, topics: object[]): Promise<any> => {
    const res = await adminApiClient.put(
      `/admin/courses/${courseId}/curriculum`,
      { topics },
    );
    return res.data ?? res;
  },

  // ── Path Relations (عبر PathModule — وليس direct relation) ───────
  getPathModules: async (courseId: string): Promise<any[]> => {
    const res = await adminApiClient.get(
      `/admin/courses/${courseId}/path-modules`,
    );
    return res.data ?? res;
  },

  addToPath: async (
    pathId: string,
    courseId: string,
    order: number,
  ): Promise<any> => {
    const res = await adminApiClient.post(`/admin/paths/${pathId}/modules`, {
      type: 'COURSE',
      courseId,
      order,
    });
    return res.data ?? res;
  },

  removeFromPath: async (moduleId: string): Promise<void> => {
    await adminApiClient.delete(`/admin/path-modules/${moduleId}`);
  },

  reorderPathModule: async (moduleId: string, order: number): Promise<any> => {
    const res = await adminApiClient.patch(`/admin/path-modules/${moduleId}`, {
      order,
    });
    return res.data ?? res;
  },
};
