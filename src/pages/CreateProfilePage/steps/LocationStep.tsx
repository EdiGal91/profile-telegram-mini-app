import { useState, useEffect } from "react";
import {
  Section,
  Select,
  Button,
  List,
  Cell,
  Checkbox,
} from "@telegram-apps/telegram-ui";
import { useSignal, initData } from "@telegram-apps/sdk-react";
import { useProfile } from "@/context/ProfileContext";
import { useProfilesContext } from "@/context/ProfilesContext";
import { usePatchProfile } from "@/hooks/useProfiles";
import {
  getCountriesForLanguage,
  getEscortLocationCountries,
  validateCountryMappings,
} from "@/utils/countryUtils";
import { getCitiesForCountry } from "@/utils/cityUtils";

const ALL_COUNTRIES_CODE = "ALL";

export function LocationStep() {
  const { state, updateData, completeStep, setStep } = useProfile();
  const { profiles } = useProfilesContext();
  const patchProfile = usePatchProfile();

  const [userCountryIso, setUserCountryIso] = useState(
    state.data.location?.country || ""
  );
  const [userCity, setUserCity] = useState(state.data.location?.city || "");

  const [clientCountriesIso, setClientCountriesIso] = useState<string[]>(
    state.data.clientCountries || []
  );

  const initDataState = useSignal(initData.state);
  const draftProfile = profiles.data?.find((profile) => profile.isDraft);

  // Debug mappings in dev
  useEffect(() => {
    if (import.meta.env.DEV) validateCountryMappings();
  }, []);

  // Sync draft data
  useEffect(() => {
    if (!draftProfile) return;

    const countryFromBackend =
      draftProfile.location?.country || draftProfile.country;
    const cityFromBackend = draftProfile.location?.city || draftProfile.city;
    const countriesFromBackend =
      draftProfile.visibleForCountries || draftProfile.clientCountries || [];

    // Always sync with backend data, not just when local state is empty
    if (countryFromBackend && countryFromBackend !== userCountryIso) {
      setUserCountryIso(countryFromBackend);
    }
    if (cityFromBackend && cityFromBackend !== userCity) {
      setUserCity(cityFromBackend);
    }
    if (
      countriesFromBackend.length > 0 &&
      JSON.stringify(countriesFromBackend) !==
        JSON.stringify(clientCountriesIso)
    ) {
      setClientCountriesIso(countriesFromBackend);
    }
  }, [draftProfile]);

  // Sync context state
  useEffect(() => {
    if (!draftProfile) return;

    const updates: any = {};
    if (
      draftProfile.location?.country &&
      draftProfile.location.country !== state.data.location?.country
    ) {
      updates.location = {
        country: draftProfile.location.country,
        city:
          state.data.location?.city ||
          draftProfile.location.city ||
          state.data.location?.city ||
          "",
      };
    }
    if (
      draftProfile.location?.city &&
      draftProfile.location.city !== state.data.location?.city
    ) {
      updates.location = {
        country:
          state.data.location?.country || draftProfile.location.country || "",
        city: draftProfile.location.city,
      };
    }
    const countriesFromBackend =
      draftProfile.visibleForCountries || draftProfile.clientCountries || [];
    if (
      countriesFromBackend.length &&
      JSON.stringify(countriesFromBackend) !==
        JSON.stringify(state.data.clientCountries)
    ) {
      updates.clientCountries = countriesFromBackend;
    }

    if (Object.keys(updates).length) updateData(updates);
  }, [draftProfile, state.data]);

  // Auto detect country from Telegram
  useEffect(() => {
    if (userCountryIso || !initDataState?.user) return;
    const languageToCountryIso: Record<string, string> = {
      ru: "RU",
      uk: "UA",
      ka: "GE",
      tr: "TR",
    };
    const detected = initDataState?.user?.language_code
      ? languageToCountryIso[initDataState.user.language_code]
      : undefined;
    if (detected) setUserCountryIso(detected);
  }, [initDataState, userCountryIso]);

  const isValid =
    userCountryIso.length > 0 &&
    userCity.length > 0 &&
    clientCountriesIso.length > 0;

  // Handlers
  const handleCountryChange = (countryIso: string) => {
    setUserCountryIso(countryIso);
    setUserCity("");
  };

  const handleClientCountryToggle = (iso: string) => {
    if (iso === ALL_COUNTRIES_CODE) {
      setClientCountriesIso((prev) =>
        prev.includes(ALL_COUNTRIES_CODE) ? [] : [ALL_COUNTRIES_CODE]
      );
    } else {
      setClientCountriesIso((prev) => {
        const updated = prev.includes(iso)
          ? prev.filter((c) => c !== iso)
          : [...prev, iso];
        return updated.filter((c) => c !== ALL_COUNTRIES_CODE);
      });
    }
  };

  const handleSaveAndGo = async (nextStep: number) => {
    if (!isValid || !draftProfile) return;

    updateData({
      location: { country: userCountryIso, city: userCity },
      clientCountries: clientCountriesIso,
    });

    try {
      await patchProfile.mutateAsync({
        id: draftProfile._id,
        profile: {
          country: userCountryIso,
          city: userCity,
          visibleForCountries: clientCountriesIso,
        },
      });
    } catch (error) {
      console.error("Failed to save location data:", error);
    }

    completeStep(2);
    setStep(nextStep);
  };

  const escortCountries = getEscortLocationCountries();
  const allCountries = [
    { iso: ALL_COUNTRIES_CODE, name: "Все страны" },
    ...getCountriesForLanguage(),
  ];
  const availableCities = userCountryIso
    ? getCitiesForCountry(userCountryIso)
    : [];

  const isAllSelected = clientCountriesIso.includes(ALL_COUNTRIES_CODE);

  return (
    <List>
      <Section header="Ваше местоположение">
        <Select
          header="Ваша страна"
          value={userCountryIso}
          onChange={(e) => handleCountryChange(e.target.value)}
        >
          <option value="" disabled>
            Выберите страну
          </option>
          {escortCountries.map((country) => (
            <option key={country.iso} value={country.iso}>
              {country.name}
            </option>
          ))}
        </Select>

        {userCountryIso && (
          <Select
            header="Ваш город"
            value={userCity}
            onChange={(e) => setUserCity(e.target.value)}
          >
            <option value="" disabled>
              Выберите город
            </option>
            {availableCities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </Select>
        )}
      </Section>

      <Section header="Пользователям из каких стран отображать Вашу анкету?">
        {allCountries.map((country) => (
          <Cell
            key={country.iso}
            onClick={() => handleClientCountryToggle(country.iso)}
            after={
              <Checkbox
                checked={clientCountriesIso.includes(country.iso)}
                disabled={isAllSelected && country.iso !== ALL_COUNTRIES_CODE}
                onChange={() => handleClientCountryToggle(country.iso)}
              />
            }
            interactiveAnimation="opacity"
          >
            {country.name}
          </Cell>
        ))}
      </Section>

      <Section>
        <div style={{ padding: "16px", display: "flex", gap: "12px" }}>
          <Button
            size="l"
            mode="outline"
            stretched
            onClick={() => handleSaveAndGo(1)}
          >
            Назад
          </Button>
          <Button
            size="l"
            stretched
            disabled={!isValid}
            onClick={() => handleSaveAndGo(3)}
          >
            Далее: Услуги
          </Button>
        </div>
      </Section>
    </List>
  );
}
