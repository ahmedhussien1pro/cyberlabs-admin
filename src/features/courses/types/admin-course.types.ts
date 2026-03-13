// ─── Enums ──────────────────────────────────────────────────────────────────
export type CourseAccess = 'FREE' | 'PRO' | 'PREMIUM';
export type CourseDifficulty =
  | 'BEGINNER'
  | 'INTERMEDIATE'
  | 'ADVANCED'
  | 'EXPERT';

// ✅ FIXED: was uppercase (EMERALD, BLUE...) — backend stores and returns lowercase
export type CourseColor =
  | 'emerald'
  | 'blue'
  | 'violet'
  | 'orange'
  | 'rose'
  | 'cyan';

export type CourseState = 'PUBLISHED' | 'COMING_SOON' | 'DRAFT';
export type CourseContentType = 'PRACTICAL' | 'THEORETICAL' | 'MIXED';
export type CourseCategory =
  | 'WEB_SECURITY'
  | 'PENETRATION_TESTING'
  | 'MALWARE_ANALYSIS'
  | 'CLOUD_SECURITY'
  | 'FUNDAMENTALS'
  | 'CRYPTOGRAPHY'
  | 'NETWORK_SECURITY'
  | 'TOOLS_AND_TECHNIQUES'
  | 'CAREER_AND_INDUSTRY';

// ─── Curriculum Types (mirror cyberlabs-frontend course.types.ts) ────────────
export type CurriculumElementType =
  | 'image'
  | 'title'
  | 'text'
  | 'table'
  | 'terminal'
  | 'note'
  | 'hr'
  | 'orderedList'
  | 'list'
  | 'quiz';

export interface CurriculumElement {
  id: string | number;
  type: CurriculumElementType;
  value?: { en: string; ar: string };
  [key: string]: unknown;
}

export interface CurriculumTopic {
  id: string;
  title: { en: string; ar: string };
  elements: CurriculumElement[];
}

export interface CurriculumData {
  topics: CurriculumTopic[];
  totalTopics: number;
  landingData?: Record<string, unknown> | null;
  /** 'json' = loaded from JSON file (full rich content), 'db' = fallback from DB */
  source?: 'json' | 'db';
  courseId?: string;
  courseSlug?: string;
  courseTitle?: string;
}

// ─── Course Admin DTO (matches backend normalizeCourse + CourseCardDto) ──────
export interface AdminCourse {
  id: string;
  slug: string;
  title: string;
  ar_title: string | null;
  description: string | null;
  ar_description: string | null;
  longDescription: string | null;
  ar_longDescription: string | null;
  image: string | null;
  thumbnail: string | null;
  isPublished: boolean;
  // ✅ FIXED: lowercase to match backend
  color: CourseColor;
  access: CourseAccess;
  state: CourseState;
  difficulty: CourseDifficulty;
  category: CourseCategory;
  contentType: CourseContentType;
  estimatedHours: number;
  enrollmentCount: number;
  totalTopics: number;
  // ✅ ADDED: missing fields from CourseCardDto
  labsCount: number;
  averageRating: number;
  reviewCount: number;
  tags: string[];
  skills: string[];
  ar_skills: string[];
  topics: string[];
  ar_topics: string[];
  prerequisites: string[];
  ar_prerequisites: string[];
  isFeatured: boolean;
  isNew: boolean;
  labsLink?: string | null;
  labSlugs: string[];
  instructorId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export type AdminCourseUpdateDto = Partial<
  Omit<AdminCourse, 'id' | 'slug' | 'enrollmentCount' | 'labSlugs' | 'labsCount' | 'averageRating' | 'reviewCount' | 'createdAt' | 'updatedAt'>
>;

export interface AdminCoursesListResponse {
  data: AdminCourse[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface AdminCourseStats {
  total: number;
  published: number;
  draft: number;
  comingSoon: number;
  featured: number;
  unpublished: number;
}

// ─── Create DTO ───────────────────────────────────────────────────────────
export interface AdminCourseCreateDto {
  title: string;
  ar_title?: string;
  slug: string;
  description?: string;
  ar_description?: string;
  difficulty: CourseDifficulty;
  access: CourseAccess;
  category: CourseCategory;
  color: CourseColor;
  contentType: CourseContentType;
  estimatedHours?: number;
  thumbnail?: string;
  tags?: string[];
  skills?: string[];
  state?: CourseState;
  instructorId: string;
}

// ─── Upload Response ───────────────────────────────────────────────────────
export interface UploadImageResponse {
  url: string;
  key: string;
}
