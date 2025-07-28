// src/pages/CreateProfilePage/steps/PhotosStep.tsx
import { useState, useEffect, useRef } from "react";
import { Section, Button, List, Cell, Text } from "@telegram-apps/telegram-ui";
import { useProfile } from "@/context/ProfileContext";
import { useProfilesContext } from "@/context/ProfilesContext";
import { StepLayout } from "@/components/StepLayout";
import { useUploadPhotos } from "@/hooks/useProfiles";

interface PhotoData {
  url: string;
  file?: File;
  isObjectURL?: boolean;
  uuid?: string;
  isMain?: boolean;
}

export function PhotosStep() {
  const { state, updateData, completeStep, setStep } = useProfile();
  const { profiles } = useProfilesContext();
  const uploadPhotosMutation = useUploadPhotos();
  const [photos, setPhotos] = useState<PhotoData[]>(() => {
    // Convert existing base64 URLs to photo data format
    return (state.data.photos || []).map((url) => ({
      url,
      isObjectURL: false,
    }));
  });

  // Get the current draft profile
  const draftProfile = profiles.data?.find((profile) => profile.isDraft);

  // Sync local state with draft profile data when it becomes available
  useEffect(() => {
    if (draftProfile?.images?.length && photos.length === 0) {
      // Use originalKey URLs from the images array with uuid and isMain
      const draftPhotos = draftProfile.images.map((image) => ({
        url: image.originalKey,
        isObjectURL: false,
        uuid: image.uuid,
        isMain: image.isMain,
      }));
      setPhotos(draftPhotos);
    }
  }, [draftProfile, photos]);

  // Sync ProfileContext state with draft profile data
  useEffect(() => {
    if (
      draftProfile?.images?.length &&
      JSON.stringify(draftProfile.images.map((img) => img.originalKey)) !==
        JSON.stringify(state.data.photos)
    ) {
      updateData({ photos: draftProfile.images.map((img) => img.originalKey) });
    }
  }, [draftProfile, state.data.photos, updateData]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectURLsRef = useRef<string[]>([]);

  const isValid = photos.length >= 1;
  const maxPhotos = 10;
  const isUploading = uploadPhotosMutation.isPending;

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    try {
      const files = Array.from(event.target.files || []);

      if (files.length === 0) return;

      for (const file of files) {
        if (photos.length >= maxPhotos) break;
        if (!file.type.startsWith("image/")) continue;

        // Create temporary blob URL for immediate preview
        const blobUrl = URL.createObjectURL(file);
        objectURLsRef.current.push(blobUrl);

        // Add photo to state immediately for preview
        const newPhoto: PhotoData = {
          url: blobUrl,
          file,
          isObjectURL: true,
        };
        setPhotos((prev) => [...prev, newPhoto]);

        // Upload the image immediately
        if (draftProfile) {
          try {
            await uploadPhotosMutation.mutateAsync({
              profileId: draftProfile._id,
              photos: [file],
            });
            // The profiles will be refreshed automatically via query invalidation
          } catch (error) {
            console.error("Failed to upload photo:", error);
            // Remove the photo from state if upload failed
            setPhotos((prev) => prev.filter((p) => p.url !== blobUrl));
            URL.revokeObjectURL(blobUrl);
            objectURLsRef.current = objectURLsRef.current.filter(
              (url) => url !== blobUrl
            );

            // Show error message
            const telegramWebApp = (window as any).Telegram?.WebApp;
            if (telegramWebApp?.showAlert) {
              telegramWebApp.showAlert(
                "Ошибка при загрузке фотографии. Пожалуйста, попробуйте еще раз."
              );
            }
          }
        }
      }

      // Clear the input to allow selecting the same file again
      if (event.target) {
        event.target.value = "";
      }
    } catch (error) {
      console.error("File selection error:", error);
    }
  };

  const handleAddPhoto = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => {
      const photoToRemove = prev[index];
      if (photoToRemove.isObjectURL && photoToRemove.url) {
        URL.revokeObjectURL(photoToRemove.url);
        objectURLsRef.current = objectURLsRef.current.filter(
          (url) => url !== photoToRemove.url
        );
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleNext = () => {
    if (isValid) {
      // Update local state with all photo URLs
      const allPhotoUrls = photos.map((photo) => photo.url);
      updateData({ photos: allPhotoUrls });

      completeStep(4);
      setStep(5);
    }
  };

  const handlePrevious = () => {
    updateData({ photos: photos.map((p) => p.url) });
    setStep(3);
  };

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      objectURLsRef.current.forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, []);

  return (
    <StepLayout
      currentStep={4}
      totalSteps={6}
      isValid={isValid}
      onPrevious={handlePrevious}
      onNext={handleNext}
      isLoading={isUploading}
      loadingText="Загрузка фотографий..."
    >
      <List>
        <Section header="Фотографии">
          <Text style={{ padding: "16px", opacity: 0.7 }}>
            Добавьте от 1 до {maxPhotos} фотографий. Первая фотография будет
            основной.
          </Text>

          <Text
            style={{
              padding: "0 16px 16px",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            Загружено: {photos.length} из {maxPhotos} фотографий
          </Text>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleFileSelect}
          />

          {photos.length < maxPhotos && (
            <Cell onClick={handleAddPhoto} interactiveAnimation="opacity">
              📷 Добавить фото
            </Cell>
          )}

          <Cell
            onClick={() => {
              // Add a demo photo for testing purposes
              setPhotos((prev) => [
                ...prev,
                {
                  url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23ff6b6b'/%3E%3Ctext x='50' y='50' text-anchor='middle' dy='0.3em' fill='white'%3EТест%3C/text%3E%3C/svg%3E",
                  isObjectURL: false,
                },
              ]);
            }}
            interactiveAnimation="opacity"
          >
            🧪 Добавить тестовое фото
          </Cell>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
              gap: "8px",
              padding: "16px",
            }}
          >
            {photos.map((photo, index) => (
              <div key={photo.uuid || index} style={{ position: "relative" }}>
                <img
                  src={photo.url}
                  alt={`Photo ${index + 1}`}
                  style={{
                    width: "100%",
                    height: "100px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    border:
                      photo.isMain || index === 0
                        ? "2px solid var(--tg-theme-button-color)"
                        : "1px solid var(--tg-theme-section-bg-color)",
                  }}
                />
                {(photo.isMain || index === 0) && (
                  <div
                    style={{
                      position: "absolute",
                      top: "4px",
                      left: "4px",
                      background: "var(--tg-theme-button-color)",
                      color: "var(--tg-theme-button-text-color)",
                      padding: "2px 6px",
                      borderRadius: "4px",
                      fontSize: "10px",
                      fontWeight: "bold",
                    }}
                  >
                    ГЛАВНАЯ
                  </div>
                )}
                <Button
                  size="s"
                  mode="outline"
                  onClick={() => removePhoto(index)}
                  style={{
                    position: "absolute",
                    top: "4px",
                    right: "4px",
                    minWidth: "24px",
                    height: "24px",
                    padding: "0",
                    background: "rgba(0,0,0,0.7)",
                    color: "white",
                    border: "none",
                  }}
                >
                  ×
                </Button>
              </div>
            ))}
          </div>
        </Section>
      </List>
    </StepLayout>
  );
}
