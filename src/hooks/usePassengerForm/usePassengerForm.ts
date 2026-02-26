"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useState } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import {
  FullPassenger,
  fullPassengerSchema,
  MultiPassenger,
  multiPassengerSchema,
  PassengerStepKey,
  passengerStepSchemas,
} from "../../components/ui/forms/schemas/passenger.schema";

interface UsePassengerFormOptions {
  mode: "single" | "multi";
  initialData?: Partial<FullPassenger | MultiPassenger>;
  onStepChange?: (step: PassengerStepKey) => void;
  onSubmit?: (data: FullPassenger | MultiPassenger) => void;
  autoSave?: boolean;
}

export const usePassengerForm = (
  options: UsePassengerFormOptions = { mode: "single" }
) => {
  const {
    mode,
    initialData,
    onStepChange,
    onSubmit,
    autoSave = false,
  } = options;

  // Current step state
  const [currentStep, setCurrentStep] =
    useState<PassengerStepKey>("personalInfo");
  const [completedSteps, setCompletedSteps] = useState<Set<PassengerStepKey>>(
    new Set()
  );

  // Form setup
  const schema = mode === "single" ? fullPassengerSchema : multiPassengerSchema;
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialData,
    mode: "onChange",
  }) as UseFormReturn<FullPassenger | MultiPassenger>;

  // Step navigation
  const stepOrder: PassengerStepKey[] = [
    "personalInfo",
    "document",
    "contact",
    "specialRequirements",
  ];

  const getCurrentStepIndex = () => stepOrder.indexOf(currentStep);

  const goToStep = useCallback(
    (step: PassengerStepKey) => {
      setCurrentStep(step);
      onStepChange?.(step);
    },
    [onStepChange]
  );

  // Validation helpers
  const validateCurrentStep = useCallback(async () => {
    const currentStepSchema = passengerStepSchemas[currentStep];
    const currentData = form.getValues();

    try {
      if (mode === "single") {
        const stepData = (currentData as FullPassenger)[currentStep];
        currentStepSchema.parse(stepData);
      }
      return true;
    } catch {
      // Trigger form validation to show errors
      await form.trigger();
      return false;
    }
  }, [currentStep, form, mode]);

  const goToNextStep = useCallback(async () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex < stepOrder.length - 1) {
      // Validate current step before proceeding
      const isValid = await validateCurrentStep();
      if (isValid) {
        const nextStep = stepOrder[currentIndex + 1];
        setCompletedSteps((prev) => new Set([...prev, currentStep]));
        goToStep(nextStep);
      }
    }
  }, [
    currentStep,
    goToStep,
    getCurrentStepIndex,
    stepOrder,
    validateCurrentStep,
  ]);

  const goToPreviousStep = useCallback(() => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex > 0) {
      const previousStep = stepOrder[currentIndex - 1];
      goToStep(previousStep);
    }
  }, [goToStep, getCurrentStepIndex, stepOrder]);

  const validateAllSteps = useCallback(async () => {
    try {
      const data = form.getValues();
      schema.parse(data);
      return true;
    } catch {
      return false;
    }
  }, [form, schema]);

  // Form submission
  const handleSubmit = useCallback(
    async (data: FullPassenger | MultiPassenger) => {
      const isValid = await validateAllSteps();
      if (isValid) {
        onSubmit?.(data);
      }
    },
    [onSubmit, validateAllSteps]
  );

  // Auto-save functionality
  const saveProgress = useCallback(() => {
    if (autoSave) {
      const data = form.getValues();
      // Save to localStorage or send to API
      localStorage.setItem("passenger-form-draft", JSON.stringify(data));
    }
  }, [form, autoSave]);

  // Utility functions
  const getStepProgress = () => {
    const totalSteps = stepOrder.length;
    const currentIndex = getCurrentStepIndex();
    return {
      current: currentIndex + 1,
      total: totalSteps,
      percentage: Math.round(((currentIndex + 1) / totalSteps) * 100),
      completedSteps: Array.from(completedSteps),
    };
  };

  const isStepCompleted = (step: PassengerStepKey) => completedSteps.has(step);

  const isStepAccessible = (step: PassengerStepKey) => {
    const stepIndex = stepOrder.indexOf(step);
    const currentIndex = getCurrentStepIndex();
    return stepIndex <= currentIndex || completedSteps.has(step);
  };

  const canGoNext = () => getCurrentStepIndex() < stepOrder.length - 1;
  const canGoPrevious = () => getCurrentStepIndex() > 0;

  // Reset form
  const resetForm = useCallback(() => {
    form.reset();
    setCurrentStep("personalInfo");
    setCompletedSteps(new Set());
    if (autoSave) {
      localStorage.removeItem("passenger-form-draft");
    }
  }, [form, autoSave]);

  return {
    // Form instance
    form,

    // Step management
    currentStep,
    stepOrder,
    goToStep,
    goToNextStep,
    goToPreviousStep,

    // Validation
    validateCurrentStep,
    validateAllSteps,

    // Progress tracking
    getStepProgress,
    isStepCompleted,
    isStepAccessible,
    canGoNext,
    canGoPrevious,

    // Form actions
    handleSubmit: form.handleSubmit(handleSubmit),
    resetForm,
    saveProgress,

    // State
    isValid: form.formState.isValid,
    errors: form.formState.errors,
    isDirty: form.formState.isDirty,
    isSubmitting: form.formState.isSubmitting,
  };
};

// Hook for document validation (passport/ID specific logic)
export const useDocumentValidation = () => {
  const validatePassportNumber = useCallback(
    (passportNumber: string, country: string) => {
      // Add country-specific passport validation logic
      const patterns: Record<string, RegExp> = {
        US: /^[A-Z0-9]{6,9}$/,
        UK: /^[A-Z]{1,2}[0-9]{6,7}$/,
        CA: /^[A-Z]{2}[0-9]{6}$/,
        // Add more countries as needed
      };

      const pattern = patterns[country];
      return pattern
        ? pattern.test(passportNumber)
        : passportNumber.length >= 6;
    },
    []
  );

  const checkPassportExpiry = useCallback(
    (expiryDate: Date, travelDate?: Date) => {
      const sixMonthsFromTravel = travelDate
        ? new Date(travelDate.getTime() + 6 * 30 * 24 * 60 * 60 * 1000)
        : new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000);

      return expiryDate > sixMonthsFromTravel;
    },
    []
  );

  return {
    validatePassportNumber,
    checkPassportExpiry,
  };
};
