export type CourseAccess = 'FREE' | 'PRO' | 'PREMIUM';
export type CourseDifficulty =
  | 'BEGINNER'
  | 'INTERMEDIATE'
  | 'ADVANCED'
  | 'EXPERT';

export type CourseColor =
  | 'EMERALD'
  | 'BLUE'
  | 'VIOLET'
  | 'ORANGE'
  | 'ROSE'
  | 'CYAN';

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

// ── Course Admin DTO ────────────────────────────────────────────────────
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
  isPublished?: boolean;
  color: CourseColor;
  access: CourseAccess;
  state: CourseState;
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
  labSlugs: string[];
  instructorId?: string | null;
}

export type AdminCourseUpdateDto = Partial<
  Omit<AdminCourse, 'id' | 'slug' | 'enrollmentCount' | 'labSlugs'>
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

// ── Create DTO ────────────────────────────────────────────────────────
export interface AdminCourseCreateDto {
  title: string;
  ar_title?: string;
  slug: string;
  description?: string;
  difficulty: CourseDifficulty;
  access: CourseAccess;
  category: CourseCategory;
  color: CourseColor;
  contentType: CourseContentType;
  instructorId: string;
}
