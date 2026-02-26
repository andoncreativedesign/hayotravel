/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import CheckoutDevTool from "@/components/dev/CheckoutDevTool/CheckoutDevTool";
import PaymentButton from "@/components/ui/PaymentButton/PaymentButton";
import type { PassengerData } from "@/store/checkout/checkout.store";
import { useCheckoutStore } from "@/store/checkout/checkout.store";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "antd";
import React from "react";
import { useForm } from "react-hook-form";
import getFormData from "../../services/getFormData";
import setFormData from "../../services/setFormData";
import PassengerFormCard from "../PassengerFormCard/PassengerFormCard";
import ValidationMessage from "../ValidationMessage";
import styles from "./EnhancedTravelerForm.module.scss";
import { FormPassengerFields, simplePassengerSchema } from "./utils/formSchema";

export interface EnhancedTravelerFormRef {
  getFormData: () => unknown;
}

interface EnhancedTravelerFormProps {
  totalPassengers: number;
  nextStep: () => void;
  prevStep: () => void;
  currentStep: number;
  checkoutId: string;
}

const getDefaultValues = (totalPassengers: number) => ({
  passengers: Array(totalPassengers)
    .fill(null)
    .map(() => ({
      passengerInfo: {
        firstName: "",
        lastName: "",
        dateOfBirth: undefined,
        gender: "male" as const,
        title: "mr" as const,
      },
      document: {
        passportNumber: "",
        countryOfIssue: "",
        expiryDate: undefined,
        nationality: "",
      },
      contact: {
        email: "",
        phone: "",
        countryCode: "",
      },
    })),
});

