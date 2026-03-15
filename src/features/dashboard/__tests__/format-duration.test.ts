// src/features/dashboard/__tests__/format-duration.test.ts
import { describe, it, expect } from 'vitest';
import { formatDuration } from '../utils/format-duration';

describe('formatDuration', () => {
  it('returns seconds for values under 60', () => {
    expect(formatDuration(0)).toBe('0s');
    expect(formatDuration(45)).toBe('45s');
    expect(formatDuration(59)).toBe('59s');
  });

  it('returns minutes for values 60–99s (< 1h)', () => {
    expect(formatDuration(60)).toBe('1m');
    expect(formatDuration(90)).toBe('1m');
    expect(formatDuration(3599)).toBe('59m');
  });

  it('returns hours + remaining minutes for values >= 3600s', () => {
    expect(formatDuration(3600)).toBe('1h 0m');
    expect(formatDuration(3660)).toBe('1h 1m');
    expect(formatDuration(7320)).toBe('2h 2m');
  });
});
