"use client";

import { StripePaymentWrapper } from "@/components/Payment";
import PaymentButton from "@/components/ui/PaymentButton/PaymentButton";
import { useCheckoutStore } from "@/store/checkout";
import {
  ItineraryType,
  useItineraryStore,
} from "@/store/itinerary/itinerary.store";
import { formatCurrencyWithSymbol } from "@/utils/helpers/currency";
import { processBookings } from "@/utils/services";
import { Alert, Button, Checkbox, Modal, notification } from "antd";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PaymentSuccessModal } from "../Modals";
import styles from "./OverviewPayment.module.scss";

interface OverviewPaymentProps {
  totalPassengers: number;
  onBack: () => void;
  apiItineraryData?: { id: number } | null;
}

const OverviewPayment = ({
  totalPassengers,
  onBack,
  apiItineraryData,
}: OverviewPaymentProps) => {
  const [consentStored, setConsentStored] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const router = useRouter();

  const {
    itinerary,
    passengerCount,
    markItineraryAsPaidAndPersist,
    isItineraryPaid,
  } = useItineraryStore();
  const {
    setBookingSuccess,
    markStepCompleted,
    isBooking,
    bookingError,
    bookingSuccess,
    formData,
    showSuccessModal,
    setShowSuccessModal,
  } = useCheckoutStore();

  // Use centralized passenger count with fallback to prop
  const effectivePassengerCount =
    passengerCount > 0 ? passengerCount : totalPassengers;

  const flights = itinerary.filter(
    (item) => item.type === ItineraryType.Flight
  );
  const hotels = itinerary.filter((item) => item.type === ItineraryType.Hotel);

  // Determine if any flight is round-trip
  const hasRoundTripFlight = flights.some(
    (flight) => flight.data && flight.data.return
  );

  // Flight taxes are per-passenger, hotel taxes are total
  const flightTaxesPerPassenger = flights.reduce((sum, flight) => {
    return sum + parseFloat(flight.tax_amount || "0");
  }, 0);
  const hotelTaxes = hotels.reduce((sum, hotel) => {
    return sum + parseFloat(hotel.tax_amount || "0");
  }, 0);
  const taxesAndFees =
    flightTaxesPerPassenger * effectivePassengerCount + hotelTaxes;

  // Flight price in itinerary is per-passenger, calculate total for all passengers
  const flightPerPassengerPrice = flights.reduce((sum, flight) => {
    return sum + parseFloat(flight.price || "0");
  }, 0);
  const flightTotalPrice = flightPerPassengerPrice * effectivePassengerCount;

  // Hotel price is total (not per-passenger)
  const hotelTotalPrice = hotels.reduce((sum, hotel) => {
    return sum + parseFloat(hotel.price || "0");
  }, 0);

  // Calculate base prices by subtracting taxes (for display purposes)
  const flightBasePrice =
    flightTotalPrice - flightTaxesPerPassenger * effectivePassengerCount;

  console.log(
    `💰 OVERVIEW PAYMENT: Flight per-passenger: ${flightPerPassengerPrice}, passengers: ${effectivePassengerCount}, total: ${flightTotalPrice}`
  );

  const hotelBasePrice =
    hotelTotalPrice -
    hotels.reduce((sum, hotel) => {
      return sum + parseFloat(hotel.tax_amount || "0");
    }, 0);

  const grandTotal = flightTotalPrice + hotelTotalPrice; // Use actual total prices

  const currency = flights[0]?.tax_currency || hotels[0]?.tax_currency || "USD";

  const totalNights = hotels.reduce((sum, hotel) => {
    return (
      sum + (hotel.type === ItineraryType.Hotel ? hotel.data.nights || 0 : 0)
    );
  }, 0);

  const isFormValid = consentStored && termsAccepted;
  const isPaid = isItineraryPaid();

  const handlePaymentClick = () => {
    if (isFormValid && !isBooking && !bookingSuccess && !isPaid) {
      setShowPaymentModal(true);
    }
  };

  const attemptBookingWithErrorHandling = async () => {
    try {
      const result = await processBookings(formData, itinerary);

      if (result.success) {
        setBookingSuccess(true);
        markStepCompleted(2);

        notification.success({
          message: "Booking Confirmed!",
          description: `You'll receive confirmation emails shortly. Flight: ${
            result.flightBookingData ? "Confirmed" : "N/A"
          }, Hotel: ${result.hotelBookingData ? "Confirmed" : "N/A"}`,
          duration: 8,
          placement: "topRight",
        });
      } else {
        setBookingSuccess(true);
        markStepCompleted(2);

        notification.info({
          message: "Payment Received!",
          description:
            "We're processing your booking and will email you confirmation details within 24 hours.",
          duration: 10,
          placement: "topRight",
        });
      }
    } catch {
      setBookingSuccess(true);
      markStepCompleted(2);

      notification.info({
        message: "Payment Received!",
        description:
          "Our team will process your booking within 24 hours and email you the confirmation details.",
        duration: 10,
        placement: "topRight",
      });
    }
  };

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const handlePaymentSuccess = async (paymentIntent: any) => {
    console.log("Payment successful:", paymentIntent);

    try {
      // Mark itinerary as paid and persist passenger data to database
      const resolvedItineraryId = Array.isArray(apiItineraryData)
        ? apiItineraryData[0]?.id
        : apiItineraryData?.id;
      if (resolvedItineraryId) {
        await markItineraryAsPaidAndPersist(
          paymentIntent.id,
          resolvedItineraryId,
          formData
        );
      } else {
        console.warn(
          "No itinerary ID found from API, payment status not persisted to database"
        );
      }
    } catch (error) {
      console.error("Failed to persist payment status:", error);
      // Continue with booking completion even if DB persistence failed
    }

    setShowPaymentModal(false);
    await attemptBookingWithErrorHandling();

    // Show success modal after successful booking
    setShowSuccessModal(true);
  };

  const handlePaymentError = (error: string) => {
    console.error("Payment failed:", error);
    // Keep the modal open so user can retry
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
  };

  const handleViewTravelWallet = () => {
    setShowSuccessModal(false);
    // Navigate to travel wallet
    router.push("/travel-wallet");
  };

  return (
    <div className={styles.overviewPayment}>
      <div className={styles.paymentSummary}>
        <div className={styles.content}>
          <div className={styles.title}>
            Payment summary
            {isPaid && (
              <span
                style={{
                  marginLeft: "8px",
                  color: "#52c41a",
                  fontSize: "14px",
                  fontWeight: "normal",
                }}>
                ✓ Paid
              </span>
            )}
          </div>

          <div className={styles.description}>
            {flights.length > 0 && (
              <>
                <div className={styles.row}>
                  <div className={styles.left}>
                    <div className={styles.label}>
                      {hasRoundTripFlight
                        ? "Round-trip flights"
                        : "One-way flights"}
                    </div>
                    <div className={styles.subtext}>
                      {effectivePassengerCount > 1
                        ? `${formatCurrencyWithSymbol(
                            flightPerPassengerPrice,
                            currency
                          )} × ${effectivePassengerCount} passengers`
                        : `${effectivePassengerCount} passenger`}
                    </div>
                  </div>
                  <div className={styles.price}>
                    {formatCurrencyWithSymbol(flightBasePrice, currency)}
                  </div>
                </div>
                <div className={styles.divider}></div>
              </>
            )}

            {hotels.length > 0 && (
              <>
                <div className={styles.row}>
                  <div className={styles.left}>
                    <div className={styles.label}>Hotel accommodation</div>
                    <div className={styles.subtext}>
                      {totalNights > 1
                        ? `${formatCurrencyWithSymbol(
                            Math.round(hotelBasePrice / totalNights),
                            currency
                          )} × ${totalNights} nights`
                        : `${totalNights} night`}
                    </div>
                  </div>
                  <div className={styles.price}>
                    {formatCurrencyWithSymbol(hotelBasePrice, currency)}
                  </div>
                </div>
                <div className={styles.divider}></div>
              </>
            )}

            {/* Additional services would be shown here if selected during booking */}

            {taxesAndFees > 0 && (
              <>
                <div className={styles.row}>
                  <div className={styles.left}>
                    <div className={styles.label}>Taxes & Fees</div>
                    <div className={styles.subtext}>
                      Airport taxes, booking fees
                    </div>
                  </div>
                  <div className={styles.price}>
                    {formatCurrencyWithSymbol(taxesAndFees, currency)}
                  </div>
                </div>
                <div className={styles.divider}></div>
              </>
            )}
          </div>

          <div className={styles.bottom}>
            <div className={styles.totalLabel}>Total</div>
            <div className={styles.totalPrice}>
              {formatCurrencyWithSymbol(grandTotal, currency)}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.consentSection}>
        <Checkbox
          checked={consentStored}
          onChange={(e) => setConsentStored(e.target.checked)}
          className={styles.checkbox}>
          I consent to storing my profile information for future purchases
        </Checkbox>

        <Checkbox
          checked={termsAccepted}
          onChange={(e) => setTermsAccepted(e.target.checked)}
          className={styles.checkbox}>
          I have read and accept the Hayo Travel Terms and conditions and
          Privacy policy
        </Checkbox>
      </div>

      <Alert
        message="🔒 Secure Payment • SSL encrypted • PCI compliant • Money back guarantee"
        type="success"
        showIcon={false}
        className={styles.securityAlert}
      />

      {bookingError && (
        <Alert
          message="Booking Error"
          description={bookingError}
          type="error"
          showIcon
          closable
          className={styles.errorAlert}
        />
      )}

      <div className={styles.actions}>
        <Button
          type="text"
          size="large"
          onClick={onBack}
          disabled={isPaid || isBooking || bookingSuccess}
          className={styles.backButton}>
          Back to previous step
        </Button>

        <PaymentButton
          type="primary"
          size="large"
          onClick={handlePaymentClick}
          disabled={!isFormValid || isBooking || bookingSuccess || isPaid}
          loading={isBooking}
          className={styles.completeButton}>
          {isPaid
            ? "✓ Already Paid"
            : isBooking
            ? "Processing..."
            : bookingSuccess
            ? "Booking Complete"
            : `Pay & Complete Booking - ${formatCurrencyWithSymbol(
                grandTotal,
                currency
              )}`}
        </PaymentButton>
      </div>

      <div className={styles.disclaimer}>
        You will receive confirmation emails right after payment • No additional
        charges
      </div>

      <Modal
        title="Complete Payment"
        open={showPaymentModal}
        onCancel={() => setShowPaymentModal(false)}
        footer={null}
        width={600}
        centered>
        <StripePaymentWrapper
          amount={Math.round(grandTotal * 100)} // Convert to cents
          currency="usd"
          description={`Travel booking for ${effectivePassengerCount} passenger${
            effectivePassengerCount > 1 ? "s" : ""
          }`}
          metadata={{
            passengers: effectivePassengerCount.toString(),
            flight_count: flights.length.toString(),
            hotel_count: hotels.length.toString(),
          }}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
        />
      </Modal>

      <PaymentSuccessModal
        open={showSuccessModal}
        onClose={handleCloseSuccessModal}
        onViewTravelWallet={handleViewTravelWallet}
      />
    </div>
  );
};

export default OverviewPayment;
export type { OverviewPaymentProps };
