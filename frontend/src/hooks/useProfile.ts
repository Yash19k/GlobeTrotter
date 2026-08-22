import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService, type UpdateProfilePayload } from '@/services/userService';
import { useAuthStore } from '@/stores/authStore';

export const USER_KEYS = {
  profile: ['user-profile'] as const,
};

export function useProfile() {
  const updateUser = useAuthStore((state) => state.updateUser);

  return useQuery({
    queryKey: USER_KEYS.profile,
    queryFn: async () => {
      const user = await userService.getCurrentUser();
      updateUser(user);
      return user;
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const updateUser = useAuthStore((state) => state.updateUser);

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => userService.updateProfile(payload),
    onSuccess: (updatedUser) => {
      updateUser(updatedUser);
      queryClient.setQueryData(USER_KEYS.profile, updatedUser);
      queryClient.invalidateQueries({ queryKey: USER_KEYS.profile });
    },
  });
}
