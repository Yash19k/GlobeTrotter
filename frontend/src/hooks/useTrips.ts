import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tripService, type CreateTripPayload, type UpdateTripPayload } from '@/services/tripService';

export const TRIP_KEYS = {
  all: ['trips'] as const,
  detail: (id: number | string) => ['trip', id] as const,
};

/**
 * Hook to fetch all user trips.
 */
export function useTrips() {
  return useQuery({
    queryKey: TRIP_KEYS.all,
    queryFn: () => tripService.getTrips(),
  });
}

/**
 * Hook to fetch single trip detail by ID.
 */
export function useTrip(id: number | string | undefined) {
  return useQuery({
    queryKey: TRIP_KEYS.detail(id!),
    queryFn: () => tripService.getTrip(id!),
    enabled: !!id,
  });
}

/**
 * Hook to create a trip.
 */
export function useCreateTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTripPayload) => tripService.createTrip(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRIP_KEYS.all });
    },
  });
}

/**
 * Hook to update an existing trip.
 */
export function useUpdateTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: UpdateTripPayload }) =>
      tripService.updateTrip(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: TRIP_KEYS.all });
      queryClient.invalidateQueries({ queryKey: TRIP_KEYS.detail(id) });
    },
  });
}

/**
 * Hook to delete a trip.
 */
export function useDeleteTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => tripService.deleteTrip(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRIP_KEYS.all });
    },
  });
}
