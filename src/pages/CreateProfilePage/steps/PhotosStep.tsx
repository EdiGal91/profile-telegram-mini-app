import { useState, useEffect, useRef } from "react";
import { Section, Button, List, Cell, Text } from "@telegram-apps/telegram-ui";
import { useProfile } from "@/context/ProfileContext";

export function PhotosStep() {
  const { state, updateData, completeStep, setStep } = useProfile();
  const [photos, setPhotos] = useState<string[]>(state.data.photos || []);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isValid = photos.length >= 1;
  const maxPhotos = 10;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    files.forEach((file) => {
      if (photos.length < maxPhotos && file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setPhotos((prev) => [...prev, result]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddPhoto = () => {
    fileInputRef.current?.click();
  };

  const handleNext = () => {
    if (isValid) {
      updateData({ photos });
      completeStep(4);
      setStep(5);
    }
  };

  const handlePrevious = () => {
    updateData({ photos });
    setStep(3);
  };

  const handleSave = () => {
    updateData({ photos });
    if (isValid) {
      completeStep(4);
    }
  };

  useEffect(() => {
    handleSave();
  }, [photos]);

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
          accept="image/*"
          multiple
          style={{ display: "none" }}
          onChange={handleFileSelect}
        />

        {photos.length < maxPhotos && (
          <Cell
            onClick={handleAddPhoto}
            interactiveAnimation="opacity"
            subtitle={`Добавлено: ${photos.length}/${maxPhotos}`}
          >
            📷 Добавить фотографии
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
                src={photo}
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
                onClick={() => handleRemovePhoto(index)}
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
