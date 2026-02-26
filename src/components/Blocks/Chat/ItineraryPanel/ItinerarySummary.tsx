import {
  ItineraryType,
  useItineraryStore,
} from "@/store/itinerary/itinerary.store";
import styles from "./ItinerarySummary.module.scss";

interface ItinerarySummaryProps {
  totalPassengers: number;
}

const ItinerarySummary = ({ totalPassengers }: ItinerarySummaryProps) => {
  const { itinerary, passengerCount } = useItineraryStore();

  // Use centralized passenger count with fallback to prop
  const effectivePassengerCount =
    passengerCount > 0 ? passengerCount : totalPassengers;

  // Separate flights and hotels
  const flightItems = itinerary.filter(
    (item) => item.type === ItineraryType.Flight
  );
  const hotelItems = itinerary.filter(
    (item) => item.type === ItineraryType.Hotel
  );

  // Determine if any flight is round-trip
  const hasRoundTripFlight = flightItems.some(
    (flight) => flight.data && flight.data.return
  );

  // Calculate flight totals
  const flightPrice = flightItems.reduce(
    (acc, item) => acc + Number(item.price),
    0
  );
  // Since item.price is already per-person, we need to multiply by passengers to get total
  const flightTotalPrice = flightPrice * effectivePassengerCount;

  console.log(
    `💰 PRICE CALCULATION: Using ${effectivePassengerCount} passengers for flight pricing (flight price: ${flightPrice}, total: ${flightTotalPrice})`
  );

  // Calculate hotel totals
  const hotelPrice = hotelItems.reduce(
    (acc, item) => acc + Number(item.price),
    0
  );
  const totalNights = hotelItems.reduce((acc, item) => {
    if (item.type === ItineraryType.Hotel) {
      return acc + item.data.nights;
    }
    return acc;
  }, 0);

  // Calculate taxes (flight taxes are per-passenger, hotel taxes are total)
  const flightTaxes =
    flightItems.reduce((acc, item) => acc + Number(item.tax_amount), 0) *
    effectivePassengerCount;
  const hotelTaxes = hotelItems.reduce(
    (acc, item) => acc + Number(item.tax_amount),
    0
  );
  const totalTaxes = flightTaxes + hotelTaxes;

  // Grand total
  const grandTotal = flightTotalPrice + hotelPrice;

  return (
    <div className={styles.summary__container}>
      <h5 className={styles.summary__title}>Payment summary</h5>

      <div className={styles.summary__item}>
        {/* Flight Section */}
        {flightItems.length > 0 && (
          <>
            <div className={styles.summary__item__wrapper}>
              <div className={styles.summary__item__text}>
                <span className={styles.summary__item__text__title}>
                  {hasRoundTripFlight
                    ? "Round-trip flights"
                    : "One-way flights"}
                </span>
                <span className={styles.summary__item__text__description}>
                  ${flightPrice.toFixed(2)} × {totalPassengers} passengers
                </span>
              </div>
              <span className={styles.summary__item__text__price}>
                ${flightTotalPrice.toFixed(2)}
              </span>
            </div>
            <span className={styles.summary__divider} />
          </>
        )}

        {/* Hotel Section */}
        {hotelItems.length > 0 && (
          <>
            <div className={styles.summary__item__wrapper}>
              <div className={styles.summary__item__text}>
                <span className={styles.summary__item__text__title}>
                  Hotel accommodation
                </span>
                <span className={styles.summary__item__text__description}>
                  ${hotelPrice.toFixed(2)} × {totalNights} nights
                </span>
              </div>
              <span className={styles.summary__item__text__price}>
                ${hotelPrice.toFixed(2)}
              </span>
            </div>
            <span className={styles.summary__divider} />
          </>
        )}

        {/* Taxes & Fees Section */}
        <div className={styles.summary__item__wrapper}>
          <div className={styles.summary__item__text}>
            <span className={styles.summary__item__text__title}>
              Taxes & Fees
            </span>
            <span className={styles.summary__item__text__description}>
              Airport taxes, booking fees
            </span>
          </div>
          <span className={styles.summary__item__text__price}>
            ${totalTaxes.toFixed(2)}
          </span>
        </div>
        <span className={styles.summary__divider} />
      </div>

      <div className={styles.summary__footer}>
        <span className={styles.summary__footer__title}>Total</span>
        <span className={styles.summary__footer__price}>
          ${grandTotal.toFixed(2)}
        </span>
      </div>
    </div>
  );
};

export default ItinerarySummary;
