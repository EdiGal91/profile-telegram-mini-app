import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSignal, initData } from "@telegram-apps/sdk-react";
import {
  fetchProfiles,
  createProfile,
  createDraftProfile,
  updateProfile,
  patchProfile,
  deleteProfile,
  uploadProfilePhotos,
  setImageAsMain,
  fetchServices,
} from "@/services/profileService";
import { ApiProfile } from "@/types/api";

// Query keys
export const profileKeys = {
  all: ["profiles"] as const,
  byTelegramId: (telegramId: number) =>
    [...profileKeys.all, "byTelegramId", telegramId] as const,
};

export const serviceKeys = {
  all: ["services"] as const,
};

// Custom hook to get current telegram ID
export const useTelegramId = () => {
  const initDataState = useSignal(initData.state);
  return initDataState?.user?.id;
};

// Hook to fetch user's profiles
export const useProfiles = () => {
  const telegramId = useTelegramId();

  return useQuery({
    queryKey: profileKeys.byTelegramId(telegramId || 0),
    queryFn: () => {
      if (!telegramId) {
        throw new Error("Telegram ID is required");
      }
      return fetchProfiles(telegramId);
    },
    enabled: !!telegramId, // Only run if we have a telegram ID
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    gcTime: 1000 * 60 * 30, // Keep in cache for 30 minutes (was cacheTime in v4)
  });
};

// Hook to create a draft profile
export const useCreateDraftProfile = () => {
  const queryClient = useQueryClient();
  const telegramId = useTelegramId();

  return useMutation({
    mutationFn: () => {
      if (!telegramId) {
        throw new Error("Telegram ID is required");
      }
      return createDraftProfile(telegramId);
    },
    onSuccess: () => {
      if (telegramId) {
        queryClient.invalidateQueries({
          queryKey: profileKeys.byTelegramId(telegramId),
        });
      }
    },
  });
};

// Hook to create a new profile
export const useCreateProfile = () => {
  const queryClient = useQueryClient();
  const telegramId = useTelegramId();

  return useMutation({
    mutationFn: createProfile,
    onSuccess: () => {
      if (telegramId) {
        // Invalidate and refetch profiles
        queryClient.invalidateQueries({
          queryKey: profileKeys.byTelegramId(telegramId),
        });
      }
    },
  });
};

// Hook to update a profile
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const telegramId = useTelegramId();

  return useMutation({
    mutationFn: ({
      id,
      profile,
    }: {
      id: string;
      profile: Partial<ApiProfile>;
    }) => updateProfile(id, profile),
    onSuccess: () => {
      if (telegramId) {
        queryClient.invalidateQueries({
          queryKey: profileKeys.byTelegramId(telegramId),
        });
      }
    },
  });
};

// Hook to patch a profile
export const usePatchProfile = () => {
  const queryClient = useQueryClient();
  const telegramId = useTelegramId();

  return useMutation({
    mutationFn: ({
      id,
      profile,
    }: {
      id: string;
      profile: Partial<ApiProfile>;
    }) => patchProfile(id, profile),
    onSuccess: () => {
      if (telegramId) {
        queryClient.invalidateQueries({
          queryKey: profileKeys.byTelegramId(telegramId),
        });
      }
    },
  });
};

// Hook to delete a profile
export const useDeleteProfile = () => {
  const queryClient = useQueryClient();
  const telegramId = useTelegramId();

  return useMutation({
    mutationFn: deleteProfile,
    onSuccess: () => {
      if (telegramId) {
        queryClient.invalidateQueries({
          queryKey: profileKeys.byTelegramId(telegramId),
        });
      }
    },
  });
};

// Hook to upload photos
export const useUploadPhotos = () => {
  const queryClient = useQueryClient();
  const telegramId = useTelegramId();

  return useMutation({
    mutationFn: ({
      profileId,
      photos,
    }: {
      profileId: string;
      photos: File[];
    }) => uploadProfilePhotos(profileId, photos),
    onSuccess: (uploadedImageKeys: string[], variables) => {
      if (telegramId) {
        // Just invalidate the query to get fresh data with signed URLs
        queryClient.invalidateQueries({
          queryKey: profileKeys.byTelegramId(telegramId),
        });
      }
    },
  });
};

// Hook to set image as main
export const useSetImageAsMain = () => {
  const queryClient = useQueryClient();
  const telegramId = useTelegramId();

  return useMutation({
    mutationFn: ({
      profileId,
      imageUuid,
    }: {
      profileId: string;
      imageUuid: string;
    }) => setImageAsMain(profileId, imageUuid),
    onSuccess: () => {
      if (telegramId) {
        // Invalidate the query to get fresh data from server
        queryClient.invalidateQueries({
          queryKey: profileKeys.byTelegramId(telegramId),
        });
      }
    },
  });
};

// Hook to fetch services
export const useServices = () => {
  return useQuery({
    queryKey: serviceKeys.all,
    queryFn: fetchServices,
    staleTime: 1000 * 60 * 30, // Consider data fresh for 30 minutes
    gcTime: 1000 * 60 * 60, // Keep in cache for 1 hour
  });
};
