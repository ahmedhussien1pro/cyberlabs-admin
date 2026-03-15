// src/features/dashboard/__tests__/dashboard-utils.test.ts
import { describe, it, expect } from 'vitest';
import { calcUserChangePercent, getErrorType } from '../utils/dashboard.utils';

describe('calcUserChangePercent', () => {
  it('returns correct percent', () => {
    expect(calcUserChangePercent(110, 10)).toBe(10); // 10/100 * 100 = 10%
  });
  it('returns undefined when total <= newThisMonth', () => {
    expect(calcUserChangePercent(5, 5)).toBeUndefined();
    expect(calcUserChangePercent(3, 5)).toBeUndefined();
  });
  it('rounds down', () => {
    expect(calcUserChangePercent(103, 3)).toBe(3); // 3/100 * 100 = 3
  });
});

describe('getErrorType', () => {
  it('returns null when no errors', () => {
    expect(getErrorType(null, undefined)).toBeNull();
  });
  it('returns forbidden for 403', () => {
    expect(getErrorType({ response: { status: 403 } })).toBe('forbidden');
  });
  it('returns unauthorized for 401', () => {
    expect(getErrorType({ response: { status: 401 } })).toBe('unauthorized');
  });
  it('returns network for ERR_NETWORK', () => {
    expect(getErrorType({ code: 'ERR_NETWORK' })).toBe('network');
  });
  it('returns network for message containing Network', () => {
    expect(getErrorType({ message: 'Network Error' })).toBe('network');
  });
  it('returns server for generic error', () => {
    expect(getErrorType({ message: 'Internal Server Error' })).toBe('server');
  });
  it('picks first truthy error', () => {
    expect(getErrorType(null, { response: { status: 403 } })).toBe('forbidden');
  });
});
