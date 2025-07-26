// API Profile type - what comes from the backend
export interface ApiProfile {
  id: string;
  telegramId: string;
  name: string;
  description: string;
  location: {
    country: string;
    city: string;
  };
  clientCountries: string[];
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
