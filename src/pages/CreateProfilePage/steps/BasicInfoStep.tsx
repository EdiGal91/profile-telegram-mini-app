import { useState, useEffect } from "react";
import { Section, Input, Textarea, List } from "@telegram-apps/telegram-ui";
import { useProfile } from "@/context/ProfileContext";
import { useProfilesContext } from "@/context/ProfilesContext";
import { usePatchProfile } from "@/hooks/useProfiles";
import { StepLayout } from "@/components/StepLayout";

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

  // Sync local state with draft profile data when it becomes available
  useEffect(() => {
    if (draftProfile && (!name || !description)) {
      // Only update if local state is empty and draft has data
      if (draftProfile.name && !name) {
        setName(draftProfile.name);
      }
      if (draftProfile.description && !description) {
        setDescription(draftProfile.description);
      }
    }
  }, [draftProfile, name, description]);

  // Sync ProfileContext state with draft profile data
  useEffect(() => {
    if (draftProfile) {
      const updates: Partial<{ name: string; description: string }> = {};

      if (draftProfile.name && draftProfile.name !== state.data.name) {
        updates.name = draftProfile.name;
      }
      if (
        draftProfile.description &&
        draftProfile.description !== state.data.description
      ) {
        updates.description = draftProfile.description;
      }

      if (Object.keys(updates).length > 0) {
        updateData(updates);
      }
    }
  }, [draftProfile, state.data.name, state.data.description, updateData]);

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
    <StepLayout
      currentStep={1}
      totalSteps={6}
      isValid={isValid && !!draftProfile}
      isLoading={isLoading}
      onNext={handleNext}
    >
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
        </Section>
      </List>
    </StepLayout>
  );
}
