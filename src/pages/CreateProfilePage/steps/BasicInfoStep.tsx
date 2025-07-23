import { useState, useEffect } from "react";
import {
  Section,
  Input,
  Textarea,
  Button,
  List,
} from "@telegram-apps/telegram-ui";
import { useProfile } from "@/context/ProfileContext";

export function BasicInfoStep() {
  const { state, updateData, completeStep, setStep } = useProfile();
  const [name, setName] = useState(state.data.name || "");
  const [description, setDescription] = useState(state.data.description || "");

  const isValid = name.trim().length >= 2 && description.trim().length >= 10;

  const handleNext = () => {
    if (isValid) {
      updateData({ name: name.trim(), description: description.trim() });
      completeStep(1);
      setStep(2);
    }
  };

  const handleSave = () => {
    updateData({ name: name.trim(), description: description.trim() });
    if (isValid) {
      completeStep(1);
    }
  };

  useEffect(() => {
    handleSave();
  }, [name, description]);

  return (
    <List>
      <Section header="Основная информация">
        <Input
          header="Ваше имя"
          placeholder="Введите ваше имя"
          value={name}
          onChange={(e) => setName(e.target.value)}
          status={name.length > 0 && name.length < 2 ? "error" : undefined}
        />

        <Textarea
          header="Описание"
          placeholder="Расскажите о себе, ваших увлечениях и том, что делает вас особенной..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          status={
            description.length > 0 && description.length < 10
              ? "error"
              : undefined
          }
        />

        <div style={{ padding: "16px" }}>
          <Button size="l" stretched disabled={!isValid} onClick={handleNext}>
            Далее: Местоположение
          </Button>
        </div>
      </Section>
    </List>
  );
}
