import apiClient from './api';
import type { FullItinerary, TripStop, TripActivity } from '@/types';

export interface AddStopPayload {
  city_id: number;
  start_date: string;
  end_date: string;
  transport_cost?: number | string;
  accommodation_cost?: number | string;
  notes?: string;
}

export interface UpdateStopPayload {
  city_id?: number;
  start_date?: string;
  end_date?: string;
  transport_cost?: number | string;
  accommodation_cost?: number | string;
  notes?: string;
}

export interface AddActivityPayload {
  activity_id: number;
  activity_date: string;
  start_time?: string;
  estimated_cost?: number | string;
  notes?: string;
}

export interface UpdateActivityPayload {
  activity_date?: string;
  start_time?: string;
  estimated_cost?: number | string;
  notes?: string;
}

export const itineraryService = {
  /**
   * Fetch full trip itinerary (trip + stops + activities).
   */
  async getItinerary(tripId: number | string): Promise<FullItinerary> {
    const response = await apiClient.get<FullItinerary>(`/trips/${tripId}/itinerary/`);
    return response.data;
  },

  /**
   * Add a city stop to a trip.
   */
  async addStop(tripId: number | string, payload: AddStopPayload): Promise<TripStop> {
    const response = await apiClient.post<TripStop>(`/trips/${tripId}/stops/`, payload);
    return response.data;
  },

  /**
   * Update a city stop.
   */
  async updateStop(stopId: number | string, payload: UpdateStopPayload): Promise<TripStop> {
    const response = await apiClient.patch<TripStop>(`/stops/${stopId}/`, payload);
    return response.data;
  },

  /**
   * Delete a city stop.
   */
  async deleteStop(stopId: number | string): Promise<void> {
    await apiClient.delete(`/stops/${stopId}/`);
  },

  /**
   * Reorder stops within a trip.
   */
  async reorderStops(tripId: number | string, stopIds: number[]): Promise<TripStop[]> {
    const response = await apiClient.patch<TripStop[]>('/stops/reorder/', {
      trip_id: Number(tripId),
      stop_ids: stopIds,
    });
    return response.data;
  },

  /**
   * Schedule an activity in a stop.
   */
  async addActivity(stopId: number | string, payload: AddActivityPayload): Promise<TripActivity> {
    const response = await apiClient.post<TripActivity>(`/stops/${stopId}/activities/`, payload);
    return response.data;
  },

  /**
   * Update a scheduled activity.
   */
  async updateActivity(activityId: number | string, payload: UpdateActivityPayload): Promise<TripActivity> {
    const response = await apiClient.patch<TripActivity>(`/trip-activities/${activityId}/`, payload);
    return response.data;
  },

  /**
   * Delete a scheduled activity.
   */
  async deleteActivity(activityId: number | string): Promise<void> {
    await apiClient.delete(`/trip-activities/${activityId}/`);
  },

  /**
   * Reorder scheduled activities within a stop.
   */
  async reorderActivities(stopId: number | string, activityIds: number[]): Promise<TripActivity[]> {
    const response = await apiClient.patch<TripActivity[]>('/trip-activities/reorder/', {
      stop_id: Number(stopId),
      activity_ids: activityIds,
    });
    return response.data;
  },
};
