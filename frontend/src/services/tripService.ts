import apiClient from './api';
import type { Trip, PaginatedResponse } from '@/types';

export interface CreateTripPayload {
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  total_budget: number;
  cover_image?: string;
}

export interface UpdateTripPayload {
  name?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  total_budget?: number;
  cover_image?: string;
  is_public?: boolean;
}

/**
 * Trip API service functions connecting frontend to Django API endpoints.
 */
export const tripService = {
  /**
   * Get list of trips owned by current user.
   */
  async getTrips(): Promise<Trip[]> {
    const response = await apiClient.get<PaginatedResponse<Trip> | Trip[]>('/trips/');
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return response.data.results || [];
  },

  /**
   * Get single trip detail by ID.
   */
  async getTrip(id: number | string): Promise<Trip> {
    const response = await apiClient.get<Trip>(`/trips/${id}/`);
    return response.data;
  },

  /**
   * Create a new trip.
   */
  async createTrip(payload: CreateTripPayload): Promise<Trip> {
    const response = await apiClient.post<Trip>('/trips/', payload);
    return response.data;
  },

  /**
   * Update an existing trip.
   */
  async updateTrip(id: number | string, payload: UpdateTripPayload): Promise<Trip> {
    const response = await apiClient.patch<Trip>(`/trips/${id}/`, payload);
    return response.data;
  },

  /**
   * Delete a trip.
   */
  async deleteTrip(id: number | string): Promise<void> {
    await apiClient.delete(`/trips/${id}/`);
  },
};
