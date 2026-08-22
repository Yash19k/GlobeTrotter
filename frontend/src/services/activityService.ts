import apiClient from './api';
import type { Activity, PaginatedResponse } from '@/types';

export interface ActivityFilters {
  search?: string;
  city?: number | string;
  category?: string;
  min_cost?: number | string;
  max_cost?: number | string;
  min_duration?: number | string;
  max_duration?: number | string;
  ordering?: string;
  page?: number;
  page_size?: number;
}

export const activityService = {
  /**
   * Fetch paginated list of activities with filters.
   */
  async getActivities(filters: ActivityFilters = {}): Promise<PaginatedResponse<Activity>> {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.city) params.append('city', String(filters.city));
    if (filters.category) params.append('category', filters.category);
    if (filters.min_cost) params.append('min_cost', String(filters.min_cost));
    if (filters.max_cost) params.append('max_cost', String(filters.max_cost));
    if (filters.min_duration) params.append('min_duration', String(filters.min_duration));
    if (filters.max_duration) params.append('max_duration', String(filters.max_duration));
    if (filters.ordering) params.append('ordering', filters.ordering);
    if (filters.page) params.append('page', String(filters.page));
    if (filters.page_size) params.append('page_size', String(filters.page_size));

    const response = await apiClient.get<PaginatedResponse<Activity> | Activity[]>(`/activities/?${params.toString()}`);

    if (Array.isArray(response.data)) {
      return {
        count: response.data.length,
        next: null,
        previous: null,
        results: response.data,
      };
    }

    return response.data;
  },

  /**
   * Fetch single activity detail by ID.
   */
  async getActivity(id: number | string): Promise<Activity> {
    const response = await apiClient.get<Activity>(`/activities/${id}/`);
    return response.data;
  },
};
