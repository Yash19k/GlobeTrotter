import apiClient from './api';
import type { User } from '@/types';

export interface UpdateProfilePayload {
  first_name?: string;
  last_name?: string;
  phone?: string;
  city?: string;
  country?: string;
  profile_image?: string;
}

export const userService = {
  /**
   * Fetch current authenticated user profile.
   */
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>('/auth/me/');
    return response.data;
  },

  /**
   * Update current user profile fields.
   */
  async updateProfile(payload: UpdateProfilePayload): Promise<User> {
    const response = await apiClient.patch<User>('/auth/me/', payload);
    return response.data;
  },
};
