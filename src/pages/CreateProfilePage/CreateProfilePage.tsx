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
import { ConfirmationStep } from "./steps/ConfirmationStep";
import { useEffect } from "react";

// Component to initialize ProfileContext with draft data
function DraftProfileInitializer() {
  const { profiles } = useProfilesContext();
  const { updateData, state } = useProfile();

  useEffect(() => {
    const draftProfile = profiles.data?.find((profile) => profile.isDraft);
    if (draftProfile) {
      // Sync all draft data with ProfileContext
      const updates: any = {};

      // Only update if the data is different from current state
      if (draftProfile.name && draftProfile.name !== state.data.name) {
        updates.name = draftProfile.name;
      }
      if (
        draftProfile.description &&
        draftProfile.description !== state.data.description
      ) {
        updates.description = draftProfile.description;
      }
      if (
        draftProfile.location &&
        JSON.stringify(draftProfile.location) !==
          JSON.stringify(state.data.location)
      ) {
        updates.location = draftProfile.location;
      }
      if (
        draftProfile.clientCountries &&
        JSON.stringify(draftProfile.clientCountries) !==
          JSON.stringify(state.data.clientCountries)
      ) {
        updates.clientCountries = draftProfile.clientCountries;
      }
      if (
        draftProfile.servicesList &&
        JSON.stringify(draftProfile.servicesList) !==
          JSON.stringify(state.data.servicesList)
      ) {
        updates.servicesList = draftProfile.servicesList;
      }
      if (
        draftProfile.photos &&
        JSON.stringify(draftProfile.photos) !==
          JSON.stringify(state.data.photos)
      ) {
        updates.photos = draftProfile.photos;
      }
      if (
        draftProfile.contactInfo &&
        JSON.stringify(draftProfile.contactInfo) !==
          JSON.stringify(state.data.contactInfo)
      ) {
        updates.contactInfo = draftProfile.contactInfo;
      }
      // Handle pricing data from backend format
      if (draftProfile.priceCurrency && draftProfile.pricingSlots) {
        // Convert backend pricing format to frontend format
        const rates: { [key: string]: { incall?: number; outcall?: number } } =
          {};
        draftProfile.pricingSlots.forEach((slot) => {
          rates[slot.slot] = {
            incall: slot.incall,
            outcall: slot.outcall,
          };
        });

        const backendPricing = {
          currency: draftProfile.priceCurrency,
          rates,
        };

        if (
          JSON.stringify(backendPricing) !== JSON.stringify(state.data.pricing)
        ) {
          updates.pricing = backendPricing;
        }
      }

      if (Object.keys(updates).length > 0) {
        updateData(updates);
      }
    }
  }, [profiles.data, state.data]); // Added state.data to dependencies for comparison

  return null;
}

function CreateProfileContent() {
  const { state } = useProfile();

  // Scroll to top whenever step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [state.currentStep]);

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
      case 7:
        return <ConfirmationStep />;
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
