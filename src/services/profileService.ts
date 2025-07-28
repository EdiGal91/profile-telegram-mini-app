import { api } from "./api";
import { ProfilesResponse, ApiProfile } from "@/types/api";

const PROFILE_API_URL = "/telegram/profiles";

// Fetch profiles for a specific telegram user
export const fetchProfiles = async (
  telegramId: number
): Promise<ProfilesResponse> => {
  const response = await api.get<ProfilesResponse>(PROFILE_API_URL, {
    params: { telegramId },
  });
  return response.data;
};

// Create a new profile
export const createProfile = async (
  profile: Omit<ApiProfile, "id" | "createdAt" | "updatedAt">
): Promise<ApiProfile> => {
  const response = await api.post<ApiProfile>(PROFILE_API_URL, profile);
  return response.data;
};

// Create a draft profile (only telegramId and isDraft)
export const createDraftProfile = async (telegramId: number) => {
  const response = await api.post<ApiProfile>(PROFILE_API_URL, {
    telegramId,
  });
  return response.data;
};

// Update an existing profile
export const updateProfile = async (
  id: string,
  profile: Partial<ApiProfile>
): Promise<ApiProfile> => {
  const response = await api.put<ApiProfile>(
    `${PROFILE_API_URL}/${id}`,
    profile
  );
  return response.data;
};

// Update a profile using PATCH method
export const patchProfile = async (
  id: string,
  profile: Partial<ApiProfile>
): Promise<ApiProfile> => {
  const response = await api.patch<ApiProfile>(
    `${PROFILE_API_URL}/${id}`,
    profile
  );
  return response.data;
};

// Delete a profile
export const deleteProfile = async (id: string): Promise<void> => {
  await api.delete(`${PROFILE_API_URL}/${id}`);
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
    `${PROFILE_API_URL}/${profileId}/photos`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data.urls;
};

// Fetch available services for profiles
export const fetchServices = async () => {
  const response = await api.get(`${PROFILE_API_URL}/services`);
  return response.data;
};
