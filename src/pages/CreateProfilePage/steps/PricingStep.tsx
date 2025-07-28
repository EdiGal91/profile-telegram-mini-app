import { useState, useEffect } from "react";
import { Section, Input, Select, List, Text } from "@telegram-apps/telegram-ui";
import { useProfile } from "@/context/ProfileContext";
import { useProfilesContext } from "@/context/ProfilesContext";
import { ISO_TO_COUNTRY } from "@/types/profile";
import { StepLayout } from "@/components/StepLayout";
import { usePatchProfile } from "@/hooks/useProfiles";

// Available time durations
const TIME_DURATIONS = [
  { value: "30m", label: "30 минут" },
  { value: "1h", label: "1 час" },
  { value: "2h", label: "2 часа" },
  { value: "6h", label: "6 часов" },
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
  const { profiles } = useProfilesContext();
  const patchProfileMutation = usePatchProfile();

  // Get the current draft profile
  const draftProfile = profiles.data?.find((profile) => profile.isDraft);

  // Get user's country to determine available currencies
  const userCountryISO = state.data.location?.country;
  const userCountryName = userCountryISO
    ? ISO_TO_COUNTRY[userCountryISO]
    : null;
  const availableCurrencies =
    userCountryName && userCountryName in COUNTRY_CURRENCIES
      ? COUNTRY_CURRENCIES[userCountryName as keyof typeof COUNTRY_CURRENCIES]
      : COUNTRY_CURRENCIES["Россия"]; // Default to Russia currencies

  // Get currency symbol for display
  const getCurrencySymbol = (currencyCode: string) => {
    const currency = availableCurrencies.find((c) => c.value === currencyCode);
    return currency?.label.split(" ")[0] || currencyCode; // Extract symbol part
  };

  // Initialize pricing from backend data or default
  const [pricing, setPricing] = useState(
    state.data.pricing || {
      currency: availableCurrencies[0].value,
      rates: {},
    }
  );

  // Load pricing data from backend when draft profile is loaded
  useEffect(() => {
    if (
      draftProfile &&
      draftProfile.priceCurrency &&
      draftProfile.pricingSlots
    ) {
      // Convert backend pricing slots to local format
      const rates: { [key: string]: { incall?: number; outcall?: number } } =
        {};
      draftProfile.pricingSlots.forEach(
        (slot: { slot: string; incall?: number; outcall?: number }) => {
          rates[slot.slot] = {
            incall: slot.incall,
            outcall: slot.outcall,
          };
        }
      );

      setPricing({
        currency: draftProfile.priceCurrency,
        rates,
      });
    }
  }, [draftProfile]);

  // Sync ProfileContext state with draft profile data
  useEffect(() => {
    if (draftProfile) {
      const updates: Partial<{ pricing: any }> = {};

      if (draftProfile.priceCurrency && draftProfile.pricingSlots) {
        // Convert backend pricing slots to local format
        const rates: { [key: string]: { incall?: number; outcall?: number } } =
          {};
        draftProfile.pricingSlots.forEach(
          (slot: { slot: string; incall?: number; outcall?: number }) => {
            rates[slot.slot] = {
              incall: slot.incall,
              outcall: slot.outcall,
            };
          }
        );

        const draftPricing = {
          currency: draftProfile.priceCurrency,
          rates,
        };

        if (
          JSON.stringify(draftPricing) !== JSON.stringify(state.data.pricing)
        ) {
          updates.pricing = draftPricing;
        }
      }

      if (Object.keys(updates).length > 0) {
        updateData(updates);
      }
    }
  }, [draftProfile, state.data.pricing, updateData]);

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

  const handleComplete = async () => {
    if (isValid && draftProfile) {
      // Convert local pricing format to backend format
      const pricingSlots = Object.entries(pricing.rates).map(
        ([slot, rates]) => ({
          slot,
          ...(rates.incall && { incall: rates.incall }),
          ...(rates.outcall && { outcall: rates.outcall }),
        })
      );

      try {
        // Send update request to backend
        await patchProfileMutation.mutateAsync({
          id: draftProfile._id,
          profile: {
            priceCurrency: pricing.currency,
            pricingSlots,
          },
        });

        // Update local state
        updateData({ pricing });
        completeStep(6);
        saveProgress();

        // Navigate to confirmation step
        setStep(7);
      } catch (error) {
        console.error("Failed to update profile:", error);
        // You might want to show an error message to the user here
      }
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

  if (profiles.isLoading) {
    return (
      <StepLayout
        currentStep={6}
        totalSteps={7}
        isValid={isValid}
        onPrevious={handlePrevious}
        onNext={handleComplete}
      >
        <Text style={{ padding: "16px", textAlign: "center" }}>
          Загрузка данных...
        </Text>
      </StepLayout>
    );
  }

  return (
    <StepLayout
      currentStep={6}
      totalSteps={7}
      isValid={isValid && !!draftProfile}
      onPrevious={handlePrevious}
      onNext={handleComplete}
    >
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
      </List>
    </StepLayout>
  );
}
