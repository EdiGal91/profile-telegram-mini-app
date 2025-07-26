// src/pages/CreateProfilePage/steps/ServicesStep.tsx
import { useState, useEffect } from "react";
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
  const { updateData, completeStep, setStep } = useProfile();
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

  // selected: категория → массив кодов выбранных опций (для булевых — код категории)
  const [selected, setSelected] = useState<Record<string, string[]>>({});

  // Инициализируем selected из draftProfile.servicesList
  useEffect(() => {
    if (draftProfile?.servicesList?.length && services) {
      const parsed: Record<string, string[]> = {};

      for (const item of draftProfile.servicesList) {
        // 1) булевая категория: если есть SERVICES[item]
        if (services[item]) {
          parsed[item] = [item];
          continue;
        }
        // 2) опция по коду
        let matched = false;
        for (const [catKey, cat] of Object.entries(services)) {
          const opt = cat.options.find((o) => o.code === item);
          if (opt) {
            parsed[catKey] = [...(parsed[catKey] || []), item];
            matched = true;
            break;
          }
        }
        if (matched) continue;
        // 3) старая метка: ищем по label
        for (const [catKey, cat] of Object.entries(services)) {
          if (!cat.options.length) {
            if (cat.label.ru === item || cat.label.en === item) {
              parsed[catKey] = [catKey];
              break;
            }
          } else {
            const o = cat.options.find(
              (o) => o.label.ru === item || o.label.en === item
            );
            if (o) {
              parsed[catKey] = [...(parsed[catKey] || []), o.code];
              break;
            }
          }
        }
      }

      setSelected(parsed);
    }
  }, [draftProfile, services]);

  // Переключение галочки
  const toggleOption = (catKey: string, optCode?: string) => {
    setSelected((prev) => {
      const curr = prev[catKey] || [];
      const cat = services![catKey] as ServiceCategory;
      let updated: string[];

      if (!cat.options.length) {
        // булевая: ставим/снимаем код категории
        updated = curr.length ? [] : [catKey];
      } else if (cat.multiSelect) {
        updated = curr.includes(optCode!)
          ? curr.filter((c) => c !== optCode)
          : [...curr, optCode!];
      } else {
        updated = curr[0] === optCode ? [] : [optCode!];
      }

      return { ...prev, [catKey]: updated };
    });
  };

  // Собираем flat-массив кодов для запроса
  const getCodes = (): string[] => {
    if (!services) return [];
    const codes: string[] = [];
    for (const [catKey, arr] of Object.entries(selected)) {
      const cat = services[catKey];
      if (!cat) continue;
      if (!cat.options.length) {
        if (arr.length) codes.push(catKey);
      } else {
        codes.push(...arr);
      }
    }
    return codes;
  };

  const codes = getCodes();
  const isValid = codes.length > 0;

  // Вперёд
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

  // Loading / Error
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

  // Основной UI
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
