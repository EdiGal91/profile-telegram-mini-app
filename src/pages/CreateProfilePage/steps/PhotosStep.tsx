// src/pages/CreateProfilePage/steps/PhotosStep.tsx
import { useState, useEffect, useRef, useMemo } from "react";
import { Section, Button, List, Cell, Text } from "@telegram-apps/telegram-ui";
import { useProfile } from "@/context/ProfileContext";
import { useProfilesContext } from "@/context/ProfilesContext";
import { StepLayout } from "@/components/StepLayout";
import {
  useUploadPhotos,
  useSetImageAsMain,
  useDeleteImage,
} from "@/hooks/useProfiles";

interface PhotoData {
  url: string;
  file?: File;
  isObjectURL?: boolean;
  uuid?: string;
  isMain?: boolean;
}

export function PhotosStep() {
  const { updateData, completeStep, setStep } = useProfile();
  const { profiles } = useProfilesContext();
  const uploadPhotosMutation = useUploadPhotos();
  const setImageAsMainMutation = useSetImageAsMain();
  const deleteImageMutation = useDeleteImage();
  const [photos, setPhotos] = useState<PhotoData[]>([]);
  const [pendingUploads, setPendingUploads] = useState<Set<string>>(new Set());

  // Get the current draft profile
  const draftProfile = profiles.data?.find((profile) => profile.isDraft);

  // Memoize the images array to prevent unnecessary re-renders
  const draftImages = useMemo(() => {
    if (!draftProfile?.images?.length) return null;
    return draftProfile.images.map((image) => ({
      url: image.originalKey,
      isObjectURL: false,
      uuid: image.uuid,
      isMain: image.isMain,
    }));
  }, [draftProfile?.images]);

  // Sync local state with draft profile data when it becomes available
  useEffect(() => {
    if (draftImages) {
      setPhotos(draftImages);
    } else {
      // If no images in draft profile, start with empty array
      setPhotos([]);
    }
  }, [draftImages]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectURLsRef = useRef<string[]>([]);

  const isValid = photos.length >= 1;
  const maxPhotos = 10;
  const isUploading =
    uploadPhotosMutation.isPending ||
    setImageAsMainMutation.isPending ||
    deleteImageMutation.isPending;

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

        // Add photo to state immediately for preview with a temporary ID
        const tempId = `temp-${Date.now()}-${Math.random()}`;
        const newPhoto: PhotoData = {
          url: blobUrl,
          file,
          isObjectURL: true,
          uuid: tempId, // Temporary ID for React key
        };
        setPhotos((prev) => [...prev, newPhoto]);
        setPendingUploads((prev) => new Set(prev).add(tempId));

        // Upload the image immediately
        if (draftProfile) {
          try {
            await uploadPhotosMutation.mutateAsync({
              profileId: draftProfile._id,
              photos: [file],
            });
            // The profiles will be refreshed automatically via query invalidation
            // and the useEffect above will update the photos with fresh data
            setPendingUploads((prev) => {
              const newSet = new Set(prev);
              newSet.delete(tempId);
              return newSet;
            });
          } catch (error) {
            console.error("Failed to upload photo:", error);
            // Remove the photo from state if upload failed
            setPhotos((prev) => prev.filter((p) => p.uuid !== tempId));
            URL.revokeObjectURL(blobUrl);
            objectURLsRef.current = objectURLsRef.current.filter(
              (url) => url !== blobUrl
            );
            setPendingUploads((prev) => {
              const newSet = new Set(prev);
              newSet.delete(tempId);
              return newSet;
            });

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

  const removePhoto = async (index: number) => {
    const photoToRemove = photos[index];

    // If it's a temporary image (not yet uploaded to server), just remove from local state
    if (photoToRemove.isObjectURL) {
      setPhotos((prev) => {
        if (photoToRemove.url) {
          URL.revokeObjectURL(photoToRemove.url);
          objectURLsRef.current = objectURLsRef.current.filter(
            (url) => url !== photoToRemove.url
          );
        }
        return prev.filter((_, i) => i !== index);
      });
      return;
    }

    // If it's a server-side image, make DELETE request
    if (photoToRemove.uuid && draftProfile) {
      try {
        await deleteImageMutation.mutateAsync({
          profileId: draftProfile._id,
          imageUuid: photoToRemove.uuid,
        });
        // The profiles will be refreshed automatically via query invalidation
        // and the useEffect above will update the photos with fresh data
      } catch (error) {
        console.error("Failed to delete image:", error);
        // Show error message
        const telegramWebApp = (window as any).Telegram?.WebApp;
        if (telegramWebApp?.showAlert) {
          telegramWebApp.showAlert(
            "Ошибка при удалении фотографии. Пожалуйста, попробуйте еще раз."
          );
        }
      }
    }
  };

  const handleSetAsMain = async (photo: PhotoData) => {
    if (!draftProfile || !photo.uuid || photo.isMain === true) return;

    try {
      await setImageAsMainMutation.mutateAsync({
        profileId: draftProfile._id,
        imageUuid: photo.uuid,
      });
      // The profiles will be refreshed automatically via query invalidation
      // and the useEffect above will update the photos with fresh data
    } catch (error) {
      console.error("Failed to set image as main:", error);
      // Show error message
      const telegramWebApp = (window as any).Telegram?.WebApp;
      if (telegramWebApp?.showAlert) {
        telegramWebApp.showAlert(
          "Ошибка при установке главной фотографии. Пожалуйста, попробуйте еще раз."
        );
      }
    }
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
            Добавьте от 1 до {maxPhotos} фотографий. Нажмите на фотографию,
            чтобы сделать её главной.
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
            // Android bug: if the element has both accept="image/*" and the multiple attributes, WebView never fires the change event
            // multiple
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleFileSelect}
          />

          {photos.length < maxPhotos && (
            <Cell onClick={handleAddPhoto} interactiveAnimation="opacity">
              📷 Добавить фото
            </Cell>
          )}

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
                      photo.isMain === true
                        ? "2px solid var(--tg-theme-button-color)"
                        : "1px solid var(--tg-theme-section-bg-color)",
                    opacity: pendingUploads.has(photo.uuid || "") ? 0.6 : 1,
                    cursor: photo.isMain === true ? "default" : "pointer",
                  }}
                  onClick={() => handleSetAsMain(photo)}
                />
                {pendingUploads.has(photo.uuid || "") && (
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      background: "rgba(0,0,0,0.7)",
                      color: "white",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      fontSize: "12px",
                    }}
                  >
                    Загрузка...
                  </div>
                )}
                {photo.isMain === true && (
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
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent triggering the image click
                    removePhoto(index);
                  }}
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
