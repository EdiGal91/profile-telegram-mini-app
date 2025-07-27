import { Button, Spinner } from "@telegram-apps/telegram-ui";

interface StepNavigationProps {
  currentStep: number;
  totalSteps: number;
  isValid: boolean;
  isLoading?: boolean;
  onPrevious?: () => void;
  onNext?: () => void;
  onComplete?: () => void;
  previousText?: string;
  nextText?: string;
  completeText?: string;
  loadingText?: string;
  showPrevious?: boolean;
  showNext?: boolean;
  showComplete?: boolean;
}

export function StepNavigation({
  currentStep,
  totalSteps,
  isValid,
  isLoading = false,
  onPrevious,
  onNext,
  onComplete,
  previousText = "Назад",
  nextText,
  completeText = "Сохранить анкету",
  loadingText = "Сохранение...",
  showPrevious = true,
  showNext = true,
  showComplete = false,
}: StepNavigationProps) {
  const isLastStep = currentStep === totalSteps;

  // Auto-generate next text if not provided
  const getNextText = () => {
    if (nextText) return nextText;

    const stepNames = [
      "Основная информация",
      "Местоположение",
      "Услуги",
      "Фотографии",
      "Контакты",
      "Цены",
    ];

    if (isLastStep) return completeText;
    return `Далее: ${stepNames[currentStep] || `Шаг ${currentStep + 1}`}`;
  };

  const handleNextClick = () => {
    if (isLastStep && onComplete) {
      onComplete();
    } else if (onNext) {
      onNext();
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "var(--tg-theme-bg-color)",
        borderTop: "1px solid var(--tg-theme-section-bg-color)",
        padding: "16px",
        zIndex: 100,
      }}
    >
      <div style={{ display: "flex", gap: "12px" }}>
        {showPrevious && onPrevious && (
          <Button
            size="l"
            mode="outline"
            stretched
            onClick={onPrevious}
            disabled={isLoading}
          >
            {previousText}
          </Button>
        )}

        {(showNext || showComplete) && (
          <Button
            size="l"
            stretched
            disabled={!isValid || isLoading}
            onClick={handleNextClick}
          >
            {isLoading ? (
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <Spinner size="s" />
                <span>{loadingText}</span>
              </div>
            ) : (
              getNextText()
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
