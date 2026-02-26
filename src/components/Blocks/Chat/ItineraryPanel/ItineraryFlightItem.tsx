import { AirPlaneTiltIcon, TrashIcon } from "@/components/icons";
import ExpandButton from "@/components/ui/ExpandButton";
import ExpandedFlightDetails from "@/components/ui/ExpandedFlightDetails/ExpandedFlightDetails";
import Status, { StatusType } from "@/components/ui/Status/Status";
import { currentChatSelector, useChatStore } from "@/store/chat/chats.store";
import {
  isItineraryCancelled,
  ItineraryFlight,
  ItineraryType,
  useItineraryStore,
} from "@/store/itinerary/itinerary.store";
import { parseDateToLocal } from "@/utils";
import { updateItinerary } from "@/utils/api/itinerary";
import { formatCurrencyWithSymbol } from "@/utils/helpers/currency";
import { formatDayWithDate } from "@/utils/helpers/transformDates";
import { OfferSlice } from "@/utils/types/flight";
import { LoadingOutlined } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import { Button, Spin, Typography } from "antd";
import { useParams } from "next/navigation";
import { useState } from "react";
import styles from "./ItineraryFlightItem.module.scss";
import { DeleteModal } from "./Modals";

const { Text } = Typography;

export type RoundTripItem = {
  id: string;
  type: "roundtrip";
  outbound: ItineraryFlight;
  return: ItineraryFlight;
  price: string;
  date: string;
};

export type DisplayItem = ItineraryFlight | RoundTripItem;

interface ItineraryItemProps {
  item: DisplayItem;
}

