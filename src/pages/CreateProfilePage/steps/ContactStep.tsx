import { useState, useEffect } from "react";
import { Section, Input, Button, List } from "@telegram-apps/telegram-ui";
import { useSignal, initData } from "@telegram-apps/sdk-react";
import { useProfile } from "@/context/ProfileContext";

export function ContactStep() {
  const { state, updateData, completeStep, setStep } = useProfile();
  const [contactInfo, setContactInfo] = useState(
    state.data.contactInfo || {
      phone: "",
      telegram: "",
      email: "",
    }
  );
  const initDataState = useSignal(initData.state);

  const isValid =
    contactInfo.phone || contactInfo.telegram || contactInfo.email;

  const handleContactChange = (
    field: keyof typeof contactInfo,
    value: string
  ) => {
    setContactInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (isValid) {
      updateData({ contactInfo });
      completeStep(5);
      setStep(6);
    }
  };

  const handlePrevious = () => {
    updateData({ contactInfo });
    setStep(4);
  };

  const handleSave = () => {
    updateData({ contactInfo });
    if (isValid) {
      completeStep(5);
    }
  };

  useEffect(() => {
    handleSave();
  }, [contactInfo]);

  // Auto-fill Telegram username if available
  useEffect(() => {
    console.log("initDataState", initDataState);
    if (initDataState?.user?.username && !contactInfo.telegram) {
      setContactInfo((prev) => ({
        ...prev,
        telegram: `@${initDataState.user?.username}`,
      }));
    }
  }, [initDataState]);

  return (
    <List>
      <Section header="Контактная информация">
        <Input
          header="Телефон"
          placeholder="+7 (999) 123-45-67"
          value={contactInfo.phone}
          onChange={(e) => handleContactChange("phone", e.target.value)}
          type="tel"
        />

        {/* Contact request not supported in current SDK version */}

        <Input
          header="Telegram"
          placeholder="@username"
          value={contactInfo.telegram}
          onChange={(e) => handleContactChange("telegram", e.target.value)}
        />

        <Input
          header="Email (опционально)"
          placeholder="example@email.com"
          value={contactInfo.email}
          onChange={(e) => handleContactChange("email", e.target.value)}
          type="email"
        />
      </Section>

      <Section>
        <div style={{ padding: "16px", display: "flex", gap: "12px" }}>
          <Button size="l" mode="outline" stretched onClick={handlePrevious}>
            Назад
          </Button>
          <Button size="l" stretched disabled={!isValid} onClick={handleNext}>
            Далее: Цены
          </Button>
        </div>
      </Section>
    </List>
  );
}
