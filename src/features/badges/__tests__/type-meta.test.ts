// src/features/badges/__tests__/type-meta.test.ts
import { describe, it, expect } from 'vitest';
import { BADGE_TYPE_META, DEFAULT_BADGE_META, BADGE_TYPE_KEYS } from '../constants/type-meta';

describe('BADGE_TYPE_META', () => {
  it('contains all 5 expected keys', () => {
    expect(BADGE_TYPE_KEYS).toEqual(['LAB', 'COURSE', 'PATH', 'STREAK', 'SPECIAL']);
  });

  it('each entry has label, icon and colour', () => {
    BADGE_TYPE_KEYS.forEach((key) => {
      const m = BADGE_TYPE_META[key];
      expect(typeof m.label).toBe('string');
      // Lucide icons are ForwardRef objects in test env, not plain functions
      expect(m.icon).toBeTruthy();
      expect(m.colour).toContain('bg-');
    });
  });

  it('DEFAULT_BADGE_META is defined', () => {
    expect(DEFAULT_BADGE_META.label).toBe('Other');
    expect(DEFAULT_BADGE_META.icon).toBeTruthy();
  });

  it('LAB colour contains purple', () => {
    expect(BADGE_TYPE_META.LAB.colour).toContain('purple');
  });
});
