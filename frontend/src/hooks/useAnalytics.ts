import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/services/analyticsService';

export const useAnalytics = () => {
  return useQuery({
    queryKey: ['analytics', 'summary'],
    queryFn: () => analyticsService.getSummary(),
    staleTime: 1000 * 60 * 2, // 2 minutes cache
  });
};
