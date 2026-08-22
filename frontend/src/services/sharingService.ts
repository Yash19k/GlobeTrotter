import apiClient from './api';
import type { PublicTripDetail, Trip } from '@/types';

export interface PublishResponse {
  is_public: boolean;
  share_slug?: string;
  public_url?: string;
}

export const sharingService = {
  /**
   * Publish a trip to make it publicly accessible via a share link.
   */
  async publishTrip(tripId: number | string): Promise<PublishResponse> {
    const response = await apiClient.post<PublishResponse>(`/trips/${tripId}/publish/`);
    return response.data;
  },

  /**
   * Unpublish a trip to make it private again.
   */
  async unpublishTrip(tripId: number | string): Promise<PublishResponse> {
    const response = await apiClient.post<PublishResponse>(`/trips/${tripId}/unpublish/`);
    return response.data;
  },

  /**
   * Fetch read-only public itinerary by share slug (no auth required).
   */
  async getPublicTrip(slug: string): Promise<PublicTripDetail> {
    const response = await apiClient.get<PublicTripDetail>(`/public/trips/${slug}/`);
    return response.data;
  },

  /**
   * Deep-copy a public trip into the authenticated user's account.
   */
  async copyPublicTrip(slug: string): Promise<Trip> {
    const response = await apiClient.post<Trip>(`/public/trips/${slug}/copy/`);
    return response.data;
  },
};
