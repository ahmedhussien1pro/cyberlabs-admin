// src/features/courses/services/course-editor.service.ts
import { adminApiClient } from '@/core/api/admin-client';

// ── Curriculum Save (PUT /admin/courses/:id/curriculum) ────────────────

export async function saveCurriculum(
  courseId: string,
  topics: object[],
): Promise<any> {
  const res = await adminApiClient.put(
    `/admin/courses/${courseId}/curriculum`,
    { topics },
  );
  return res.data ?? res;
}

// ── Download JSON (browser-side export) ───────────────────────────────

export function downloadJSON(data: object, filename = 'course.json'): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
