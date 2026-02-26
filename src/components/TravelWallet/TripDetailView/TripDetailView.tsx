"use client";
import {
  AirplaneLandingIcon,
  AirplaneTakeoffIcon,
  ArrowLeftTailIcon,
  BuildingsIcon,
} from "@/components/icons";
import { StatusType } from "@/components/ui/Status/Status";
import ToolSelectionBase from "@/components/ui/ToolSelectionBase/ToolSelectionBase";
import {
  Itinerary,
  ItineraryType,
  isItineraryCancelled,
} from "@/store/itinerary/itinerary.store";
import {
  TravelWalletPanelMode,
  useTravelWalletUIStore,
} from "@/store/travel-wallet/travel-wallet-ui.store";
import { TravelWalletTrip } from "@/utils/types/travel-wallet";
import { Button, Space, Tooltip } from "antd";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import styles from "./TripDetailView.module.scss";

interface TripDetailViewProps {
  trip?: TravelWalletTrip;
}

export function TripDetailView({ trip }: TripDetailViewProps) {
  const router = useRouter();
  const {
    openItemDetails,
    openFlightDetails,
    selectedItineraryItemId,
    selectedFlightDirection,
    panelMode,
    clearSelection,
  } = useTravelWalletUIStore();
  const hasAutoExpandedRef = useRef<string | null>(null);

  const handleBackClick = () => {
    router.push("/travel-wallet");
  };

  const calculateTripDuration = () => {
    if (!trip) return 0;
    // Create dates and normalize to avoid timezone issues
    const start = new Date(trip.startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(trip.endDate);
    end.setHours(0, 0, 0, 0);

    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatDateRange = () => {
    if (!trip) return "";
    // Add one day forward to both dates to handle timezone/UTC issues
    const start = new Date(trip.startDate);
    start.setDate(start.getDate() + 1);
    const end = new Date(trip.endDate);
    end.setDate(end.getDate() + 1);

    return `${start.getDate()} ${start.toLocaleDateString("en-GB", {
      month: "short",
    })} - ${end.getDate()} ${end.toLocaleDateString("en-GB", {
      month: "short",
    })}, ${end.getFullYear()}`;
  };

  const handleItemClick = (
    itemId: string,
    itemType: ItineraryType,
    flightDirection?: "outbound" | "return"
  ) => {
    if (itemType === ItineraryType.Flight && flightDirection) {
      openFlightDetails(itemId, flightDirection);
    } else if (itemType === ItineraryType.Hotel) {
      openItemDetails(itemId, TravelWalletPanelMode.HotelDetails);
    }
  };

  // Format date for display (e.g., "Fri, 1 Aug")
  const formatDisplayDate = (dateString: string) => {
    const date = new Date(dateString);
    // Add one day forward to handle timezone/UTC issues
    date.setDate(date.getDate() + 1);
    const options: Intl.DateTimeFormatOptions = {
      weekday: "short",
      day: "numeric",
      month: "short",
    };
    return date.toLocaleDateString("en-GB", options);
  };

  // Format date range for hotels (e.g., "Fri, 1 Aug - Wed, 4 Aug")
  const formatHotelDateRange = (checkIn: string, checkOut: string) => {
    const checkInFormatted = formatDisplayDate(checkIn);
    const checkOutFormatted = formatDisplayDate(checkOut);
    return `${checkInFormatted} - ${checkOutFormatted}`;
  };

  // Create ordered itinerary items: outbound → hotel → inbound
  const getOrderedItineraryItems = () => {
    if (!trip) return [];

    const flights = trip.itineraryItems.filter(
      (item) => item.type === ItineraryType.Flight
    );
    const hotels = trip.itineraryItems.filter(
      (item) => item.type === ItineraryType.Hotel
    );

    const orderedItems: Array<{
      id: string;
      type: ItineraryType;
      title: string;
      description: string;
      icon: React.ReactNode;
      date: string;
      flightDirection?: "outbound" | "return";
      originalItem: Itinerary;
    }> = [];

    // Add outbound flights
    flights.forEach((flight) => {
      if (flight.type === ItineraryType.Flight && flight.data.outbound) {
        orderedItems.push({
          id: `${flight.id}-outbound`,
          type: ItineraryType.Flight,
          title: "Outbound Flight",
          description: `${flight.data.outbound.slice.segments[0].origin.iata_code} → ${flight.data.outbound.slice.segments[0].destination.iata_code}`,
          icon: <AirplaneTakeoffIcon />,
          date: formatDisplayDate(flight.data.outbound.date),
          flightDirection: "outbound",
          originalItem: flight,
        });
      }
    });

    // Add hotels
    hotels.forEach((hotel) => {
      if (hotel.type === ItineraryType.Hotel) {
        orderedItems.push({
          id: hotel.id,
          type: ItineraryType.Hotel,
          title: "Hotel",
          description: hotel.data.name,
          icon: <BuildingsIcon />,
          date: formatHotelDateRange(hotel.data.checkIn, hotel.data.checkOut),
          originalItem: hotel,
        });
      }
    });

    // Add return flights (inbound)
    flights.forEach((flight) => {
      if (flight.type === ItineraryType.Flight && flight.data.return) {
        orderedItems.push({
          id: `${flight.id}-return`,
          type: ItineraryType.Flight,
          title: "Inbound Flight",
          description: `${flight.data.return.slice.segments[0].origin.iata_code} → ${flight.data.return.slice.segments[0].destination.iata_code}`,
          icon: <AirplaneLandingIcon />,
          date: formatDisplayDate(flight.data.return.date),
          flightDirection: "return",
          originalItem: flight,
        });
      }
    });

    return orderedItems;
  };

  // Reset auto-expansion tracking when trip changes
  useEffect(() => {
    if (trip && hasAutoExpandedRef.current !== trip.id) {
      hasAutoExpandedRef.current = null; // Reset for new trip
    }
  }, [trip?.id]);

  // Check panel mode compatibility when trip changes
  useEffect(() => {
    if (!trip) return;

    const hasHotels = trip.itineraryItems.some(
      (item) => item.type === ItineraryType.Hotel
    );
    const hasFlights = trip.itineraryItems.some(
      (item) => item.type === ItineraryType.Flight
    );

    // If currently showing hotel details but new trip has no hotels
    if (panelMode === TravelWalletPanelMode.HotelDetails && !hasHotels) {
      if (hasFlights) {
        // Switch to first available flight
        const firstFlight = trip.itineraryItems.find(
          (item) => item.type === ItineraryType.Flight
        );
        if (firstFlight && firstFlight.type === ItineraryType.Flight) {
          const direction = firstFlight.data.outbound ? "outbound" : "return";
          openFlightDetails(firstFlight.id, direction);
        }
      } else {
        // No flights either, clear selection
        clearSelection();
      }
    }
    // If currently showing flight details but new trip has no flights
    else if (panelMode === TravelWalletPanelMode.FlightDetails && !hasFlights) {
      if (hasHotels) {
        // Switch to first available hotel
        const firstHotel = trip.itineraryItems.find(
          (item) => item.type === ItineraryType.Hotel
        );
        if (firstHotel) {
          openItemDetails(firstHotel.id, TravelWalletPanelMode.HotelDetails);
        }
      } else {
        // No hotels either, clear selection
        clearSelection();
      }
    }
  }, [trip?.id, panelMode, openFlightDetails, openItemDetails, clearSelection]);

  // Auto-expand the first itinerary item when trip loads (only once per trip)
  useEffect(() => {
    if (
      trip &&
      trip.itineraryItems.length > 0 &&
      !selectedItineraryItemId &&
      hasAutoExpandedRef.current !== trip.id
    ) {
      const orderedItems = getOrderedItineraryItems();
      if (orderedItems.length > 0) {
        const firstItem = orderedItems[0];

        if (
          firstItem.type === ItineraryType.Flight &&
          firstItem.flightDirection
        ) {
          openFlightDetails(
            firstItem.originalItem.id,
            firstItem.flightDirection
          );
          hasAutoExpandedRef.current = trip.id; // Mark as auto-expanded for this trip
        } else if (firstItem.type === ItineraryType.Hotel) {
          openItemDetails(firstItem.id, TravelWalletPanelMode.HotelDetails);
          hasAutoExpandedRef.current = trip.id; // Mark as auto-expanded for this trip
        }
      }
    }
  }, [trip, selectedItineraryItemId, openFlightDetails, openItemDetails]);

  // If no trip data is provided, show a placeholder or return null
  if (!trip) {
    return null;
  }

  console.log(trip.metadata.chatMetadata);

  return (
    <div className={styles.tripDetailView}>
      {/* New Header Design */}
      <div className={styles.header}>
        <div className={styles.canvasHeader}>
          <div className={styles.topSection}>
            <Button
              type="text"
              icon={<ArrowLeftTailIcon />}
              onClick={handleBackClick}
              className={styles.backButton}>
              Back to Travel Wallet
            </Button>
          </div>
        </div>

        <div className={styles.tripSummary}>
          <div className={styles.tripNameStatus}>
            <div className={styles.titleWrapper}>
              <Tooltip title={trip.metadata.chatMetadata?.title as string}>
                <h1 className={styles.tripTitle}>
                  {trip.metadata.chatMetadata?.title as string}
                </h1>
              </Tooltip>
            </div>
            {/* <Button
              type="default"
              shape="circle"
              icon={<MoreOutlined />}
              className={styles.moreButton}
            /> */}
          </div>

          <div className={styles.tagsSection}>
            <Space wrap className={styles.summaryTags}>
              <div className={styles.badge}>Origin → {trip.destination}</div>
              <div className={styles.badge}>{formatDateRange()}</div>
              <div className={styles.badge}>
                {calculateTripDuration()} nights
              </div>
              <div className={styles.badge}>
                {trip.travelersCount} traveller
                {trip.travelersCount !== 1 ? "s" : ""}
              </div>
            </Space>
          </div>
        </div>
      </div>

      <div className={styles.divider}></div>

      <div className={styles.itineraryIndicator}>
        <div className={styles.itineraryIndicator__divider} />
        <div className={styles.itineraryItemsWrapper}>
          {getOrderedItineraryItems().map((item) => {
            // For flights, we need to check if the original flight item is selected
            // For hotels, we check the item id directly
            const isSelected =
              item.type === ItineraryType.Flight
                ? selectedItineraryItemId === item.originalItem.id &&
                  selectedFlightDirection === item.flightDirection
                : selectedItineraryItemId === item.id;

            // Determine the original itinerary item to check cancellation status
            const originalItem =
              item.type === ItineraryType.Flight
                ? item.originalItem
                : trip?.itineraryItems.find((i) => i.id === item.id);

            // Determine status based on cancellation
            const itemStatus =
              originalItem && isItineraryCancelled(originalItem)
                ? StatusType.Cancelled
                : StatusType.Confirmed;

            return (
              <div key={item.id} className={styles.itineraryItem}>
                <div className={styles.dateColumn}>
                  <span className={styles.dateText}>{item.date}</span>
                </div>
                <div className={styles.itemColumn}>
                  <ToolSelectionBase
                    classNameWrapper={styles.toolSelectionBase}
                    classNameFilter={styles.toolSelectionBaseFilter}
                    title={item.title}
                    description={item.description}
                    icon={item.icon}
                    onClick={() =>
                      handleItemClick(
                        item.type === ItineraryType.Flight
                          ? item.originalItem.id
                          : item.id,
                        item.type,
                        item.flightDirection
                      )
                    }
                    status={itemStatus}
                    selected={isSelected}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
