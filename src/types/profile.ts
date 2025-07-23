export interface ProfileData {
  // Step 1: Basic Info
  name: string;
  description: string;

  // Step 2: Location
  country: string;
  countriesServed: string[];

  // Step 3: Services
  serviceType: string;
  servicesList: string[];

  // Step 4: Photos
  photos: string[];

  // Step 5: Contact
  contactInfo: {
    phone?: string;
    telegram?: string;
    email?: string;
  };

  // Step 6: Pricing
  pricing: {
    incall: number;
    outcall: number;
    currency: string;
  };
}

export interface ProfileState {
  data: Partial<ProfileData>;
  currentStep: number;
  completedSteps: Set<number>;
  isLoading: boolean;
}

export const PROFILE_STEPS = [
  { id: 1, title: "Основная информация", description: "Имя и описание" },
  {
    id: 2,
    title: "Местоположение",
    description: "Страна и регионы обслуживания",
  },
  { id: 3, title: "Услуги", description: "Тип и список услуг" },
  { id: 4, title: "Фотографии", description: "Загрузите ваши фото" },
  { id: 5, title: "Контакты", description: "Способы связи" },
  { id: 6, title: "Цены", description: "Стоимость услуг" },
] as const;
