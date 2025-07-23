import { useState, useEffect } from "react";
import {
  Section,
  Select,
  Button,
  List,
  Cell,
  Checkbox,
  Input,
} from "@telegram-apps/telegram-ui";
import { useProfile } from "@/context/ProfileContext";

const SERVICE_TYPES = ["Эскорт", "Массаж", "Компаньонка", "Модель", "Другое"];

const PREDEFINED_SERVICES = [
  "Классический секс",
  "Оральный секс",
  "Анальный секс",
  "Массаж классический",
  "Эротический массаж",
  "Ролевые игры",
  "Фетиш",
  "БДСМ",
  "Стриптиз",
  "Сопровождение на мероприятия",
  "Фотосессии",
  "Видеозвонки",
];

export function ServicesStep() {
  const { state, updateData, completeStep, setStep } = useProfile();
  const [serviceType, setServiceType] = useState(state.data.serviceType || "");
  const [servicesList, setServicesList] = useState<string[]>(
    state.data.servicesList || []
  );
  const [customService, setCustomService] = useState("");

  const isValid = serviceType.length > 0 && servicesList.length > 0;

  const handleServiceToggle = (service: string) => {
    setServicesList((prev) =>
      prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service]
    );
  };

  const handleAddCustomService = () => {
    if (customService.trim() && !servicesList.includes(customService.trim())) {
      setServicesList((prev) => [...prev, customService.trim()]);
      setCustomService("");
    }
  };

  const handleNext = () => {
    if (isValid) {
      updateData({ serviceType, servicesList });
      completeStep(3);
      setStep(4);
    }
  };

  const handlePrevious = () => {
    updateData({ serviceType, servicesList });
    setStep(2);
  };

  const handleSave = () => {
    updateData({ serviceType, servicesList });
    if (isValid) {
      completeStep(3);
    }
  };

  useEffect(() => {
    handleSave();
  }, [serviceType, servicesList]);

  return (
    <List>
      <Section header="Тип услуг">
        <Select
          header="Основная категория"
          value={serviceType}
          onChange={(e) => setServiceType(e.target.value)}
        >
          {SERVICE_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </Select>
      </Section>

      <Section header="Список услуг">
        {PREDEFINED_SERVICES.map((service) => (
          <Cell
            key={service}
            onClick={() => handleServiceToggle(service)}
            after={
              <Checkbox
                checked={servicesList.includes(service)}
                onChange={() => handleServiceToggle(service)}
              />
            }
            interactiveAnimation="opacity"
          >
            {service}
          </Cell>
        ))}

        <div style={{ padding: "16px" }}>
          <Input
            placeholder="Добавить свою услугу"
            value={customService}
            onChange={(e) => setCustomService(e.target.value)}
            after={
              <Button
                size="s"
                disabled={!customService.trim()}
                onClick={handleAddCustomService}
              >
                Добавить
              </Button>
            }
          />
        </div>

        {servicesList
          .filter((s) => !PREDEFINED_SERVICES.includes(s))
          .map((customSrv) => (
            <Cell
              key={customSrv}
              onClick={() => handleServiceToggle(customSrv)}
              after={
                <Checkbox
                  checked={servicesList.includes(customSrv)}
                  onChange={() => handleServiceToggle(customSrv)}
                />
              }
              interactiveAnimation="opacity"
            >
              {customSrv} <span style={{ opacity: 0.6 }}>(добавлено вами)</span>
            </Cell>
          ))}
      </Section>

      <Section>
        <div style={{ padding: "16px", display: "flex", gap: "12px" }}>
          <Button size="l" mode="outline" stretched onClick={handlePrevious}>
            Назад
          </Button>
          <Button size="l" stretched disabled={!isValid} onClick={handleNext}>
            Далее: Фото
          </Button>
        </div>
      </Section>
    </List>
  );
}
