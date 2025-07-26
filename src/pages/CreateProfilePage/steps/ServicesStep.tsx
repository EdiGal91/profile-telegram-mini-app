// src/pages/CreateProfilePage/steps/ServicesStep.tsx
import React, { useState, useEffect } from "react";
import {
  Section,
  List,
  Cell,
  Checkbox,
  Button,
  Spinner,
} from "@telegram-apps/telegram-ui";
import { useProfile } from "@/context/ProfileContext";
import { useProfilesContext } from "@/context/ProfilesContext";
import { useServices, usePatchProfile } from "@/hooks/useProfiles";
import { ServiceCategory, ServiceOption } from "@/types/api";

export function ServicesStep() {
  const { state, updateData, completeStep, setStep } = useProfile();
  const { profiles } = useProfilesContext();

  const {
    data: services,
    isLoading,
    error,
  } = useServices() as {
    data: Record<string, ServiceCategory> | undefined;
    isLoading: boolean;
    error: Error | null;
  };

  const patchProfile = usePatchProfile();
  const draftProfile = profiles.data?.find((p) => p.isDraft);

  // тут будем хранить { [categoryKey]: string[] } — массив кодов опций
  const [selected, setSelected] = useState<Record<string, string[]>>({});

  // Инициализируем выбранные коды из draftProfile.servicesList
  useEffect(() => {
    if (draftProfile?.servicesList?.length && services) {
      const parsed: Record<string, string[]> = {};

      draftProfile.servicesList.forEach((item) => {
        // 1) Если item — ключ категории (без опций)
        if (services[item]) {
          parsed[item] = [];
          return;
        }

        // 2) Если item — точный код опции
        let matched = false;
        for (const [catKey, cat] of Object.entries(services)) {
          if (cat.options.some((o) => o.code === item)) {
            parsed[catKey] = [...(parsed[catKey] || []), item];
            matched = true;
            break;
          }
        }
        if (matched) return;

        // 3) Старые метки: ищем по label.ru или label.en
        for (const [catKey, cat] of Object.entries(services)) {
          // категория без опций?
          if (!cat.options.length) {
            if (cat.label.ru === item || cat.label.en === item) {
              parsed[catKey] = [];
              break;
            }
          } else {
            const opt = cat.options.find(
              (o) => o.label.ru === item || o.label.en === item
            );
            if (opt) {
              parsed[catKey] = [...(parsed[catKey] || []), opt.code];
              break;
            }
          }
        }
      });

      setSelected(parsed);
    }
  }, [draftProfile, services]);

  // Тогглим выбор
  const toggleOption = (catKey: string, optCode?: string) => {
    setSelected((prev) => {
      const curr = prev[catKey] || [];
      const cat = services![catKey] as ServiceCategory;
      let updated: string[];

      if (!cat.options.length) {
        // булевая категория
        updated = curr.length ? [] : [""];
      } else if (cat.multiSelect) {
        // множественный выбор внутри категории
        updated = curr.includes(optCode!)
          ? curr.filter((c) => c !== optCode)
          : [...curr, optCode!];
      } else {
        // одиночный выбор
        updated = curr[0] === optCode ? [] : [optCode!];
      }

      return { ...prev, [catKey]: updated };
    });
  };

  // собираем массив КОДОВ для отправки
  const getCodes = (): string[] => {
    if (!services) return [];
    const codes: string[] = [];
    Object.entries(selected).forEach(([catKey, arr]) => {
      const cat = services[catKey];
      if (!cat) return;
      if (!cat.options.length) {
        if (arr.length) codes.push(catKey);
      } else {
        arr.forEach((c) => codes.push(c));
      }
    });
    return codes;
  };

  const codes = getCodes();
  const isValid = codes.length > 0;

  // Перейти дальше
  const handleNext = async () => {
    if (!draftProfile || !isValid) return;
    updateData({ servicesList: codes });
    try {
      await patchProfile.mutateAsync({
        id: draftProfile._id,
        profile: { servicesList: codes },
      });
    } catch (e) {
      console.error("Failed to save services:", e);
    }
    completeStep(3);
    setStep(4);
  };

  // Назад
  const handlePrev = () => setStep(2);

  // Загрузка / ошибка
  if (isLoading) {
    return (
      <List>
        <Section>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 24,
            }}
          >
            <Spinner size="l" />
            <span style={{ marginLeft: 12 }}>Загружаем услуги...</span>
          </div>
        </Section>
      </List>
    );
  }
  if (error) {
    return (
      <List>
        <Section>
          <div style={{ padding: 16, textAlign: "center" }}>
            Ошибка загрузки услуг. Попробуйте позже.
          </div>
        </Section>
      </List>
    );
  }

  // Основной рендер
  return (
    <List>
      {services &&
        Object.entries(services).map(([catKey, cat]) => (
          <Section key={catKey} header={cat.label.ru}>
            {cat.options.length === 0 ? (
              <Cell
                onClick={() => toggleOption(catKey)}
                after={
                  <Checkbox
                    checked={(selected[catKey] || []).length > 0}
                    onChange={() => toggleOption(catKey)}
                  />
                }
                interactiveAnimation="opacity"
              >
                {cat.label.ru}
              </Cell>
            ) : (
              cat.options.map((opt: ServiceOption) => (
                <Cell
                  key={opt.code}
                  onClick={() => toggleOption(catKey, opt.code)}
                  after={
                    <Checkbox
                      checked={(selected[catKey] || []).includes(opt.code)}
                      onChange={() => toggleOption(catKey, opt.code)}
                    />
                  }
                  interactiveAnimation="opacity"
                >
                  {opt.label.ru}
                </Cell>
              ))
            )}
          </Section>
        ))}

      <Section>
        <div style={{ display: "flex", gap: 12, padding: 16 }}>
          <Button mode="outline" stretched onClick={handlePrev}>
            Назад
          </Button>
          <Button stretched disabled={!isValid} onClick={handleNext}>
            Далее: Фото
          </Button>
        </div>
      </Section>
    </List>
  );
}
