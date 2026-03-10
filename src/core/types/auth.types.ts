import type { User } from './user.types';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  accessToken?: string;
  access_token?: string;
  token?: string;
  refreshToken?: string;
  expiresIn?: number;
}

export type AuthResponse = LoginResponse;

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}
