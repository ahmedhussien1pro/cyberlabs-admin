/**
 * Single source of truth for all course enum VALUES (arrays for UI selects).
 * Types are defined in ../types/index.ts — do NOT redefine them here.
 */
import type {
  CourseDifficulty, CourseAccess, CourseColor,
  CourseContentType, CourseCategory, CourseState,
} from '../types';

export const COURSE_DIFFICULTIES: readonly CourseDifficulty[] = [
  'BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT',
] as const;

export const COURSE_ACCESSES: readonly CourseAccess[] = [
  'FREE', 'PRO', 'PREMIUM',
] as const;

export const COURSE_COLORS: readonly CourseColor[] = [
  'BLUE', 'EMERALD', 'VIOLET', 'ORANGE', 'ROSE', 'CYAN',
] as const;

export const COURSE_CONTENT_TYPES: readonly CourseContentType[] = [
  'MIXED', 'PRACTICAL', 'THEORETICAL',
] as const;

export const COURSE_CATEGORIES: readonly CourseCategory[] = [
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

export const COURSE_STATES: readonly CourseState[] = [
  'DRAFT', 'PUBLISHED', 'COMING_SOON',
] as const;

/** Helper — converts enum key to readable label */
export function enumLabel(value: string): string {
  return value.replace(/_/g, ' ');
}
