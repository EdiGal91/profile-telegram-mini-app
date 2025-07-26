import { api } from "./api";
import { ProfilesResponse, ApiProfile } from "@/types/api";

// Fetch profiles for a specific telegram user
export const fetchProfiles = async (
  telegramId: number
): Promise<ProfilesResponse> => {
  const response = await api.get<ProfilesResponse>("/profiles", {
    params: { telegramId },
  });
  return response.data;
};

// Create a new profile
export const createProfile = async (
  profile: Omit<ApiProfile, "id" | "createdAt" | "updatedAt">
): Promise<ApiProfile> => {
  const response = await api.post<ApiProfile>("/profiles", profile);
  return response.data;
};

// Create a draft profile (only telegramId and isDraft)
export const createDraftProfile = async (telegramId: number) => {
  const response = await api.post<ApiProfile>("/profiles", {
    telegramId,
  });
  return response.data;
};

// Update an existing profile
export const updateProfile = async (
  id: string,
  profile: Partial<ApiProfile>
): Promise<ApiProfile> => {
  const response = await api.put<ApiProfile>(`/profiles/${id}`, profile);
  return response.data;
};

// Delete a profile
export const deleteProfile = async (id: string): Promise<void> => {
  await api.delete(`/profiles/${id}`);
};

// Upload photos for a profile
export const uploadProfilePhotos = async (
  profileId: string,
  photos: File[]
): Promise<string[]> => {
  const formData = new FormData();
  photos.forEach((photo) => {
    formData.append(`photos`, photo);
  });

  const response = await api.post<{ urls: string[] }>(
    `/profiles/${profileId}/photos`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data.urls;
};
