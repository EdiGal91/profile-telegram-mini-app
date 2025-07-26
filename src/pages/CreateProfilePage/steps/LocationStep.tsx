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
import { patchProfile } from "@/services/profileService";
import {
  getCountryName,
  getCountriesForLanguage,
  getEscortLocationCountries,
  validateCountryMappings,
} from "@/utils/countryUtils";
import { getCitiesForCountry } from "@/utils/cityUtils";

export function LocationStep() {
  const { state, updateData, completeStep, setStep } = useProfile();
  const { profiles } = useProfilesContext();

  // Her location (country + city) - using ISO codes
  const [userCountryIso, setUserCountryIso] = useState(
    state.data.location?.country || ""
  );
  const [userCity, setUserCity] = useState(state.data.location?.city || "");

  // Countries where she serves clients - using ISO codes
  const [clientCountriesIso, setClientCountriesIso] = useState<string[]>(
    state.data.clientCountries || []
  );

  const initDataState = useSignal(initData.state);

  // Get the current draft profile
  const draftProfile = profiles.data?.find((profile) => profile.isDraft);

  // Test country mappings in development
  useEffect(() => {
    if (import.meta.env.DEV) {
      validateCountryMappings();
    }
  }, []);

  // Sync local state with draft profile data when it becomes available
  useEffect(() => {
    if (draftProfile) {
      // Sync location data - use ISO codes directly
      const countryFromBackend =
        draftProfile.location?.country || draftProfile.country;
      const cityFromBackend = draftProfile.location?.city || draftProfile.city;

      if (countryFromBackend && !userCountryIso) {
        setUserCountryIso(countryFromBackend);
      }
      if (cityFromBackend && !userCity) {
        setUserCity(cityFromBackend);
      }
      // Sync client countries data - use ISO codes directly
      if (
        (draftProfile.visibleForCountries?.length ||
          draftProfile.clientCountries?.length) &&
        clientCountriesIso.length === 0
      ) {
        const countriesToUse =
          draftProfile.visibleForCountries ||
          draftProfile.clientCountries ||
          [];
        setClientCountriesIso(countriesToUse);
      }
    }
  }, [draftProfile, userCountryIso, userCity, clientCountriesIso]);

  // Sync ProfileContext state with draft profile data
  useEffect(() => {
    if (draftProfile) {
      const updates: Partial<{
        location: { country: string; city: string };
        clientCountries: string[];
      }> = {};

      const countryFromBackend =
        draftProfile.location?.country || draftProfile.country;
      const cityFromBackend = draftProfile.location?.city || draftProfile.city;

      if (
        countryFromBackend &&
        countryFromBackend !== state.data.location?.country
      ) {
        updates.location = {
          country: countryFromBackend,
          city: state.data.location?.city || cityFromBackend || "",
        };
      }
      if (cityFromBackend && cityFromBackend !== state.data.location?.city) {
        updates.location = {
          country: state.data.location?.country || countryFromBackend || "",
          city: cityFromBackend,
        };
      }
      if (
        (draftProfile.visibleForCountries?.length ||
          draftProfile.clientCountries?.length) &&
        JSON.stringify(draftProfile.clientCountries) !==
          JSON.stringify(state.data.clientCountries)
      ) {
        const countriesToUse =
          draftProfile.visibleForCountries ||
          draftProfile.clientCountries ||
          [];
        updates.clientCountries = countriesToUse;
      }

      if (Object.keys(updates).length > 0) {
        updateData(updates);
      }
    }
  }, [
    draftProfile,
    state.data.location,
    state.data.clientCountries,
    updateData,
  ]);

  const isValid =
    userCountryIso.length > 0 &&
    userCity.length > 0 &&
    clientCountriesIso.length > 0;

  const handleClientCountryToggle = (selectedCountryIso: string) => {
    setClientCountriesIso((prev) =>
      prev.includes(selectedCountryIso)
        ? prev.filter((c) => c !== selectedCountryIso)
        : [...prev, selectedCountryIso]
    );
  };

  const handleCountryChange = (countryIso: string) => {
    setUserCountryIso(countryIso);
    // Reset city when country changes
    setUserCity("");
  };

  const handleNext = async () => {
    if (isValid && draftProfile) {
      // Validate that we have valid ISO codes
      if (!userCountryIso) {
        console.error("Invalid country selected:", userCountryIso);
        return;
      }

      if (clientCountriesIso.length === 0) {
        console.error("No valid countries selected for visibility");
        return;
      }

      // Update local state
      updateData({
        location: { country: userCountryIso, city: userCity },
        clientCountries: clientCountriesIso,
      });

      try {
        // Send data to backend
        await patchProfile(draftProfile._id, {
          country: userCountryIso,
          city: userCity,
          visibleForCountries: clientCountriesIso,
        });

        completeStep(2);
        setStep(3);
      } catch (error) {
        console.error("Failed to save location data:", error);
        // Still proceed to next step even if backend save fails
        completeStep(2);
        setStep(3);
      }
    }
  };

  const handlePrevious = async () => {
    if (draftProfile) {
      // Update local state
      updateData({
        location: { country: userCountryIso, city: userCity },
        clientCountries: clientCountriesIso,
      });

      try {
        // Send data to backend
        await patchProfile(draftProfile._id, {
          country: userCountryIso,
          city: userCity,
          visibleForCountries: clientCountriesIso,
        });
      } catch (error) {
        console.error("Failed to save location data:", error);
      }
    }
    setStep(1);
  };

  // Removed auto-save useEffect - now only saves when user clicks Continue/Save

  // Auto-detect country from Telegram user data
  useEffect(() => {
    if (!userCountryIso && initDataState?.user) {
      const languageToCountryIso: Record<string, string> = {
        ru: "RU",
        uk: "UA",
        ka: "GE",
        tr: "TR",
      };

      const detectedCountryIso = initDataState.user.language_code
        ? languageToCountryIso[initDataState.user.language_code]
        : null;

      if (detectedCountryIso) {
        setUserCountryIso(detectedCountryIso);
      }
    }
  }, [initDataState, userCountryIso]);

  // Get countries for display
  const escortCountries = getEscortLocationCountries();
  const allCountries = getCountriesForLanguage();
  const availableCities = userCountryIso
    ? getCitiesForCountry(userCountryIso)
    : [];

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
          <Button size="l" mode="outline" stretched onClick={handlePrevious}>
            Назад
          </Button>
          <Button size="l" stretched disabled={!isValid} onClick={handleNext}>
            Далее: Услуги
          </Button>
        </div>
      </Section>
    </List>
  );
}
