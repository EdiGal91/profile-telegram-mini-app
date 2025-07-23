import { useState, useEffect } from "react";
import {
  Section,
  Select,
  Button,
  List,
  Cell,
  Checkbox,
} from "@telegram-apps/telegram-ui";
import { requestLocation, useSignal, initData } from "@telegram-apps/sdk-react";
import { useProfile } from "@/context/ProfileContext";

const COUNTRIES = [
  "Россия",
  "Украина",
  "Беларусь",
  "Казахстан",
  "Грузия",
  "Армения",
  "Азербайджан",
  "Молдова",
  "Киргизия",
  "Таджикистан",
  "Узбекистан",
  "Туркменистан",
  "Литва",
  "Латвия",
  "Эстония",
  "Другая",
];

export function LocationStep() {
  const { state, updateData, completeStep, setStep } = useProfile();
  const [country, setCountry] = useState(state.data.country || "");
  const [countriesServed, setCountriesServed] = useState<string[]>(
    state.data.countriesServed || []
  );
  const initDataState = useSignal(initData.state);

  const isValid = country.length > 0 && countriesServed.length > 0;

  const handleCountryServedToggle = (selectedCountry: string) => {
    setCountriesServed((prev) =>
      prev.includes(selectedCountry)
        ? prev.filter((c) => c !== selectedCountry)
        : [...prev, selectedCountry]
    );
  };

  const handleRequestLocation = async () => {
    try {
      const location = await requestLocation();
      console.log("Location received:", location);
      setCountry("Россия");
    } catch (error) {
      console.error("Location request failed:", error);
    }
  };

  const handleNext = () => {
    if (isValid) {
      updateData({ country, countriesServed });
      completeStep(2);
      setStep(3);
    }
  };

  const handlePrevious = () => {
    updateData({ country, countriesServed });
    setStep(1);
  };

  const handleSave = () => {
    updateData({ country, countriesServed });
    if (isValid) {
      completeStep(2);
    }
  };

  useEffect(() => {
    handleSave();
  }, [country, countriesServed]);

  // Try to auto-detect country from Telegram user data
  useEffect(() => {
    if (initDataState?.user?.language_code && !country) {
      const languageToCountry: Record<string, string> = {
        ru: "Россия",
        uk: "Украина",
        be: "Беларусь",
        kk: "Казахстан",
        ka: "Грузия",
      };
      const detectedCountry =
        languageToCountry[initDataState.user.language_code];
      if (detectedCountry) {
        setCountry(detectedCountry);
      }
    }
  }, [initDataState]);

  return (
    <List>
      <Section header="Местоположение">
        <Select
          header="Ваша страна"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
        >
          {COUNTRIES.map((countryOption) => (
            <option key={countryOption} value={countryOption}>
              {countryOption}
            </option>
          ))}
        </Select>

        <Cell
          subtitle="Определить автоматически через GPS"
          onClick={handleRequestLocation}
          interactiveAnimation="opacity"
        >
          📍 Определить местоположение
        </Cell>
      </Section>

      <Section header="Страны обслуживания клиентов">
        {COUNTRIES.filter((c) => c !== "Другая").map((countryOption) => (
          <Cell
            key={countryOption}
            onClick={() => handleCountryServedToggle(countryOption)}
            after={
              <Checkbox
                checked={countriesServed.includes(countryOption)}
                onChange={() => handleCountryServedToggle(countryOption)}
              />
            }
            interactiveAnimation="opacity"
          >
            {countryOption}
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
