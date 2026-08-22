import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sharingService } from '@/services/sharingService';
import { communityService } from '@/services/communityService';

export const SHARING_KEYS = {
  publicDetail: (slug: string) => ['public-trip', slug] as const,
  communityFeed: (page: number, search: string) => ['community-trips', page, search] as const,
};

export function usePublicTrip(slug: string | undefined) {
  return useQuery({
    queryKey: SHARING_KEYS.publicDetail(slug!),
    queryFn: () => sharingService.getPublicTrip(slug!),
    enabled: !!slug,
  });
}

export function useCommunityTrips(page: number = 1, search: string = '') {
  return useQuery({
    queryKey: SHARING_KEYS.communityFeed(page, search),
    queryFn: () => communityService.getCommunityTrips(page, search),
  });
}

export function usePublishTrip(tripId: number | string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => sharingService.publishTrip(tripId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip', String(tripId)] });
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['community-trips'] });
    },
  });
}

export function useUnpublishTrip(tripId: number | string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => sharingService.unpublishTrip(tripId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip', String(tripId)] });
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['community-trips'] });
    },
  });
}

export function useCopyTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (slug: string) => sharingService.copyPublicTrip(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });
}
