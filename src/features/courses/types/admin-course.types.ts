// src/features/courses/types/admin-course.types.ts
// ✅ Types مطابقة تماماً لـ cyberlabs-frontend/course.types.ts

export type CourseAccess = 'FREE' | 'PRO' | 'PREMIUM';
export type CourseDifficulty =
  | 'BEGINNER'
  | 'INTERMEDIATE'
  | 'ADVANCED'
  | 'EXPERT';
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

// ── Curriculum (مطابق لـ CurriculumTopic في المنصة) ──────────────────
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
}

// ── Course Admin DTO ─────────────────────────────────────────────────
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
  color: CourseColor;
  access: CourseAccess;
  state: CourseState; // ✅ ليس isPublished boolean
  difficulty: CourseDifficulty;
  category: CourseCategory;
  contentType: CourseContentType;
  estimatedHours: number;
  enrollmentCount: number;
  totalTopics: number;
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
}

export type AdminCourseUpdateDto = Partial<
  Omit<AdminCourse, 'id' | 'slug' | 'enrollmentCount'>
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
}
