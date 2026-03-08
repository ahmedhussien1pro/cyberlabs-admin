export const ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  CONTACT: '/contact',
  PRICING: '/pricing',
  TERMS: '/terms',
  PRIVACY: '/privacy',

  AUTH: {
    LOGIN: '/auth',
    REGISTER: '/auth',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',
    VERIFY_EMAIL: '/verify-email',
    LOGOUT: '/logout',
    OTP_VERIFICATION: '/otp',
    OAUTH_CALLBACK: '/auth/callback',
    GOOGLE_CALLBACK: '/auth/google/callback',
    GITHUB_CALLBACK: '/auth/github/callback',
  },

  DASHBOARD: {
    DashboardPage: '/dashboard',
    LabsPage: '/dashboard/labs',
    ProgressPage: '/dashboard/progress',
    GoalsPage: '/dashboard/goals',
    CommunityPage: '/dashboard/community',
    SettingsPage: '/dashboard/settings',
  },

  PROFILE: {
    VIEW: '/profile',
    PUBLIC: (id: string) => `/profile/${id}`,
  },

  PATHS: {
    LIST: '/paths',
    DETAIL: (slug: string) => `/paths/${slug}`,
  },

  COURSES: {
    LIST: '/courses',
    DETAIL: (slug: string) => `/courses/${slug}`,
    TOPIC: (slug: string, topicId: string) =>
      `/courses/${slug}/topics/${topicId}`,
    LESSON: (courseId: string, lessonId: string) =>
      `/courses/${courseId}/lessons/${lessonId}`,
  },

  LABS: {
    LIST: '/labs',
    DETAIL: (slug: string) => `/labs/${slug}`,
  },

  UNAUTHORIZED: '/401',
} as const;
