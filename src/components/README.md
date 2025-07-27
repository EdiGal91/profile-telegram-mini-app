# Step Navigation Components

This directory contains reusable components for handling step-by-step navigation in the profile creation process.

## Components

### StepNavigation

A reusable navigation component that provides Previous/Next/Complete buttons with consistent styling and behavior.

#### Props

- `currentStep: number` - Current step number (1-based)
- `totalSteps: number` - Total number of steps
- `isValid: boolean` - Whether the current step is valid
- `isLoading?: boolean` - Whether the step is in loading state
- `onPrevious?: () => void` - Previous button click handler
- `onNext?: () => void` - Next button click handler
- `onComplete?: () => void` - Complete button click handler (for last step)
- `previousText?: string` - Custom text for previous button (default: "Назад")
- `nextText?: string` - Custom text for next button (auto-generated if not provided)
- `completeText?: string` - Custom text for complete button (default: "Сохранить анкету")
- `loadingText?: string` - Custom text for loading state (default: "Сохранение...")
- `showPrevious?: boolean` - Whether to show previous button (default: true)
- `showNext?: boolean` - Whether to show next button (default: true)
- `showComplete?: boolean` - Whether to show complete button (default: false)

#### Features

- Sticky positioning at bottom of screen
- Automatic button text generation based on step names
- Loading states with spinner
- Consistent styling with Telegram UI
- Proper spacing to prevent content overlap

### StepLayout

A layout wrapper that provides proper scrolling and sticky navigation for step content.

#### Props

All props from StepNavigation plus:

- `children: React.ReactNode` - The step content to render

#### Features

- Full viewport height layout
- Scrollable content area with proper padding
- Sticky navigation at bottom
- Prevents content from being hidden behind navigation

## Usage Example

```tsx
import { StepLayout } from "@/components/StepLayout";

export function MyStep() {
  const [isValid, setIsValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleNext = async () => {
    setIsLoading(true);
    // Save data and navigate to next step
    setIsLoading(false);
  };

  const handlePrevious = () => {
    // Navigate to previous step
  };

  return (
    <StepLayout
      currentStep={1}
      totalSteps={6}
      isValid={isValid}
      isLoading={isLoading}
      onPrevious={handlePrevious}
      onNext={handleNext}
    >
      <List>
        <Section header="My Step Content">
          {/* Your step content here */}
        </Section>
      </List>
    </StepLayout>
  );
}
```

## Migration Guide

To migrate existing steps to use the new components:

1. Import `StepLayout` from `@/components/StepLayout`
2. Remove the old button imports (`Button`, `Spinner`)
3. Wrap your step content with `StepLayout`
4. Remove the old button sections from your JSX
5. Pass the navigation handlers and state to `StepLayout`

The components handle all the button logic, styling, and positioning automatically.
