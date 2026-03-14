// ── Shared types for CurriculumPlatformEditor ─────────────────────────────
import type { CourseElement } from '../CourseElementRenderer';

export interface TopicTitle { en: string; ar: string; }

export interface Topic {
  id: string;
  title: TopicTitle;
  elements: CourseElement[];
}

export function normalizeTitle(raw: any): TopicTitle {
  if (raw && typeof raw === 'object' && ('en' in raw || 'ar' in raw))
    return { en: raw.en ?? '', ar: raw.ar ?? '' };
  const str = typeof raw === 'string' ? raw : '';
  return { en: str, ar: '' };
}

export function normalizeElement(el: any): CourseElement {
  if (!el || typeof el !== 'object') return el;
  const out = { ...el };
  const bilingualFields = ['value', 'title', 'label', 'alt'];
  for (const field of bilingualFields) {
    if (out[field] !== undefined && typeof out[field] === 'string') {
      out[field] = { en: out[field], ar: '' };
    }
  }
  if (Array.isArray(out.items)) {
    out.items = out.items.map((item: any) => {
      if (typeof item === 'string') return { en: item, ar: '' };
      return item;
    });
  }
  return out as CourseElement;
}

export function normalizeTopic(raw: any, idx: number): Topic {
  const elements: CourseElement[] = Array.isArray(raw?.elements)
    ? raw.elements.map((el: any) => normalizeElement(el))
    : [];
  return {
    id:    raw?.id ?? `topic-${Date.now()}-${idx}`,
    title: normalizeTitle(raw?.title),
    elements,
  };
}

export function sanitizeTopicsForSave(topics: Topic[]): object[] {
  return topics.map((t) => ({
    ...t,
    elements: t.elements.map(({ _localFile, ...el }: any) => el),
  }));
}