export const ItineraryFlightItem = ({ item }: ItineraryItemProps) => {
  const {
    removeItineraryItem,
    toggleItemExpanded,
    itinerary,
    isItineraryPaid,
  } = useItineraryStore();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const isPaid = isItineraryPaid();
  const { chatList } = useChatStore();
  const params = useParams<{ id: string }>();
  const chatId = params.id;
  const currentChat = currentChatSelector(chatList, chatId);
  const travelersCount = currentChat?.travelers_count;
  const currency = (item as ItineraryFlight)?.tax_currency || "USD";

  // Mutation to persist itinerary changes to the database
  const { mutate: updateItineraryMutation, isPending: isUpdatingItinerary } =
    useMutation({
      mutationFn: updateItinerary,
      onSuccess: (data) => {
        console.log("Itinerary updated successfully after deletion:", data);
        setIsDeleteModalOpen(false);
        removeItineraryItem(item.id);
      },
      onError: (error) => {
        setIsDeleteModalOpen(false);
        console.error("Error updating itinerary after deletion:", error);
        // TODO: Add user-friendly error handling (toast notification, etc.)
      },
    });

  const handleRemove = () => {
    // Persist the changes to the database
    const itineraryId = currentChat?.itinerary_id;
    if (itineraryId) {
      // Create updated itinerary without the deleted item
      const updatedItinerary = itinerary.filter(
        (itineraryItem) => itineraryItem.id !== item.id
      );

      updateItineraryMutation({
        itinerary_id: itineraryId,
        itinerary: {
          itinerary_data: {
            itinerary: updatedItinerary,
            travelers_count: travelersCount || 1,
          },
        },
      });
    }
  };

  const handleToggleExpanded = () => {
    toggleItemExpanded(item.id);
  };

  // Handle both single flight and round trip items
  const isRoundTrip =
    item.type === "roundtrip" ||
    (item.type === ItineraryType.Flight && item.data.return);

  const outboundData =
    item.type === "roundtrip"
      ? item.outbound.data.outbound
      : item.data.outbound;

  const returnData =
    item.type === "roundtrip" ? item.return.data.return : item.data.return;

  const isSelected =
    item.type === "roundtrip" ? item.outbound.isSelected : item.isSelected;

  const isExpanded =
    item.type === "roundtrip" ? item.outbound.isExpanded : item.isExpanded;

  const formatFlightDetails = (flightData: {
    slice: OfferSlice;
    airline: string;
    date: string;
  }) => {
    const firstSegment = flightData.slice.segments[0];
    const lastSegment =
      flightData.slice.segments[flightData.slice.segments.length - 1];
    const layovers = flightData.slice.segments.length - 1;

    const departureTime = parseDateToLocal(firstSegment.departing_at, {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    const arrivalTime = parseDateToLocal(lastSegment.arriving_at, {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    // Extract layover destinations from intermediate segments
    const layoverDestinations =
      layovers > 0
        ? flightData.slice.segments.slice(0, -1).map((segment) => ({
            iata_code: segment.destination.iata_code,
            city_name:
              segment.destination.city_name || segment.destination.iata_code,
            name: segment.destination.name,
          }))
        : [];

    const layoverText =
      layovers === 0
        ? "Direct"
        : layovers === 1
        ? `1 layover in ${
            layoverDestinations[0].city_name || layoverDestinations[0].iata_code
          }`
        : `${layovers} layovers in ${layoverDestinations
            .map((dest) => dest.city_name || dest.iata_code)
            .join(", ")}`;

    return {
      airline: flightData.airline,
      route: `${firstSegment.origin.iata_code} → ${lastSegment.destination.iata_code}`,
      time: `${departureTime} - ${arrivalTime} (${layoverText})`,
      date: parseDateToLocal(flightData.date, {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      // Additional details for expanded view
      departureTime,
      arrivalTime,
      departureDate: new Date(firstSegment.departing_at).toLocaleDateString(
        "en-GB",
        {
          day: "numeric",
          month: "short",
        }
      ),
      arrivalDate: new Date(lastSegment.arriving_at).toLocaleDateString(
        "en-GB",
        {
          day: "numeric",
          month: "short",
        }
      ),
      duration: flightData.slice.duration,
      originCity: firstSegment.origin.city_name,
      originAirport: `${firstSegment.origin.iata_code}${
        firstSegment.origin.name ? ` - ${firstSegment.origin.name}` : ""
      }`,
      destinationCity: lastSegment.destination.city_name,
      destinationAirport: `${lastSegment.destination.iata_code}${
        lastSegment.destination.name ? ` - ${lastSegment.destination.name}` : ""
      }`,
      flightType:
        layovers === 0
          ? "Direct flight"
          : layovers === 1
          ? `1 layover in ${
              layoverDestinations[0].city_name ||
              layoverDestinations[0].iata_code
            }`
          : `${layovers} layovers in ${layoverDestinations
              .map((dest) => dest.city_name || dest.iata_code)
              .join(", ")}`,
      layoverDestinations,
      operatingCarrier: firstSegment.operating_carrier,
      marketingCarrier: firstSegment.marketing_carrier,
    };
  };

  const outboundDetails = formatFlightDetails(outboundData);
  const returnDetails = returnData ? formatFlightDetails(returnData) : null;

  const isCancelled = isItineraryCancelled(item as ItineraryFlight);

  return (
    <div
      className={`${styles.basketItem} ${isCancelled ? styles.cancelled : ""}`}
      data-testid={`itinerary-item-${item.id}`}>
      {/* Top Section */}
      <div className={styles.top}>
        <div className={styles.left}>
          <div className={styles.title}>
            <AirPlaneTiltIcon className={styles.icon} />
            <Text className={styles.label}>Flight</Text>
          </div>
        </div>
        <div className={styles.right}>
          {isItineraryCancelled(item as ItineraryFlight) ? (
            <Status status={StatusType.Cancelled} />
          ) : isPaid ? (
            <Status status={StatusType.Confirmed} />
          ) : isSelected ? (
            <Status status={StatusType.Selected} />
          ) : null}
          <div className={styles.actions}>
            <Button
              type="text"
              className={styles.iconWithBg}
              onClick={() => setIsDeleteModalOpen(true)}
              shape="circle"
              disabled={isUpdatingItinerary || isPaid}>
              {isUpdatingItinerary ? (
                <Spin
                  spinning={isUpdatingItinerary}
                  indicator={<LoadingOutlined spin />}
                />
              ) : (
                <TrashIcon className={styles.actionIcon} />
              )}
            </Button>
            <ExpandButton
              isExpanded={Boolean(isExpanded)}
              onToggle={handleToggleExpanded}
              ariaLabel={{
                expanded: "Collapse passenger details",
                collapsed: "Expand passenger details",
              }}
            />
          </div>
        </div>
      </div>

      {/* Outbound Section */}
      <div className={styles.outbound}>
        <div className={styles.segmentHeader}>
          <div className={styles.segmentLeft}>
            <Text className={styles.segmentDate}>
              {formatDayWithDate(new Date(outboundDetails.date))}
              {returnDetails &&
                ` - ${formatDayWithDate(new Date(returnDetails.date))}`}
            </Text>
          </div>
        </div>
        <div className={styles.description}>
          <Text className={styles.flightDetails}>
            {isRoundTrip ? "Round trip: " : "One way: "}
            {outboundDetails.route}
          </Text>
        </div>
      </div>

      {/* Expanded Outbound Details */}
      {isExpanded && <ExpandedFlightDetails {...outboundDetails} />}

      {/* Inbound Section */}
      {isRoundTrip && returnDetails && (
        <>
          {/* Expanded Inbound Details */}
          {isExpanded && <ExpandedFlightDetails {...returnDetails} />}
        </>
      )}

      <div className={styles.divider} />

      {/* Price Section */}
      <div className={styles.price}>
        <div className={styles.priceAmountAll}>
          <Text className={styles.amountAll}>
            Total{" "}
            {formatCurrencyWithSymbol(
              Number(item.price) * (travelersCount || 1),
              currency
            )}
          </Text>
          <Text className={styles.taxesLabel} type="secondary">
            *Taxes included
          </Text>
        </div>
        <div className={styles.priceAmount}>
          <Text className={styles.amount}>
            {formatCurrencyWithSymbol(Number(item.price), currency)}
          </Text>
          <Text className={styles.per}>/person</Text>
        </div>
      </div>
      <DeleteModal
        open={isDeleteModalOpen}
        onCancel={() => setIsDeleteModalOpen(false)}
        loading={isUpdatingItinerary}
        onConfirm={handleRemove}
        itemType="Flight"
        tripName={currentChat?.title || "New Trip"}
      />
    </div>
  );
};
