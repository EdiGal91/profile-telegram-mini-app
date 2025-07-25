import { useState, useEffect } from "react";
import { Section, Input, Button, List } from "@telegram-apps/telegram-ui";
import { useSignal, initData } from "@telegram-apps/sdk-react";
import { useProfile } from "@/context/ProfileContext";

// Country-specific mobile phone formats and validation
const PHONE_FORMATS = {
  Россия: {
    flag: "🇷🇺",
    code: "+7",
    placeholder: "9XX XXX-XX-XX",
    format: "XXX XXX-XX-XX",
    // Russian mobile: 10 digits, starts with 9
    validation: /^9\d{9}$/,
    example: "9123456789",
  },
  Украина: {
    flag: "🇺🇦",
    code: "+380",
    placeholder: "XX XXX-XX-XX",
    format: "XX XXX-XX-XX",
    // Ukrainian mobile: 9 digits, starts with specific prefixes
    validation: /^(39|50|63|66|67|68|73|91|92|93|94|95|96|97|98|99)\d{7}$/,
    example: "501234567",
  },
  Грузия: {
    flag: "🇬🇪",
    code: "+995",
    placeholder: "5XX XXX-XXX",
    format: "XXX XXX-XXX",
    // Georgian mobile: 9 digits, starts with 5
    validation: /^\d{9}$/,
    example: "551234567",
  },
  Турция: {
    flag: "🇹🇷",
    code: "+90",
    placeholder: "5XX XXX-XX-XX",
    format: "XXX XXX-XX-XX",
    // Turkish mobile: 10 digits, starts with 5
    validation: /^5\d{9}$/,
    example: "5123456789",
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
      exposeTelegram: false,
      exposeWhatsApp: false,
    }
  );
  const initDataState = useSignal(initData.state);

  // Validate phone format based on country
  const cleanPhone = localPhone.replace(/\D/g, ""); // Remove non-digits for validation
  const isPhoneValid = phoneFormat.validation.test(cleanPhone);
  const isValid = isPhoneValid && !!localPhone?.trim();

  const handlePhoneChange = (value: string) => {
    // Only allow digits, spaces, dashes, and parentheses for phone formatting
    const filteredValue = value.replace(/[^\d\s\-\(\)]/g, "");
    setLocalPhone(filteredValue);
  };

  const handleContactChange = (
    field: keyof typeof contactInfo,
    value: string | boolean
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
  }, [
    localPhone,
    contactInfo.telegram,
    contactInfo.exposeTelegram,
    contactInfo.exposeWhatsApp,
  ]);

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
              onChange={(e) => handlePhoneChange(e.target.value)}
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
        <div
          style={{
            padding: "12px 16px",
            borderTop: "1px solid var(--tg-theme-section-bg-color)",
          }}
        >
          <div
            style={{
              fontSize: "13px",
              color: "var(--tg-theme-hint-color)",
              marginBottom: "8px",
            }}
          >
            Показывать клиентам:
          </div>

          <div style={{ display: "flex", gap: "20px" }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={contactInfo.exposeTelegram || false}
                onChange={(e) =>
                  handleContactChange("exposeTelegram", e.target.checked)
                }
                style={{
                  width: "16px",
                  height: "16px",
                  accentColor: "var(--tg-theme-button-color)",
                }}
              />
              <div
                style={{ display: "flex", alignItems: "center", gap: "4px" }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  style={{ color: "#0088cc" }}
                >
                  <path d="M12 0C5.374 0 0 5.373 0 12s5.374 12 12 12 12-5.373 12-12S18.626 0 12 0zm5.568 8.16l-1.58 7.44c-.117.546-.43.68-.87.42l-2.4-1.77-1.16.89c-.128.127-.235.235-.48.235l.17-2.4 4.38-3.96c.19-.17-.04-.27-.3-.1l-5.41 3.41-2.33-.73c-.51-.16-.52-.51.11-.75l9.1-3.51c.42-.16.8.1.66.75z" />
                </svg>
                <span
                  style={{
                    color: "var(--tg-theme-text-color)",
                    fontSize: "14px",
                  }}
                >
                  Telegram
                </span>
              </div>
            </label>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={contactInfo.exposeWhatsApp || false}
                onChange={(e) =>
                  handleContactChange("exposeWhatsApp", e.target.checked)
                }
                style={{
                  width: "16px",
                  height: "16px",
                  accentColor: "var(--tg-theme-button-color)",
                }}
              />
              <div
                style={{ display: "flex", alignItems: "center", gap: "4px" }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  style={{ color: "#25D366" }}
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.384" />
                </svg>
                <span
                  style={{
                    color: "var(--tg-theme-text-color)",
                    fontSize: "14px",
                  }}
                >
                  WhatsApp
                </span>
              </div>
            </label>
          </div>
        </div>
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
