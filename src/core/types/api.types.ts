// User Types
export interface User {
  id: string;
  email: string;
  username: string;
  role: 'USER' | 'ADMIN';
  isSuspended: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    enrollments: number;
    labProgress: number;
  };
}

export interface UserListItem {
  id: string;
  email: string;
  username: string;
  role: 'USER' | 'ADMIN';
  isSuspended: boolean;
  createdAt: string;
  _count: {
    enrollments: number;
    labProgress: number;
  };
}

export interface UserStats {
  total: number;
  active: number;
  suspended: number;
  admins: number;
}

// Auth Types
export interface AuthResponse {
  user: User;
  accessToken: string;
  access_token?: string;
  token?: string;
  refreshToken?: string;
  expiresIn?: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// Course Types
export interface Course {
  id: string;
  title: string;
  description: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    labs: number;
    enrollments: number;
  };
}

export interface CourseListItem {
  id: string;
  title: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  isPublished: boolean;
  createdAt: string;
  _count: {
    labs: number;
    enrollments: number;
  };
}

export interface CourseStats {
  total: number;
  published: number;
  draft: number;
  byDifficulty: {
    beginner: number;
    intermediate: number;
    advanced: number;
  };
}

export interface CreateCourseRequest {
  title: string;
  description: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
}

export interface UpdateCourseRequest extends Partial<CreateCourseRequest> {}

// Lab Types
export type LabCategory =
  | 'WEB_SECURITY'
  | 'NETWORK_SECURITY'
  | 'CRYPTOGRAPHY'
  | 'REVERSE_ENGINEERING'
  | 'FORENSICS'
  | 'BINARY_EXPLOITATION'
  | 'OSINT'
  | 'MISC';

export type LabDifficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';

export type LabExecutionMode = 'BROWSER' | 'DOCKER' | 'STATIC';

export interface LabListItem {
  id: string;
  title: string;
  category: LabCategory;
  difficulty: LabDifficulty;
  executionMode: LabExecutionMode;
  points: number;
  isPublished: boolean;
  courseId: string | null;
  createdAt: string;
  _count: {
    submissions: number;
    usersProgress: number;
    hints: number;
  };
}

export interface Lab extends LabListItem {
  description: string;
  flagAnswer: string;
  hints: string[];
  resources: string[];
  dockerImage: string | null;
  staticFiles: string[];
  course: {
    id: string;
    title: string;
  } | null;
  updatedAt: string;
  _count: {
    submissions: number;
    usersProgress: number;
    hints: number;
  };
}

export interface LabStats {
  total: number;
  published: number;
  draft: number;
  byCategory: Record<LabCategory, number>;
  byDifficulty: {
    beginner: number;
    intermediate: number;
    advanced: number;
    expert: number;
  };
  byExecutionMode: {
    browser: number;
    docker: number;
    static: number;
  };
}

export interface CreateLabRequest {
  title: string;
  description: string;
  category: LabCategory;
  difficulty: LabDifficulty;
  executionMode: LabExecutionMode;
  points: number;
  flagAnswer: string;
  hints?: string[];
  resources?: string[];
  dockerImage?: string;
  staticFiles?: string[];
  courseId?: string;
}

export interface UpdateLabRequest extends Partial<CreateLabRequest> {}

// Analytics Types
export interface AnalyticsOverview {
  users: number;
  courses: number;
  labs: number;
  labCompletions: number;
  usersChange?: number;
  coursesChange?: number;
  labsChange?: number;
  completionsChange?: number;
}

export interface GrowthData {
  labels: string[];
  users: number[];
  courses: number[];
  labs: number[];
}

export interface EngagementMetrics {
  avgTimePerLab: number;
  completionRate: number;
  activeUsers: number;
  topCategories: Array<{
    category: string;
    count: number;
  }>;
}

export interface TopContentItem {
  id: string;
  title: string;
  type: 'course' | 'lab';
  views: number;
  completions: number;
}

export interface RecentActivityItem {
  id: string;
  type: 'enrollment' | 'completion' | 'submission';
  user: {
    id: string;
    username: string;
  };
  target: {
    id: string;
    title: string;
    type: 'course' | 'lab';
  };
  timestamp: string;
}

// Pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
