// User Types
export type UserRole = 'USER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  username: string;
  name?: string;
  role: UserRole;
  isSuspended: boolean;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  _count?: {
    enrollments: number;
    labProgress: number;
    submissions?: number;
  };
}

export interface UserListItem {
  id: string;
  email: string;
  username: string;
  name?: string;
  role: UserRole;
  isSuspended: boolean;
  isActive?: boolean;
  createdAt: string;
  _count: {
    enrollments: number;
    labProgress: number;
    submissions?: number;
  };
}

export interface UserStats {
  total: number;
  active: number;
  activeToday?: number;
  suspended: number;
  admins: number;
}

export interface UpdateUserRoleRequest {
  role: UserRole;
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
export type Difficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';

export interface Course {
  id: string;
  title: string;
  ar_title?: string;
  slug?: string;
  description: string;
  difficulty: Difficulty;
  isPublished: boolean;
  enrollmentCount?: number;
  averageRating?: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    labs: number;
    courseLabs?: number;
    enrollments: number;
    reviews?: number;
  };
  courseLabs?: Array<{
    lab: any;
  }>;
}

export interface CourseListItem {
  id: string;
  title: string;
  slug?: string;
  difficulty: Difficulty;
  isPublished: boolean;
  enrollmentCount?: number;
  createdAt: string;
  _count: {
    labs: number;
    courseLabs?: number;
    enrollments: number;
  };
}

export interface CourseStats {
  total: number;
  published: number;
  unpublished?: number;
  draft: number;
  totalEnrollments?: number;
  byDifficulty: {
    beginner: number;
    intermediate: number;
    advanced: number;
    expert?: number;
  };
}

export interface CreateCourseRequest {
  title: string;
  slug?: string;
  description: string;
  difficulty: Difficulty;
  imageUrl?: string;
}

export interface UpdateCourseRequest extends Partial<CreateCourseRequest> {}

// Lab Types
export type Category =
  | 'WEB_SECURITY'
  | 'NETWORK_SECURITY'
  | 'CRYPTOGRAPHY'
  | 'REVERSE_ENGINEERING'
  | 'FORENSICS'
  | 'BINARY_EXPLOITATION'
  | 'OSINT'
  | 'MISC';

export type LabCategory = Category;

export type LabDifficulty = Difficulty;

export type LabExecutionMode = 'BROWSER' | 'DOCKER' | 'STATIC';

export interface LabListItem {
  id: string;
  title: string;
  slug?: string;
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
    instances?: number;
  };
}

export interface Lab extends Omit<LabListItem, '_count'> {
  description: string;
  ar_title?: string;
  flagAnswer: string;
  hints: string[];
  resources: string[];
  dockerImage: string | null;
  staticFiles: string[];
  xpReward?: number;
  pointsReward?: number;
  duration?: number;
  maxAttempts?: number;
  timeLimit?: number;
  skills?: string[];
  course: {
    id: string;
    title: string;
  } | null;
  updatedAt: string;
  _count: {
    submissions: number;
    usersProgress: number;
    hints: number;
    instances?: number;
  };
}

export interface LabStats {
  total: number;
  published: number;
  draft: number;
  totalCompletions?: number;
  byCategory: Record<LabCategory, number>;
  byDifficulty: {
    beginner: number;
    BEGINNER?: number;
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
  slug?: string;
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
  xpReward?: number;
  pointsReward?: number;
  duration?: number;
  maxAttempts?: number;
  timeLimit?: number;
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

export interface GrowthTrends {
  users: Array<{ date: string; count: number }>;
  courses: Array<{ date: string; count: number }>;
}

export interface EngagementMetrics {
  avgTimePerLab: number;
  completionRate: number;
  activeUsers: number;
  labLaunches?: number;
  submissions?: number;
  avgSessionDuration?: number;
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

export interface TopContent {
  courses: Array<{
    id: string;
    title: string;
    enrollments: number;
    completions: number;
  }>;
  labs: Array<{
    id: string;
    title: string;
    attempts: number;
    completions: number;
  }>;
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

export interface ActivityEvent {
  id: string;
  type: 'enrollment' | 'completion' | 'lab_start' | 'submission';
  user: {
    id: string;
    name: string;
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

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta?: PaginationMeta;
  pagination?: PaginationMeta;
}
