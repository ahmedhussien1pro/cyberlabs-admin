import { describe, it, expect } from 'vitest';
import {
  slugify,
  resolveTitle,
  resolveDescription,
  resolveThumbnail,
  normalizeColor,
  formatEnrollment,
  difficultyLabel,
} from '../course.utils';

describe('slugify', () => {
  it('converts spaces to hyphens', () => {
    expect(slugify('Web Security Fundamentals')).toBe('web-security-fundamentals');
  });
  it('strips special characters', () => {
    expect(slugify('Hello! World@2024')).toBe('hello-world2024');
  });
  it('collapses multiple hyphens', () => {
    expect(slugify('foo   bar')).toBe('foo-bar');
  });
  it('trims leading/trailing hyphens', () => {
    expect(slugify('  -hello-  ')).toBe('hello');
  });
  it('returns empty string for empty input', () => {
    expect(slugify('')).toBe('');
  });
});

describe('resolveTitle', () => {
  const course = { title: 'English Title', ar_title: 'عنوان عربي' };
  it('returns ar_title when lang is ar', () => {
    expect(resolveTitle(course, 'ar')).toBe('عنوان عربي');
  });
  it('returns title when lang is en', () => {
    expect(resolveTitle(course, 'en')).toBe('English Title');
  });
  it('falls back to title if ar_title is empty', () => {
    expect(resolveTitle({ title: 'English', ar_title: '' }, 'ar')).toBe('English');
  });
  it('falls back to title if ar_title is undefined', () => {
    expect(resolveTitle({ title: 'English', ar_title: undefined }, 'ar')).toBe('English');
  });
});

describe('resolveDescription', () => {
  const base = { description: 'EN desc', ar_description: 'وصف عربي', longDescription: 'Long EN' };
  it('returns ar_description for ar lang', () => {
    expect(resolveDescription(base, 'ar')).toBe('وصف عربي');
  });
  it('falls back to description if ar_description empty', () => {
    expect(resolveDescription({ ...base, ar_description: '' }, 'ar')).toBe('EN desc');
  });
  it('returns null when all empty for en', () => {
    expect(resolveDescription({ description: '', ar_description: '', longDescription: '' }, 'en')).toBeNull();
  });
});

describe('resolveThumbnail', () => {
  it('prefers image over thumbnail', () => {
    expect(resolveThumbnail({ image: 'img.png', thumbnail: 'thumb.png' })).toBe('img.png');
  });
  it('falls back to thumbnail', () => {
    expect(resolveThumbnail({ image: undefined, thumbnail: 'thumb.png' })).toBe('thumb.png');
  });
  it('returns null when both absent', () => {
    expect(resolveThumbnail({ image: undefined, thumbnail: undefined })).toBeNull();
  });
});

describe('normalizeColor', () => {
  it('lowercases the color', () => {
    expect(normalizeColor('BLUE')).toBe('blue');
  });
  it('defaults to blue for null', () => {
    expect(normalizeColor(null)).toBe('blue');
  });
  it('defaults to blue for undefined', () => {
    expect(normalizeColor(undefined)).toBe('blue');
  });
});

describe('formatEnrollment', () => {
  it('formats number with locale', () => {
    expect(formatEnrollment(1000)).toBe('1,000');
  });
  it('defaults to 0 for undefined', () => {
    expect(formatEnrollment(undefined)).toBe('0');
  });
});

describe('difficultyLabel', () => {
  it('returns Arabic label', () => {
    expect(difficultyLabel('BEGINNER', 'ar')).toBe('مبتدئ');
  });
  it('returns title-case for en', () => {
    expect(difficultyLabel('BEGINNER', 'en')).toBe('Beginner');
  });
  it('returns empty string for undefined', () => {
    expect(difficultyLabel(undefined, 'en')).toBe('');
  });
});
