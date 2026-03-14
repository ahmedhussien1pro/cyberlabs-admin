// src/features/auth/services/auth-tokens.service.ts
// Centralised token management — replaces scattered Cookies.set in components
import Cookies from 'js-cookie';

const ACCESS_KEY  = 'access_token';
const REFRESH_KEY = 'refresh_token';

/** Secure cookie options */
const SECURE_OPTS = {
  path:     '/',
  sameSite: 'strict' as const,       // was 'lax' — upgraded to 'strict'
  secure:   import.meta.env.PROD,    // HTTPS-only in production
};

export const authTokenService = {
  /** Store tokens from a login response */
  save(accessToken: string, refreshToken?: string): void {
    Cookies.set(ACCESS_KEY,  accessToken,  { ...SECURE_OPTS, expires: 7  });
    if (refreshToken) {
      Cookies.set(REFRESH_KEY, refreshToken, { ...SECURE_OPTS, expires: 30 });
    }
  },

  getAccess():  string | undefined { return Cookies.get(ACCESS_KEY);  },
  getRefresh(): string | undefined { return Cookies.get(REFRESH_KEY); },

  clear(): void {
    Cookies.remove(ACCESS_KEY,  { path: '/' });
    Cookies.remove(REFRESH_KEY, { path: '/' });
  },

  isLoggedIn(): boolean {
    return !!Cookies.get(ACCESS_KEY);
  },
};
