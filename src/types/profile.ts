export interface ProfileData {
  // Step 1: Basic Info
  name: string;
  description: string;
  languageCode: string; // Language code: 'en', 'ru', 'ka', or 'tr'

  // Step 2: Location
  location: {
    country: string; // ISO 3166-1 alpha-2 code (e.g., "GE", "IL")
    city: string; // Normalized city value (e.g., "tbilisi", "jerusalem")
  };
  clientCountries: string[]; // ISO 3166-1 alpha-2 codes
  visibleForCountries: string[]; // ISO 3166-1 alpha-2 codes for backend

  // Step 3: Services
  serviceType: string;
  servicesList: string[];

  // Step 4: Photos
  photos: string[];

  // Step 5: Contact
  contactInfo: {
    phoneCountryCode?: string;
    phoneNumber?: string;
    telegram?: string;
    email?: string;
    exposeTelegram?: boolean;
    exposeWhatsApp?: boolean;
  };

  // Step 6: Pricing
  pricing: {
    currency: string;
    rates: {
      [duration: string]: {
        incall?: number;
        outcall?: number;
      };
    };
  };
}

export interface ProfileState {
  data: Partial<ProfileData>;
  currentStep: number;
  completedSteps: Set<number>;
  isLoading: boolean;
}

// Mapping between country names and ISO 3166-1 alpha-2 codes
export const COUNTRY_TO_ISO: Record<string, string> = {
  Россия: "RU",
  Турция: "TR",
  Армения: "AM",
  Израиль: "IL",
  Азербайджан: "AZ",
  Казахстан: "KZ",
  Беларусь: "BY",
  Украина: "UA",
  Индия: "IN",
  Грузия: "GE",
  Молдова: "MD",
  США: "US",
  Германия: "DE",
  Польша: "PL",
  Великобритания: "GB",
  Франция: "FR",
  Греция: "GR",
  Италия: "IT",
  Нидерланды: "NL",
  Испания: "ES",
  Литва: "LT",
  Латвия: "LV",
  Эстония: "EE",
  Португалия: "PT",
  Ирландия: "IE",
  Швейцария: "CH",
  Швеция: "SE",
  Киргизия: "KG",
  Таджикистан: "TJ",
  Узбекистан: "UZ",
  Туркменистан: "TM",
};

// Reverse mapping from ISO codes to country names
export const ISO_TO_COUNTRY: Record<string, string> = Object.fromEntries(
  Object.entries(COUNTRY_TO_ISO).map(([country, iso]) => [iso, country])
);

export const PROFILE_STEPS = [
  { id: 1, title: "Основная информация", description: "Имя и описание" },
  {
    id: 2,
    title: "Местоположение",
    description: "Ваше местоположение и клиенты",
  },
  { id: 3, title: "Услуги", description: "Тип и список услуг" },
  { id: 4, title: "Фотографии", description: "Загрузите ваши фото" },
  { id: 5, title: "Контакты", description: "Способы связи" },
  { id: 6, title: "Цены", description: "Стоимость услуг" },
  { id: 7, title: "Подтверждение", description: "Проверьте данные анкеты" },
] as const;
