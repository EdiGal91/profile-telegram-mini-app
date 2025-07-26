import { createContext, useContext, ReactNode } from "react";
import { UseQueryResult } from "@tanstack/react-query";
import { useProfiles, useTelegramId } from "@/hooks/useProfiles";
import { ProfilesResponse } from "@/types/api";

// Context type
interface ProfilesContextType {
  profiles: UseQueryResult<ProfilesResponse, Error>;
  telegramId: number | undefined;
}

// Create context
const ProfilesContext = createContext<ProfilesContextType | undefined>(
  undefined
);

// Provider component
interface ProfilesProviderProps {
  children: ReactNode;
}

export function ProfilesProvider({ children }: ProfilesProviderProps) {
  const telegramId = useTelegramId();
  const profiles = useProfiles();

  return (
    <ProfilesContext.Provider value={{ profiles, telegramId }}>
      {children}
    </ProfilesContext.Provider>
  );
}

// Hook to use the context
export function useProfilesContext() {
  const context = useContext(ProfilesContext);
  if (context === undefined) {
    throw new Error(
      "useProfilesContext must be used within a ProfilesProvider"
    );
  }
  return context;
}
