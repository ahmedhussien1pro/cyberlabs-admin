/**
 * Single source of truth for all course enum values.
 * Imported by create-page, edit tabs, and anywhere else they're needed.
 */

export const COURSE_DIFFICULTIES = [
  'BEGINNER',
  'INTERMEDIATE',
  'ADVANCED',
  'EXPERT',
] as const;
export type CourseDifficulty = (typeof COURSE_DIFFICULTIES)[number];

export const COURSE_ACCESSES = ['FREE', 'PRO', 'PREMIUM'] as const;
export type CourseAccess = (typeof COURSE_ACCESSES)[number];

export const COURSE_COLORS = [
  'BLUE',
  'EMERALD',
  'VIOLET',
  'ORANGE',
  'ROSE',
  'CYAN',
] as const;
export type CourseColor = (typeof COURSE_COLORS)[number];

export const COURSE_CONTENT_TYPES = ['MIXED', 'PRACTICAL', 'THEORETICAL'] as const;
export type CourseContentType = (typeof COURSE_CONTENT_TYPES)[number];

export const COURSE_CATEGORIES = [
  'FUNDAMENTALS',
  'WEB_SECURITY',
  'PENETRATION_TESTING',
  'MALWARE_ANALYSIS',
  'CLOUD_SECURITY',
  'CRYPTOGRAPHY',
  'NETWORK_SECURITY',
  'TOOLS_AND_TECHNIQUES',
  'CAREER_AND_INDUSTRY',
] as const;
export type CourseCategory = (typeof COURSE_CATEGORIES)[number];

export const COURSE_STATES = ['DRAFT', 'PUBLISHED', 'COMING_SOON'] as const;
export type CourseState = (typeof COURSE_STATES)[number];

/** Helper — converts enum key to readable label */
export function enumLabel(value: string): string {
  return value.replace(/_/g, ' ');
}
