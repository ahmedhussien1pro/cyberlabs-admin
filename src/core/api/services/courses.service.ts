// src/core/api/services/courses.service.ts
import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';
import type { CourseState } from '@/core/types';

export interface CourseQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  difficulty?: string;
  category?: string;
  access?: string;
  state?: string;
  isPublished?: boolean;
}

export interface UpdateCoursePayload {
  title?: string;
  ar_title?: string;
  description?: string;
  ar_description?: string;
  longDescription?: string;
  ar_longDescription?: string;
  slug?: string;
  difficulty?: string;
  category?: string;
  access?: string;
  contentType?: string;
  color?: string;
  state?: CourseState;
  isPublished?: boolean;
  isFeatured?: boolean;
  isNew?: boolean;
  price?: number;
  duration?: string;
  estimatedHours?: number;
  thumbnail?: string;
  backgroundImage?: string;
  tags?: string[];
  topics?: string[];
  skills?: string[];
  prerequisites?: string[];
  instructorId?: string;
}

export const coursesService = {
  // GET /admin/courses
  getAll: (params?: CourseQueryParams) =>
    apiClient.get(ENDPOINTS.COURSES.LIST, { params }).then((r) => r.data),

  // GET /admin/courses/stats
  getStats: () =>
    apiClient.get(ENDPOINTS.COURSES.STATS).then((r) => r.data),

  // GET /admin/courses/:id
  getOne: (id: string) =>
    apiClient.get(ENDPOINTS.COURSES.DETAIL(id)).then((r) => r.data),

  // POST /admin/courses
  create: (data: Record<string, unknown>) =>
    apiClient.post(ENDPOINTS.COURSES.LIST, data).then((r) => r.data),

  // PATCH /admin/courses/:id  ← general field updates incl. state
  update: (id: string, data: UpdateCoursePayload) =>
    apiClient.patch(ENDPOINTS.COURSES.DETAIL(id), data).then((r) => r.data),

  // PATCH /admin/courses/:id/publish  ← sets isPublished:true + state:PUBLISHED
  publish: (id: string) =>
    apiClient.patch(ENDPOINTS.COURSES.PUBLISH(id)).then((r) => r.data),

  // PATCH /admin/courses/:id/unpublish  ← sets isPublished:false + state:DRAFT
  unpublish: (id: string) =>
    apiClient.patch(ENDPOINTS.COURSES.UNPUBLISH(id)).then((r) => r.data),

  // DELETE /admin/courses/:id
  remove: (id: string) =>
    apiClient.delete(ENDPOINTS.COURSES.DETAIL(id)).then((r) => r.data),

  // GET /admin/courses/:id/curriculum
  getCurriculum: (id: string) =>
    apiClient.get(ENDPOINTS.COURSES.CURRICULUM(id)).then((r) => r.data),

  // PUT /admin/courses/:id/curriculum
  updateCurriculum: (id: string, data: Record<string, unknown>) =>
    apiClient.put(ENDPOINTS.COURSES.CURRICULUM(id), data).then((r) => r.data),

  // GET /admin/courses/:id/labs
  getCourseLabs: (id: string) =>
    apiClient.get(ENDPOINTS.COURSES.LABS(id)).then((r) => r.data),

  // POST /admin/courses/:id/labs/:labId
  attachLab: (courseId: string, labId: string) =>
    apiClient.post(ENDPOINTS.COURSES.ATTACH_LAB(courseId, labId)).then((r) => r.data),

  // DELETE /admin/courses/:id/labs/:labId
  detachLab: (courseId: string, labId: string) =>
    apiClient.delete(ENDPOINTS.COURSES.DETACH_LAB(courseId, labId)).then((r) => r.data),

  // PATCH /admin/courses/:id/labs/reorder
  reorderLabs: (courseId: string, order: string[]) =>
    apiClient.patch(ENDPOINTS.COURSES.REORDER_LABS(courseId), { order }).then((r) => r.data),
};
