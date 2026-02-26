"use client";
import { ItineraryType } from "@/store/itinerary/itinerary.store";
import {
  TravelWalletPanelMode,
  useTravelWalletUIStore,
} from "@/store/travel-wallet/travel-wallet-ui.store";
import { TravelWalletTrip } from "@/utils/types/travel-wallet";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo } from "react";
import { FlightInfo } from "../Info/FlightInfo/FlightInfo";
import { HotelInfoWithMap } from "../Info/HotelInfo/HotelInfoWithMap";
import { TripDetailView } from "../TripDetailView/TripDetailView";
import styles from "./SplitWalletDetails.module.scss";

interface SplitWalletDetailsProps {
  trip?: TravelWalletTrip;
  rightContent?: React.ReactNode;
}

const RightPanelContent = ({
  trip,
  panelMode,
}: {
  trip?: TravelWalletTrip;
  panelMode: TravelWalletPanelMode;
}) => {
  const {
    selectedItineraryItemId,
    selectedFlightDirection,
    clearSelection,
    openFlightDetails,
  } = useTravelWalletUIStore();

  const selectedItem = useMemo(() => {
    if (!trip || !selectedItineraryItemId) return null;
    return trip.itineraryItems.find(
      (item) => item.id === selectedItineraryItemId
    );
  }, [trip, selectedItineraryItemId]);

  const animationVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  // Helper function to get the first available flight
  const getFirstAvailableFlight = () => {
    const flights = trip?.itineraryItems.filter(
      (item) => item.type === ItineraryType.Flight
    );
    if (flights && flights.length > 0) {
      const firstFlight = flights[0];
      if (firstFlight.type === ItineraryType.Flight) {
        // Check if it has outbound first, otherwise return flight
        const direction: "outbound" | "return" = firstFlight.data.outbound
          ? "outbound"
          : "return";
        return { flight: firstFlight, direction };
      }
    }
    return null;
  };

  const renderContent = () => {
    switch (panelMode) {
      case TravelWalletPanelMode.FlightDetails:
        if (
          selectedItem &&
          selectedItem.type === ItineraryType.Flight &&
          selectedFlightDirection
        ) {
          return (
            <FlightInfo
              itineraryItems={[selectedItem]}
              flightDirection={selectedFlightDirection}
              trip={trip}
            />
          );
        }
        // Fallback to all flight items if no specific selection
        return (
          <FlightInfo
            itineraryItems={
              trip?.itineraryItems.filter(
                (item) => item.type === ItineraryType.Flight
              ) || []
            }
            trip={trip}
          />
        );

      case TravelWalletPanelMode.HotelDetails:
        if (selectedItem && selectedItem.type === ItineraryType.Hotel) {
          return (
            <HotelInfoWithMap
              hotel={selectedItem}
              trip={trip}
              onClose={clearSelection}
            />
          );
        }
        // Fallback to first hotel if no specific selection
        const firstHotel = trip?.itineraryItems.find(
          (item) => item.type === ItineraryType.Hotel
        );
        if (firstHotel && firstHotel.type === ItineraryType.Hotel) {
          return (
            <HotelInfoWithMap
              hotel={firstHotel}
              trip={trip}
              onClose={clearSelection}
            />
          );
        }

        // Smart fallback: if no hotels available, try to switch to first available flight
        const firstFlight = getFirstAvailableFlight();
        if (firstFlight) {
          // Auto-switch to flight details
          setTimeout(() => {
            openFlightDetails(firstFlight.flight.id, firstFlight.direction);
          }, 0);
          return null; // Return null while switching
        }

        // If no flights either, close the panel
        setTimeout(() => {
          clearSelection();
        }, 0);
        return null;

      case TravelWalletPanelMode.Empty:
      default:
        return null;
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={panelMode}
        variants={animationVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.2 }}
        style={{ height: "100%" }}>
        {renderContent()}
      </motion.div>
    </AnimatePresence>
  );
};

export function SplitWalletDetails({
  trip,
  rightContent,
}: SplitWalletDetailsProps) {
  const { panelMode, selectedItineraryItemId } = useTravelWalletUIStore();

  // Only show right panel when there's a selected item or explicit right content
  const shouldShowRightPanel =
    (panelMode !== TravelWalletPanelMode.Empty && selectedItineraryItemId) ||
    rightContent;

  const leftWidth = shouldShowRightPanel ? "50%" : "100%";
  const rightWidth = shouldShowRightPanel ? "50%" : "0%";

  return (
    <div className={styles.wrapper}>
      <motion.div
        className={styles.left}
        initial={{ width: "100%" }}
        animate={{ width: leftWidth }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}>
        <TripDetailView trip={trip} />
      </motion.div>

      <motion.div
        className={styles.rightAbsolute}
        animate={{ width: rightWidth }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        style={{ overflow: shouldShowRightPanel ? "auto" : "hidden" }}>
        {shouldShowRightPanel && (
          <div className={styles.rightPanel}>
            {rightContent || (
              <RightPanelContent trip={trip} panelMode={panelMode} />
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
