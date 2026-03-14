// src/features/courses/utils/course.utils.ts
// Pure utility functions — zero React deps, fully testable

import type { AdminCourse } from '../types';

/** Slugify a raw string to kebab-case URL-safe slug */
export function slugify(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Resolve the display title based on language */
export function resolveTitle(course: Pick<AdminCourse, 'title' | 'ar_title'>, lang: 'en' | 'ar'): string {
  return lang === 'ar' ? course.ar_title || course.title : course.title;
}

/** Resolve the display description based on language */
export function resolveDescription(
  course: Pick<AdminCourse, 'description' | 'ar_description' | 'longDescription'>,
  lang: 'en' | 'ar',
): string | null {
  return lang === 'ar'
    ? course.ar_description || course.description || course.longDescription || null
    : course.description || course.longDescription || null;
}

/** Return thumbnail URL with fallback to image field */
export function resolveThumbnail(course: Pick<AdminCourse, 'image' | 'thumbnail'>): string | null {
  return course.image ?? course.thumbnail ?? null;
}

/** Normalize a color string to lowercase for map lookups */
export function normalizeColor(color: string | undefined | null): string {
  return (color ?? 'blue').toLowerCase();
}

/** Check if a course is editable (not deleted/archived) */
export function isCourseEditable(course: Pick<AdminCourse, 'state'>): boolean {
  return course.state !== undefined;
}

/** Format enrollment count with locale separator */
export function formatEnrollment(count: number | undefined): string {
  return (count ?? 0).toLocaleString();
}

/** Derive difficulty label for display */
export function difficultyLabel(difficulty: string | undefined, lang: 'en' | 'ar'): string {
  if (!difficulty) return '';
  const AR: Record<string, string> = { BEGINNER: 'مبتدئ', INTERMEDIATE: 'متوسط', ADVANCED: 'متقدم', EXPERT: 'خبير' };
  return lang === 'ar' ? (AR[difficulty] ?? difficulty) : difficulty.charAt(0) + difficulty.slice(1).toLowerCase();
}
