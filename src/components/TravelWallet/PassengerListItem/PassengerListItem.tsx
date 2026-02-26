"use client";
import { ArrowSquareOutIcon, UserMiniIcon } from "@/components/icons";
import ExpandButton from "@/components/ui/ExpandButton";
import ExpandedFlightDetails from "@/components/ui/ExpandedFlightDetails/ExpandedFlightDetails";
import {
  ItineraryFlight,
  isItineraryCancelled,
} from "@/store/itinerary/itinerary.store";
import {
  DuffelOfferDetails,
  fetchOfferDetails,
  formatBaggageInfo,
  formatSeatAssignment,
} from "@/utils/api/duffel";
import { capitalizeFirstLetter } from "@/utils/helpers/firstLetterUpercase";
import {
  formatDateShort,
  formatDuration,
  formatTime12Hour,
} from "@/utils/helpers/transformDates";
import {
  getUnsupportedAirlineMessage,
  isCheckInSupported,
  openAirlineCheckIn,
} from "@/utils/services/airlineCheckInService";
import { OfferPassenger } from "@/utils/types/flight";
import { TravelWalletTrip } from "@/utils/types/travel-wallet";
import { useQuery } from "@tanstack/react-query";
import { Button, Tooltip } from "antd";
import styles from "./PassengerListItem.module.scss";

export interface PassengerData {
  id: string;
  name: string;
  ageGroup: "Adult" | "Child" | "Infant";
  ageGroupNumber: number;
  travelClass: string;
  checkedBags?: string;
  cabinBags?: string;
  seat: string;
}

export interface FlightData {
  departureDate: string;
  departureTime: string;
  duration: string;
  arrivalTime: string;
  arrivalDate: string;
  originCity: string;
  originAirport: string;
  destinationCity: string;
  destinationAirport: string;
  flightType: string;
  operatingCarrier: {
    id: string;
    name: string;
  };
}

interface PassengerListItemProps {
  passenger: OfferPassenger;
  flightData: ItineraryFlight;
  flightDirection?: "outbound" | "return";
  isExpanded: boolean;
  onToggleExpand: () => void;
  onCheckIn?: (passengerId: string) => void;
  onCancelModify?: (passengerId: string) => void;
  trip?: TravelWalletTrip;
  passengerIndex?: number; // Add index to match with trip passenger details
}

