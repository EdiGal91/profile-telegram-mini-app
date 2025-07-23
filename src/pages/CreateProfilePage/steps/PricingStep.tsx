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

const CURRENCIES = [
  { value: "RUB", label: "₽ Рубли" },
  { value: "USD", label: "$ Доллары" },
  { value: "EUR", label: "€ Евро" },
  { value: "UAH", label: "₴ Гривны" },
  { value: "KZT", label: "₸ Тенге" },
];

export function PricingStep() {
  const { state, updateData, completeStep, saveProgress, setStep } =
    useProfile();
  const navigate = useNavigate();
  const [pricing, setPricing] = useState(
    state.data.pricing || {
      incall: 0,
      outcall: 0,
      currency: "RUB",
    }
  );

  const isValid = pricing.incall > 0 || pricing.outcall > 0;

  const handlePricingChange = (
    field: keyof typeof pricing,
    value: string | number
  ) => {
    setPricing((prev) => ({ ...prev, [field]: value }));
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
          onChange={(e) => handlePricingChange("currency", e.target.value)}
        >
          {CURRENCIES.map((curr) => (
            <option key={curr.value} value={curr.value}>
              {curr.label}
            </option>
          ))}
        </Select>

        <Input
          header="Инколл (у вас)"
          placeholder="0"
          value={pricing.incall.toString()}
          onChange={(e) =>
            handlePricingChange("incall", parseInt(e.target.value) || 0)
          }
          type="number"
          min="0"
        />

        <Input
          header="Аутколл (выезд)"
          placeholder="0"
          value={pricing.outcall.toString()}
          onChange={(e) =>
            handlePricingChange("outcall", parseInt(e.target.value) || 0)
          }
          type="number"
          min="0"
        />

        <Text style={{ padding: "16px", opacity: 0.7, fontSize: "14px" }}>
          Указывайте цену за час. Вы можете указать только один тип услуг или
          оба.
        </Text>
      </Section>

      <Section header="Завершение">
        <Text style={{ padding: "16px" }}>
          Поздравляем! Вы заполнили все необходимые поля для создания анкеты.
          После сохранения ваша анкета будет создана как черновик.
        </Text>

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
