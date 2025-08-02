// API Profile type - what comes from the backend
export interface ApiProfile {
  _id: string;
  userId: string;
  telegramId: number;
  status: string;
  isDraft: boolean;
  name: string;
  description: string;
  languageCode: string; // Language code: 'en', 'ru', 'ka', or 'tr'
  // Support both nested and flat location formats
  location?: {
    country: string; // ISO 3166-1 alpha-2 code (e.g., "GE", "IL")
    city: string; // Normalized city value (e.g., "tbilisi", "jerusalem")
  };
  country?: string; // ISO 3166-1 alpha-2 code (flat format)
  city?: string; // Normalized city value (flat format)
  visibleForCountries: string[]; // Array of ISO 3166-1 alpha-2 codes
  clientCountries: string[]; // Legacy field - keeping for backward compatibility
  serviceType: string;
  servicesList: string[];
  photos: string[]; // URLs to uploaded photos (legacy field for backward compatibility)
  images: Array<{
    originalKey: string;
    blurredKey: string;
    uuid: string;
    isMain: boolean;
  }>; // New field for images with original and blurred versions
  contactInfo: {
    phoneCountryCode?: string;
    phoneNumber?: string;
    telegram?: string;
    exposeTelegram?: boolean;
    exposeWhatsApp?: boolean;
  };
  priceCurrency: string;
  pricingSlots: Array<{
    slot: string;
    incall?: number;
    outcall?: number;
  }>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

// API response for profiles list - just an array of profiles
export type ProfilesResponse = ApiProfile[];

// API error response
export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}

// Services API types
export interface ServiceOption {
  code: string;
  label: {
    en: string;
    ru: string;
  };
}

export interface ServiceCategory {
  label: {
    en: string;
    ru: string;
  };
  options: ServiceOption[];
  multiSelect?: boolean;
}

export interface ServicesResponse {
  [key: string]: ServiceCategory;
}

// Location API types for /telegram/profiles/locations
export interface LocationCity {
  normalized: string;
  names: Record<string, string>;
}

export interface LocationCountry {
  iso: string;
  names: Record<string, string>;
  forEscort: boolean;
  forClient: boolean;
  cities?: LocationCity[];
}

export interface LocationsResponse {
  countries: LocationCountry[];
}
