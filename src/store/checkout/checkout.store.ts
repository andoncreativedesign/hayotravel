import { create } from "zustand";

export interface PassengerData {
  passengerInfo?: {
    title?: "mr" | "mrs" | "ms" | "dr";
    firstName?: string;
    middleName?: string;
    lastName?: string;
    dateOfBirth?: string;
    gender?: "male" | "female" | "other";
    nationality?: string;
  };
  contact?: {
    email?: string;
    phone?: string;
    countryCode?: string;
  };
  document?: {
    type?: string;
    number?: string;
    issueCountry?: string;
    expiryDate?: string;
  };
  useProfileInfo?: boolean; // Flag for "Use my profile information" toggle
}

export interface CheckoutFormData {
  passengers?: PassengerData[];
  // Legacy single passenger support for backward compatibility
  passengerInfo?: {
    title?: "mr" | "mrs" | "ms" | "dr";
    firstName?: string;
    middleName?: string;
    lastName?: string;
    dateOfBirth?: string;
    gender?: "male" | "female" | "other";
    nationality?: string;
  };
  contact?: {
    email?: string;
    phone?: string;
    countryCode?: string;
  };
  document?: {
    type?: string;
    number?: string;
    issueCountry?: string;
    expiryDate?: string;
  };
}

export type CheckoutState = {
  currentStep: number;
  isFormValid: boolean;
  formData: CheckoutFormData;
  completedSteps: Set<number>;
  itineraryId: string | null;
  isBooking: boolean;
  bookingError: string | null;
  bookingSuccess: boolean;
  showSuccessModal: boolean;
};

export type CheckoutActions = {
  setCurrentStep: (step: number) => void;
  setFormValid: (valid: boolean) => void;
  setFormData: (data: CheckoutFormData) => void;
  updateFormData: (data: Partial<CheckoutFormData>) => void;
  markStepCompleted: (step: number) => void;
  markStepIncomplete: (step: number) => void;
  setItineraryId: (itineraryId: string) => void;
  resetCheckout: () => void;

  // Booking actions
  setBookingState: (isBooking: boolean) => void;
  setBookingError: (error: string | null) => void;
  setBookingSuccess: (success: boolean) => void;
  setShowSuccessModal: (show: boolean) => void;

  // localStorage persistence methods
  saveProgress: () => void;
  loadProgress: (itineraryId: string) => void;
  clearProgress: (itineraryId?: string) => void;
};

export const defaultCheckoutState: CheckoutState = {
  currentStep: 1,
  isFormValid: false,
  formData: {},
  completedSteps: new Set([0]), // Trip Review is step 0 and starts completed
  itineraryId: null,
  isBooking: false,
  bookingError: null,
  bookingSuccess: false,
  showSuccessModal: false,
};

export type CheckoutStore = CheckoutState & CheckoutActions;

const STORAGE_KEY_PREFIX = "hayo-checkout-progress";

const getStorageKey = (itineraryId: string) =>
  `${STORAGE_KEY_PREFIX}-${itineraryId}`;

const saveToLocalStorage = (itineraryId: string, data: CheckoutState) => {
  try {
    const storageData = {
      currentStep: data.currentStep,
      isFormValid: data.isFormValid,
      formData: data.formData,
      completedSteps: Array.from(data.completedSteps),
      timestamp: Date.now(),
    };
    localStorage.setItem(
      getStorageKey(itineraryId),
      JSON.stringify(storageData)
    );
  } catch (error) {
    console.error("Failed to save checkout progress to localStorage:", error);
  }
};

const loadFromLocalStorage = (
  itineraryId: string
): Partial<CheckoutState> | null => {
  try {
    const stored = localStorage.getItem(getStorageKey(itineraryId));
    if (!stored) return null;

    const data = JSON.parse(stored);

    // Optional: Add timestamp validation (e.g., expire after 24 hours)
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    if (data.timestamp && Date.now() - data.timestamp > maxAge) {
      localStorage.removeItem(getStorageKey(itineraryId));
      return null;
    }

    return {
      currentStep: data.currentStep,
      isFormValid: data.isFormValid,
      formData: data.formData || {},
      completedSteps: new Set(data.completedSteps || [0]),
    };
  } catch (error) {
    console.error("Failed to load checkout progress from localStorage:", error);
    return null;
  }
};

export const useCheckoutStore = create<CheckoutStore>()((set, get) => ({
  ...defaultCheckoutState,

  setCurrentStep: (step: number) => {
    set({ currentStep: step });
    get().saveProgress();
  },

  setFormValid: (valid: boolean) => {
    set({ isFormValid: valid });
    get().saveProgress();
  },

  setFormData: (data: CheckoutFormData) => {
    set({ formData: data });
    get().saveProgress();
  },

  updateFormData: (data: Partial<CheckoutFormData>) => {
    set((state) => ({
      formData: { ...state.formData, ...data },
    }));
    get().saveProgress();
  },

  markStepCompleted: (step: number) => {
    set((state) => ({
      completedSteps: new Set([...state.completedSteps, step]),
    }));
    get().saveProgress();
  },

  markStepIncomplete: (step: number) => {
    set((state) => {
      const newCompletedSteps = new Set(state.completedSteps);
      newCompletedSteps.delete(step);
      return { completedSteps: newCompletedSteps };
    });
    get().saveProgress();
  },

  setItineraryId: (itineraryId: string) => {
    set({ itineraryId });
    // Load existing progress for this itinerary
    get().loadProgress(itineraryId);
  },

  resetCheckout: () => {
    set(defaultCheckoutState);
    const { itineraryId } = get();
    if (itineraryId) {
      get().clearProgress(itineraryId);
    }
  },

  saveProgress: () => {
    const state = get();
    if (state.itineraryId) {
      saveToLocalStorage(state.itineraryId, state);
    }
  },

  loadProgress: (itineraryId: string) => {
    const savedState = loadFromLocalStorage(itineraryId);
    if (savedState) {
      set((state) => ({
        ...state,
        ...savedState,
        itineraryId,
      }));
    } else {
      // If no saved state, reset to default but keep the itinerary ID
      set({
        ...defaultCheckoutState,
        itineraryId,
      });
    }
  },

  clearProgress: (itineraryId?: string) => {
    const targetItineraryId = itineraryId || get().itineraryId;
    if (targetItineraryId) {
      try {
        localStorage.removeItem(getStorageKey(targetItineraryId));
      } catch (error) {
        console.error(
          "Failed to clear checkout progress from localStorage:",
          error
        );
      }
    }
  },

  setBookingState: (isBooking: boolean) => {
    set({ isBooking });
  },

  setBookingError: (error: string | null) => {
    set({ bookingError: error });
  },

  setBookingSuccess: (success: boolean) => {
    set({ bookingSuccess: success });
  },

  setShowSuccessModal: (show: boolean) => {
    set({ showSuccessModal: show });
  },
}));

// Selector for getting step completion status
export const getStepStatus = (
  completedSteps: Set<number>,
  currentStep: number,
  step: number
) => {
  return {
    completed: completedSteps.has(step),
    current: currentStep === step,
    accessible: step <= currentStep || completedSteps.has(step),
  };
};
