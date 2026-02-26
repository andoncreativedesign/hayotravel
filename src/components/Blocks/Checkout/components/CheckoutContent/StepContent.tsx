import EnhancedTravelerForm from "../EnhancedTravelerForm/EnhancedTravelerForm";
import OverviewPayment from "../OverviewPayment";

export const StepContent = ({
  currentStep,
  totalPassengers,
  handleContinue,
  handleBackToPrevious,
  checkoutId,
  apiItineraryData,
}: {
  currentStep: number;
  totalPassengers: number;
  handleContinue: () => void;
  handleBackToPrevious: () => void;
  checkoutId: string;
  apiItineraryData?: {id: number} | null;
}) => {
  switch (currentStep) {
    case 1:
      return (
        <EnhancedTravelerForm
          totalPassengers={totalPassengers}
          nextStep={handleContinue}
          prevStep={handleBackToPrevious}
          currentStep={currentStep}
          checkoutId={checkoutId}
        />
      );
    case 2:
      return (
        <OverviewPayment
          totalPassengers={totalPassengers}
          onBack={handleBackToPrevious}
          apiItineraryData={apiItineraryData}
        />
      );
    default:
      return null;
  }
};
