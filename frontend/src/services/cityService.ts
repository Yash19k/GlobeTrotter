import apiClient from './api';
import type { City, PaginatedResponse } from '@/types';

export interface CityFilters {
  search?: string;
  country?: string;
  region?: string;
  cost_index?: number | string;
  ordering?: string;
  page?: number;
  page_size?: number;
}

export const cityService = {
  /**
   * Fetch paginated list of destination cities with filters.
   */
  async getCities(filters: CityFilters = {}): Promise<PaginatedResponse<City>> {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.country) params.append('country', filters.country);
    if (filters.region) params.append('region', filters.region);
    if (filters.cost_index) params.append('cost_index', String(filters.cost_index));
    if (filters.ordering) params.append('ordering', filters.ordering);
    if (filters.page) params.append('page', String(filters.page));
    if (filters.page_size) params.append('page_size', String(filters.page_size));

    const response = await apiClient.get<PaginatedResponse<City> | City[]>(`/cities/?${params.toString()}`);

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
   * Fetch single city detail by ID.
   */
  async getCity(id: number | string): Promise<City> {
    const response = await apiClient.get<City>(`/cities/${id}/`);
    return response.data;
  },
};
