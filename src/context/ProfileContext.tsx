import {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useEffect,
} from "react";
import { ProfileData, ProfileState } from "@/types/profile";

type ProfileAction =
  | { type: "SET_STEP"; step: number }
  | { type: "SET_DATA"; data: Partial<ProfileData> }
  | { type: "COMPLETE_STEP"; step: number }
  | { type: "SET_LOADING"; loading: boolean }
  | { type: "LOAD_SAVED_DATA"; data: ProfileState };

const STORAGE_KEY = "profile_draft";

const initialState: ProfileState = {
  data: {},
  currentStep: 1,
  completedSteps: new Set(),
  isLoading: false,
};

function profileReducer(
  state: ProfileState,
  action: ProfileAction
): ProfileState {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, currentStep: action.step };
    case "SET_DATA":
      return { ...state, data: { ...state.data, ...action.data } };
    case "COMPLETE_STEP":
      return {
        ...state,
        completedSteps: new Set([...state.completedSteps, action.step]),
      };
    case "SET_LOADING":
      return { ...state, isLoading: action.loading };
    case "LOAD_SAVED_DATA":
      return {
        ...initialState,
        ...action.data,
        completedSteps: new Set(action.data.completedSteps || []),
        data: action.data.data || {},
      };
    default:
      return state;
  }
}

interface ProfileContextType {
  state: ProfileState;
  setStep: (step: number) => void;
  updateData: (data: Partial<ProfileData>) => void;
  completeStep: (step: number) => void;
  saveProgress: () => void;
  canGoToStep: (step: number) => boolean;
  isStepValid: (step: number) => boolean;
}

const ProfileContext = createContext<ProfileContextType | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  // Initialize with saved data
  const [state, dispatch] = useReducer(
    profileReducer,
    initialState,
    (initial) => {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          return {
            ...initial,
            ...parsed,
            completedSteps: new Set(parsed.completedSteps || []),
            data: parsed.data || {},
          };
        } catch (error) {
          console.error("Failed to load saved profile data:", error);
        }
      }
      return initial;
    }
  );

  // Save data whenever state changes (but not on initial load)
  useEffect(() => {
    const dataToSave = {
      ...state,
      completedSteps: Array.from(state.completedSteps),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  }, [state]);

  const setStep = (step: number) => {
    dispatch({ type: "SET_STEP", step });
  };

  const updateData = (data: Partial<ProfileData>) => {
    dispatch({ type: "SET_DATA", data });
  };

  const completeStep = (step: number) => {
    dispatch({ type: "COMPLETE_STEP", step });
  };

  const saveProgress = () => {
    // Mock API call - replace with real API when ready
    dispatch({ type: "SET_LOADING", loading: true });
    setTimeout(() => {
      dispatch({ type: "SET_LOADING", loading: false });
      console.log("Profile saved:", state.data);
    }, 1000);
  };

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1: // Basic Info
        return !!(
          state.data.name?.trim() &&
          state.data.description?.trim() &&
          state.data.name.length >= 2 &&
          state.data.description.length >= 10
        );
      case 2: // Location
        return !!(
          state.data.location?.country &&
          state.data.location?.city &&
          state.data.clientCountries?.length
        );
      case 3: // Services
        return !!state.data.servicesList?.length;
      case 4: // Photos
        return !!state.data.photos?.length;
      case 5: // Contact
        return !!(
          state.data.contactInfo?.phone || state.data.contactInfo?.telegram
        ); // Email removed, telegram auto-collected
      case 6: // Pricing
        return true; // Pricing is optional
      default:
        return false;
    }
  };

  const canGoToStep = (step: number) => {
    if (step === 1) return true;

    // Can't go forward if current step is invalid
    if (step > state.currentStep) {
      if (!isStepValid(state.currentStep)) {
        return false;
      }

      // Check that all steps between current and target are valid
      for (let i = state.currentStep + 1; i < step; i++) {
        if (!isStepValid(i)) {
          return false;
        }
      }
    }

    // Check if previous steps are completed or step is already accessible
    return state.completedSteps.has(step - 1) || state.completedSteps.has(step);
  };

  return (
    <ProfileContext.Provider
      value={{
        state,
        setStep,
        updateData,
        completeStep,
        saveProgress,
        canGoToStep,
        isStepValid,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile must be used within ProfileProvider");
  }
  return context;
}
