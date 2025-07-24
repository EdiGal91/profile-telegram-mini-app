import { useState, useEffect } from "react";
import { Section, Input, Button, List } from "@telegram-apps/telegram-ui";
import { useSignal, initData } from "@telegram-apps/sdk-react";
import { useProfile } from "@/context/ProfileContext";

// Country-specific phone formats
const PHONE_FORMATS = {
  Россия: {
    flag: "🇷🇺",
    code: "+7",
    placeholder: "(999) 123-45-67",
    format: "XXX XXX-XX-XX",
  },
  Украина: {
    flag: "🇺🇦",
    code: "+380",
    placeholder: "(99) 123-45-67",
    format: "XX XXX-XX-XX",
  },
  Грузия: {
    flag: "🇬🇪",
    code: "+995",
    placeholder: "(999) 123-456",
    format: "XXX XXX-XXX",
  },
  Турция: {
    flag: "🇹🇷",
    code: "+90",
    placeholder: "(999) 123-45-67",
    format: "XXX XXX-XX-XX",
  },
} as const;

export function ContactStep() {
  const { state, updateData, completeStep, setStep } = useProfile();

  // Get user's country for phone formatting
  const userCountry = state.data.location?.country;
  const phoneFormat =
    userCountry && userCountry in PHONE_FORMATS
      ? PHONE_FORMATS[userCountry as keyof typeof PHONE_FORMATS]
      : PHONE_FORMATS["Россия"]; // Default to Russia format

  // Store just the local phone number (without country code)
  const [localPhone, setLocalPhone] = useState(() => {
    const savedPhone = state.data.contactInfo?.phone || "";
    // If phone starts with country code, extract local part
    if (savedPhone.startsWith(phoneFormat.code)) {
      return savedPhone.slice(phoneFormat.code.length).replace(/^\s+/, "");
    }
    return savedPhone;
  });

  const [contactInfo, setContactInfo] = useState(
    state.data.contactInfo || {
      phone: "",
      telegram: "",
    }
  );
  const initDataState = useSignal(initData.state);

  // Only phone is required (Telegram is auto-collected)
  const isValid = !!localPhone?.trim();

  const handleContactChange = (
    field: keyof typeof contactInfo,
    value: string
  ) => {
    setContactInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (isValid) {
      const fullPhone = phoneFormat.code + " " + localPhone;
      updateData({
        contactInfo: {
          ...contactInfo,
          phone: fullPhone,
        },
      });
      completeStep(5);
      setStep(6);
    }
  };

  const handlePrevious = () => {
    const fullPhone = localPhone ? phoneFormat.code + " " + localPhone : "";
    updateData({
      contactInfo: {
        ...contactInfo,
        phone: fullPhone,
      },
    });
    setStep(4);
  };

  const handleSave = () => {
    const fullPhone = localPhone ? phoneFormat.code + " " + localPhone : "";
    updateData({
      contactInfo: {
        ...contactInfo,
        phone: fullPhone,
      },
    });
    if (isValid) {
      completeStep(5);
    }
  };

  useEffect(() => {
    handleSave();
  }, [localPhone, contactInfo.telegram]);

  // Auto-fill Telegram username if available (hidden from user)
  useEffect(() => {
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
        <div style={{ position: "relative" }}>
          <div
            style={{
              fontSize: "14px",
              color: "var(--tg-theme-hint-color)",
              marginBottom: "8px",
              paddingLeft: "16px",
            }}
          >
            Телефон
          </div>

          {/* Unified input field design */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: "var(--tg-theme-bg-color)",
              border: "1px solid var(--tg-theme-section-bg-color)",
              borderRadius: "8px",
              padding: "0",
              margin: "0 16px",
              overflow: "hidden",
            }}
          >
            {/* Country code section - integrated into the input */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "12px 8px 12px 12px",
                background: "var(--tg-theme-secondary-bg-color)",
                borderRight: "1px solid var(--tg-theme-section-bg-color)",
                minWidth: "70px",
              }}
            >
              <span style={{ fontSize: "14px" }}>{phoneFormat.flag}</span>
              <span
                style={{
                  color: "var(--tg-theme-text-color)",
                  fontWeight: "500",
                  fontSize: "16px",
                }}
              >
                {phoneFormat.code}
              </span>
            </div>

            {/* Phone number input - seamlessly integrated */}
            <input
              type="tel"
              placeholder={phoneFormat.placeholder}
              value={localPhone}
              onChange={(e) => setLocalPhone(e.target.value)}
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                padding: "12px",
                background: "transparent",
                color: "var(--tg-theme-text-color)",
                fontSize: "16px",
              }}
            />
          </div>

          <div
            style={{
              fontSize: "12px",
              color: "var(--tg-theme-hint-color)",
              marginTop: "4px",
              paddingLeft: "16px",
              opacity: 0.7,
            }}
          >
            Введите номер без кода страны
          </div>
        </div>

        {/* Telegram is auto-collected but hidden from user */}
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
