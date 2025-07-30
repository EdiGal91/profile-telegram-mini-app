// City data structure with normalized values and multiple language support
interface CityData {
  normalized: string; // Normalized value like "tbilisi", "jerusalem", etc.
  names: {
    en: string; // English name
    ru: string; // Russian name
    ka?: string; // Georgian name (optional)
    tr?: string; // Turkish name (optional)
  };
}

// Cities by country ISO code with normalized values and multi-language support
export const CITIES_BY_COUNTRY_ISO: Record<string, CityData[]> = {
  RU: [
    {
      normalized: "moscow",
      names: { en: "Moscow", ru: "Москва" },
    },
    {
      normalized: "saint-petersburg",
      names: { en: "Saint Petersburg", ru: "Санкт-Петербург" },
    },
    {
      normalized: "yekaterinburg",
      names: { en: "Yekaterinburg", ru: "Екатеринбург" },
    },
    {
      normalized: "novosibirsk",
      names: { en: "Novosibirsk", ru: "Новосибирск" },
    },
    {
      normalized: "kazan",
      names: { en: "Kazan", ru: "Казань" },
    },
    {
      normalized: "nizhny-novgorod",
      names: { en: "Nizhny Novgorod", ru: "Нижний Новгород" },
    },
    {
      normalized: "chelyabinsk",
      names: { en: "Chelyabinsk", ru: "Челябинск" },
    },
    {
      normalized: "samara",
      names: { en: "Samara", ru: "Самара" },
    },
    {
      normalized: "rostov-on-don",
      names: { en: "Rostov-on-Don", ru: "Ростов-на-Дону" },
    },
    {
      normalized: "ufa",
      names: { en: "Ufa", ru: "Уфа" },
    },
    {
      normalized: "krasnoyarsk",
      names: { en: "Krasnoyarsk", ru: "Красноярск" },
    },
    {
      normalized: "voronezh",
      names: { en: "Voronezh", ru: "Воронеж" },
    },
    {
      normalized: "perm",
      names: { en: "Perm", ru: "Пермь" },
    },
    {
      normalized: "volgograd",
      names: { en: "Volgograd", ru: "Волгоград" },
    },
  ],
  TR: [
    {
      normalized: "istanbul",
      names: { en: "Istanbul", ru: "Стамбул", tr: "İstanbul" },
    },
    {
      normalized: "ankara",
      names: { en: "Ankara", ru: "Анкара", tr: "Ankara" },
    },
    {
      normalized: "izmir",
      names: { en: "Izmir", ru: "Измир", tr: "İzmir" },
    },
    {
      normalized: "bursa",
      names: { en: "Bursa", ru: "Бурса", tr: "Bursa" },
    },
    {
      normalized: "antalya",
      names: { en: "Antalya", ru: "Анталья", tr: "Antalya" },
    },
    {
      normalized: "adana",
      names: { en: "Adana", ru: "Адана", tr: "Adana" },
    },
    {
      normalized: "gaziantep",
      names: { en: "Gaziantep", ru: "Газиантеп", tr: "Gaziantep" },
    },
    {
      normalized: "konya",
      names: { en: "Konya", ru: "Конья", tr: "Konya" },
    },
    {
      normalized: "mersin",
      names: { en: "Mersin", ru: "Мерсин", tr: "Mersin" },
    },
    {
      normalized: "kayseri",
      names: { en: "Kayseri", ru: "Кайсери", tr: "Kayseri" },
    },
  ],
  GE: [
    {
      normalized: "tbilisi",
      names: { en: "Tbilisi", ru: "Тбилиси", ka: "თბილისი" },
    },
    {
      normalized: "kutaisi",
      names: { en: "Kutaisi", ru: "Кутаиси", ka: "ქუთაისი" },
    },
    {
      normalized: "batumi",
      names: { en: "Batumi", ru: "Батуми", ka: "ბათუმი" },
    },
    {
      normalized: "rustavi",
      names: { en: "Rustavi", ru: "Рустави", ka: "რუსთავი" },
    },
    {
      normalized: "zugdidi",
      names: { en: "Zugdidi", ru: "Зугдиди", ka: "ზუგდიდი" },
    },
    {
      normalized: "gori",
      names: { en: "Gori", ru: "Гори", ka: "გორი" },
    },
    {
      normalized: "poti",
      names: { en: "Poti", ru: "Поти", ka: "ფოთი" },
    },
    {
      normalized: "sukhumi",
      names: { en: "Sukhumi", ru: "Сухуми", ka: "სოხუმი" },
    },
  ],
  UA: [
    {
      normalized: "kyiv",
      names: { en: "Kyiv", ru: "Киев" },
    },
    {
      normalized: "kharkiv",
      names: { en: "Kharkiv", ru: "Харьков" },
    },
    {
      normalized: "odesa",
      names: { en: "Odesa", ru: "Одесса" },
    },
    {
      normalized: "dnipro",
      names: { en: "Dnipro", ru: "Днепр" },
    },
    {
      normalized: "donetsk",
      names: { en: "Donetsk", ru: "Донецк" },
    },
    {
      normalized: "zaporizhzhia",
      names: { en: "Zaporizhzhia", ru: "Запорожье" },
    },
    {
      normalized: "lviv",
      names: { en: "Lviv", ru: "Львов" },
    },
    {
      normalized: "kryvyi-rih",
      names: { en: "Kryvyi Rih", ru: "Кривой Рог" },
    },
  ],
};

// Get cities for a specific country by ISO code
export const getCitiesForCountry = (countryIso: string): CityData[] => {
  return CITIES_BY_COUNTRY_ISO[countryIso] || [];
};

// Get city names for a specific language
export const getCityNamesForLanguage = (
  countryIso: string,
  languageCode: string
): string[] => {
  console.log("countryIso", countryIso);
  console.log("languageCode", languageCode);
  const cities = getCitiesForCountry(countryIso);
  return cities.map(
    (city) =>
      city.names[languageCode as keyof typeof city.names] || city.names.en
  );
};

// Get normalized value for a city by its display name and language
export const getNormalizedCityValue = (
  countryIso: string,
  cityDisplayName: string,
  languageCode: string
): string => {
  const cities = getCitiesForCountry(countryIso);
  const city = cities.find(
    (city) =>
      city.names[languageCode as keyof typeof city.names] === cityDisplayName
  );
  return city?.normalized || cityDisplayName.toLowerCase().replace(/\s+/g, "-");
};

// Get display name for a normalized city value
export const getCityDisplayName = (
  countryIso: string,
  normalizedValue: string,
  languageCode: string
): string => {
  const cities = getCitiesForCountry(countryIso);
  const city = cities.find((city) => city.normalized === normalizedValue);
  return (
    city?.names[languageCode as keyof typeof city.names] ||
    city?.names.en ||
    normalizedValue
  );
};
