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

function unwrapItem<T>(res: any): T {
  let val = res?.data ?? res;
  for (let i = 0; i < 5; i++) {
    if (val && typeof val === 'object' && 'data' in val && !('id' in val)) {
      val = val.data;
    } else {
      break;
    }
  }
  return val as T;
}

function unwrapList<T>(res: any): T {
  const axiosData = res?.data ?? res;
  let payload = axiosData;
  if (
    payload &&
    typeof payload === 'object' &&
    'data' in payload &&
    !Array.isArray(payload.data)
  ) {
    const inner = payload.data;
    if (inner && typeof inner === 'object' && Array.isArray(inner.data)) {
      payload = inner;
    }
  }
  if (payload?.data !== undefined && payload?.meta !== undefined) {
    return payload as T;
  }
  const arr = Array.isArray(payload?.data)
    ? payload.data
    : Array.isArray(payload)
      ? payload
      : [];
  return {
    data: arr,
    meta: { total: arr.length, page: 1, limit: 20, totalPages: 1 },
  } as T;
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
  list: async (params: AdminCourseListParams = {}): Promise<AdminCoursesListResponse> => {
    const query: Record<string, any> = {
      page:  params.page  ?? 1,
      limit: params.limit ?? 20,
    };
    if (params.search)                                    query.search     = params.search;
    if (params.difficulty && params.difficulty !== 'ALL') query.difficulty = params.difficulty;
    if (params.state && params.state !== 'all')           query.state      = params.state;
    const res = await adminApiClient.get('/admin/courses', { params: query });
    return unwrapList<AdminCoursesListResponse>(res);
  },

  getStats: async (): Promise<AdminCourseStats> => {
    const res = await adminApiClient.get('/admin/courses/stats');
    return unwrapItem<AdminCourseStats>(res);
  },

  getById: async (id: string): Promise<AdminCourse> => {
    const res = await adminApiClient.get(`/admin/courses/${id}`);
    return normalizeArrays(unwrapItem<AdminCourse>(res));
  },

  getBySlug: async (slug: string): Promise<AdminCourse> => {
    const res = await adminApiClient.get(`/admin/courses/${encodeURIComponent(slug)}`);
    const course = unwrapItem<AdminCourse>(res);
    if (!course || typeof course !== 'object' || !('id' in course)) {
      throw new Error(`Course not found: ${slug}`);
    }
    return normalizeArrays(course);
  },

  create: async (data: AdminCourseCreateDto): Promise<AdminCourse> => {
    const res = await adminApiClient.post('/admin/courses', data);
    return normalizeArrays(unwrapItem<AdminCourse>(res));
  },

  update: async (id: string, data: AdminCourseUpdateDto): Promise<AdminCourse> => {
    const res = await adminApiClient.patch(`/admin/courses/${id}`, data);
    return normalizeArrays(unwrapItem<AdminCourse>(res));
  },

  // Direct PATCH { state } — backend does not have dedicated /publish /unpublish endpoints
  setState: async (id: string, state: CourseState): Promise<AdminCourse> => {
    const res = await adminApiClient.patch(`/admin/courses/${id}`, { state });
    return normalizeArrays(unwrapItem<AdminCourse>(res));
  },

  duplicate: async (id: string): Promise<AdminCourse> => {
    const res = await adminApiClient.post(`/admin/courses/${id}/duplicate`);
    return normalizeArrays(unwrapItem<AdminCourse>(res));
  },

  delete: async (id: string): Promise<void> => {
    await adminApiClient.delete(`/admin/courses/${id}`);
  },

  getCurriculum: async (courseId: string): Promise<CurriculumData> => {
    const res = await adminApiClient.get(`/admin/courses/${courseId}/curriculum`);
    const payload = unwrapItem<any>(res);
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
    return unwrapItem(res);
  },

  getPathModules: async (courseId: string): Promise<any[]> => {
    const res = await adminApiClient.get(`/admin/courses/${courseId}/path-modules`);
    const d = unwrapItem<any>(res);
    return Array.isArray(d) ? d : (d?.data ?? []);
  },

  addToPath: async (pathId: string, courseId: string, order: number): Promise<any> => {
    const res = await adminApiClient.post(`/admin/paths/${pathId}/modules`, {
      type: 'COURSE', courseId, order,
    });
    return unwrapItem(res);
  },

  removeFromPath: async (moduleId: string): Promise<void> => {
    await adminApiClient.delete(`/admin/path-modules/${moduleId}`);
  },

  reorderPathModule: async (moduleId: string, order: number): Promise<any> => {
    const res = await adminApiClient.patch(`/admin/path-modules/${moduleId}`, { order });
    return unwrapItem(res);
  },
};
