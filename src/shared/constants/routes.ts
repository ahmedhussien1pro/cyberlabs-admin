export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/',
  USERS: '/users',
  USER_DETAIL: (id: string) => `/users/${id}`,

  // ── Courses CMS ──
  COURSES: '/courses',
  COURSE_CREATE: '/courses/new',
  COURSE_IMPORT: '/courses/import',
  // ✅ صفحة واحدة شاملة: Edit | Curriculum | Path Relations | Preview
  COURSE_EDIT: (slug: string) => `/courses/${slug}/edit`,

  // ── Labs ──
  LABS: '/labs',
  LAB_DETAIL: (id: string) => `/labs/${id}`,
  LAB_CREATE: '/labs/new',
  LAB_EDIT: (id: string) => `/labs/${id}/edit`,

  // ── Paths ──
  PATHS: '/paths',
  PATH_DETAIL: (id: string) => `/paths/${id}`,
  PATH_CREATE: '/paths/create',
  PATH_EDIT: (id: string) => `/paths/${id}/edit`,

  // ── Other ──
  MAP: '/map',
  BADGES: '/badges',
  SETTINGS: '/settings',
  UN_AUTHORIZED: '/401',
} as const;
