// Country names in different languages
export const COUNTRY_NAMES: Record<string, Record<string, string>> = {
  ru: {
    RU: "Россия",
    TR: "Турция",
    AM: "Армения",
    IL: "Израиль",
    AZ: "Азербайджан",
    KZ: "Казахстан",
    BY: "Беларусь",
    UA: "Украина",
    IN: "Индия",
    GE: "Грузия",
    MD: "Молдова",
    US: "США",
    DE: "Германия",
    PL: "Польша",
    GB: "Великобритания",
    FR: "Франция",
    GR: "Греция",
    IT: "Италия",
    NL: "Нидерланды",
    ES: "Испания",
    LT: "Литва",
    LV: "Латвия",
    EE: "Эстония",
    PT: "Португалия",
    IE: "Ирландия",
    CH: "Швейцария",
    SE: "Швеция",
  },
  en: {
    RU: "Russia",
    TR: "Turkey",
    AM: "Armenia",
    IL: "Israel",
    AZ: "Azerbaijan",
    KZ: "Kazakhstan",
    BY: "Belarus",
    UA: "Ukraine",
    IN: "India",
    GE: "Georgia",
    MD: "Moldova",
    US: "United States",
    DE: "Germany",
    PL: "Poland",
    GB: "United Kingdom",
    FR: "France",
    GR: "Greece",
    IT: "Italy",
    NL: "Netherlands",
    ES: "Spain",
    LT: "Lithuania",
    LV: "Latvia",
    EE: "Estonia",
    PT: "Portugal",
    IE: "Ireland",
    CH: "Switzerland",
    SE: "Sweden",
  },
  ka: {
    RU: "რუსეთი",
    TR: "თურქეთი",
    AM: "სომხეთი",
    IL: "ისრაელი",
    AZ: "აზერბაიჯანი",
    KZ: "ყაზახეთი",
    BY: "ბელარუსი",
    UA: "უკრაინა",
    IN: "ინდოეთი",
    GE: "საქართველო",
    MD: "მოლდოვა",
    US: "აშშ",
    DE: "გერმანია",
    PL: "პოლონეთი",
    GB: "გაერთიანებული სამეფო",
    FR: "საფრანგეთი",
    GR: "საბერძნეთი",
    IT: "იტალია",
    NL: "ნიდერლანდები",
    ES: "ესპანეთი",
    LT: "ლიტვა",
    LV: "ლატვია",
    EE: "ესტონეთი",
    PT: "პორტუგალია",
    IE: "ირლანდია",
    CH: "შვეიცარია",
    SE: "შვედეთი",
  },
  tr: {
    RU: "Rusya",
    TR: "Türkiye",
    AM: "Ermenistan",
    IL: "İsrail",
    AZ: "Azerbaycan",
    KZ: "Kazakistan",
    BY: "Belarus",
    UA: "Ukrayna",
    IN: "Hindistan",
    GE: "Gürcistan",
    MD: "Moldova",
    US: "Amerika Birleşik Devletleri",
    DE: "Almanya",
    PL: "Polonya",
    GB: "Birleşik Krallık",
    FR: "Fransa",
    GR: "Yunanistan",
    IT: "İtalya",
    NL: "Hollanda",
    ES: "İspanya",
    LT: "Litvanya",
    LV: "Letonya",
    EE: "Estonya",
    PT: "Portekiz",
    IE: "İrlanda",
    CH: "İsviçre",
    SE: "İsveç",
  },
  // Add more languages as needed
};

// Get current language (you can integrate with your i18n system)
export const getCurrentLanguage = (): string => {
  // For now, default to Russian, but you can detect from user preferences
  return "ru";
};

// Get localized "All countries" text
export const getAllCountriesText = (language: string): string => {
  const allCountriesText: Record<string, string> = {
    ru: "Все страны",
    en: "All countries",
    ka: "ყველა ქვეყანა",
    tr: "Tüm ülkeler",
  };
  return allCountriesText[language] || allCountriesText.en;
};

// Get all countries for a specific language
export const getCountriesForLanguage = (
  language?: string
): Array<{ iso: string; name: string }> => {
  const lang = language || getCurrentLanguage();
  const countryNames = COUNTRY_NAMES[lang] || {};

  return Object.entries(countryNames).map(([iso, name]) => ({
    iso,
    name,
  }));
};

// Get countries for escort location (limited selection)
export const getEscortLocationCountries = (
  language?: string
): Array<{ iso: string; name: string }> => {
  const allCountries = getCountriesForLanguage(language);
  const escortCountryIsos = ["GE", "RU", "TR", "UA"]; // ISO codes for escort countries

  return allCountries.filter((country) =>
    escortCountryIsos.includes(country.iso)
  );
};
