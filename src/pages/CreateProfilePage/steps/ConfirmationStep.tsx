import { useState } from "react";
import { Section, Text, List } from "@telegram-apps/telegram-ui";
import { useNavigate } from "react-router-dom";
import { ISO_TO_COUNTRY } from "@/types/profile";
import { StepLayout } from "@/components/StepLayout";
import { useProfiles, usePatchProfile } from "@/hooks/useProfiles";

// Available time durations for pricing display
const TIME_DURATIONS = [
  { value: "30m", label: "30 минут" },
  { value: "1h", label: "1 час" },
  { value: "2h", label: "2 часа" },
  { value: "6h", label: "6 часов" },
];

export function ConfirmationStep() {
  const navigate = useNavigate();
  const { data: profiles, isLoading: profilesLoading } = useProfiles();
  const patchProfileMutation = usePatchProfile();

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get current profile
  const currentProfile = profiles?.find((profile) => profile.isDraft);

  // Get currency symbol for display
  const getCurrencySymbol = (currencyCode: string) => {
    const currencySymbols: { [key: string]: string } = {
      RUB: "₽",
      USD: "$",
      UAH: "₴",
      GEL: "₾",
      TRY: "₺",
    };
    return currencySymbols[currencyCode] || currencyCode;
  };

  const handleSaveDraft = () => {
    // Just navigate back to home - draft is already saved
    navigate("/");
  };

  const handleProfileReady = async () => {
    if (!currentProfile) return;

    setIsSubmitting(true);
    try {
      // Send patch request to mark profile as ready
      await patchProfileMutation.mutateAsync({
        id: currentProfile._id,
        profile: {
          isDraft: false,
        },
      });

      // Navigate to home page
      navigate("/");
    } catch (error) {
      console.error("Failed to mark profile as ready:", error);
      // You might want to show an error message to the user here
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrevious = () => {
    // This is now the "Save Draft" button
    handleSaveDraft();
  };

  if (profilesLoading) {
    return (
      <StepLayout
        currentStep={7}
        totalSteps={7}
        isValid={true}
        onPrevious={handlePrevious}
        onComplete={() => {}}
      >
        <Text style={{ padding: "16px", textAlign: "center" }}>
          Загрузка данных...
        </Text>
      </StepLayout>
    );
  }

  if (!currentProfile) {
    return (
      <StepLayout
        currentStep={7}
        totalSteps={7}
        isValid={true}
        onPrevious={handlePrevious}
        onComplete={() => {}}
      >
        <Text style={{ padding: "16px", textAlign: "center" }}>
          Профиль не найден
        </Text>
      </StepLayout>
    );
  }

  return (
    <StepLayout
      currentStep={7}
      totalSteps={7}
      isValid={true}
      onPrevious={handlePrevious}
      onComplete={handleProfileReady}
      previousText="Сохранить черновик"
      completeText={isSubmitting ? "Сохранение..." : "Анкета готова"}
      showNext={false}
      showComplete={true}
      isLoading={isSubmitting}
    >
      <List>
        {/* Basic Information */}
        <Section header="Основная информация">
          <div style={{ padding: "16px" }}>
            <Text weight="2" style={{ marginBottom: "8px" }}>
              Имя: {currentProfile.name || "Не указано"}
            </Text>
            <Text style={{ opacity: 0.8, marginBottom: "8px" }}>
              Описание: {currentProfile.description || "Описание не указано"}
            </Text>
          </div>
        </Section>

        {/* Location */}
        <Section header="Местоположение">
          <div style={{ padding: "16px" }}>
            <Text weight="2" style={{ marginBottom: "8px" }}>
              Страна:{" "}
              {currentProfile.country
                ? ISO_TO_COUNTRY[currentProfile.country]
                : "Не указано"}
            </Text>
            <Text style={{ marginBottom: "8px" }}>
              Город: {currentProfile.city || "Не указано"}
            </Text>
            <Text style={{ opacity: 0.8, marginBottom: "8px" }}>
              Клиенты:{" "}
              {currentProfile.visibleForCountries
                ?.map((country) => ISO_TO_COUNTRY[country])
                .join(", ") || "Не указано"}
            </Text>
          </div>
        </Section>

        {/* Services */}
        <Section header="Услуги">
          <div style={{ padding: "16px" }}>
            <Text weight="2" style={{ marginBottom: "8px" }}>
              Тип услуг: {currentProfile.serviceType || "Не указано"}
            </Text>
            <Text style={{ opacity: 0.8 }}>
              Список услуг:{" "}
              {currentProfile.servicesList?.join(", ") || "Не указано"}
            </Text>
          </div>
        </Section>

        {/* Photos */}
        <Section header="Фотографии">
          <div style={{ padding: "16px" }}>
            <Text style={{ marginBottom: "8px" }}>
              Количество фото: {currentProfile.photos?.length || 0}
            </Text>
            {currentProfile.photos && currentProfile.photos.length > 0 && (
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {currentProfile.photos.slice(0, 3).map((photo, index) => (
                  <img
                    key={index}
                    src={photo}
                    alt={`Фото ${index + 1}`}
                    style={{
                      width: "60px",
                      height: "60px",
                      objectFit: "cover",
                      borderRadius: "8px",
                    }}
                  />
                ))}
                {currentProfile.photos.length > 3 && (
                  <Text style={{ opacity: 0.7 }}>
                    +{currentProfile.photos.length - 3} еще
                  </Text>
                )}
              </div>
            )}
          </div>
        </Section>

        {/* Contact Information */}
        <Section header="Контакты">
          <div style={{ padding: "16px" }}>
            {currentProfile.contactInfo?.phoneNumber && (
              <Text style={{ marginBottom: "4px" }}>
                Телефон:{" "}
                {currentProfile.contactInfo.phoneCountryCode &&
                  `${currentProfile.contactInfo.phoneCountryCode} `}
                {currentProfile.contactInfo.phoneNumber}
              </Text>
            )}
            {currentProfile.contactInfo?.telegram && (
              <Text style={{ marginBottom: "4px" }}>
                Telegram: @{currentProfile.contactInfo.telegram}
              </Text>
            )}
            {!currentProfile.contactInfo?.phoneNumber &&
              !currentProfile.contactInfo?.telegram && (
                <Text style={{ opacity: 0.7 }}>Контакты не указаны</Text>
              )}
          </div>
        </Section>

        {/* Pricing */}
        <Section header="Цены">
          <div style={{ padding: "16px" }}>
            <Text weight="2" style={{ marginBottom: "8px" }}>
              Валюта:{" "}
              {currentProfile.priceCurrency
                ? getCurrencySymbol(currentProfile.priceCurrency)
                : "Не указано"}
            </Text>
            {currentProfile.pricingSlots &&
            currentProfile.pricingSlots.length > 0 ? (
              <div>
                {TIME_DURATIONS.map((duration) => {
                  const slot = currentProfile.pricingSlots?.find(
                    (s) => s.slot === duration.value
                  );
                  if (!slot || (!slot.incall && !slot.outcall)) return null;

                  return (
                    <div key={duration.value} style={{ marginBottom: "8px" }}>
                      <Text weight="2" style={{ fontSize: "14px" }}>
                        {duration.label}:
                      </Text>
                      <div style={{ marginLeft: "16px" }}>
                        {slot.incall && (
                          <Text style={{ fontSize: "13px", opacity: 0.8 }}>
                            Инколл: {slot.incall}{" "}
                            {getCurrencySymbol(
                              currentProfile.priceCurrency || ""
                            )}
                          </Text>
                        )}
                        {slot.outcall && (
                          <Text style={{ fontSize: "13px", opacity: 0.8 }}>
                            Аутколл: {slot.outcall}{" "}
                            {getCurrencySymbol(
                              currentProfile.priceCurrency || ""
                            )}
                          </Text>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <Text style={{ opacity: 0.7 }}>Цены не указаны</Text>
            )}
          </div>
        </Section>
      </List>
    </StepLayout>
  );
}
