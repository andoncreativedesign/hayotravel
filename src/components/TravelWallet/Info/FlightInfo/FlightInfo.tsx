import { CopyIcon, XIcon } from "@/components/icons";
import { TravelWalletTrip } from "@/utils/types/travel-wallet";
import { ItineraryType, isItineraryCancelled, useItineraryStore } from "@/store/itinerary/itinerary.store";
import { useTravelWalletUIStore } from "@/store/travel-wallet/travel-wallet-ui.store";
import { getFlightBookingReference } from "@/utils/services/bookingReferenceService";
import { Button, message } from "antd";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { PassengerListItem } from "../../PassengerListItem/PassengerListItem";
import { CancelButton } from "../../CancelButton/CancelButton";
import styles from "./FlightInfo.module.scss";

export function FlightInfo({
  itineraryItems,
  flightDirection,
  trip,
}: {
  itineraryItems: TravelWalletTrip["itineraryItems"];
  flightDirection?: "outbound" | "return";
  trip?: TravelWalletTrip;
}) {
  const { clearSelection } = useTravelWalletUIStore();
  const { markItemAsCancelledWithData } = useItineraryStore();

  // State to track which passenger is currently expanded (accordion behavior)
  const [expandedPassengerId, setExpandedPassengerId] = useState<string | null>(
    // Default to first passenger of first flight being expanded
    itineraryItems.length > 0 &&
      itineraryItems[0].type === ItineraryType.Flight &&
      itineraryItems[0].data.passengers.length > 0
      ? `${itineraryItems[0].id}-${itineraryItems[0].data.passengers[0].id}`
      : null
  );

  // Extract flight item and order ID for query
  const flightOrderData = useMemo(() => {
    if (itineraryItems.length === 0) return null;
    
    const flightItem = itineraryItems.find(item => item.type === ItineraryType.Flight);
    if (!flightItem || !flightItem.duffel_order_id) return null;
    
    return {
      flightItem,
      orderId: flightItem.duffel_order_id
    };
  }, [itineraryItems]);

  // Use React Query to fetch and cache booking reference
  const {
    data: bookingReferenceData,
    isLoading: isLoadingBookingRef,
    error: bookingReferenceError
  } = useQuery({
    queryKey: ['flight-booking-reference', flightOrderData?.orderId],
    queryFn: async () => {
      if (!flightOrderData?.orderId) throw new Error('No order ID available');
      return getFlightBookingReference(flightOrderData.orderId);
    },
    enabled: !!flightOrderData?.orderId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: false,
    retryDelay: 1000,
  });

  const bookingReference = bookingReferenceData?.bookingReference || 
    (bookingReferenceError ? "N/A" : "");

  const getBookingReferenceDisplay = () => {
    if (isLoadingBookingRef) return "Loading...";
    if (!flightOrderData?.orderId) return "Not booked yet";
    if (bookingReferenceError) return "N/A";
    return bookingReference || "N/A";
  };

  const handleCopyBookingReference = async () => {
    if (!bookingReference || bookingReference === "N/A") return;

    try {
      await navigator.clipboard.writeText(bookingReference);
      message.success("Booking reference copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy booking reference:", error);
      message.error("Failed to copy booking reference");
    }
  };

  const handlePassengerToggle = (passengerKey: string) => {
    // If the same passenger is clicked, collapse it, otherwise expand the new one
    setExpandedPassengerId(
      expandedPassengerId === passengerKey ? null : passengerKey
    );
  };

  const handleCheckIn = (passengerId: string) => {
    // Check-in logic is now handled by the PassengerListItem component
    console.log("Check-in initiated for passenger:", passengerId);
  };


  const handleCancelModify = (passengerId: string) => {
    console.log("Cancel/Modify for passenger:", passengerId);
    // Implement cancel/modify logic
  };

  const isAnyCancelled = itineraryItems.some(item => isItineraryCancelled(item));

  return (
    <div className={`${styles.flightDetails} ${isAnyCancelled ? styles.cancelled : ''}`}>
      <div className={styles.header}>
        <span className={styles.headerLabel}>FLIGHT DETAILS</span>
        <Button
          className={styles.closeButton}
          variant="text"
          shape="circle"
          onClick={clearSelection}>
          <XIcon />
        </Button>
      </div>

      <div className={styles.content}>
        {flightOrderData?.orderId && (
          <>
            <div className={styles.bookingRef}>
              <span className={styles.bookingText}>
                Booking ref: {getBookingReferenceDisplay()}
              </span>
              <button 
                className={styles.copyButton} 
                onClick={handleCopyBookingReference}
                disabled={isLoadingBookingRef || !bookingReference || bookingReference === "N/A" || isAnyCancelled}
              >
                <CopyIcon />
              </button>
            </div>

            <div className={styles.divider}></div>
          </>
        )}

        {/* Flight cancellation section */}
        {flightOrderData?.flightItem && trip && !isItineraryCancelled(flightOrderData.flightItem) && (
          <div className={styles.cancellationSection}>
            <CancelButton
              componentType="flight"
              componentId={flightOrderData.flightItem.id}
              componentName={`${flightDirection || "outbound"} flight`}
              itineraryId={trip.itineraryId}
              onCancellationSuccess={async (cancellationReason?: string) => {
                try {
                  await markItemAsCancelledWithData(
                    flightOrderData.flightItem.id, 
                    trip.itineraryId, 
                    trip.itineraryItems, 
                    trip.travelersCount, 
                    cancellationReason
                  );
                } catch (error) {
                  console.error('Failed to update itinerary store for flight:', error);
                }
                clearSelection();
              }}
            />
          </div>
        )}

        <h2 className={styles.sectionTitle}>Passenger(s)</h2>

        <div className={styles.passengerList}>
          {itineraryItems.map((itineraryItem) => {
            if (itineraryItem.type === ItineraryType.Flight) {
              return itineraryItem.data.passengers.map((passenger, passengerIndex) => {
                const passengerKey = `${itineraryItem.id}-${passenger.id}`;
                return (
                  <div key={passengerKey} style={{ marginBottom: "16px" }}>
                    <PassengerListItem
                      passenger={passenger}
                      flightData={itineraryItem}
                      flightDirection={flightDirection}
                      isExpanded={expandedPassengerId === passengerKey}
                      onToggleExpand={() => handlePassengerToggle(passengerKey)}
                      onCheckIn={handleCheckIn}
                      onCancelModify={handleCancelModify}
                      trip={trip}
                      passengerIndex={passengerIndex}
                    />
                  </div>
                );
              });
            }
            return null;
          })}
        </div>
      </div>
    </div>
  );
}
