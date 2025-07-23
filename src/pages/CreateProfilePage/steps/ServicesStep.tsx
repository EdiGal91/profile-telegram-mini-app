import { useState, useEffect } from "react";
import {
  Section,
  Button,
  List,
  Cell,
  Checkbox,
} from "@telegram-apps/telegram-ui";
import { useProfile } from "@/context/ProfileContext";

const PREDEFINED_SERVICES = [
  "Классический секс",
  "Оральный секс в презервативе",
  "Оральный секс без презерватива",
  "Анальный секс",
  "Массаж классический",
  "Эротический массаж",
  "Ролевые игры",
  "Фетиш",
  "БДСМ",
  "Стриптиз",
  "Сопровождение на мероприятия",
  "Фотосессии",
];

export function ServicesStep() {
  const { state, updateData, completeStep, setStep } = useProfile();
  const [servicesList, setServicesList] = useState<string[]>(
    state.data.servicesList || []
  );

  const isValid = servicesList.length > 0;

  const handleServiceToggle = (service: string) => {
    setServicesList((prev) =>
      prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service]
    );
  };

  const handleNext = () => {
    if (isValid) {
      updateData({ servicesList });
      completeStep(3);
      setStep(4);
    }
  };

  const handlePrevious = () => {
    updateData({ servicesList });
    setStep(2);
  };

  const handleSave = () => {
    updateData({ servicesList });
    if (isValid) {
      completeStep(3);
    }
  };

  useEffect(() => {
    handleSave();
  }, [servicesList]);

  return (
    <List>
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