export function PassengerListItem({
  passenger,
  flightData,
  flightDirection = "outbound",
  isExpanded,
  onToggleExpand,
  onCheckIn,
  onCancelModify,
  trip,
  passengerIndex,
}: PassengerListItemProps) {
  const offerId = flightData.duffel_offer_id;
  const { data: offerDetails } = useQuery<DuffelOfferDetails>({
    queryKey: ["duffel-offer", offerId],
    queryFn: () => fetchOfferDetails(offerId!),
    enabled: !!offerId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 1, // Only retry once for API calls
  });

  const handleCheckIn = () => {
    // Get airline IATA code from flight data
    const flightDisplayData = getFlightDisplayData(flightData, flightDirection);
    const airlineCode = flightDisplayData.operatingCarrier.id;

    if (airlineCode && isCheckInSupported(airlineCode)) {
      // Open airline check-in page in new tab
      const success = openAirlineCheckIn(airlineCode);
      if (!success) {
        console.error("Failed to open check-in page for airline:", airlineCode);
      }
    } else {
      console.warn("Check-in not supported for airline:", airlineCode);
    }

    // Still call the original callback if provided
    onCheckIn?.(passenger.id);
  };

  const handleCancelModify = () => {
    onCancelModify?.(passenger.id);
  };

  const formatTitle = (title?: string): string => {
    if (!title) return "";
    switch (title.toLowerCase()) {
      case "mr":
        return "Mr";
      case "mrs":
        return "Mrs";
      case "ms":
        return "Ms";
      case "dr":
        return "Dr";
      default:
        return title.charAt(0).toUpperCase() + title.slice(1).toLowerCase();
    }
  };

  const getPassengerName = () => {
    // Use passenger details from trip if available and index is provided
    if (
      trip?.passengerDetails &&
      trip.passengerDetails.length > 0 &&
      typeof passengerIndex === "number"
    ) {
      const passengerDetails = trip.passengerDetails[passengerIndex];

      if (passengerDetails?.passengerInfo) {
        const { passengerInfo } = passengerDetails;
        const title = formatTitle(passengerInfo.title);
        const firstName = passengerInfo.firstName || "";
        const lastName = passengerInfo.lastName || "";

        // Return formatted name with title
        if (title && firstName && lastName) {
          return `${title} ${firstName} ${lastName}`;
        } else if (firstName && lastName) {
          return `${firstName} ${lastName}`;
        } else if (firstName || lastName) {
          return firstName || lastName;
        }
      }
    }

    // Fallback to flight passenger data if available
    if (passenger.given_name && passenger.family_name) {
      return `${passenger.given_name} ${passenger.family_name}`;
    }

    // Final fallback
    return `Passenger ${passenger.id}`;
  };

  const getPassengerDetails = () => {
    if (!offerDetails || typeof passengerIndex !== "number") {
      return { baggage: "", seat: "", fareBrand: "" };
    }

    const sliceIndex = flightDirection === "return" ? 1 : 0;
    const slice = offerDetails.data?.slices?.[sliceIndex];

    if (!slice) {
      return { baggage: "", seat: "", fareBrand: "" };
    }

    const firstSegment = slice.segments?.[0];
    const segmentPassenger = firstSegment?.passengers?.find(
      (sp) =>
        sp.passenger_id === offerDetails.data.passengers?.[passengerIndex]?.id
    );

    if (!segmentPassenger) {
      return { baggage: "", seat: "", fareBrand: "" };
    }

    const baggageInfo = formatBaggageInfo(
      segmentPassenger.baggages || [],
      slice.fare_brand_name
    );

    const seatInfo = formatSeatAssignment(segmentPassenger.seat);

    return {
      baggage: baggageInfo,
      seat: seatInfo,
      fareBrand: slice.fare_brand_name || "",
    };
  };

  const passengerDetails = getPassengerDetails();

  const {
    departureDate,
    departureTime,
    duration,
    arrivalTime,
    arrivalDate,
    originCity,
    originAirport,
    destinationCity,
    destinationAirport,
    flightType,
    operatingCarrier,
  } = getFlightDisplayData(flightData, flightDirection);

  // Check if airline supports check-in
  const airlineCode = operatingCarrier.id;
  const isAirlineCheckInSupported =
    airlineCode && isCheckInSupported(airlineCode);
  const unsupportedMessage = isAirlineCheckInSupported
    ? ""
    : getUnsupportedAirlineMessage(operatingCarrier.name);

  return (
    <div
      className={`${styles.passengerCard} ${
        isExpanded ? styles.expanded : styles.collapsed
      }`}>
      <div className={styles.passengerCardHeader}>
        <div className={styles.passengerInfo}>
          <div className={styles.passengerHeader}>
            <div className={styles.passengerBadge}>
              <UserMiniIcon />
              {/* Temporary fix for child type */}
              <span>{capitalizeFirstLetter(passenger.type || "child")}</span>
            </div>
            <span className={styles.passengerName}>{getPassengerName()}</span>
          </div>
          <div className={styles.passengerDetails}>
            <span>{formatBaggage(flightData, flightDirection)}</span>

            {passengerDetails.baggage && (
              <span>{passengerDetails.baggage}</span>
            )}

            {passengerDetails.seat && <span>{passengerDetails.seat}</span>}
          </div>
        </div>
        <ExpandButton
          className={styles.expandButton}
          isExpanded={isExpanded}
          onToggle={onToggleExpand}
          ariaLabel={{
            expanded: "Collapse passenger details",
            collapsed: "Expand passenger details",
          }}
        />
      </div>

      {isExpanded && (
        <div className={styles.passengerExpandedContent}>
          <div className={styles.passengerActions}>
            <Tooltip
              title={unsupportedMessage}
              placement="top"
              open={
                !isAirlineCheckInSupported && unsupportedMessage
                  ? undefined
                  : false
              }>
              <Button
                type="primary"
                size="small"
                onClick={handleCheckIn}
                disabled={
                  !isAirlineCheckInSupported ||
                  (flightData && isItineraryCancelled(flightData))
                }
                icon={<ArrowSquareOutIcon />}>
                Check-in
              </Button>
            </Tooltip>
            <Button
              size="small"
              onClick={handleCancelModify}
              disabled={flightData && isItineraryCancelled(flightData)}
              icon={<ArrowSquareOutIcon />}>
              Cancel
            </Button>
          </div>

          {flightData && (
            <div className={styles.flightSection}>
              <ExpandedFlightDetails
                departureDate={departureDate}
                departureTime={departureTime}
                duration={duration}
                arrivalTime={arrivalTime}
                arrivalDate={arrivalDate}
                originCity={originCity}
                originAirport={originAirport}
                destinationCity={destinationCity}
                destinationAirport={destinationAirport}
                flightType={flightType}
                operatingCarrier={operatingCarrier}
                offerDetails={offerDetails}
                flightDirection={flightDirection}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const formatBaggage = (
  flightData: ItineraryFlight,
  flightDirection: "outbound" | "return"
) => {
  const parts = [];
  if (flightData.data[flightDirection]?.cabin_class)
    parts.push(flightData.data[flightDirection]?.cabin_class);
  // Add other baggage info if available in your data structure
  return parts.join(" • ") || "Economy";
};

const getFlightDisplayData = (
  flightData: ItineraryFlight,
  flightDirection: "outbound" | "return"
): FlightData => {
  // Determine which flight direction to show
  let slice;
  let flightDirectionData;
  if (flightDirection === "return" && flightData?.data?.return?.slice) {
    slice = flightData.data.return.slice;
    flightDirectionData = flightData.data.return;
  } else if (flightData?.data?.outbound?.slice) {
    slice = flightData.data.outbound.slice;
    flightDirectionData = flightData.data.outbound;
  } else {
    return {
      departureDate: "",
      departureTime: "",
      duration: "",
      arrivalTime: "",
      arrivalDate: "",
      originCity: "",
      originAirport: "",
      destinationCity: "",
      destinationAirport: "",
      flightType: "",
      operatingCarrier: { id: "", name: "" },
    };
  }

  const firstSegment = slice.segments[0];
  const lastSegment = slice.segments[slice.segments.length - 1];

  const departureDate = new Date(firstSegment.departing_at);
  const arrivalDate = new Date(lastSegment.arriving_at);

  return {
    departureDate: formatDateShort(departureDate),
    departureTime: formatTime12Hour(departureDate),
    duration: formatDuration(slice.duration),
    arrivalTime: formatTime12Hour(arrivalDate),
    arrivalDate: formatDateShort(arrivalDate),
    originCity: firstSegment.origin.city_name || "",
    originAirport: firstSegment.origin.iata_code || "",
    destinationCity: lastSegment.destination.city_name || "",
    destinationAirport: lastSegment.destination.iata_code || "",
    flightType: flightData.data.return ? "Round-trip" : "One-way",
    operatingCarrier: {
      id: firstSegment.operating_carrier.iata_code || "",
      name:
        flightDirectionData?.airline ||
        firstSegment.operating_carrier.name ||
        "",
    },
  };
};
