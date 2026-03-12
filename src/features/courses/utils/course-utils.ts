// src/features/courses/utils/course-utils.ts

/** Capitalize first letter of difficulty string */
export function normalizeDiff(d?: string | null): string | null {
  if (!d) return null;
  const s = d.toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Get platform course URL */
export function getPlatformCourseUrl(slug: string): string {
  const base =
    (import.meta as any).env?.VITE_PLATFORM_URL ?? 'https://test.cyber-labs.tech';
  return `${base}/courses/${slug}`;
}
