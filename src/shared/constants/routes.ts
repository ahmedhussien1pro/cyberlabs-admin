export const ROUTES = {
  LOGIN:     '/login',
  DASHBOARD: '/',

  // ── Users ──
  USERS:       '/users',
  USER_DETAIL: (id: string) => `/users/${id}`,

  // ── Courses CMS ──
  COURSES:       '/courses',
  COURSE_CREATE: '/courses/new',
  COURSE_IMPORT: '/courses/import',
  COURSE_EDIT:   (slug: string) => `/courses/${slug}/edit`,
  // COURSE_DETAIL was removed — Preview lives inside COURSE_EDIT ?tab=preview
  COURSE_PREVIEW: (slug: string) => `/courses/${slug}/edit?tab=preview`,

  // ── Labs ──
  LABS:      '/labs',
  LAB_CREATE: '/labs/new',
  LAB_DETAIL: (id: string) => `/labs/${id}`,
  LAB_EDIT:   (id: string) => `/labs/${id}/edit`,

  // ── Paths ──
  PATHS:       '/paths',
  PATH_CREATE: '/paths/create',
  PATH_DETAIL: (id: string) => `/paths/${id}`,
  PATH_EDIT:   (id: string) => `/paths/${id}/edit`,

  // ── Other ──
  MAP:           '/map',
  BADGES:        '/badges',
  SETTINGS:      '/settings',
  UN_AUTHORIZED: '/401',
} as const;
