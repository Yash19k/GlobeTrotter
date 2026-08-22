import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  itineraryService,
  type AddStopPayload,
  type UpdateStopPayload,
  type AddActivityPayload,
  type UpdateActivityPayload,
} from '@/services/itineraryService';

export const ITINERARY_KEYS = {
  detail: (tripId: number | string) => ['itinerary', String(tripId)] as const,
};

export function useItinerary(tripId: number | string | undefined) {
  return useQuery({
    queryKey: ITINERARY_KEYS.detail(tripId!),
    queryFn: () => itineraryService.getItinerary(tripId!),
    enabled: !!tripId,
  });
}

export function useAddStop(tripId: number | string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AddStopPayload) => itineraryService.addStop(tripId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ITINERARY_KEYS.detail(tripId) });
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });
}

export function useUpdateStop(tripId: number | string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ stopId, payload }: { stopId: number | string; payload: UpdateStopPayload }) =>
      itineraryService.updateStop(stopId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ITINERARY_KEYS.detail(tripId) });
    },
  });
}

export function useDeleteStop(tripId: number | string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (stopId: number | string) => itineraryService.deleteStop(stopId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ITINERARY_KEYS.detail(tripId) });
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });
}

export function useReorderStops(tripId: number | string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (stopIds: number[]) => itineraryService.reorderStops(tripId, stopIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ITINERARY_KEYS.detail(tripId) });
    },
  });
}

export function useAddActivity(tripId: number | string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ stopId, payload }: { stopId: number | string; payload: AddActivityPayload }) =>
      itineraryService.addActivity(stopId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ITINERARY_KEYS.detail(tripId) });
    },
  });
}

export function useUpdateActivity(tripId: number | string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ activityId, payload }: { activityId: number | string; payload: UpdateActivityPayload }) =>
      itineraryService.updateActivity(activityId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ITINERARY_KEYS.detail(tripId) });
    },
  });
}

export function useDeleteActivity(tripId: number | string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (activityId: number | string) => itineraryService.deleteActivity(activityId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ITINERARY_KEYS.detail(tripId) });
    },
  });
}

export function useReorderActivities(tripId: number | string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ stopId, activityIds }: { stopId: number | string; activityIds: number[] }) =>
      itineraryService.reorderActivities(stopId, activityIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ITINERARY_KEYS.detail(tripId) });
    },
  });
}
