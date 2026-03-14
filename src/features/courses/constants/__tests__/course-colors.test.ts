import { describe, it, expect } from 'vitest';
import { MATRIX_COLOR, STRIPE, BLOOM, TEXT_COLOR, FALLBACK_BG, ACCESS_BADGE, STATE_DOT } from '../course-colors';

const EXPECTED_COLORS = ['blue', 'emerald', 'violet', 'orange', 'rose', 'cyan'];

describe('MATRIX_COLOR', () => {
  it('has all 6 color keys', () => {
    EXPECTED_COLORS.forEach((c) => expect(MATRIX_COLOR).toHaveProperty(c));
  });
  it('values are hex strings', () => {
    Object.values(MATRIX_COLOR).forEach((v) => expect(v).toMatch(/^#[0-9a-f]{6}$/i));
  });
});

describe('STRIPE', () => {
  it('has all 6 color keys with tailwind classes', () => {
    EXPECTED_COLORS.forEach((c) => {
      expect(STRIPE).toHaveProperty(c);
      expect(typeof STRIPE[c]).toBe('string');
    });
  });
});

describe('ACCESS_BADGE', () => {
  it('has FREE, PRO, PREMIUM', () => {
    expect(ACCESS_BADGE).toHaveProperty('FREE');
    expect(ACCESS_BADGE).toHaveProperty('PRO');
    expect(ACCESS_BADGE).toHaveProperty('PREMIUM');
  });
});

describe('STATE_DOT', () => {
  it('has PUBLISHED, DRAFT, COMING_SOON', () => {
    expect(STATE_DOT).toHaveProperty('PUBLISHED');
    expect(STATE_DOT).toHaveProperty('DRAFT');
    expect(STATE_DOT).toHaveProperty('COMING_SOON');
  });
  it('values are bg-* tailwind classes', () => {
    Object.values(STATE_DOT).forEach((v) => expect(v).toMatch(/^bg-/));
  });
});

describe('TEXT_COLOR + FALLBACK_BG + BLOOM', () => {
  it('all have 6 color keys', () => {
    [TEXT_COLOR, FALLBACK_BG, BLOOM].forEach((map) => {
      EXPECTED_COLORS.forEach((c) => expect(map).toHaveProperty(c));
    });
  });
});
