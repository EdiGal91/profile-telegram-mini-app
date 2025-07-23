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
import {
  COUNTRIES,
  ESCORT_LOCATION_COUNTRIES,
  CITIES_BY_COUNTRY,
} from "@/types/profile";

export function LocationStep() {
  const { state, updateData, completeStep, setStep } = useProfile();

  // Her location (country + city)
  const [userCountry, setUserCountry] = useState(
    state.data.location?.country || ""
  );
  const [userCity, setUserCity] = useState(state.data.location?.city || "");

  // Countries where she serves clients
  const [clientCountries, setClientCountries] = useState<string[]>(
    state.data.clientCountries || []
  );

  const initDataState = useSignal(initData.state);

  const isValid =
    userCountry.length > 0 && userCity.length > 0 && clientCountries.length > 0;

  const availableCities = userCountry
    ? CITIES_BY_COUNTRY[userCountry] || []
    : [];

  const handleClientCountryToggle = (selectedCountry: string) => {
    setClientCountries((prev) =>
      prev.includes(selectedCountry)
        ? prev.filter((c) => c !== selectedCountry)
        : [...prev, selectedCountry]
    );
  };

  const handleCountryChange = (country: string) => {
    setUserCountry(country);
    // Reset city when country changes
    setUserCity("");
  };

  const handleNext = () => {
    if (isValid) {
      updateData({
        location: { country: userCountry, city: userCity },
        clientCountries,
      });
      completeStep(2);
      setStep(3);
    }
  };

  const handlePrevious = () => {
    updateData({
      location: { country: userCountry, city: userCity },
      clientCountries,
    });
    setStep(1);
  };

  const handleSave = () => {
    updateData({
      location: { country: userCountry, city: userCity },
      clientCountries,
    });
    if (isValid) {
      completeStep(2);
    }
  };

  useEffect(() => {
    handleSave();
  }, [userCountry, userCity, clientCountries]);

  // Auto-detect country from Telegram user data
  useEffect(() => {
    if (!userCountry && initDataState?.user) {
      const languageToCountry: Record<string, string> = {
        ru: "Россия",
        uk: "Украина",
        ka: "Грузия",
        tr: "Турция",
      };

      const detectedCountry = initDataState.user.language_code
        ? languageToCountry[initDataState.user.language_code]
        : null;

      if (
        detectedCountry &&
        ESCORT_LOCATION_COUNTRIES.includes(detectedCountry)
      ) {
        setUserCountry(detectedCountry);
      }
      // No automatic default - let user choose
    }
  }, [initDataState, userCountry]);

  return (
    <List>
      <Section header="Ваше местоположение">
        <Select
          header="Ваша страна"
          value={userCountry}
          onChange={(e) => handleCountryChange(e.target.value)}
        >
          <option value="" disabled>
            Выберите страну
          </option>
          {ESCORT_LOCATION_COUNTRIES.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </Select>

        {userCountry && (
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

      <Section header="Клиентам из каких стран выша анкета будет видна">
        {COUNTRIES.map((country) => (
          <Cell
            key={country}
            onClick={() => handleClientCountryToggle(country)}
            after={
              <Checkbox
                checked={clientCountries.includes(country)}
                onChange={() => handleClientCountryToggle(country)}
              />
            }
            interactiveAnimation="opacity"
          >
            {country}
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
