// src/features/notifications/__tests__/type-meta.test.ts
import { describe, it, expect } from 'vitest';
import { TYPE_KEYS, TYPE_META } from '../constants/type-meta';

describe('TYPE_META', () => {
  it('has an entry for every TYPE_KEY', () => {
    TYPE_KEYS.forEach((k) => expect(TYPE_META[k]).toBeDefined());
  });

  it('each entry has icon, color, iconColor, bg', () => {
    TYPE_KEYS.forEach((k) => {
      expect(TYPE_META[k].icon).toBeDefined();
      expect(typeof TYPE_META[k].color).toBe('string');
      expect(typeof TYPE_META[k].iconColor).toBe('string');
      expect(typeof TYPE_META[k].bg).toBe('string');
    });
  });

  it('INFO uses text-blue-400', () => {
    expect(TYPE_META.INFO.iconColor).toBe('text-blue-400');
  });

  it('ALERT uses text-rose-400', () => {
    expect(TYPE_META.ALERT.iconColor).toBe('text-rose-400');
  });
});
