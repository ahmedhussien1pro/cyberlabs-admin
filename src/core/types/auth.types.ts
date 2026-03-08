import type { User } from './user.types';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  accessToken?: string;  // CamelCase (used by backend)
  access_token?: string; // Snake case (alternative)
  token?: string;        // Simple key (alternative)
  refreshToken?: string;
  expiresIn?: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}
