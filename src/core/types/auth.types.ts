import type { User } from './user.types';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  access_token?: string; // Some backends use this
  token?: string;        // Others use this
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}
