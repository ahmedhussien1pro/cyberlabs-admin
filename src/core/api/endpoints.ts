// src/core/api/endpoints.ts
const BASE = '/admin';

export const ENDPOINTS = {
  // ── Auth ──────────────────────────────────────────────────
  AUTH: {
    LOGIN: `${BASE}/auth/login`,
    ME: `${BASE}/auth/me`,
    REFRESH: `${BASE}/auth/refresh`,
  },

  // ── Users ─────────────────────────────────────────────────
  USERS: {
    LIST: `${BASE}/users`,
    DETAIL: (id: string) => `${BASE}/users/${id}`,
    SUSPEND: (id: string) => `${BASE}/users/${id}/suspend`,
    ROLE: (id: string) => `${BASE}/users/${id}/role`,
  },

  // ── Courses ───────────────────────────────────────────────
  COURSES: {
    LIST:        `${BASE}/courses`,
    STATS:       `${BASE}/courses/stats`,
    DETAIL:      (id: string) => `${BASE}/courses/${id}`,
    // PATCH /admin/courses/:id handles state + isPublished together
    CURRICULUM:  (id: string) => `${BASE}/courses/${id}/curriculum`,
    LABS:        (id: string) => `${BASE}/courses/${id}/labs`,
    ATTACH_LAB:  (courseId: string, labId: string) => `${BASE}/courses/${courseId}/labs/${labId}`,
    DETACH_LAB:  (courseId: string, labId: string) => `${BASE}/courses/${courseId}/labs/${labId}`,
    REORDER_LABS:(courseId: string) => `${BASE}/courses/${courseId}/labs/reorder`,
  },

  // ── Labs ──────────────────────────────────────────────────
  LABS: {
    LIST:   `${BASE}/labs`,
    STATS:  `${BASE}/labs/stats`,
    DETAIL: (id: string) => `${BASE}/labs/${id}`,
  },

  // ── Paths ─────────────────────────────────────────────────
  PATHS: {
    LIST:   `${BASE}/paths`,
    DETAIL: (id: string) => `${BASE}/paths/${id}`,
  },

  // ── Dashboard ─────────────────────────────────────────────
  DASHBOARD: {
    STATS: `${BASE}/dashboard/stats`,
  },
} as const;
