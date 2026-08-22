import { useQuery } from '@tanstack/react-query';
import { activityService, type ActivityFilters } from '@/services/activityService';

export const ACTIVITY_KEYS = {
  all: ['activities'] as const,
  list: (filters: ActivityFilters) => ['activities', filters] as const,
  detail: (id: number | string) => ['activity', id] as const,
};

export function useActivities(filters: ActivityFilters = {}) {
  return useQuery({
    queryKey: ACTIVITY_KEYS.list(filters),
    queryFn: () => activityService.getActivities(filters),
    staleTime: 5 * 60 * 1000,
  });
}

export function useActivity(id: number | string | undefined) {
  return useQuery({
    queryKey: ACTIVITY_KEYS.detail(id!),
    queryFn: () => activityService.getActivity(id!),
    enabled: !!id,
  });
}
