// ── Course types — مطابق لـ AdminCourse في الـ backend ──────────────────
export type CourseAccess      = 'FREE' | 'PRO' | 'PREMIUM';
export type CourseDifficulty  = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
export type CourseColor       = 'EMERALD' | 'BLUE' | 'VIOLET' | 'ORANGE' | 'ROSE' | 'CYAN';
export type CourseState       = 'PUBLISHED' | 'COMING_SOON' | 'DRAFT';
export type CourseContentType = 'PRACTICAL' | 'THEORETICAL' | 'MIXED';
export type CourseCategory =
  | 'WEB_SECURITY' | 'PENETRATION_TESTING' | 'MALWARE_ANALYSIS'
  | 'CLOUD_SECURITY' | 'FUNDAMENTALS' | 'CRYPTOGRAPHY'
  | 'NETWORK_SECURITY' | 'TOOLS_AND_TECHNIQUES' | 'CAREER_AND_INDUSTRY';

export interface Course {
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
  state: CourseState;
  difficulty: CourseDifficulty;
  ar_difficulty?: string | null;
  category: CourseCategory;
  ar_category?: string | null;
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

export interface CoursesListResponse {
  data: Course[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface CourseStats {
  total: number;
  published: number;
  draft: number;
  comingSoon: number;
  featured: number;
}

export type CourseUpdateDto = Partial<Omit<Course, 'id' | 'slug' | 'enrollmentCount' | 'labSlugs'>>;

export interface CourseCreateDto {
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
