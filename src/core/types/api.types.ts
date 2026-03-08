// ─── User Types ───────────────────────────────────────────────────────────────
export type UserRole =
  | 'USER'
  | 'ADMIN'
  | 'STUDENT'
  | 'INSTRUCTOR'
  | 'CONTENT_CREATOR';

export interface User {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  role: UserRole;
  internalRole?: string;
  isActive?: boolean;
  isEmailVerified?: boolean;
  twoFactorEnabled?: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  security?: {
    isSuspended: boolean;
    suspensionReason?: string | null;
    suspendedAt?: string | null;
    loginAttempts?: number;
    lockedUntil?: string | null;
  };
  points?: { totalPoints: number; totalXP: number; level: number };
  subscriptions?: Array<{
    id: string;
    status: string;
    billingCycle: string;
    currentPeriodEnd: string;
    plan: { name: string; price: number };
  }>;
  _count?: {
    enrollments: number;
    labProgress: number;
    badges?: number;
  };
}

export interface UserListItem {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  role: UserRole;
  internalRole?: string;
  isActive?: boolean;
  isEmailVerified?: boolean;
  createdAt: string;
  lastLoginAt?: string;
  security?: {
    isSuspended: boolean;
    suspensionReason?: string | null;
    suspendedAt?: string | null;
  };
  points?: { totalPoints: number; totalXP: number; level: number };
  _count: {
    enrollments: number;
    labProgress: number;
    badges?: number;
  };
}

/** Shape returned by GET /admin/users/stats */
export interface UserStats {
  total: number;
  newThisMonth: number;
  suspended: number;
  byRole: {
    ADMIN: number;
    USER: number;
    STUDENT: number;
    INSTRUCTOR: number;
    CONTENT_CREATOR: number;
  };
}

export interface UpdateUserRoleRequest {
  role: UserRole;
}

// ─── Auth Types ────────────────────────────────────────────────────────────────
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

// ─── Course Types ──────────────────────────────────────────────────────────────
export type Difficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
export type CourseState = 'PUBLISHED' | 'DRAFT' | 'COMING_SOON';
export type CourseAccess = 'FREE' | 'PREMIUM';

export interface Course {
  id: string;
  title: string;
  ar_title?: string;
  slug: string;
  description?: string;
  ar_description?: string;
  longDescription?: string;
  ar_longDescription?: string;
  difficulty: Difficulty;
  category?: string;
  access?: CourseAccess;
  contentType?: string;
  color?: string;
  state?: CourseState;
  isPublished: boolean;
  isFeatured?: boolean;
  isNew?: boolean;
  price?: number;
  duration?: string;
  estimatedHours?: number;
  thumbnail?: string;
  backgroundImage?: string;
  tags?: string[];
  topics?: string[];
  skills?: string[];
  prerequisites?: string[];
  enrollmentCount?: number;
  averageRating?: number;
  reviewCount?: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  instructor?: { id: string; name: string; email?: string; avatarUrl?: string };
  _count?: {
    enrollments: number;
    sections: number;
    lessons: number;
    reviews?: number;
  };
}

export interface CourseListItem {
  id: string;
  title: string;
  ar_title?: string;
  slug: string;
  thumbnail?: string;
  difficulty: Difficulty;
  category?: string;
  access?: CourseAccess;
  state?: CourseState;
  isPublished: boolean;
  isFeatured?: boolean;
  isNew?: boolean;
  price?: number;
  enrollmentCount?: number;
  averageRating?: number;
  reviewCount?: number;
  createdAt: string;
  updatedAt: string;
  instructor?: { id: string; name: string; avatarUrl?: string };
  _count: {
    enrollments: number;
    sections: number;
    lessons: number;
  };
}

/** Shape returned by GET /admin/courses/stats */
export interface CourseStats {
  total: number;
  published: number;
  unpublished: number;
  featured: number;
  byState: {
    PUBLISHED: number;
    DRAFT: number;
    COMING_SOON: number;
  };
}

export interface CreateCourseRequest {
  title: string;
  slug: string;
  instructorId: string;
  ar_title?: string;
  description?: string;
  ar_description?: string;
  longDescription?: string;
  ar_longDescription?: string;
  difficulty: Difficulty;
  category?: string;
  access?: CourseAccess;
  contentType?: string;
  color?: string;
  state?: CourseState;
  price?: number;
  duration?: string;
  estimatedHours?: number;
  thumbnail?: string;
  backgroundImage?: string;
  tags?: string[];
  topics?: string[];
  skills?: string[];
  prerequisites?: string[];
  isNew?: boolean;
  isFeatured?: boolean;
}

export interface UpdateCourseRequest extends Partial<CreateCourseRequest> {}

// ─── Lab Types ─────────────────────────────────────────────────────────────────
export type LabCategory =
  | 'WEB_SECURITY'
  | 'NETWORK_SECURITY'
  | 'CRYPTOGRAPHY'
  | 'REVERSE_ENGINEERING'
  | 'FORENSICS'
  | 'BINARY_EXPLOITATION'
  | 'OSINT'
  | 'MISC'
  | 'WEB'
  | 'NETWORK'
  | 'MALWARE_ANALYSIS';

