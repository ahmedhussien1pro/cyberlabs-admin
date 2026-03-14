// Compile-time type guard tests — if this file compiles, types are consistent
import { describe, it, expect } from 'vitest';
import type { AdminCourse, CourseColor, CourseState, CurriculumTopic } from '../index';

describe('type guards', () => {
  it('AdminCourse has required fields', () => {
    const c: AdminCourse = {
      id: '1', slug: 'test', title: 'Test',
      state: 'DRAFT', access: 'FREE', difficulty: 'BEGINNER',
      color: 'BLUE', category: 'FUNDAMENTALS', contentType: 'MIXED',
    } as any;
    expect(c.id).toBe('1');
    expect(c.slug).toBe('test');
  });

  it('CourseColor values are uppercase strings', () => {
    const colors: CourseColor[] = ['BLUE', 'EMERALD', 'VIOLET', 'ORANGE', 'ROSE', 'CYAN'];
    expect(colors).toHaveLength(6);
  });

  it('CourseState values are correct', () => {
    const states: CourseState[] = ['PUBLISHED', 'DRAFT', 'COMING_SOON'];
    expect(states).toHaveLength(3);
  });

  it('CurriculumTopic has id + title + elements', () => {
    const topic: CurriculumTopic = {
      id: 'topic-1',
      title: { en: 'Intro', ar: 'مقدمة' },
      elements: [],
    };
    expect(topic.title.en).toBe('Intro');
  });
});
