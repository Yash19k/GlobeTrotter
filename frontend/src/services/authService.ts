import apiClient from './api';
import type { User, AuthTokens } from '@/types';

export interface RegisterPayload {
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  phone?: string;
  city?: string;
  country?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

/**
 * Authentication service functions connecting frontend to Django API endpoints.
 */
export const authService = {
  /**
   * Register a new user account.
   */
  async register(data: RegisterPayload): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register/', data);
    return response.data;
  },

  /**
   * Log in user with email & password credentials.
   */
  async login(data: LoginPayload): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/login/', data);
    return response.data;
  },

  /**
   * Fetch current authenticated user profile.
   */
  async getMe(): Promise<User> {
    const response = await apiClient.get<User>('/auth/me/');
    return response.data;
  },

  /**
   * Blacklist refresh token on logout.
   */
  async logout(refreshToken: string): Promise<void> {
    await apiClient.post('/auth/logout/', { refresh: refreshToken });
  },
};
