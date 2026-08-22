import apiClient from './api';
import type { CommunityFeedResponse } from '@/types';

export const communityService = {
  /**
   * Fetch paginated list of public community trips.
   */
  async getCommunityTrips(page: number = 1, search: string = ''): Promise<CommunityFeedResponse> {
    const params = new URLSearchParams();
    if (page) params.append('page', String(page));
    if (search) params.append('search', search);

    const response = await apiClient.get<CommunityFeedResponse>(`/community/trips/?${params.toString()}`);
    return response.data;
  },
};
