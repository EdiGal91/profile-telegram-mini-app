import { Page } from "@/components/Page";
import { ProfileProvider, useProfile } from "@/context/ProfileContext";
import { ProfileStepper } from "./components/ProfileStepper";
import { BasicInfoStep } from "./steps/BasicInfoStep";
import { LocationStep } from "./steps/LocationStep";
import { ServicesStep } from "./steps/ServicesStep";
import { PhotosStep } from "./steps/PhotosStep";
import { ContactStep } from "./steps/ContactStep";
import { PricingStep } from "./steps/PricingStep";

function CreateProfileContent() {
  const { state } = useProfile();

  const renderCurrentStep = () => {
    switch (state.currentStep) {
      case 1:
        return <BasicInfoStep />;
      case 2:
        return <LocationStep />;
      case 3:
        return <ServicesStep />;
      case 4:
        return <PhotosStep />;
      case 5:
        return <ContactStep />;
      case 6:
        return <PricingStep />;
      default:
        return <BasicInfoStep />;
    }
  };

  return (
    <Page>
      <ProfileStepper />
      {renderCurrentStep()}
    </Page>
  );
}

export default function CreateProfilePage() {
  return (
    <ProfileProvider>
      <CreateProfileContent />
    </ProfileProvider>
  );
}
