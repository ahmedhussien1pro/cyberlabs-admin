// src/features/courses/services/courses.api.ts
import { adminApiClient } from '@/core/api/admin-client';
import type {
  Course, CourseCreateDto, CourseUpdateDto,
  CoursesListResponse, CourseStats, CourseState,
} from '../types/course.types';

export interface CourseListParams {
  page?: number;
  limit?: number;
  search?: string;
  state?: CourseState | 'all';
  difficulty?: string;
}

function unwrapItem<T>(res: any): T {
  const p = res?.data ?? res;
  return (p?.data ?? p) as T;
}

function unwrapList<T>(res: any): T {
  const p = res?.data ?? res;
  if (p?.data !== undefined && p?.meta !== undefined) return p as T;
  const arr = Array.isArray(p?.data) ? p.data : Array.isArray(p) ? p : [];
  return { data: arr, meta: { total: arr.length, page: 1, limit: 20, totalPages: 1 } } as T;
}

function normalize(c: Course): Course {
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
  };
}

export const coursesApi = {
  list: async (p: CourseListParams = {}): Promise<CoursesListResponse> => {
    const q: Record<string, any> = { page: p.page ?? 1, limit: p.limit ?? 20 };
    if (p.search)     q.search = p.search;
    if (p.difficulty) q.difficulty = p.difficulty;
    if (p.state && p.state !== 'all') {
      q.isPublished = p.state === 'PUBLISHED' ? true : false;
    }
    const res = await adminApiClient.get('/admin/courses', { params: q });
    return unwrapList<CoursesListResponse>(res);
  },

  getStats: async (): Promise<CourseStats> => {
    const res = await adminApiClient.get('/admin/courses/stats');
    return unwrapItem<CourseStats>(res);
  },

  getBySlug: async (slug: string): Promise<Course> => {
    try {
      const res = await adminApiClient.get(`/admin/courses/${slug}`);
      const c = unwrapItem<Course>(res);
      if (c && 'id' in c) return normalize(c);
    } catch (e: any) {
      const s = e?.response?.status ?? e?.status;
      if (s !== 404 && s !== 400) throw e;
    }
    // fallback: search by slug
    const list = await coursesApi.list({ search: slug, limit: 50 });
    const match = (list.data ?? []).find((c) => c.slug === slug || c.id === slug);
    if (!match) throw Object.assign(new Error(`Course not found: ${slug}`), { statusCode: 404 });
    const res = await adminApiClient.get(`/admin/courses/${match.id}`);
    return normalize(unwrapItem<Course>(res));
  },

  create: async (data: CourseCreateDto): Promise<Course> => {
    const res = await adminApiClient.post('/admin/courses', data);
    return normalize(unwrapItem<Course>(res));
  },

  update: async (id: string, data: CourseUpdateDto): Promise<Course> => {
    const res = await adminApiClient.patch(`/admin/courses/${id}`, data);
    return normalize(unwrapItem<Course>(res));
  },

  publish: async (id: string): Promise<Course> => {
    const res = await adminApiClient.patch(`/admin/courses/${id}/publish`);
    return normalize(unwrapItem<Course>(res));
  },

  unpublish: async (id: string): Promise<Course> => {
    const res = await adminApiClient.patch(`/admin/courses/${id}/unpublish`);
    return normalize(unwrapItem<Course>(res));
  },

  delete: async (id: string): Promise<void> => {
    await adminApiClient.delete(`/admin/courses/${id}`);
  },

  duplicate: async (id: string): Promise<Course> => {
    const res = await adminApiClient.post(`/admin/courses/${id}/duplicate`);
    return normalize(unwrapItem<Course>(res));
  },

  getCurriculum: async (courseId: string): Promise<any> => {
    const res = await adminApiClient.get(`/admin/courses/${courseId}/curriculum`);
    const p = unwrapItem<any>(res);
    return {
      topics:      Array.isArray(p?.topics) ? p.topics : [],
      totalTopics: Number(p?.totalTopics)   || 0,
      landingData: p?.landingData ?? null,
    };
  },

  saveCurriculum: async (courseId: string, topics: object[]): Promise<any> => {
    const res = await adminApiClient.put(`/admin/courses/${courseId}/curriculum`, { topics });
    return unwrapItem(res);
  },
};
