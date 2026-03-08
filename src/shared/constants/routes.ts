export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/',
  USERS: '/users',
  USER_DETAIL: (id: string) => `/users/${id}`,
  COURSES: '/courses',
  COURSE_DETAIL: (id: string) => `/courses/${id}`,
  COURSE_CREATE: '/courses/new',
  LABS: '/labs',
  LAB_DETAIL: (id: string) => `/labs/${id}`,
  LAB_CREATE: '/labs/new',
} as const;
