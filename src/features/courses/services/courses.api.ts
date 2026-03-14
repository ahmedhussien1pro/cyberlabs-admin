// src/features/courses/services/courses.api.ts
import { adminApiClient } from '@/core/api/admin-client';
import type {
  AdminCourse,
  AdminCourseCreateDto,
  AdminCourseUpdateDto,
  AdminCoursesListResponse,
  AdminCourseStats,
  CourseState,
} from '../types';

export interface CourseListParams {
  page?: number;
  limit?: number;
  search?: string;
  state?: CourseState | 'all';
  difficulty?: string;
}

function unwrapItem<T>(res: unknown): T {
  const p = (res as any)?.data ?? res;
  return ((p as any)?.data ?? p) as T;
}

function unwrapList<T>(res: unknown): T {
  const p = (res as any)?.data ?? res;
  if ((p as any)?.data !== undefined && (p as any)?.meta !== undefined) return p as T;
  const arr = Array.isArray((p as any)?.data) ? (p as any).data : Array.isArray(p) ? p : [];
  return { data: arr, meta: { total: arr.length, page: 1, limit: 20, totalPages: 1 } } as T;
}

function normalize(c: AdminCourse): AdminCourse {
  return {
    ...c,
    tags:             Array.isArray(c.tags)             ? c.tags             : [],
    skills:           Array.isArray(c.skills)           ? c.skills           : [],
    ar_skills:        Array.isArray(c.ar_skills)        ? c.ar_skills        : [],
    topics:           Array.isArray(c.topics)           ? c.topics           : [],
    ar_topics:        Array.isArray(c.ar_topics)        ? c.ar_topics        : [],
    prerequisites:    Array.isArray(c.prerequisites)    ? c.prerequisites    : [],
    ar_prerequisites: Array.isArray(c.ar_prerequisites) ? c.ar_prerequisites : [],
    labSlugs:         Array.isArray(c.labSlugs)         ? c.labSlugs         : [],
    // Normalize color to UPPERCASE to match CourseColor type
    color: ((c.color as string)?.toUpperCase() ?? 'BLUE') as AdminCourse['color'],
  };
}

export const coursesApi = {
  list: async (p: CourseListParams = {}): Promise<AdminCoursesListResponse> => {
    const q: Record<string, unknown> = { page: p.page ?? 1, limit: p.limit ?? 20 };
    if (p.search)     q.search = p.search;
    if (p.difficulty) q.difficulty = p.difficulty;
    if (p.state && p.state !== 'all') q.state = p.state;
    const res = await adminApiClient.get('/admin/courses', { params: q });
    return unwrapList<AdminCoursesListResponse>(res);
  },

  getStats: async (): Promise<AdminCourseStats> => {
    const res = await adminApiClient.get('/admin/courses/stats');
    return unwrapItem<AdminCourseStats>(res);
  },

  getBySlug: async (slug: string): Promise<AdminCourse> => {
    try {
      const res = await adminApiClient.get(`/admin/courses/${slug}`);
      const c = unwrapItem<AdminCourse>(res);
      if (c && 'id' in c) return normalize(c);
    } catch (e: unknown) {
      const s = (e as any)?.response?.status ?? (e as any)?.status;
      if (s !== 404 && s !== 400) throw e;
    }
    const list = await coursesApi.list({ search: slug, limit: 50 });
    const match = (list.data ?? []).find((c: AdminCourse) => c.slug === slug || c.id === slug);
    if (!match) throw Object.assign(new Error(`Course not found: ${slug}`), { statusCode: 404 });
    const res = await adminApiClient.get(`/admin/courses/${match.id}`);
    return normalize(unwrapItem<AdminCourse>(res));
  },

  create: async (data: AdminCourseCreateDto): Promise<AdminCourse> => {
    const res = await adminApiClient.post('/admin/courses', data);
    return normalize(unwrapItem<AdminCourse>(res));
  },

  update: async (id: string, data: AdminCourseUpdateDto): Promise<AdminCourse> => {
    const res = await adminApiClient.patch(`/admin/courses/${id}`, data);
    return normalize(unwrapItem<AdminCourse>(res));
  },

  publish: async (id: string): Promise<AdminCourse> => {
    const res = await adminApiClient.patch(`/admin/courses/${id}/publish`);
    return normalize(unwrapItem<AdminCourse>(res));
  },

  unpublish: async (id: string): Promise<AdminCourse> => {
    const res = await adminApiClient.patch(`/admin/courses/${id}/unpublish`);
    return normalize(unwrapItem<AdminCourse>(res));
  },

  delete: async (id: string): Promise<void> => {
    await adminApiClient.delete(`/admin/courses/${id}`);
  },

  duplicate: async (id: string): Promise<AdminCourse> => {
    const res = await adminApiClient.post(`/admin/courses/${id}/duplicate`);
    return normalize(unwrapItem<AdminCourse>(res));
  },

  getCurriculum: async (courseId: string): Promise<unknown> => {
    const res = await adminApiClient.get(`/admin/courses/${courseId}/curriculum`);
    const p = unwrapItem<Record<string, unknown>>(res);
    return {
      topics:      Array.isArray(p?.topics) ? p.topics : [],
      totalTopics: Number(p?.totalTopics)   || 0,
      landingData: p?.landingData ?? null,
    };
  },

  saveCurriculum: async (courseId: string, topics: object[]): Promise<unknown> => {
    const res = await adminApiClient.put(`/admin/courses/${courseId}/curriculum`, { topics });
    return unwrapItem(res);
  },
};
