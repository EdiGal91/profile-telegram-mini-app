import { useState, useEffect } from "react";
import {
  Section,
  Input,
  Textarea,
  Button,
  List,
  Spinner,
} from "@telegram-apps/telegram-ui";
import { useProfile } from "@/context/ProfileContext";
import { useProfilesContext } from "@/context/ProfilesContext";
import { usePatchProfile } from "@/hooks/useProfiles";

export function BasicInfoStep() {
  const { state, updateData, completeStep, setStep } = useProfile();
  const { profiles } = useProfilesContext();
  const patchProfile = usePatchProfile();

  const [name, setName] = useState(state.data.name || "");
  const [description, setDescription] = useState(state.data.description || "");
  const [isLoading, setIsLoading] = useState(false);

  const isValid = name.trim().length >= 2 && description.trim().length >= 10;

  // Get the current draft profile
  const draftProfile = profiles.data?.find((profile) => profile.isDraft);

  const handleNext = async () => {
    if (isValid && draftProfile) {
      try {
        setIsLoading(true);

        // Update local state first
        updateData({ name: name.trim(), description: description.trim() });

        // Send PATCH request to update the profile
        await patchProfile.mutateAsync({
          id: draftProfile._id,
          profile: {
            name: name.trim(),
            description: description.trim(),
          },
        });

        // Complete step and move to next
        completeStep(1);
        setStep(2);
      } catch (error) {
        console.error("Failed to update profile:", error);
        // You might want to show an error message to the user here
      } finally {
        setIsLoading(false);
      }
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
          <Button
            size="l"
            stretched
            disabled={!isValid || isLoading || !draftProfile}
            onClick={handleNext}
          >
            {isLoading ? (
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <Spinner size="s" />
                <span>Сохранение...</span>
              </div>
            ) : (
              "Далее: Местоположение"
            )}
          </Button>
        </div>
      </Section>
    </List>
  );
}
