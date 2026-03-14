// src/features/auth/__tests__/auth-tokens.service.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

// vi.mock is hoisted to the top of the file by Vitest.
// Variables defined with vi.hoisted() are also hoisted, so they are safe to
// reference inside the vi.mock factory.
const { mockSet, mockGet, mockRemove } = vi.hoisted(() => ({
  mockSet:    vi.fn(),
  mockGet:    vi.fn(),
  mockRemove: vi.fn(),
}));

vi.mock('js-cookie', () => ({
  default: { set: mockSet, get: mockGet, remove: mockRemove },
}));

import { authTokenService } from '../services/auth-tokens.service';

beforeEach(() => vi.clearAllMocks());

describe('authTokenService.save', () => {
  it('sets access_token cookie', () => {
    authTokenService.save('tok_abc');
    expect(mockSet).toHaveBeenCalledWith(
      'access_token', 'tok_abc',
      expect.objectContaining({ expires: 7, path: '/' }),
    );
  });

  it('sets refresh_token cookie when provided', () => {
    authTokenService.save('tok_abc', 'ref_xyz');
    expect(mockSet).toHaveBeenCalledWith(
      'refresh_token', 'ref_xyz',
      expect.objectContaining({ expires: 30, path: '/' }),
    );
  });

  it('does NOT set refresh_token when not provided', () => {
    authTokenService.save('tok_only');
    const calls = mockSet.mock.calls.map((c) => c[0]);
    expect(calls).not.toContain('refresh_token');
  });
});

describe('authTokenService.clear', () => {
  it('removes both cookies', () => {
    authTokenService.clear();
    expect(mockRemove).toHaveBeenCalledWith('access_token',  { path: '/' });
    expect(mockRemove).toHaveBeenCalledWith('refresh_token', { path: '/' });
  });
});

describe('authTokenService.isLoggedIn', () => {
  it('returns true when access_token cookie exists', () => {
    mockGet.mockReturnValue('some_token');
    expect(authTokenService.isLoggedIn()).toBe(true);
  });

  it('returns false when access_token cookie is absent', () => {
    mockGet.mockReturnValue(undefined);
    expect(authTokenService.isLoggedIn()).toBe(false);
  });
});

describe('authTokenService — security', () => {
  it('uses SameSite=strict (not lax)', () => {
    authTokenService.save('tok');
    expect(mockSet).toHaveBeenCalledWith(
      'access_token', 'tok',
      expect.objectContaining({ sameSite: 'strict' }),
    );
  });

  it('access token expires in 7 days, refresh in 30', () => {
    authTokenService.save('tok', 'ref');
    const calls = mockSet.mock.calls;
    const accessCall  = calls.find((c) => c[0] === 'access_token');
    const refreshCall = calls.find((c) => c[0] === 'refresh_token');
    expect(accessCall?.[2]).toMatchObject({ expires: 7  });
    expect(refreshCall?.[2]).toMatchObject({ expires: 30 });
  });
});
