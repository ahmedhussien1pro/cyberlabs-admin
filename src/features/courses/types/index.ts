// ═══════════════════════════════════════════════════════════════════════════
// src/features/courses/types/index.ts
// Single source of truth for ALL course-related types in cyberlabs-admin.
// Import everything from this barrel — never import from sub-files directly.
// ═══════════════════════════════════════════════════════════════════════════

// ─── Primitive enums ────────────────────────────────────────────────────────
export type CourseAccess      = 'FREE' | 'PRO' | 'PREMIUM';
export type CourseDifficulty  = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
export type CourseState       = 'PUBLISHED' | 'COMING_SOON' | 'DRAFT';
export type CourseContentType = 'PRACTICAL' | 'THEORETICAL' | 'MIXED';
export type CourseCategory    =
  | 'WEB_SECURITY'
  | 'PENETRATION_TESTING'
  | 'MALWARE_ANALYSIS'
  | 'CLOUD_SECURITY'
  | 'FUNDAMENTALS'
  | 'CRYPTOGRAPHY'
  | 'NETWORK_SECURITY'
  | 'TOOLS_AND_TECHNIQUES'
  | 'CAREER_AND_INDUSTRY';

/**
 * CourseColor — stored & returned LOWERCASE by backend.
 * UI lookups use `.toLowerCase()` before map access.
 */
export type CourseColor = 'emerald' | 'blue' | 'violet' | 'orange' | 'rose' | 'cyan';

// ─── Curriculum ─────────────────────────────────────────────────────────────
export type CurriculumElementType =
  | 'image' | 'title' | 'text' | 'table' | 'terminal'
  | 'note'  | 'hr'    | 'orderedList' | 'list' | 'quiz' | 'code' | 'video' | 'lab';

export interface CurriculumElement {
  id?: string | number;
  type: CurriculumElementType;
  value?: { en: string; ar?: string | null } | string;
  imageUrl?: string;
  [key: string]: unknown;
}

export interface CurriculumTopic {
  id: string;
  title: { en: string; ar: string };
  elements: CurriculumElement[];
}

export interface CurriculumData {
  topics:      CurriculumTopic[];
  totalTopics: number;
  landingData?: Record<string, unknown> | null;
  /** 'json' = rich JSON file, 'db' = fallback from DB */
  source?:     'json' | 'db';
  courseId?:   string;
  courseSlug?: string;
  courseTitle?: string;
}

// ─── Core Course DTO (read-only, from API) ───────────────────────────────────
export interface AdminCourse {
  // identifiers
  id:   string;
  slug: string;

  // bilingual text
  title:              string;
  ar_title:           string | null;
  description:        string | null;
  ar_description:     string | null;
  longDescription:    string | null;
  ar_longDescription: string | null;

  // media
  image:     string | null;
  thumbnail: string | null;

  // classification
  color:       CourseColor;
  access:      CourseAccess;
  state:       CourseState;
  difficulty:  CourseDifficulty;
  category:    CourseCategory;
  contentType: CourseContentType;

  // numeric stats
  estimatedHours:  number;
  enrollmentCount: number;
  totalTopics:     number;
  labsCount:       number;
  averageRating:   number;
  reviewCount:     number;

  // tags / arrays
  tags:             string[];
  skills:           string[];
  ar_skills:        string[];
  topics:           string[];
  ar_topics:        string[];
  prerequisites:    string[];
  ar_prerequisites: string[];
  labSlugs:         string[];

  // flags
  isFeatured:  boolean;
  isNew:       boolean;
  isPublished: boolean;

  // optional relations
  labsLink?:     string | null;
  instructorId?: string | null;

  // timestamps
  createdAt?: string;
  updatedAt?: string;
}

// ─── DTOs ────────────────────────────────────────────────────────────────────
export type AdminCourseUpdateDto = Partial<
  Omit<
    AdminCourse,
    'id' | 'slug' | 'enrollmentCount' | 'labSlugs' |
    'labsCount' | 'averageRating' | 'reviewCount' | 'createdAt' | 'updatedAt'
  >
>;

export interface AdminCourseCreateDto {
  title:          string;
  ar_title?:      string;
  slug:           string;
  description?:   string;
  ar_description?: string;
  difficulty:     CourseDifficulty;
  access:         CourseAccess;
  category:       CourseCategory;
  color:          CourseColor;
  contentType:    CourseContentType;
  estimatedHours?: number;
  thumbnail?:     string;
  tags?:          string[];
  skills?:        string[];
  state?:         CourseState;
  instructorId:   string;
}

// ─── API List Response ────────────────────────────────────────────────────────
export interface AdminCoursesListResponse {
  data: AdminCourse[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

// ─── Stats ───────────────────────────────────────────────────────────────────
export interface AdminCourseStats {
  total:       number;
  published:   number;
  draft:       number;
  comingSoon:  number;
  featured:    number;
  unpublished: number;
}

// ─── Upload ───────────────────────────────────────────────────────────────────
export interface UploadImageResponse {
  url: string;
  key: string;
}

// ─── Form state types (used by edit tabs + previews) ─────────────────────────

/** Shape of the Card Info tab form — also consumed by LiveCardPreview */
export interface CardFormState {
  title:          string;
  ar_title:       string;
  description:    string;
  ar_description: string;
  color:          string;
  access:         string;
  difficulty:     string;
  category:       string;
  contentType:    string;
  estimatedHours: string;
  isFeatured:     boolean;
  isNew:          boolean;
}

/** Shape of the Hero Info tab form — also consumed by LiveHeroPreview */
export interface HeroFormState {
  title:              string;
  ar_title:           string;
  color:              string;
  image:              string;
  thumbnail:          string;
  access:             string;
  difficulty:         string;
  category:           string;
  contentType:        string;
  state:              string;
  isNew:              boolean;
  isFeatured:         boolean;
  estimatedHours:     string;
  description:        string;
  ar_description:     string;
  longDescription:    string;
  ar_longDescription: string;
  labsLink:           string;
  instructorId:       string;
  skills:             string[];
  ar_skills:          string[];
  topics:             string[];
  ar_topics:          string[];
  prerequisites:      string[];
  ar_prerequisites:   string[];
  tags:               string[];
}
