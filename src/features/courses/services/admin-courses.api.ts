// src/features/courses/services/admin-courses.api.ts
import { adminApiClient } from '@/core/api/admin-client';
import type {
  AdminCourse,
  AdminCourseUpdateDto,
  AdminCourseCreateDto,
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

/**
 * Safely unwrap backend responses.
 * Handles shapes:
 *   - AxiosResponse: { data: { ... } }  → uses res.data
 *   - Already unwrapped payload: { accessToken, ... } or { data: [...] }
 *   - Nested course: { data: { course: { ... } } }
 */
function unwrap<T>(res: any): T {
  // If it looks like a full AxiosResponse (has .status + .data), unwrap .data
  const raw = (res?.status !== undefined && res?.data !== undefined)
    ? res.data
    : res;
  if (raw?.course) return raw.course as T;
  return raw as T;
}

function normalizeArrays(course: AdminCourse): AdminCourse {
  return {
    ...course,
    tags:             Array.isArray(course.tags)             ? course.tags             : [],
    skills:           Array.isArray(course.skills)           ? course.skills           : [],
    ar_skills:        Array.isArray(course.ar_skills)        ? course.ar_skills        : [],
    topics:           Array.isArray(course.topics)           ? course.topics           : [],
    ar_topics:        Array.isArray(course.ar_topics)        ? course.ar_topics        : [],
    prerequisites:    Array.isArray(course.prerequisites)    ? course.prerequisites    : [],
    ar_prerequisites: Array.isArray(course.ar_prerequisites) ? course.ar_prerequisites : [],
    labSlugs:         Array.isArray(course.labSlugs)         ? course.labSlugs         : [],
  };
}

export const adminCoursesApi = {
  // ── List ────────────────────────────────────────────────────────────────────
  list: async (params: AdminCourseListParams = {}): Promise<AdminCoursesListResponse> => {
    const query: Record<string, any> = {
      page:  params.page  ?? 1,
      limit: params.limit ?? 20,
    };
    if (params.search)                          query.search     = params.search;
    if (params.state && params.state !== 'all') query.state      = params.state;
    if (params.difficulty)                      query.difficulty = params.difficulty;

    const res = await adminApiClient.get('/admin/courses', { params: query });
    return unwrap<AdminCoursesListResponse>(res);
  },

  // ── Stats ────────────────────────────────────────────────────────────────
  getStats: async (): Promise<AdminCourseStats> => {
    const res = await adminApiClient.get('/admin/courses/stats');
    return unwrap<AdminCourseStats>(res);
  },

  // ── Get by ID ────────────────────────────────────────────────────────────
  getById: async (id: string): Promise<AdminCourse> => {
    const res = await adminApiClient.get(`/admin/courses/${id}`);
    return normalizeArrays(unwrap<AdminCourse>(res));
  },

  // ── Get by Slug ──────────────────────────────────────────────────────────
  // 1. Try direct GET /admin/courses/:slug
  // 2. Fallback: search list, find exact slug match, then getById
  getBySlug: async (slug: string): Promise<AdminCourse> => {
    try {
      const res = await adminApiClient.get(`/admin/courses/${slug}`);
      const candidate = unwrap<AdminCourse>(res);
      if (candidate && typeof candidate === 'object' && 'id' in candidate) {
        return normalizeArrays(candidate);
      }
    } catch (err: any) {
      const status = err?.response?.status ?? err?.status;
      if (status !== 404 && status !== 400) throw err;
    }

    // Fallback: search by slug in list
    const listRes = await adminCoursesApi.list({ search: slug, limit: 50 });
    const match = (listRes.data ?? []).find(
      (c) => c.slug === slug || c.id === slug,
    );
    if (!match) {
      const err: any = new Error(`Course not found: ${slug}`);
      err.statusCode = 404;
      throw err;
    }
    return adminCoursesApi.getById(match.id);
  },

  // ── Create ───────────────────────────────────────────────────────────────
  create: async (data: AdminCourseCreateDto): Promise<AdminCourse> => {
    const res = await adminApiClient.post('/admin/courses', data);
    return normalizeArrays(unwrap<AdminCourse>(res));
  },

  // ── Update ───────────────────────────────────────────────────────────────
  update: async (id: string, data: AdminCourseUpdateDto): Promise<AdminCourse> => {
    const res = await adminApiClient.patch(`/admin/courses/${id}`, data);
    return normalizeArrays(unwrap<AdminCourse>(res));
  },

  // ── State Management ─────────────────────────────────────────────────────
  setState: async (id: string, state: CourseState): Promise<AdminCourse> => {
    const res = await adminApiClient.patch(`/admin/courses/${id}`, { state });
    return normalizeArrays(unwrap<AdminCourse>(res));
  },

  // ── Delete ───────────────────────────────────────────────────────────────
  delete: async (id: string): Promise<void> => {
    await adminApiClient.delete(`/admin/courses/${id}`);
  },

  // ── Curriculum ───────────────────────────────────────────────────────────
  getCurriculum: async (courseId: string): Promise<CurriculumData> => {
    const res = await adminApiClient.get(`/admin/courses/${courseId}/curriculum`);
    const payload = unwrap<any>(res);
    return {
      topics:      Array.isArray(payload?.topics) ? payload.topics : [],
      totalTopics: Number(payload?.totalTopics)   || 0,
      landingData: payload?.landingData            ?? null,
    };
  },

  saveCurriculum: async (courseId: string, topics: object[]): Promise<any> => {
    const res = await adminApiClient.put(
      `/admin/courses/${courseId}/curriculum`,
      { topics },
    );
    return unwrap(res);
  },

  // ── Path Relations ─────────────────────────────────────────────────────
  getPathModules: async (courseId: string): Promise<any[]> => {
    const res = await adminApiClient.get(`/admin/courses/${courseId}/path-modules`);
    const d = unwrap<any>(res);
    return Array.isArray(d) ? d : (d?.data ?? []);
  },

  addToPath: async (pathId: string, courseId: string, order: number): Promise<any> => {
    const res = await adminApiClient.post(`/admin/paths/${pathId}/modules`, {
      type: 'COURSE',
      courseId,
      order,
    });
    return unwrap(res);
  },

  removeFromPath: async (moduleId: string): Promise<void> => {
    await adminApiClient.delete(`/admin/path-modules/${moduleId}`);
  },

  reorderPathModule: async (moduleId: string, order: number): Promise<any> => {
    const res = await adminApiClient.patch(`/admin/path-modules/${moduleId}`, { order });
    return unwrap(res);
  },
};
