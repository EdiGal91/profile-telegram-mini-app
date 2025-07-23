import { Section, Button, Text } from "@telegram-apps/telegram-ui";
import { useProfile } from "@/context/ProfileContext";
import { PROFILE_STEPS } from "@/types/profile";

export function ProfileStepper() {
  const { state, setStep, canGoToStep } = useProfile();

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
          {PROFILE_STEPS.map((step) => (
            <Button
              key={step.id}
              size="s"
              mode={state.currentStep === step.id ? "filled" : "outline"}
              disabled={!canGoToStep(step.id)}
              onClick={() => canGoToStep(step.id) && setStep(step.id)}
            >
              {step.id}
            </Button>
          ))}
        </div>
      </div>
    </Section>
  );
}
