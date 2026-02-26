"use client";

import {
  ItineraryType,
  useItineraryStore,
} from "@/store/itinerary/itinerary.store";
import { formatCurrencyWithSymbol } from "@/utils/helpers/currency";
import styles from "./PaymentSummary.module.scss";

interface PaymentSummaryProps {
  totalPassengers: number;
}

const PaymentSummary = ({ totalPassengers }: PaymentSummaryProps) => {
  const { itinerary, passengerCount } = useItineraryStore();

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

  // Flight price is per-passenger in itinerary, calculate total for all passengers
  const flightPerPassengerPrice = flights.reduce((sum, flight) => {
    return sum + parseFloat(flight.price || "0");
  }, 0);
  const flightTotalPrice = flightPerPassengerPrice * effectivePassengerCount;

  // Hotel price is total (not per-passenger)
  const hotelBasePrice = hotels.reduce((sum, hotel) => {
    return sum + parseFloat(hotel.price || "0");
  }, 0);

  const grandTotal = flightTotalPrice + hotelBasePrice;

  console.log(
    `💰 PAYMENT SUMMARY: Flight per-passenger: ${flightPerPassengerPrice}, passengers: ${effectivePassengerCount}, total: ${flightTotalPrice}`
  );

  const currency = flights[0]?.tax_currency || hotels[0]?.tax_currency || "USD";

  const totalNights = hotels.reduce((sum, hotel) => {
    return sum + (hotel.data.nights || 0);
  }, 0);

  return (
    <div
      className={styles.paymentSummary}
      data-testid="checkout-payment-summary">
      <div className={styles.content}>
        <div className={styles.title}>Payment summary</div>

        <div className={styles.description}>
          {flights.length > 0 && (
            <>
              <div className={styles.row} data-testid="checkout-flight-item">
                <div className={styles.left}>
                  <div className={styles.label} data-testid="item-title">
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
                  {effectivePassengerCount > 1 && (
                    <div style={{ display: "none" }}>
                      {effectivePassengerCount} passengers
                    </div>
                  )}
                </div>
                <div className={styles.price} data-testid="item-price">
                  {formatCurrencyWithSymbol(flightTotalPrice, currency)}
                </div>
              </div>
              <div className={styles.divider}></div>
            </>
          )}

          {hotels.length > 0 && (
            <>
              <div className={styles.row} data-testid="checkout-hotel-item">
                <div className={styles.left}>
                  <div className={styles.label} data-testid="item-title">
                    Hotel accommodation
                  </div>
                  <div className={styles.subtext}>
                    {totalNights > 1
                      ? `${formatCurrencyWithSymbol(
                          Math.round(hotelBasePrice / totalNights),
                          currency
                        )} × ${totalNights} nights`
                      : `${totalNights} night`}
                  </div>
                  {totalNights > 1 && (
                    <div style={{ display: "none" }}>{totalNights} nights</div>
                  )}
                </div>
                <div className={styles.price} data-testid="item-price">
                  {formatCurrencyWithSymbol(hotelBasePrice, currency)}
                </div>
              </div>
              <div className={styles.divider}></div>
            </>
          )}

          {taxesAndFees > 0 && (
            <>
              <div className={styles.row}>
                <div className={styles.left}>
                  <div className={styles.label}>Taxes & Fees</div>
                  <div className={styles.subtext}>
                    Hotel taxes, booking fees
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
  );
};

export default PaymentSummary;
