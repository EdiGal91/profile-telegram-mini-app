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
  const [error, setError] = useState<string>("");
  const [debugInfo, setDebugInfo] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectURLsRef = useRef<string[]>([]);

  const isValid = photos.length >= 1;
  const maxPhotos = 10;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setError("");
      setDebugInfo(`File selection started. Current photos: ${photos.length}`);

      const files = Array.from(event.target.files || []);
      setDebugInfo((prev) => prev + ` | Files selected: ${files.length}`);

      if (files.length === 0) {
        setError("No files selected");
        return;
      }

      files.forEach((file, index) => {
        try {
          setDebugInfo(
            (prev) =>
              prev +
              ` | Processing file ${index + 1}: ${file.name}, type: ${
                file.type
              }, size: ${file.size}`
          );

          if (photos.length >= maxPhotos) {
            setError(`Maximum ${maxPhotos} photos allowed`);
            return;
          }

          if (!file.type.startsWith("image/")) {
            setError(`File ${file.name} is not an image. Type: ${file.type}`);
            return;
          }

          // Create object URL for better mobile compatibility
          const objectURL = URL.createObjectURL(file);
          objectURLsRef.current.push(objectURL);
          setDebugInfo(
            (prev) =>
              prev + ` | Object URL created: ${objectURL.substring(0, 50)}...`
          );

          setPhotos((prev) => {
            const newPhotos = [
              ...prev,
              {
                url: objectURL,
                file,
                isObjectURL: true,
              },
            ];
            setDebugInfo(
              (current) =>
                current +
                ` | Photos array updated, new length: ${newPhotos.length}`
            );
            return newPhotos;
          });
        } catch (fileError) {
          setError(`Error processing file ${file.name}: ${fileError}`);
        }
      });

      // Clear the input to allow selecting the same file again
      if (event.target) {
        event.target.value = "";
      }
    } catch (error) {
      setError(`File selection error: ${error}`);
    }
  };

  const handleRemovePhoto = (index: number) => {
    const photoToRemove = photos[index];
    if (photoToRemove?.isObjectURL) {
      URL.revokeObjectURL(photoToRemove.url);
      objectURLsRef.current = objectURLsRef.current.filter(
        (url) => url !== photoToRemove.url
      );
    }
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddPhoto = () => {
    fileInputRef.current?.click();
  };

  const convertPhotosToBase64 = async (
    photoData: PhotoData[]
  ): Promise<string[]> => {
    const promises = photoData.map(async (photo) => {
      if (photo.isObjectURL && photo.file) {
        // Convert to base64 for storage
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(photo.file!);
        });
      }
      return photo.url;
    });
    return Promise.all(promises);
  };

  const handleNext = async () => {
    if (isValid) {
      const photoUrls = await convertPhotosToBase64(photos);
      updateData({ photos: photoUrls });
      completeStep(4);
      setStep(5);
    }
  };

  const handlePrevious = async () => {
    const photoUrls = await convertPhotosToBase64(photos);
    updateData({ photos: photoUrls });
    setStep(3);
  };

  const handleSave = async () => {
    const photoUrls = await convertPhotosToBase64(photos);
    updateData({ photos: photoUrls });
    if (isValid) {
      completeStep(4);
    }
  };

  useEffect(() => {
    handleSave();
  }, [photos]);

  // Cleanup object URLs when component unmounts
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
        {error && (
          <div
            style={{
              padding: "16px",
              background: "var(--tg-theme-destructive-text-color)",
              color: "white",
              margin: "8px",
              borderRadius: "8px",
              fontSize: "14px",
            }}
          >
            ❌ Ошибка: {error}
          </div>
        )}

        {debugInfo && (
          <div
            style={{
              padding: "16px",
              background: "var(--tg-theme-section-bg-color)",
              color: "var(--tg-theme-text-color)",
              margin: "8px",
              borderRadius: "8px",
              fontSize: "12px",
              wordBreak: "break-all",
            }}
          >
            🐛 Debug: {debugInfo}
          </div>
        )}

        <div
          style={{
            padding: "16px",
            background: "var(--tg-theme-hint-color)",
            color: "var(--tg-theme-bg-color)",
            margin: "8px",
            borderRadius: "8px",
            fontSize: "14px",
          }}
        >
          📊 Текущее состояние: {photos.length} фото из {maxPhotos}
          <br />
          🔧 Valid: {isValid ? "✅" : "❌"} | Object URLs:{" "}
          {objectURLsRef.current.length}
          <br />
          {(debugInfo || error) && (
            <Button
              size="s"
              style={{ marginTop: "8px" }}
              onClick={() => {
                setDebugInfo("");
                setError("");
              }}
            >
              Очистить лог
            </Button>
          )}
        </div>

        <Text style={{ padding: "16px", opacity: 0.7 }}>
          Добавьте от 1 до {maxPhotos} фотографий. Первая фотография будет
          основной. Если фото не отображаются в мобильном приложении, они всё
          равно сохранены.
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
          <Cell
            onClick={handleAddPhoto}
            interactiveAnimation="opacity"
            subtitle={`Добавлено: ${photos.length}/${maxPhotos}`}
          >
            📷 Добавить фотографии
          </Cell>
        )}

        <Cell
          onClick={() => {
            // Test: Add a fake photo to see if display works
            setPhotos((prev) => [
              ...prev,
              {
                url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23ff6b6b'/%3E%3Ctext x='50' y='50' text-anchor='middle' dy='0.3em' fill='white'%3EТест%3C/text%3E%3C/svg%3E",
                isObjectURL: false,
              },
            ]);
            setDebugInfo((prev) => prev + " | Test photo added");
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
            <div key={index} style={{ position: "relative" }}>
              <img
                src={photo.url}
                alt={`Photo ${index + 1}`}
                onError={(e) => {
                  // Fallback for mobile compatibility issues
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                  const fallback = document.createElement("div");
                  fallback.style.cssText = `
                    width: 100%; height: 100px; background: var(--tg-theme-section-bg-color);
                    display: flex; align-items: center; justify-content: center;
                    border-radius: 8px; color: var(--tg-theme-hint-color);
                    font-size: 12px;
                  `;
                  fallback.textContent = "📷 Фото";
                  target.parentNode?.insertBefore(fallback, target);
                }}
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
