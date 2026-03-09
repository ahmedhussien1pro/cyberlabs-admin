// src/features/courses/types/course-editor.types.ts
// All types for the Course Content Editor.
// Aligned with the backend DB model (Section → Lesson).

// ── Element Types ────────────────────────────────────────────────────────────────

export type ElementType = 'TEXT' | 'IMAGE' | 'VIDEO' | 'CODE' | 'QUIZ';

/**
 * Maps editor ElementType → backend lesson type
 * TEXT   → ARTICLE  (content = markdown text)
 * IMAGE  → ARTICLE  (content = image URL or markdown img)
 * VIDEO  → VIDEO
 * CODE   → ARTICLE  (content = fenced code block)
 * QUIZ   → QUIZ
 */
export const ELEMENT_TYPE_TO_LESSON_TYPE: Record<ElementType, string> = {
  TEXT: 'ARTICLE',
  IMAGE: 'ARTICLE',
  VIDEO: 'VIDEO',
  CODE: 'ARTICLE',
  QUIZ: 'QUIZ',
};

// ── Quiz Sub-types ──────────────────────────────────────────────────────────

export interface QuizOption {
  id: string;
  text: string;
  ar_text?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  ar_question?: string;
  options: QuizOption[];
  correctOptionId: string;
  explanation?: string;
  ar_explanation?: string;
}

// ── Course Element ──────────────────────────────────────────────────────────

export interface CourseElement {
  id: string;
  type: ElementType;
  title: string;
  ar_title?: string;
  order: number;

  // TEXT
  content?: string;
  ar_content?: string;

  // IMAGE
  imageUrl?: string;
  altText?: string;
  ar_altText?: string;
  caption?: string;
  ar_caption?: string;

  // VIDEO
  videoUrl?: string;
  /** Duration in seconds */
  videoDuration?: number;

  // CODE
  code?: string;
  language?: string;
  codeExplanation?: string;
  ar_codeExplanation?: string;

  // QUIZ
  questions?: QuizQuestion[];
}

// ── Topic (maps to Section + Module in DB) ──────────────────────────────

export interface EditorTopic {
  id: string;
  title: string;
  ar_title?: string;
  description?: string;
  ar_description?: string;
  order: number;
  elements: CourseElement[];
}

// ── Card Info (course listing card) ──────────────────────────────────

export interface EditorCardInfo {
  title: string;
  ar_title: string;
  slug: string;
  thumbnail: string;
  color: string;
  access: 'FREE' | 'PRO' | 'PREMIUM';
  category: string;
  contentType: string;
  tags: string[];
  skills: string[];
  isNew: boolean;
  isFeatured: boolean;
}

// ── Hero Info (course detail page) ────────────────────────────────

export interface EditorHeroInfo {
  description: string;
  ar_description: string;
  longDescription: string;
  ar_longDescription: string;
  difficulty: string;
  estimatedHours: number;
  instructorId: string;
  whatYouLearn: string[];
  ar_whatYouLearn: string[];
  requirements: string[];
  ar_requirements: string[];
}

// ── Editor Meta ────────────────────────────────────────────────────────────

/** Where did the data come from? */
export type EditorMode = 'new' | 'import' | 'edit';

/** Which left panel is active */
export type EditorPanel = 'card' | 'hero' | 'curriculum';

// ── Default values ──────────────────────────────────────────────────────────

export const DEFAULT_CARD_INFO: EditorCardInfo = {
  title: '',
  ar_title: '',
  slug: '',
  thumbnail: '',
  color: '#3b82f6',
  access: 'FREE',
  category: '',
  contentType: 'COURSE',
  tags: [],
  skills: [],
  isNew: false,
  isFeatured: false,
};

export const DEFAULT_HERO_INFO: EditorHeroInfo = {
  description: '',
  ar_description: '',
  longDescription: '',
  ar_longDescription: '',
  difficulty: 'beginner',
  estimatedHours: 0,
  instructorId: '',
  whatYouLearn: [],
  ar_whatYouLearn: [],
  requirements: [],
  ar_requirements: [],
};