const EnhancedTravelerForm = ({
  totalPassengers,
  nextStep,
  prevStep,
  currentStep,
  checkoutId,
}: EnhancedTravelerFormProps) => {
  const previousFormData = getFormData(checkoutId);
  const { setFormData: setCheckoutFormData } = useCheckoutStore();

  // Load data from sessionStorage with specific key format
  const loadSessionStorageData = React.useCallback(() => {
    try {
      const sessionKey = `checkout-form-data-${checkoutId}`;
      const sessionData = sessionStorage.getItem(sessionKey);

      if (sessionData) {
        const parsedData = JSON.parse(sessionData);
        console.log("📦 Loaded data from sessionStorage:", parsedData);

        // Transform the data to match our form structure
        if (parsedData.form && parsedData.form.passengers) {
          const transformedData = {
            passengers: parsedData.form.passengers.map((passenger: any) => ({
              passengerInfo: {
                ...passenger.passengerInfo,
                // Convert date strings to Date objects
                dateOfBirth: passenger.passengerInfo.dateOfBirth
                  ? new Date(passenger.passengerInfo.dateOfBirth)
                  : undefined,
              },
              document: {
                ...passenger.document,
                // Convert date strings to Date objects
                expiryDate: passenger.document.expiryDate
                  ? new Date(passenger.document.expiryDate)
                  : undefined,
              },
              contact: {
                ...passenger.contact,
              },
            })),
          };

          console.log("🔄 Transformed sessionStorage data:", transformedData);
          return transformedData;
        }
      }
    } catch (error) {
      console.warn("Could not load data from sessionStorage:", error);
    }
    return null;
  }, [checkoutId]);

  // TODO: Review this logic til line 80, seems questionable
  // Check for step conflict - if saved data is from a different step, ignore it
  const shouldUseSavedData =
    previousFormData.currentStep === undefined ||
    previousFormData.currentStep === currentStep;
  if (!shouldUseSavedData) {
    // Clear the conflicting saved data to prevent future issues
    try {
      localStorage.removeItem(`form-data-${checkoutId}`);
    } catch (error) {
      console.warn("Could not clear conflicting saved data:", error);
    }
  }

  const defaultValues = React.useMemo(() => {
    return getDefaultValues(totalPassengers);
  }, [totalPassengers]);

  const formDefaultValues = React.useMemo(() => {
    // First try to load from sessionStorage with the specific key
    const sessionStorageData = loadSessionStorageData();

    if (sessionStorageData) {
      console.log("✅ Using sessionStorage data for form initialization");
      return sessionStorageData;
    }

    // Fallback to previous logic
    return shouldUseSavedData
      ? previousFormData.form || defaultValues
      : defaultValues;
  }, [
    shouldUseSavedData,
    previousFormData.form,
    defaultValues,
    loadSessionStorageData,
  ]);

  const form = useForm<FormPassengerFields>({
    resolver: zodResolver(simplePassengerSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: formDefaultValues,
  });

  // Transform form data to checkout store format
  const transformFormDataToCheckoutFormat = (
    formData: FormPassengerFields
  ): PassengerData[] => {
    return formData.passengers.map((passenger) => {
      const countryCode = passenger.contact.countryCode || "+1";
      const phoneNumber = passenger.contact.phone || "";

      // Smart phone number combination to avoid duplication
      let fullPhoneNumber: string;

      // Extract numeric part of country code (e.g., +351 -> 351)
      const countryCodeNumbers = countryCode.replace(/^\+/, "");

      // Check if phone number already starts with the country code
      if (phoneNumber.startsWith(countryCodeNumbers)) {
        // Phone number already includes country code, just add the + prefix
        fullPhoneNumber = `+${phoneNumber}`;
      } else {
        // Phone number is in local format, combine with country code
        fullPhoneNumber = `${countryCode}${phoneNumber}`;
      }

      return {
        passengerInfo: {
          title: passenger.passengerInfo.title,
          firstName: passenger.passengerInfo.firstName,
          lastName: passenger.passengerInfo.lastName,
          dateOfBirth: passenger.passengerInfo.dateOfBirth
            ?.toISOString()
            .split("T")[0], // Convert Date to string
          gender: passenger.passengerInfo.gender,
          nationality: passenger.document.nationality,
        },
        contact: {
          email: passenger.contact.email,
          phone: fullPhoneNumber,
          countryCode: passenger.contact.countryCode,
        },
        document: {
          type: "passport", // Assuming passport for now
          number: passenger.document.passportNumber,
          issueCountry: passenger.document.countryOfIssue,
          expiryDate: passenger.document.expiryDate
            ?.toISOString()
            .split("T")[0], // Convert Date to string
        },
      };
    });
  };

  const onSubmit = async (data: FormPassengerFields) => {
    try {
      // Save to sessionStorage (existing behavior)
      setFormData({ form: data, currentStep: currentStep + 1 }, checkoutId);

      // Transform and save to checkout store for booking process
      const transformedPassengers = transformFormDataToCheckoutFormat(data);
      setCheckoutFormData({ passengers: transformedPassengers });

      console.log(
        "✅ FORM: Saved passenger data to checkout store:",
        transformedPassengers
      );

      nextStep();
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  // Watch form values to ensure reactivity
  form.watch();

  // Get current validation state
  const isFormValid = form.formState.isValid;
  const formErrors = form.formState.errors;

  return (
    <div
      className={styles.enhancedTravelerForm}
      data-testid="enhanced-traveler-form">
      {/* Multiple Passenger Forms */}
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={styles.formContent}
        id="travellers-data-form">
        <div className={styles.passengerForms}>
          {Array(totalPassengers)
            .fill(null)
            .map((_, index) => (
              <PassengerFormCard
                key={index}
                passengerIndex={index}
                totalPassengers={totalPassengers}
                form={form}
                fieldPrefix={`passengers.${index}`}
              />
            ))}
          {currentStep < 2 && (
            <div className={styles.navigation}>
              {!isFormValid && Object.keys(formErrors).length > 0 && (
                <ValidationMessage form={form} />
              )}
              <div className={styles.actions}>
                <Button
                  type="text"
                  size="large"
                  onClick={prevStep}
                  className={styles.backButton}>
                  Back to previous step
                </Button>
                <PaymentButton
                  htmlType="submit"
                  form="travellers-data-form"
                  type="primary"
                  size="large"
                  disabled={!isFormValid}
                  className={styles.completeButton}
                  data-testid="continue-button">
                  Continue
                </PaymentButton>
              </div>
            </div>
          )}
        </div>
      </form>

      {/* Dev Tool - Only shows in development */}
      <CheckoutDevTool
        totalPassengers={totalPassengers}
        onFillForm={(data) => {
          console.log("EnhancedTravelerForm received data:", data);

          if (data.passengers) {
            data.passengers.forEach((passenger: any, index: number) => {
              console.log(`Filling passenger ${index}:`, passenger);

              const getFieldName = (section: string, field: string) => {
                if (totalPassengers === 1 && index === 0) {
                  return `${section}.${field}`;
                } else {
                  return `passengers.${index}.${section}.${field}`;
                }
              };

              if (passenger.passengerInfo) {
                Object.keys(passenger.passengerInfo).forEach((key) => {
                  let value = passenger.passengerInfo[key];
                  if (
                    key === "dateOfBirth" &&
                    typeof value === "string" &&
                    value
                  ) {
                    value = new Date(value);
                  }
                  const fieldName = getFieldName("passengerInfo", key);
                  console.log(`Setting ${fieldName}:`, value);
                  form.setValue(fieldName as any, value, {
                    shouldValidate: true,
                    shouldDirty: true,
                  });
                });
              }
              if (passenger.document) {
                Object.keys(passenger.document).forEach((key) => {
                  let value = passenger.document[key];
                  if (
                    key === "expiryDate" &&
                    typeof value === "string" &&
                    value
                  ) {
                    value = new Date(value);
                  }
                  const fieldName = getFieldName("document", key);
                  console.log(`Setting ${fieldName}:`, value);
                  form.setValue(fieldName as any, value, {
                    shouldValidate: true,
                    shouldDirty: true,
                  });
                });
              }
              if (passenger.contact) {
                Object.keys(passenger.contact).forEach((key) => {
                  const fieldName = getFieldName("contact", key);
                  console.log(`Setting ${fieldName}:`, passenger.contact[key]);
                  form.setValue(fieldName as any, passenger.contact[key], {
                    shouldValidate: true,
                    shouldDirty: true,
                  });
                });
              }
            });

            form.trigger();
          }
        }}
        onClearForm={() => form.reset()}
      />
    </div>
  );
};

export default React.memo(EnhancedTravelerForm);
