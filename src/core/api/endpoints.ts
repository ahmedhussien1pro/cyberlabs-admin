// src/core/api/endpoints.ts
const BASE = '/admin';

export const ENDPOINTS = {
  // ── Auth ──────────────────────────────────────────────────────────────────
  AUTH: {
    LOGIN:   `${BASE}/auth/login`,
    ME:      `${BASE}/auth/me`,
    REFRESH: `${BASE}/auth/refresh`,
  },

  // ── Users ─────────────────────────────────────────────────────────────────
  USERS: {
    LIST:    `${BASE}/users`,
    STATS:   `${BASE}/users/stats`,
    DETAIL:  (id: string) => `${BASE}/users/${id}`,
    SUSPEND: (id: string) => `${BASE}/users/${id}/suspend`,
    ROLE:    (id: string) => `${BASE}/users/${id}/role`,
  },

  // ── Courses ───────────────────────────────────────────────────────────────
  // Backend: src/modules/admin/admin-courses.controller.ts
  COURSES: {
    LIST:         `${BASE}/courses`,
    STATS:        `${BASE}/courses/stats`,
    DETAIL:       (id: string) => `${BASE}/courses/${id}`,
    PUBLISH:      (id: string) => `${BASE}/courses/${id}/publish`,
    UNPUBLISH:    (id: string) => `${BASE}/courses/${id}/unpublish`,
    CURRICULUM:   (id: string) => `${BASE}/courses/${id}/curriculum`,
    LABS:         (id: string) => `${BASE}/courses/${id}/labs`,
    ATTACH_LAB:   (courseId: string, labId: string) => `${BASE}/courses/${courseId}/labs/${labId}`,
    DETACH_LAB:   (courseId: string, labId: string) => `${BASE}/courses/${courseId}/labs/${labId}`,
    REORDER_LABS: (courseId: string) => `${BASE}/courses/${courseId}/labs/reorder`,
  },

  // ── Labs ──────────────────────────────────────────────────────────────────
  // Backend: src/modules/admin/admin-labs.controller.ts
  LABS: {
    LIST:      `${BASE}/labs`,
    STATS:     `${BASE}/labs/stats`,
    CREATE:    `${BASE}/labs`,
    DETAIL:    (id: string) => `${BASE}/labs/${id}`,
    UPDATE:    (id: string) => `${BASE}/labs/${id}`,
    DELETE:    (id: string) => `${BASE}/labs/${id}`,
    PUBLISH:   (id: string) => `${BASE}/labs/${id}/publish`,
    UNPUBLISH: (id: string) => `${BASE}/labs/${id}/unpublish`,
  },

  // ── Paths ─────────────────────────────────────────────────────────────────
  PATHS: {
    LIST:   `${BASE}/paths`,
    DETAIL: (id: string) => `${BASE}/paths/${id}`,
  },

  // ── Dashboard ─────────────────────────────────────────────────────────────
  DASHBOARD: {
    STATS: `${BASE}/dashboard/stats`,
  },

  // ── Analytics ─────────────────────────────────────────────────────────────
  ANALYTICS: {
    OVERVIEW:        `${BASE}/analytics/overview`,
    GROWTH:          `${BASE}/analytics/growth`,
    ENGAGEMENT:      `${BASE}/analytics/engagement`,
    TOP_CONTENT:     `${BASE}/analytics/top-content`,
    RECENT_ACTIVITY: `${BASE}/analytics/recent-activity`,
  },
} as const;

// Alias kept for backward-compat with labs.service.ts and other legacy imports
export const API_ENDPOINTS = {
  ADMIN_LABS: ENDPOINTS.LABS,
};