/** @deprecated use LabCategory */
export type Category = LabCategory;

export type LabDifficulty = Difficulty;
export type LabExecutionMode = 'FRONTEND' | 'SHARED_BACKEND' | 'DOCKER' | 'BROWSER' | 'STATIC';

export interface LabListItem {
  id: string;
  title: string;
  slug?: string;
  category: LabCategory;
  difficulty: LabDifficulty;
  executionMode: LabExecutionMode;
  points?: number;
  isPublished: boolean;
  createdAt: string;
  _count: {
    submissions: number;
    usersProgress?: number;
    hints?: number;
    instances?: number;
  };
}

export interface Lab extends LabListItem {
  ar_title?: string;
  description?: string;
  flagAnswer: string;
  solution?: string;
  hints?: string[];
  resources?: string[];
  dockerImage?: string | null;
  staticFiles?: string[];
  xpReward?: number;
  pointsReward?: number;
  duration?: number;
  maxAttempts?: number;
  timeLimit?: number;
  skills?: string[];
  updatedAt: string;
}

/** Shape returned by GET /admin/labs/stats */
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
    EXPERT: number;
  };
}

export interface CreateLabRequest {
  title: string;
  slug?: string;
  description?: string;
  category?: LabCategory;
  difficulty?: LabDifficulty;
  executionMode?: LabExecutionMode;
  points?: number;
  flagAnswer?: string;
  hints?: string[];
  resources?: string[];
  dockerImage?: string;
  staticFiles?: string[];
  xpReward?: number;
  pointsReward?: number;
  duration?: number;
  maxAttempts?: number;
  timeLimit?: number;
}

export interface UpdateLabRequest extends Partial<CreateLabRequest> {}

// ─── Learning Path Types ───────────────────────────────────────────────────────
export type PathModuleType = 'COURSE' | 'LAB';
export type PathModuleStatus = 'PUBLISHED' | 'DRAFT' | 'COMING_SOON';

export interface PathModule {
  id: string;
  pathId: string;
  title: string;
  ar_title?: string;
  description?: string;
  ar_description?: string;
  order: number;
  type: PathModuleType;
  status: PathModuleStatus;
  estimatedHours: number;
  isLocked: boolean;
  totalTopics: number;
  courseId?: string;
  labId?: string;
  course?: {
    id: string;
    title: string;
    slug: string;
    thumbnail?: string;
    difficulty: Difficulty;
  };
  lab?: {
    id: string;
    title: string;
    slug: string;
    imageUrl?: string;
    difficulty: LabDifficulty;
  };
}

export interface LearningPathListItem {
  id: string;
  title: string;
  ar_title?: string;
  slug: string;
  description?: string;
  thumbnail?: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt?: string;
  _count: {
    modules: number;
    enrollments: number;
  };
}

export interface LearningPath extends LearningPathListItem {
  ar_description?: string;
  modules: PathModule[];
}

/** Shape returned by GET /admin/paths/stats */
export interface PathStats {
  total: number;
  published: number;
  unpublished: number;
}

export interface CreatePathRequest {
  title: string;
  slug: string;
  ar_title?: string;
  description?: string;
  ar_description?: string;
  thumbnail?: string;
  isPublished?: boolean;
  modules?: Array<{
    title: string;
    ar_title?: string;
    description?: string;
    ar_description?: string;
    order: number;
    type: PathModuleType;
    estimatedHours?: number;
    isLocked?: boolean;
    courseId?: string;
    labId?: string;
  }>;
}

export interface UpdatePathRequest extends Partial<Omit<CreatePathRequest, 'modules'>> {}

// ─── Analytics Types ───────────────────────────────────────────────────────────
/** Shape returned by GET /admin/analytics/overview */
export interface AnalyticsOverview {
  users: number;
  courses: number;
  labs: number;
  enrollments: number;
  labCompletions: number;
  totalXP: number;
  totalPoints: number;
}

/** Single data point returned by growth arrays */
export interface GrowthDataPoint {
  month: string; // e.g. "2025-03"
  count: number;
}

/** Shape returned by GET /admin/analytics/growth */
export interface GrowthTrends {
  users: GrowthDataPoint[];
  enrollments: GrowthDataPoint[];
}

/** Shape returned by GET /admin/analytics/engagement */
export interface EngagementMetrics {
  activeUsers: number;
  labLaunches: number;
  submissions: number;
  avgSessionDuration: number; // seconds
}

/** Shape returned by GET /admin/analytics/top-content */
export interface TopContent {
  courses: Array<{
    id: string;
    title: string;
    slug: string;
    enrollmentCount: number;
    averageRating: number;
    difficulty: Difficulty;
  }>;
  labs: Array<{
    id: string;
    title: string;
    slug: string;
    difficulty: LabDifficulty;
    category: LabCategory;
    completions: number;
  }>;
}

/** Shape returned by GET /admin/analytics/recent-activity */
export interface ActivityEvent {
  type: 'user_registered' | 'course_enrolled' | 'lab_completed';
  timestamp: string;
  user: { id: string; name: string };
  course?: { id: string; title: string; slug?: string };
  lab?: { id: string; title: string; slug?: string };
}

// ─── Pagination ────────────────────────────────────────────────────────────────
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}
