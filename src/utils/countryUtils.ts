import { COUNTRY_TO_ISO, ISO_TO_COUNTRY } from "@/types/profile";

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
  // Add more languages as needed
};

// Get current language (you can integrate with your i18n system)
export const getCurrentLanguage = (): string => {
  // For now, default to Russian, but you can detect from user preferences
  return "ru";
};

// Get country name in current language
export const getCountryName = (isoCode: string, language?: string): string => {
  const lang = language || getCurrentLanguage();
  return COUNTRY_NAMES[lang]?.[isoCode] || isoCode;
};

// Get country name in specific language
export const getCountryNameInLanguage = (
  isoCode: string,
  language: string
): string => {
  return COUNTRY_NAMES[language]?.[isoCode] || isoCode;
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

// Convert ISO codes to country names
export const convertIsoToCountryNames = (
  isoCodes: string[],
  language?: string
): string[] => {
  return isoCodes.map((iso) => getCountryName(iso, language));
};

// Convert country names to ISO codes (for backward compatibility)
export const convertCountryNamesToIso = (countryNames: string[]): string[] => {
  return countryNames.map((country) => COUNTRY_TO_ISO[country]).filter(Boolean);
};

// Test function to validate the new system
export const validateCountryMappings = () => {
  console.log("Testing new country system...");

  // Test the specific case from the user's request
  const userCountryIso = "GE";
  const userCity = "Тbilisi";
  const visibleCountriesIso = ["IL", "PT"];

  console.log("\nUser's specific case (new system):");
  console.log(
    `Country ISO: ${userCountryIso} -> ${getCountryName(userCountryIso)}`
  );
  console.log(`City: ${userCity}`);
  console.log(
    `Visible for countries: ${visibleCountriesIso
      .map((iso) => `${iso} (${getCountryName(iso)})`)
      .join(", ")}`
  );

  const expectedPayload = {
    country: userCountryIso,
    city: userCity,
    visibleForCountries: visibleCountriesIso,
  };

  console.log("Expected backend payload:", expectedPayload);

  // Test multiple languages
  console.log("\nTesting multiple languages:");
  console.log(`GE in Russian: ${getCountryNameInLanguage("GE", "ru")}`);
  console.log(`GE in English: ${getCountryNameInLanguage("GE", "en")}`);
  console.log(`IL in Russian: ${getCountryNameInLanguage("IL", "ru")}`);
  console.log(`IL in English: ${getCountryNameInLanguage("IL", "en")}`);
};
