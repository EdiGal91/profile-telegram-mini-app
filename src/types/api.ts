// API Profile type - what comes from the backend
export interface ApiProfile {
  _id: string;
  telegramId: string;
  name: string;
  description: string;
  // Support both nested and flat location formats
  location?: {
    country: string; // ISO 3166-1 alpha-2 code (e.g., "GE", "IL")
    city: string;
  };
  country?: string; // ISO 3166-1 alpha-2 code (flat format)
  city?: string; // Flat format
  visibleForCountries: string[]; // Array of ISO 3166-1 alpha-2 codes
  clientCountries: string[]; // Legacy field - keeping for backward compatibility
  serviceType: string;
  servicesList: string[];
  photos: string[]; // URLs to uploaded photos
  contactInfo: {
    phone?: string;
    telegram?: string;
    exposeTelegram?: boolean;
    exposeWhatsApp?: boolean;
  };
  pricing: {
    incall?: string;
    outcall?: string;
  };
  isActive: boolean;
  isDraft: boolean; // Indicates if this is a draft profile
  createdAt: string;
  updatedAt: string;
}

// API response for profiles list - just an array of profiles
export type ProfilesResponse = ApiProfile[];

// API error response
export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}
