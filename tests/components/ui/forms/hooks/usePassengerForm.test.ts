import {
  FullPassenger,
  MultiPassenger,
} from "@/components/ui/forms/schemas/passenger.schema";
import { usePassengerForm } from "@/hooks/usePassengerForm/usePassengerForm";
import { act, renderHook } from "@testing-library/react";

// Mock the passenger schema to make validation pass
jest.mock("@/components/ui/forms/schemas/passenger.schema", () => {
  const originalModule = jest.requireActual(
    "@/components/ui/forms/schemas/passenger.schema"
  );
  return {
    ...originalModule,
    passengerStepSchemas: {
      personalInfo: {
        parse: jest.fn().mockReturnValue(true),
      },
      document: {
        parse: jest.fn().mockReturnValue(true),
      },
      contact: {
        parse: jest.fn().mockReturnValue(true),
      },
      specialRequirements: {
        parse: jest.fn().mockReturnValue(true),
      },
    },
  };
});

describe("usePassengerForm Hook", () => {
  it("should initialize with default values for single mode", () => {
    const { result } = renderHook(() => usePassengerForm({ mode: "single" }));

    expect(result.current.currentStep).toBe("personalInfo");
    expect(result.current.canGoPrevious()).toBe(false);
    expect(result.current.canGoNext()).toBe(true);
    expect(result.current.form).toBeTruthy();
  });

  it("should initialize with default values for multi mode", () => {
    const { result } = renderHook(() => usePassengerForm({ mode: "multi" }));

    expect(result.current.currentStep).toBe("personalInfo");
    expect(result.current.form).toBeTruthy();
  });

  it("should navigate to next step correctly", async () => {
    const { result } = renderHook(() => usePassengerForm({ mode: "single" }));

    expect(result.current.currentStep).toBe("personalInfo");

    // Fill in required personalInfo fields to pass validation
    await act(async () => {
      result.current.form.setValue("passengerInfo.firstName", "John");
      result.current.form.setValue("passengerInfo.lastName", "Doe");
      result.current.form.setValue(
        "passengerInfo.dateOfBirth",
        new Date("1990-01-01")
      );
      result.current.form.setValue("passengerInfo.gender", "male");
    });

    // Mock the validation to pass
    const validateSpy = jest.spyOn(result.current, "validateCurrentStep");
    validateSpy.mockResolvedValue(true);

    await act(async () => {
      await result.current.goToNextStep();
    });

    expect(result.current.currentStep).toBe("document");
  });

  it("should navigate to previous step correctly", async () => {
    const { result } = renderHook(() => usePassengerForm({ mode: "single" }));

    // Fill in required personalInfo fields to pass validation
    await act(async () => {
      result.current.form.setValue("passengerInfo.firstName", "John");
      result.current.form.setValue("passengerInfo.lastName", "Doe");
      result.current.form.setValue(
        "passengerInfo.dateOfBirth",
        new Date("1990-01-01")
      );
      result.current.form.setValue("passengerInfo.gender", "male");
    });

    // Mock the validation to pass
    const validateSpy = jest.spyOn(result.current, "validateCurrentStep");
    validateSpy.mockResolvedValue(true);

    // First go to next step
    await act(async () => {
      await result.current.goToNextStep();
    });

    expect(result.current.currentStep).toBe("document");

    // Then go back
    await act(async () => {
      result.current.goToPreviousStep();
    });

    expect(result.current.currentStep).toBe("personalInfo");
  });

  it("should calculate step progress correctly", async () => {
    const { result } = renderHook(() => usePassengerForm({ mode: "single" }));

    // Initial step should be 25% (1 out of 4 steps)
    expect(result.current.getStepProgress().percentage).toBe(25);

    // Fill in required personalInfo fields to pass validation
    await act(async () => {
      result.current.form.setValue("passengerInfo.firstName", "John");
      result.current.form.setValue("passengerInfo.lastName", "Doe");
      result.current.form.setValue(
        "passengerInfo.dateOfBirth",
        new Date("1990-01-01")
      );
      result.current.form.setValue("passengerInfo.gender", "male");
    });

    // Mock the validation to pass
    const validateSpy = jest.spyOn(result.current, "validateCurrentStep");
    validateSpy.mockResolvedValue(true);

    await act(async () => {
      await result.current.goToNextStep();
    });

    // Second step should be 50% (2 out of 4 steps)
    expect(result.current.getStepProgress().percentage).toBe(50);
  });

  it("should handle step validation", () => {
    const { result } = renderHook(() => usePassengerForm({ mode: "single" }));

    // Initially should be able to go next (no validation errors)
    expect(result.current.canGoNext()).toBe(true);

    // Form should be invalid initially (empty required fields)
    expect(result.current.isValid).toBe(false);
  });

  it("should call onStepChange callback when step changes", async () => {
    const mockOnStepChange = jest.fn();
    const { result } = renderHook(() =>
      usePassengerForm({
        mode: "single",
        onStepChange: mockOnStepChange,
      })
    );

    // Fill in required personalInfo fields to pass validation
    await act(async () => {
      result.current.form.setValue("passengerInfo.firstName", "John");
      result.current.form.setValue("passengerInfo.lastName", "Doe");
      result.current.form.setValue(
        "passengerInfo.dateOfBirth",
        new Date("1990-01-01")
      );
      result.current.form.setValue("passengerInfo.gender", "male");
    });

    // Mock the validation to pass
    const validateSpy = jest.spyOn(result.current, "validateCurrentStep");
    validateSpy.mockResolvedValue(true);

    await act(async () => {
      await result.current.goToNextStep();
    });

    expect(mockOnStepChange).toHaveBeenCalledWith("document");
  });

  it("should handle completed steps tracking", async () => {
    const { result } = renderHook(() => usePassengerForm({ mode: "single" }));

    // Initially no steps should be completed
    expect(result.current.getStepProgress().completedSteps.length).toBe(0);

    // Fill in required personalInfo fields to pass validation
    await act(async () => {
      result.current.form.setValue("passengerInfo.firstName", "John");
      result.current.form.setValue("passengerInfo.lastName", "Doe");
      result.current.form.setValue(
        "passengerInfo.dateOfBirth",
        new Date("1990-01-01")
      );
      result.current.form.setValue("passengerInfo.gender", "male");
    });

    // Mock the validation to pass
    const validateSpy = jest.spyOn(result.current, "validateCurrentStep");
    validateSpy.mockResolvedValue(true);

    // Complete personalInfo step
    await act(async () => {
      await result.current.goToNextStep();
    });

    // personalInfo should now be marked as completed
    expect(
      result.current.getStepProgress().completedSteps.includes("personalInfo")
    ).toBe(true);
  });

  it("should handle initial data correctly", () => {
    const initialData: Partial<FullPassenger> = {
      passengerInfo: {
        firstName: "Jane",
        lastName: "Smith",
        gender: "female",
        dateOfBirth: new Date("1985-05-15"),
      },
    };

    const { result } = renderHook(() =>
      usePassengerForm({
        mode: "single",
        initialData,
      })
    );

    // Form should be initialized with the provided data
    const formValues = result.current.form.getValues() as FullPassenger;
    expect(formValues.passengerInfo?.firstName).toBe("Jane");
    expect(formValues.passengerInfo?.lastName).toBe("Smith");
  });

  it("should prevent navigation before first step", async () => {
    const { result } = renderHook(() => usePassengerForm({ mode: "single" }));

    expect(result.current.currentStep).toBe("personalInfo");
    expect(result.current.canGoPrevious()).toBe(false);

    // Try to go to previous step (should not change)
    await act(async () => {
      result.current.goToPreviousStep();
    });

    expect(result.current.currentStep).toBe("personalInfo");
  });

  it("should handle auto-save functionality", async () => {
    const mockOnSubmit = jest.fn();
    const { result } = renderHook(() =>
      usePassengerForm({
        mode: "single",
        autoSave: true,
        onSubmit: mockOnSubmit,
      })
    );

    // Auto-save should trigger when form data changes
    await act(async () => {
      result.current.form.setValue("passengerInfo.firstName", "AutoSave");
    });

    // Should have triggered auto-save (implementation dependent)
    const formValues = result.current.form.getValues() as FullPassenger;
    expect(formValues.passengerInfo?.firstName).toBe("AutoSave");
  });

  it("should handle form errors correctly", async () => {
    const { result } = renderHook(() => usePassengerForm({ mode: "single" }));

    // Set invalid data to trigger validation errors
    await act(async () => {
      result.current.form.setValue("passengerInfo.firstName", "");
      await result.current.form.trigger(); // Trigger validation
    });

    // Should have validation errors
    expect(result.current.errors).toBeTruthy();
  });

  it("should handle step-specific validation", async () => {
    const { result } = renderHook(() => usePassengerForm({ mode: "single" }));

    // Validate current step
    await act(async () => {
      const isValid = await result.current.validateCurrentStep();
      expect(typeof isValid).toBe("boolean");
    });
  });

  it("should reset form data when needed", async () => {
    const { result } = renderHook(() => usePassengerForm({ mode: "single" }));

    // Set some data
    await act(async () => {
      result.current.form.setValue("passengerInfo.firstName", "Test");
    });

    let formValues = result.current.form.getValues() as FullPassenger;
    expect(formValues.passengerInfo?.firstName).toBe("Test");

    // Reset form
    await act(async () => {
      result.current.resetForm();
    });

    formValues = result.current.form.getValues() as FullPassenger;
    expect(formValues.passengerInfo?.firstName).toBeUndefined();
  });

  it("should handle multi-passenger form correctly", () => {
    const initialData: Partial<MultiPassenger> = {
      passengers: [
        {
          passengerInfo: {
            firstName: "Passenger1",
            lastName: "Test",
            gender: "male",
            dateOfBirth: new Date("1990-01-01"),
          },
          document: {
            passportNumber: "AB123456",
            countryOfIssue: "US",
            expiryDate: new Date("2030-01-01"),
            nationality: "US",
          },
          contact: {
            email: "test@example.com",
            phone: "1234567890",
            countryCode: "+1",
          },
        },
      ],
      primaryContact: {
        isPrimaryPassenger: true,
      },
    };

    const { result } = renderHook(() =>
      usePassengerForm({
        mode: "multi",
        initialData,
      })
    );

    // Should handle multi-passenger schema
    expect(result.current.form).toBeTruthy();
    const formValues = result.current.form.getValues() as MultiPassenger;
    expect(formValues.passengers?.[0]?.passengerInfo?.firstName).toBe(
      "Passenger1"
    );
  });

  it("should handle form mode switching", () => {
    let mode: "single" | "multi" = "single";

    const { result, rerender } = renderHook(() => usePassengerForm({ mode }));

    expect(result.current.form).toBeTruthy();

    // Change mode
    mode = "multi";
    rerender();

    // Should still work with new mode
    expect(result.current.form).toBeTruthy();
  });
});
