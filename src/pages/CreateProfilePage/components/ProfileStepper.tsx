import React from "react";
import { Section, Button, Text } from "@telegram-apps/telegram-ui";
import { useProfile } from "@/context/ProfileContext";
import { PROFILE_STEPS } from "@/types/profile";

export function ProfileStepper() {
  const { state, setStep, canGoToStep, isStepValid } = useProfile();

  return (
    <Section header="Создание анкеты">
      <div style={{ padding: "12px 16px" }}>
        <Text weight="2">
          Шаг {state.currentStep} из {PROFILE_STEPS.length}:{" "}
          {PROFILE_STEPS[state.currentStep - 1]?.title}
        </Text>
        {/* <Text style={{ marginTop: "4px", opacity: 0.7 }}>
          {PROFILE_STEPS[state.currentStep - 1]?.description}
        </Text> */}

        {/* Progress bar */}
        <div
          style={{
            marginTop: "12px",
            background: "var(--tg-theme-section-bg-color)",
            borderRadius: "6px",
            height: "6px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              background: "var(--tg-theme-button-color)",
              height: "100%",
              width: `${(state.currentStep / PROFILE_STEPS.length) * 100}%`,
              transition: "width 0.3s ease",
            }}
          />
        </div>

        {/* Step navigation */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            marginTop: "12px",
            flexWrap: "wrap",
          }}
        >
          {PROFILE_STEPS.map((step) => {
            const isCurrent = state.currentStep === step.id;
            const isCompleted = state.completedSteps.has(step.id);
            const isValid = isStepValid(step.id);
            const canNavigate = canGoToStep(step.id);

            // Determine styling based on state
            let buttonStyle: React.CSSProperties = {
              opacity: !canNavigate ? 0.4 : 1,
            };

            let mode: "filled" | "outline" | "plain" = "outline";
            let content = step.id.toString();

            if (isCurrent) {
              // Active step - blue background
              mode = "filled";
              buttonStyle = {
                ...buttonStyle,
                backgroundColor: "var(--tg-theme-button-color)",
                color: "var(--tg-theme-button-text-color)",
                border: "none",
              };
            } else if (isCompleted && isValid) {
              // Completed step - green with checkmark
              mode = "filled";
              content = "✓";
              buttonStyle = {
                ...buttonStyle,
                backgroundColor: "#4CAF50",
                color: "white",
                border: "none",
                fontWeight: "bold",
              };
            }

            return (
              <Button
                key={step.id}
                size="s"
                mode={mode}
                disabled={!canNavigate}
                onClick={() => canNavigate && setStep(step.id)}
                style={buttonStyle}
              >
                {content}
              </Button>
            );
          })}

          {/* Clear data button */}
          <Button
            size="s"
            mode="outline"
            onClick={() => {
              if (confirm("Вы уверены? Все данные анкеты будут удалены.")) {
                localStorage.removeItem("profile_draft");
                window.location.reload();
              }
            }}
            style={{
              marginLeft: "auto",
              backgroundColor: "var(--tg-theme-destructive-text-color)",
              color: "white",
              border: "none",
            }}
          >
            🗑️
          </Button>
        </div>
      </div>
    </Section>
  );
}
