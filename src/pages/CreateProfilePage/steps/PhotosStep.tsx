import { useState, useEffect, useRef } from "react";
import { Section, Button, List, Cell, Text } from "@telegram-apps/telegram-ui";
import { useProfile } from "@/context/ProfileContext";

interface PhotoData {
  url: string;
  file?: File;
  isObjectURL?: boolean;
}

export function PhotosStep() {
  const { state, updateData, completeStep, setStep } = useProfile();
  const [photos, setPhotos] = useState<PhotoData[]>(() => {
    // Convert existing base64 URLs to photo data format
    return (state.data.photos || []).map((url) => ({
      url,
      isObjectURL: false,
    }));
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectURLsRef = useRef<string[]>([]);

  const isValid = photos.length >= 1;
  const maxPhotos = 10;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const files = Array.from(event.target.files || []);

      if (files.length === 0) return;

      files.forEach((file) => {
        if (photos.length >= maxPhotos) return;
        if (!file.type.startsWith("image/")) return;

        // const reader = new FileReader();
        // reader.onload = (e) => {
        //   const base64 = e.target?.result as string;
        //   setPhotos((prev) => [
        //     ...prev,
        //     {
        //       url: base64,
        //       file,
        //       isObjectURL: false,
        //     },
        //   ]);
        // };
        // reader.readAsDataURL(file);

        const blobUrl = URL.createObjectURL(file);
        objectURLsRef.current.push(blobUrl);
        setPhotos((prev) => [
          ...prev,
          { url: blobUrl, file, isObjectURL: true },
        ]);
      });

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
      updateData({ photos: photos.map((p) => p.url) });
      completeStep(4);
      setStep(5);
    }
  };

  const handlePrevious = () => {
    updateData({ photos: photos.map((p) => p.url) });
    setStep(3);
  };

  // const handleSave = () => {
  //   updateData({ photos: photos.map((p) => p.url) });
  //   if (isValid) {
  //     completeStep(4);
  //   }
  // };

  // useEffect(() => {
  //   handleSave();
  // }, [photos]);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      objectURLsRef.current.forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, []);

  return (
    <List>
      <Section header="Фотографии">
        <Text style={{ padding: "16px", opacity: 0.7 }}>
          Добавьте от 1 до {maxPhotos} фотографий. Первая фотография будет
          основной.
        </Text>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          multiple
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
            <div key={index} style={{ position: "relative" }}>
              <img
                src={photo.url}
                alt={`Photo ${index + 1}`}
                style={{
                  width: "100%",
                  height: "100px",
                  objectFit: "cover",
                  borderRadius: "8px",
                  border:
                    index === 0
                      ? "2px solid var(--tg-theme-button-color)"
                      : "1px solid var(--tg-theme-section-bg-color)",
                }}
              />
              {index === 0 && (
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

      <Section>
        <div style={{ padding: "16px", display: "flex", gap: "12px" }}>
          <Button size="l" mode="outline" stretched onClick={handlePrevious}>
            Назад
          </Button>
          <Button size="l" stretched disabled={!isValid} onClick={handleNext}>
            Далее: Контакты
          </Button>
        </div>
      </Section>
    </List>
  );
}
