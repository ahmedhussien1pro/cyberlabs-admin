// ────────────────────────────────────────────────────────────────────
// Common Types
// ────────────────────────────────────────────────────────────────────

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export type UserRole = 'USER' | 'ADMIN';
export type Difficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type Category = 'WEB' | 'NETWORK' | 'CRYPTOGRAPHY' | 'FORENSICS' | 'REVERSE_ENGINEERING' | 'MALWARE_ANALYSIS';
export type LabExecutionMode = 'FRONTEND' | 'SHARED_BACKEND' | 'DOCKER';

// ────────────────────────────────────────────────────────────────────
// Auth
// ────────────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

// ────────────────────────────────────────────────────────────────────
// Users
// ────────────────────────────────────────────────────────────────────

export interface UserStats {
  total: number;
  admins: number;
  suspended: number;
  activeToday: number;
}

export interface UserListItem extends User {
  _count: {
    enrollments: number;
    submissions: number;
    labProgress: number;
  };
}

export interface UpdateUserRoleRequest {
  role: UserRole;
}

// ────────────────────────────────────────────────────────────────────
// Courses
// ────────────────────────────────────────────────────────────────────

export interface CourseStats {
  total: number;
  published: number;
  unpublished: number;
  totalEnrollments: number;
  avgRating: number;
}

export interface CourseListItem {
  id: string;
  slug: string;
  title: string;
  ar_title?: string;
  description?: string;
  imageUrl?: string;
  difficulty?: Difficulty;
  isPublished: boolean;
  enrollmentCount: number;
  averageRating?: number;
  createdAt: string;
  updatedAt: string;
  _count: {
    courseLabs: number;
    enrollments: number;
    reviews: number;
  };
}

export interface Course extends CourseListItem {
  ar_description?: string;
  content?: any;
  ar_content?: any;
  prerequisites?: string[];
  learningOutcomes?: string[];
  totalDuration?: number;
  category?: Category;
  tags?: string[];
  syllabus?: any;
  courseLabs: {
    lab: {
      id: string;
      title: string;
      slug: string;
      difficulty?: Difficulty;
    };
  }[];
}

export interface CreateCourseRequest {
  title: string;
  slug: string;
  ar_title?: string;
  description?: string;
  ar_description?: string;
  imageUrl?: string;
  difficulty?: Difficulty;
  category?: Category;
  content?: any;
  ar_content?: any;
  prerequisites?: string[];
  learningOutcomes?: string[];
  totalDuration?: number;
  tags?: string[];
  syllabus?: any;
  isPublished?: boolean;
}

export interface UpdateCourseRequest extends Partial<CreateCourseRequest> {}

// ────────────────────────────────────────────────────────────────────
// Labs
// ────────────────────────────────────────────────────────────────────

export interface LabStats {
  total: number;
  published: number;
  unpublished: number;
  totalCompletions: number;
  totalSubmissions: number;
  byDifficulty: {
    BEGINNER: number;
    INTERMEDIATE: number;
    ADVANCED: number;
  };
}

export interface LabListItem {
  id: string;
  slug: string;
  title: string;
  ar_title?: string;
  description?: string;
  imageUrl?: string;
  difficulty?: Difficulty;
  category?: Category;
  executionMode?: LabExecutionMode;
  isPublished: boolean;
  duration?: number;
  xpReward?: number;
  pointsReward?: number;
  skills?: string[];
  courseId?: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    submissions: number;
    usersProgress: number;
    hints: number;
  };
}

export interface Lab extends LabListItem {
  ar_description?: string;
  scenario?: string;
  ar_scenario?: string;
  goal?: string;
  ar_goal?: string;
  labUrl?: string;
  isolationMode?: string;
  engineConfig?: any;
  briefing?: any;
  stepsOverview?: any;
  steps?: any;
  postSolve?: any;
  initialState?: any;
  flagAnswer?: string;  // ⚠️ Only in admin detail view
  solution?: any;       // ⚠️ Only in admin detail view
  pointsPerHint?: number;
  pointsPerFail?: number;
  maxAttempts?: number;
  timeLimit?: number;
  hints?: {
    id: string;
    order: number;
    content: string;
    ar_content?: string;
    xpCost: number;
  }[];
  courseLabs?: {
    course: {
      id: string;
      title: string;
      slug: string;
    };
  }[];
  _count: {
    submissions: number;
    usersProgress: number;
    instances: number;
  };
}

export interface CreateLabRequest {
  title: string;
  slug: string;
  ar_title?: string;
  description?: string;
  ar_description?: string;
  scenario?: string;
  ar_scenario?: string;
  goal?: string;
  ar_goal?: string;
  difficulty?: Difficulty;
  category?: Category;
  executionMode?: LabExecutionMode;
  xpReward?: number;
  pointsReward?: number;
  pointsPerHint?: number;
  pointsPerFail?: number;
  duration?: number;
  maxAttempts?: number;
  timeLimit?: number;
  imageUrl?: string;
  labUrl?: string;
  courseId?: string;
  isolationMode?: string;
  skills?: string[];
  engineConfig?: any;
  briefing?: any;
  stepsOverview?: any;
  steps?: any;
  postSolve?: any;
  initialState?: any;
  flagAnswer?: string;
  solution?: any;
  isPublished?: boolean;
}

export interface UpdateLabRequest extends Partial<CreateLabRequest> {}

// ────────────────────────────────────────────────────────────────────
// Analytics
// ────────────────────────────────────────────────────────────────────

export interface AnalyticsOverview {
  users: number;
  courses: number;
  labs: number;
  enrollments: number;
  labCompletions: number;
  totalXP: number;
  totalPoints: number;
}

export interface GrowthTrends {
  users: { month: string; count: number }[];
  enrollments: { month: string; count: number }[];
}

export interface EngagementMetrics {
  activeUsers: number;
  labLaunches: number;
  submissions: number;
  avgSessionDuration: number;
}

export interface TopContent {
  courses: Array<{
    id: string;
    title: string;
    slug: string;
    enrollmentCount: number;
    averageRating?: number;
    difficulty?: Difficulty;
  }>;
  labs: Array<{
    id: string;
    title: string;
    slug: string;
    difficulty?: Difficulty;
    category?: Category;
    completions: number;
  }>;
}

export interface ActivityEvent {
  type: 'user_registered' | 'course_enrolled' | 'lab_completed';
  timestamp: string;
  user: { id: string; name: string };
  course?: { id: string; title: string; slug: string };
  lab?: { id: string; title: string; slug: string };
}
