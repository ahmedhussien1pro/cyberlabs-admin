// src/features/auth/types.ts
// Shared auth types — exported from barrel

export interface LoginFormData {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role: string;
}

export interface LoginResponse extends AuthTokens {
  user: AuthUser;
  /** legacy field aliases */
  access_token?: string;
  token?: string;
}
