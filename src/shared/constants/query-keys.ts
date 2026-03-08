// src/shared/constants/query-keys.ts
export const USER_QUERY_KEYS = {
  me: ['user', 'me'] as const,
  stats: ['user', 'stats'] as const,
  points: ['user', 'points'] as const,
  labs: ['user', 'labs'] as const,
  courses: ['user', 'courses'] as const,
  activity: ['user', 'activity'] as const,
  paths: ['user', 'paths'] as const,
  public: (id: string) => ['user', 'public', id] as const,
} as const;
