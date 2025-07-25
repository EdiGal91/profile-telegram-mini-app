import { useState, useEffect } from "react";
import {
  Section,
  Input,
  Select,
  Button,
  List,
  Text,
} from "@telegram-apps/telegram-ui";
import { useProfile } from "@/context/ProfileContext";
import { useNavigate } from "react-router-dom";

// Available time durations
const TIME_DURATIONS = [
  { value: "30min", label: "30 минут" },
  { value: "1hour", label: "1 час" },
  { value: "2hours", label: "2 часа" },
  { value: "6hours", label: "6 часов" },
];

// Country-specific currencies + USD
const COUNTRY_CURRENCIES = {
  Россия: [
    { value: "RUB", label: "₽ Рубли" },
    { value: "USD", label: "$ Доллары" },
  ],
  Украина: [
    { value: "UAH", label: "₴ Гривны" },
    { value: "USD", label: "$ Доллары" },
  ],
  Грузия: [
    { value: "GEL", label: "₾ Лари" },
    { value: "USD", label: "$ Доллары" },
  ],
  Турция: [
    { value: "TRY", label: "₺ Лиры" },
    { value: "USD", label: "$ Доллары" },
  ],
} as const;

export function PricingStep() {
  const { state, updateData, completeStep, saveProgress, setStep } =
    useProfile();
  const navigate = useNavigate();

  // Get user's country to determine available currencies
  const userCountry = state.data.location?.country;
  const availableCurrencies =
    userCountry && userCountry in COUNTRY_CURRENCIES
      ? COUNTRY_CURRENCIES[userCountry as keyof typeof COUNTRY_CURRENCIES]
      : COUNTRY_CURRENCIES["Россия"]; // Default to Russia currencies

  // Get currency symbol for display
  const getCurrencySymbol = (currencyCode: string) => {
    const currency = availableCurrencies.find((c) => c.value === currencyCode);
    return currency?.label.split(" ")[0] || currencyCode; // Extract symbol part
  };

  const [pricing, setPricing] = useState(
    state.data.pricing || {
      currency: availableCurrencies[0].value,
      rates: {},
    }
  );

  // Pricing is optional - always valid
  const isValid = true;

  const handleCurrencyChange = (currency: string) => {
    setPricing((prev) => ({ ...prev, currency }));
  };

  const handleRateChange = (
    duration: string,
    type: "incall" | "outcall",
    value: number
  ) => {
    setPricing((prev) => {
      const newRates = { ...prev.rates };

      if (value > 0) {
        // Set the price if it's a valid positive number
        newRates[duration] = {
          ...newRates[duration],
          [type]: value,
        };
      } else {
        // Remove the price if it's 0 or empty
        if (newRates[duration]) {
          const { [type]: _, ...remainingRates } = newRates[duration];

          // If no rates left for this duration, remove the duration entirely
          if (Object.keys(remainingRates).length === 0) {
            delete newRates[duration];
          } else {
            newRates[duration] = remainingRates;
          }
        }
      }

      return {
        ...prev,
        rates: newRates,
      };
    });
  };

  const handleComplete = () => {
    if (isValid) {
      updateData({ pricing });
      completeStep(6);
      saveProgress();

      // Navigate back to home or show completion message
      setTimeout(() => {
        navigate("/");
      }, 1000);
    }
  };

  const handlePrevious = () => {
    updateData({ pricing });
    setStep(5);
  };

  const handleSave = () => {
    updateData({ pricing });
    if (isValid) {
      completeStep(6);
    }
  };

  useEffect(() => {
    handleSave();
  }, [pricing]);

  return (
    <List>
      <Section header="Стоимость услуг">
        <Select
          header="Валюта"
          value={pricing.currency}
          onChange={(e) => handleCurrencyChange(e.target.value)}
        >
          {availableCurrencies.map((curr) => (
            <option key={curr.value} value={curr.value}>
              {curr.label}
            </option>
          ))}
        </Select>

        <Text style={{ padding: "16px", opacity: 0.7, fontSize: "14px" }}>
          Вы можете указать цены для разных временных интервалов. Вы можете
          указать только инколл, только аутколл, или оба.
        </Text>

        {TIME_DURATIONS.map((duration) => (
          <div
            key={duration.value}
            style={{
              padding: "16px",
              borderBottom: "1px solid var(--tg-theme-section-bg-color)",
            }}
          >
            <Text
              style={{
                fontWeight: "500",
                marginBottom: "12px",
                fontSize: "16px",
              }}
            >
              {duration.label}
            </Text>

            <div style={{ display: "flex", gap: "12px" }}>
              <div style={{ flex: 1 }}>
                <Input
                  header={`Инколл ${getCurrencySymbol(pricing.currency)}`}
                  placeholder="0"
                  value={
                    pricing.rates[duration.value]?.incall?.toString() || ""
                  }
                  onChange={(e) => {
                    const value = e.target.value;
                    const numValue = value === "" ? 0 : parseInt(value) || 0;
                    handleRateChange(duration.value, "incall", numValue);
                  }}
                  type="number"
                  min="0"
                />
              </div>

              <div style={{ flex: 1 }}>
                <Input
                  header={`Аутколл ${getCurrencySymbol(pricing.currency)}`}
                  placeholder="0"
                  value={
                    pricing.rates[duration.value]?.outcall?.toString() || ""
                  }
                  onChange={(e) => {
                    const value = e.target.value;
                    const numValue = value === "" ? 0 : parseInt(value) || 0;
                    handleRateChange(duration.value, "outcall", numValue);
                  }}
                  type="number"
                  min="0"
                />
              </div>
            </div>
          </div>
        ))}
      </Section>

      <Section header="Завершение">
        <Text style={{ padding: "16px" }}>Анкета готова к сохранению.</Text>

        <div style={{ padding: "16px", display: "flex", gap: "12px" }}>
          <Button size="l" mode="outline" stretched onClick={handlePrevious}>
            Назад
          </Button>
          <Button
            size="l"
            stretched
            disabled={!isValid}
            onClick={handleComplete}
          >
            Сохранить анкету
          </Button>
        </div>
      </Section>
    </List>
  );
}
