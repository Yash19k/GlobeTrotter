import { useQuery } from '@tanstack/react-query';
import { cityService, type CityFilters } from '@/services/cityService';

export const CITY_KEYS = {
  all: ['cities'] as const,
  list: (filters: CityFilters) => ['cities', filters] as const,
  detail: (id: number | string) => ['city', id] as const,
};

export function useCities(filters: CityFilters = {}) {
  return useQuery({
    queryKey: CITY_KEYS.list(filters),
    queryFn: () => cityService.getCities(filters),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCity(id: number | string | undefined) {
  return useQuery({
    queryKey: CITY_KEYS.detail(id!),
    queryFn: () => cityService.getCity(id!),
    enabled: !!id,
  });
}
