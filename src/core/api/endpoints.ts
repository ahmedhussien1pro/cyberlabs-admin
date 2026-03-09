// src/core/api/endpoints.ts
const BASE = '/admin';

export const ENDPOINTS = {
  AUTH: {
    LOGIN: `${BASE}/auth/login`,
    ME: `${BASE}/auth/me`,
    REFRESH: `${BASE}/auth/refresh`,
    LOGOUT: `${BASE}/auth/logout`,
  },
  USERS: {
    LIST: `${BASE}/users`,
    STATS: `${BASE}/users/stats`,
    DETAIL: (id: string) => `${BASE}/users/${id}`,
    SUSPEND: (id: string) => `${BASE}/users/${id}/suspend`,
    ROLE: (id: string) => `${BASE}/users/${id}/role`,
  },
  COURSES: {
    LIST: `${BASE}/courses`,
    STATS: `${BASE}/courses/stats`,
    DETAIL: (id: string) => `${BASE}/courses/${id}`,
    PUBLISH: (id: string) => `${BASE}/courses/${id}/publish`,
    UNPUBLISH: (id: string) => `${BASE}/courses/${id}/unpublish`,
    CURRICULUM: (id: string) => `${BASE}/courses/${id}/curriculum`,
    LABS: (id: string) => `${BASE}/courses/${id}/labs`,
    ATTACH_LAB: (courseId: string, labId: string) =>
      `${BASE}/courses/${courseId}/labs/${labId}`,
    DETACH_LAB: (courseId: string, labId: string) =>
      `${BASE}/courses/${courseId}/labs/${labId}`,
    REORDER_LABS: (courseId: string) =>
      `${BASE}/courses/${courseId}/labs/reorder`,
  },
  LABS: {
    LIST: `${BASE}/labs`,
    STATS: `${BASE}/labs/stats`,
    CREATE: `${BASE}/labs`,
    DETAIL: (id: string) => `${BASE}/labs/${id}`,
    UPDATE: (id: string) => `${BASE}/labs/${id}`,
    DELETE: (id: string) => `${BASE}/labs/${id}`,
    PUBLISH: (id: string) => `${BASE}/labs/${id}/publish`,
    UNPUBLISH: (id: string) => `${BASE}/labs/${id}/unpublish`,
  },
  PATHS: {
    LIST: `${BASE}/paths`,
    STATS: `${BASE}/paths/stats`,
    CREATE: `${BASE}/paths`,
    DETAIL: (id: string) => `${BASE}/paths/${id}`,
    UPDATE: (id: string) => `${BASE}/paths/${id}`,
    PUBLISH: (id: string) => `${BASE}/paths/${id}/publish`,
    UNPUBLISH: (id: string) => `${BASE}/paths/${id}/unpublish`,
    DELETE: (id: string) => `${BASE}/paths/${id}`,
    REORDER_MODULES: (id: string) => `${BASE}/paths/${id}/modules/reorder`,
  },
  BADGES: {
    LIST: `${BASE}/badges`,
  },
  DASHBOARD: {
    STATS: `${BASE}/dashboard/stats`,
  },
  ANALYTICS: {
    OVERVIEW: `${BASE}/analytics/overview`,
    GROWTH: `${BASE}/analytics/growth`,
    ENGAGEMENT: `${BASE}/analytics/engagement`,
    TOP_CONTENT: `${BASE}/analytics/top-content`,
    RECENT_ACTIVITY: `${BASE}/analytics/recent-activity`,
  },
} as const;

// ── Aliases for legacy service imports ─────────────────────────────────────
export const API_ENDPOINTS = {
  ADMIN_LABS: ENDPOINTS.LABS,
  ADMIN_ANALYTICS: ENDPOINTS.ANALYTICS,
  ADMIN_PATHS: {
    LIST: ENDPOINTS.PATHS.LIST,
    STATS: ENDPOINTS.PATHS.STATS,
    CREATE: ENDPOINTS.PATHS.CREATE,
    DETAIL: ENDPOINTS.PATHS.DETAIL,
    UPDATE: ENDPOINTS.PATHS.UPDATE,
    PUBLISH: ENDPOINTS.PATHS.PUBLISH,
    UNPUBLISH: ENDPOINTS.PATHS.UNPUBLISH,
    DELETE: ENDPOINTS.PATHS.DELETE,
  },
  BADGES: ENDPOINTS.BADGES,
  AUTH: {
    LOGIN: ENDPOINTS.AUTH.LOGIN,
    ME: ENDPOINTS.AUTH.ME,
    LOGOUT: ENDPOINTS.AUTH.LOGOUT,
  },
  ADMIN: {
    HEALTH: `${BASE}/health`,
  },
  USERS: {
    LIST: ENDPOINTS.USERS.LIST,
    STATS: ENDPOINTS.USERS.STATS,
    DETAIL: ENDPOINTS.USERS.DETAIL,
    SUSPEND: ENDPOINTS.USERS.SUSPEND,
    ROLE: ENDPOINTS.USERS.ROLE,
  },
};
