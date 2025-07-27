import React from "react";
import { StepNavigation } from "./StepNavigation";

interface StepLayoutProps {
  children: React.ReactNode;
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

export function StepLayout({
  children,
  currentStep,
  totalSteps,
  isValid,
  isLoading = false,
  onPrevious,
  onNext,
  onComplete,
  previousText,
  nextText,
  completeText,
  loadingText,
  showPrevious = true,
  showNext = true,
  showComplete = false,
}: StepLayoutProps) {
  return (
    <div
      style={{
        minHeight: "100vh",
        paddingBottom: "80px", // Add padding to prevent content from being hidden behind fixed nav
      }}
    >
      {/* Content area */}
      <div>{children}</div>

      {/* Fixed navigation at bottom of viewport */}
      <StepNavigation
        currentStep={currentStep}
        totalSteps={totalSteps}
        isValid={isValid}
        isLoading={isLoading}
        onPrevious={onPrevious}
        onNext={onNext}
        onComplete={onComplete}
        previousText={previousText}
        nextText={nextText}
        completeText={completeText}
        loadingText={loadingText}
        showPrevious={showPrevious}
        showNext={showNext}
        showComplete={showComplete}
      />
    </div>
  );
}
