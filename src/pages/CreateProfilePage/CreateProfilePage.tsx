import { Page } from "@/components/Page";
import { ProfileProvider, useProfile } from "@/context/ProfileContext";
import { useProfilesContext } from "@/context/ProfilesContext";
import { ProfileStepper } from "./components/ProfileStepper";
import { BasicInfoStep } from "./steps/BasicInfoStep";
import { LocationStep } from "./steps/LocationStep";
import { ServicesStep } from "./steps/ServicesStep";
import { PhotosStep } from "./steps/PhotosStep";
import { ContactStep } from "./steps/ContactStep";
import { PricingStep } from "./steps/PricingStep";
import { useEffect } from "react";

// Component to initialize ProfileContext with draft data
function DraftProfileInitializer() {
  const { profiles } = useProfilesContext();
  const { updateData } = useProfile();

  useEffect(() => {
    const draftProfile = profiles.data?.find((profile) => profile.isDraft);
    if (draftProfile) {
      // Sync all draft data with ProfileContext
      const updates: any = {};

      if (draftProfile.name) updates.name = draftProfile.name;
      if (draftProfile.description)
        updates.description = draftProfile.description;
      if (draftProfile.location) updates.location = draftProfile.location;
      if (draftProfile.clientCountries)
        updates.clientCountries = draftProfile.clientCountries;
      if (draftProfile.servicesList)
        updates.servicesList = draftProfile.servicesList;
      if (draftProfile.photos) updates.photos = draftProfile.photos;
      if (draftProfile.contactInfo)
        updates.contactInfo = draftProfile.contactInfo;
      if (draftProfile.pricing) updates.pricing = draftProfile.pricing;

      if (Object.keys(updates).length > 0) {
        updateData(updates);
      }
    }
  }, [profiles.data, updateData]);

  return null;
}

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
      <DraftProfileInitializer />
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
