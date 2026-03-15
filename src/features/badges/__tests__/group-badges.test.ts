// src/features/badges/__tests__/group-badges.test.ts
import { describe, it, expect } from 'vitest';
import { groupBadgesByType } from '../utils/group-badges';
import type { BadgeItem } from '@/core/api/services';

const make = (id: string, type: string): BadgeItem => ({
  id, type, title: `Badge ${id}`, ar_title: '',
  description: '', imageUrl: '', xpReward: 0, pointsReward: 0,
} as any);

describe('groupBadgesByType', () => {
  it('groups badges by uppercase type', () => {
    const result = groupBadgesByType([make('1', 'lab'), make('2', 'course'), make('3', 'lab')]);
    expect(result['LAB'].length).toBe(2);
    expect(result['COURSE'].length).toBe(1);
  });

  it('uses OTHER for missing type', () => {
    const result = groupBadgesByType([{ ...make('1', ''), type: undefined } as any]);
    expect(result['OTHER'].length).toBe(1);
  });

  it('returns empty object for empty array', () => {
    expect(groupBadgesByType([])).toEqual({});
  });

  it('preserves insertion order within groups', () => {
    const result = groupBadgesByType([make('a', 'LAB'), make('b', 'LAB'), make('c', 'LAB')]);
    expect(result['LAB'].map((b) => b.id)).toEqual(['a', 'b', 'c']);
  });
});
