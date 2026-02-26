import {
  BedIcon,
  CaretDownIcon,
  CaretUpIcon,
  CoffeeIcon,
  CopyIcon,
  MapMarkIcon,
  XIcon,
} from "@/components/icons";
import ExpandButton from "@/components/ui/ExpandButton";
import { FastApiError } from "@/lib/fastapi-client";
import { useAuthStore } from "@/store/auth/auth.store";
import {
  ItineraryHotel,
  isItineraryCancelled,
  useItineraryStore,
} from "@/store/itinerary/itinerary.store";
import { cn } from "@/utils/helpers/cn";
import { ConfirmationService } from "@/utils/services/confirmationService";
import { ComponentCancellationResponse } from "@/utils/types/cancellation";
import { TravelWalletTrip } from "@/utils/types/travel-wallet";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { App, Button, Rate, notification } from "antd";
import Image from "next/image";
import { useState } from "react";
import { CancellationModal } from "../../CancellationModal/CancellationModal";
import styles from "./HotelInfo.module.scss";

// Type definitions for passenger data
type TripPassengerDetail = {
  passengerInfo?: {
    title?: "mr" | "mrs" | "ms" | "dr";
    firstName?: string;
    middleName?: string;
    lastName?: string;
    dateOfBirth?: string;
    gender?: "male" | "female" | "other";
    nationality?: string;
  };
  contact?: {
    email?: string;
    phone?: string;
    countryCode?: string;
  };
  document?: {
    type?: string;
    number?: string;
    issueCountry?: string;
    expiryDate?: string;
  };
};

type HotelBookingGuest = {
  given_name: string;
  family_name: string;
  born_on?: string;
};

type PassengerUnion = TripPassengerDetail | HotelBookingGuest;

// Type guard functions
const isTripPassengerDetail = (
  passenger: PassengerUnion
): passenger is TripPassengerDetail => {
  return "passengerInfo" in passenger;
};

const isHotelBookingGuest = (
  passenger: PassengerUnion
): passenger is HotelBookingGuest => {
  return "given_name" in passenger;
};

interface HotelInfoProps {
  hotel: ItineraryHotel;
  trip?: TravelWalletTrip;
  onClose?: () => void;
}

// Download icon component
const DownloadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 12 12" fill="none">
    <path
      d="M11.5 7C11.7761 7 12 7.22386 12 7.5V11C12 11.2652 11.8946 11.5195 11.707 11.707C11.5195 11.8946 11.2652 12 11 12H1C0.734784 12 0.480506 11.8946 0.292969 11.707C0.105432 11.5195 0 11.2652 0 11V7.5C0 7.22386 0.223858 7 0.5 7C0.776142 7 1 7.22386 1 7.5V11H11V7.5C11 7.22386 11.2239 7 11.5 7ZM6 0C6.27614 0 6.5 0.223858 6.5 0.5V6.29297L8.27148 4.52148C8.46675 4.32622 8.78325 4.32622 8.97852 4.52148C9.17378 4.71675 9.17378 5.03325 8.97852 5.22852L6.35352 7.85352C6.32961 7.87742 6.30323 7.89879 6.2749 7.91748C6.25603 7.92993 6.23634 7.94057 6.21631 7.9502C6.1937 7.96108 6.17034 7.9706 6.146 7.97803C6.13585 7.98112 6.12552 7.98341 6.11523 7.98584C6.10955 7.98718 6.1039 7.9886 6.09814 7.98975C6.09297 7.99078 6.08772 7.99132 6.08252 7.99219C6.05562 7.99666 6.02817 8 6 8C5.97167 8 5.94404 7.99672 5.91699 7.99219C5.91179 7.99131 5.90654 7.99078 5.90137 7.98975C5.89562 7.98859 5.88996 7.98719 5.88428 7.98584C5.87399 7.9834 5.86366 7.98113 5.85352 7.97803C5.82919 7.97058 5.8058 7.96109 5.7832 7.9502C5.76331 7.94061 5.74384 7.92985 5.7251 7.91748C5.69677 7.89879 5.67039 7.87742 5.64648 7.85352L3.02148 5.22852C2.82622 5.03325 2.82622 4.71675 3.02148 4.52148C3.21675 4.32622 3.53325 4.32622 3.72852 4.52148L5.5 6.29297V0.5C5.5 0.223858 5.72386 0 6 0Z"
      fill="currentColor"
    />
  </svg>
);

// External link icon component
const ExternalLinkIcon = () => (
  <svg width="16" height="16" viewBox="0 0 12 12" fill="none">
    <path
      d="M5 2C5.27614 2 5.5 2.22386 5.5 2.5C5.5 2.77614 5.27614 3 5 3H1V11H9V7C9 6.72386 9.22386 6.5 9.5 6.5C9.77614 6.5 10 6.72386 10 7V11C10 11.2652 9.89457 11.5195 9.70703 11.707C9.51949 11.8946 9.26521 12 9 12H1C0.734784 12 0.480506 11.8946 0.292969 11.707C0.105433 11.5195 0 11.2652 0 11V3C0 2.73478 0.105433 2.4805 0.292969 2.29297C0.480505 2.10543 0.734783 2 1 2H5ZM11.5 0C11.5281 0 11.5556 0.0028567 11.5825 0.00732422C11.5869 0.00805422 11.5913 0.00843033 11.5957 0.00927734L11.6006 0.0102539C11.6055 0.0112601 11.6104 0.012522 11.6152 0.0136719C11.6255 0.016098 11.6359 0.0183996 11.646 0.0214844C11.6704 0.0289165 11.6937 0.0389013 11.7163 0.0498047C11.7233 0.0531725 11.7304 0.056345 11.7373 0.0600586C11.8102 0.0994368 11.8721 0.156274 11.9175 0.225098C11.9299 0.24384 11.9406 0.263308 11.9502 0.283203C11.9611 0.305795 11.9706 0.32919 11.978 0.353516C11.9811 0.363659 11.9834 0.373993 11.9858 0.384277C11.9947 0.421468 12 0.46011 12 0.5V4.25C12 4.52614 11.7761 4.75 11.5 4.75C11.2239 4.75 11 4.52614 11 4.25V1.70703L7.35352 5.35352C7.15825 5.54878 6.84175 5.54878 6.64648 5.35352C6.45122 5.15825 6.45122 4.84175 6.64648 4.64648L10.293 1H7.75C7.47386 1 7.25 0.776142 7.25 0.5C7.25 0.223858 7.47386 0 7.75 0H11.5Z"
      fill="currentColor"
    />
  </svg>
);

// Couch icon component (for sofa beds)
const CouchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 15 10" fill="none">
    <path
      d="M13.5 0C13.7652 0 14.0195 0.105432 14.207 0.292969C14.3946 0.480505 14.5 0.734784 14.5 1V3.13574C14.6518 3.22337 14.778 3.34929 14.8657 3.50098C14.9534 3.65266 14.9997 3.82477 15 4V7C15 7.26522 14.8946 7.51949 14.707 7.70703C14.5195 7.89457 14.2652 8 14 8H13.5V9C13.5 9.13261 13.4473 9.25975 13.3535 9.35352C13.2597 9.44728 13.1326 9.5 13 9.5C12.8674 9.5 12.7403 9.44728 12.6465 9.35352C12.5527 9.25975 12.5 9.13261 12.5 9V8H2.5V9C2.5 9.13261 2.44728 9.25975 2.35352 9.35352C2.25975 9.44728 2.13261 9.5 2 9.5C1.86739 9.5 1.74025 9.44728 1.64648 9.35352C1.55272 9.25975 1.5 9.13261 1.5 9V8H1C0.734784 8 0.480505 7.89457 0.292969 7.70703C0.105432 7.51949 0 7.26522 0 7V4C0.000289333 3.82477 0.0465527 3.65266 0.134277 3.50098C0.222021 3.34929 0.348246 3.22337 0.5 3.13574V1C0.5 0.734784 0.605432 0.480505 0.792969 0.292969C0.980505 0.105432 1.23478 0 1.5 0H13.5ZM1 4V7H14V4H13V5.5C13 5.63261 12.9473 5.75975 12.8535 5.85352C12.7597 5.94728 12.6326 6 12.5 6H2.5C2.36739 6 2.24025 5.94728 2.14648 5.85352C2.05272 5.75975 2 5.63261 2 5.5V4H1ZM1.5 1V3H2C2.26522 3 2.51949 3.10543 2.70703 3.29297C2.89457 3.48051 3 3.73478 3 4V5H7V1H1.5ZM8 1V5H12V4C12 3.73478 12.1054 3.48051 12.293 3.29297C12.4805 3.10543 12.7348 3 13 3H13.5V1H8Z"
      fill="currentColor"
    />
  </svg>
);

export function HotelInfo({ hotel, trip, onClose }: HotelInfoProps) {
  const { message } = App.useApp();
  const [isExpanded, setIsExpanded] = useState(true);
  const [showBookingDetails, setShowBookingDetails] = useState(false);
  const [isDownloadingConfirmation, setIsDownloadingConfirmation] =
    useState(false);
  const [isCancellationModalOpen, setIsCancellationModalOpen] = useState(false);

  const { apiClient } = useAuthStore();
  const queryClient = useQueryClient();
  const { markItemAsCancelledWithData } = useItineraryStore();
  const bookingReference = hotel.booking_data?.data?.reference;

  // Cancellation mutation
  const cancellationMutation = useMutation({
    mutationFn: async (
      cancellationReason?: string
    ): Promise<ComponentCancellationResponse> => {
      if (!apiClient) {
        throw new Error("API client not available");
      }
      return apiClient.cancelStayComponent(
        trip!.itineraryId,
        hotel.id,
        cancellationReason
      ) as Promise<ComponentCancellationResponse>;
    },
    onSuccess: async (data, cancellationReason) => {
      try {
        if (trip) {
          await markItemAsCancelledWithData(
            hotel.id,
            trip.itineraryId,
            trip.itineraryItems,
            trip.travelersCount,
            cancellationReason
          );
        }

        notification.success({
          message: "Cancellation Successful",
          description: "Stay cancelled successfully",
          placement: "topRight",
        });

        // Invalidate relevant queries to refresh the data
        queryClient.invalidateQueries({
          queryKey: ["travel-wallet-trips"],
        });
        queryClient.invalidateQueries({
          queryKey: ["trip", trip!.itineraryId.toString()],
        });

        onClose?.();
        setIsCancellationModalOpen(false);
      } catch (error) {
        console.error("Failed to update itinerary store:", error);
        notification.success({
          message: "Cancellation Successful",
          description: "Stay cancelled successfully",
          placement: "topRight",
        });

        queryClient.invalidateQueries({
          queryKey: ["travel-wallet-trips"],
        });
        queryClient.invalidateQueries({
          queryKey: ["trip", trip!.itineraryId.toString()],
        });

        onClose?.();
        setIsCancellationModalOpen(false);
      }
    },
    onError: (error: FastApiError) => {
      let errorMessage = "Failed to cancel stay";

      if (error.details && typeof error.details === "string") {
        if (error.details.includes("already cancelled")) {
          errorMessage = "This stay is already cancelled";
        } else if (error.details.includes("not found")) {
          errorMessage = "Stay not found";
        } else {
          errorMessage = error.details;
        }
      }

      notification.error({
        message: "Cancellation Failed",
        description: errorMessage,
        placement: "topRight",
      });
      console.error("Stay cancellation failed:", error);
    },
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      weekday: "short",
      day: "numeric",
      month: "short",
    };
    return date.toLocaleDateString("en-US", options);
  };

  const formatTime = (dateString: string, fallbackTime: string) => {
    try {
      const date = new Date(dateString);

      // Check if the date parsing was successful
      if (isNaN(date.getTime())) {
        return fallbackTime;
      }

      // Check if the original string contains time information
      // If it's just a date (like "2025-09-10"), the time will be 00:00:00
      // If it contains actual time, we'll use it
      const hasTimeInfo =
        dateString.includes("T") ||
        dateString.includes(" ") ||
        dateString.match(/\d{2}:\d{2}/);

      if (!hasTimeInfo) {
        // No time info in the string, use fallback
        return fallbackTime;
      }

      // Extract time and format it
      const timeString = date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });

      return timeString;
    } catch (error) {
      // If any parsing fails, return fallback
      console.warn("Date parsing failed for:", dateString, error);
      return fallbackTime;
    }
  };

  const formatIssuingDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  };

  const formatBookingInfo = () => {
    const nights = hotel.data.nights;
    return `1 room · ${nights} night${nights !== 1 ? "s" : ""}`;
  };

  const getPrimaryContact = () => {
    const primaryPassenger = trip?.passengerDetails?.[0];
    return {
      email:
        hotel.booking_data?.data?.email ||
        primaryPassenger?.contact?.email ||
        "N/A",
      phone:
        hotel.booking_data?.data?.phone_number ||
        primaryPassenger?.contact?.phone ||
        "N/A",
    };
  };

  const getGuestInfo = () => {
    if (!trip?.passengerDetails && !hotel.booking_data?.data?.guests)
      return { summary: "N/A", names: [] };

    const passengers: PassengerUnion[] =
      trip?.passengerDetails || hotel.booking_data?.data?.guests || [];
    const totalGuests = passengers.length;
    const adults = passengers.filter((p: PassengerUnion) => {
      // Check if it's a TripPassengerDetail
      if (isTripPassengerDetail(p)) {
        return (
          !p.passengerInfo?.dateOfBirth ||
          new Date().getFullYear() -
            new Date(p.passengerInfo.dateOfBirth).getFullYear() >=
            18
        );
      }
      // For HotelBookingGuest, assume adult if no birth date info
      return true;
    }).length;
    const children = totalGuests - adults;

    let summary = `${totalGuests} guest${totalGuests !== 1 ? "s" : ""}`;
    if (adults > 0) summary += ` · ${adults} adult${adults !== 1 ? "s" : ""}`;
    if (children > 0)
      summary += ` · ${children} child${children !== 1 ? "ren" : ""}`;

    let names: string[] = [];
    if (trip?.passengerDetails) {
      names = passengers.map((p: PassengerUnion) => {
        if (isTripPassengerDetail(p)) {
          const first = p.passengerInfo?.firstName || "";
          const last = p.passengerInfo?.lastName || "";
          return `${first} ${last}`.trim() || "N/A";
        }
        return "N/A";
      });
    } else {
      names = passengers.map((p: PassengerUnion) => {
        if (isHotelBookingGuest(p)) {
          const first = p.given_name || "";
          const last = p.family_name || "";
          return `${first} ${last}`.trim() || "N/A";
        }
        return "N/A";
      });
    }

    return { summary, names };
  };

  const handleCopyReference = () => {
    // In real implementation, copy the accommodation reference
    navigator.clipboard.writeText(bookingReference || hotel.duffel_quote_id);
  };

  const handleDownloadConfirmation = async () => {
    if (!trip) {
      message.error("Trip information is required for confirmation");
      return;
    }

    // Check if confirmation is available
    const confirmationStatus = ConfirmationService.getConfirmationStatus({
      hotel,
      trip,
      type: "hotel",
    });

    if (!confirmationStatus.available) {
      message.warning(
        confirmationStatus.reason || "Confirmation not available"
      );
      return;
    }

    setIsDownloadingConfirmation(true);

    try {
      await ConfirmationService.downloadHotelConfirmation({
        hotel,
        trip,
        type: "hotel",
      });

      const isConfirmed = trip.confirmation?.bookingConfirmed;
      const successMessage = isConfirmed
        ? "Hotel confirmation downloaded successfully"
        : "Hotel booking details downloaded successfully";
      message.success(successMessage);
    } catch (error) {
      console.error("Failed to download confirmation:", error);
      message.error(
        error instanceof Error
          ? error.message
          : "Failed to download confirmation"
      );
    } finally {
      setIsDownloadingConfirmation(false);
    }
  };

  const handleCancelClick = () => {
    setIsCancellationModalOpen(true);
  };

  const handleConfirmCancellation = async (reason?: string) => {
    await cancellationMutation.mutateAsync(reason);
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const toggleBookingDetails = () => {
    setShowBookingDetails(!showBookingDetails);
  };

  const isCancelled = isItineraryCancelled(hotel);

  return (
    <div className={cn(styles.hotelInfo, isCancelled && styles.cancelled)}>
      {/* Header */}
      <div className={styles.header}>
        <span className={styles.headerLabel}>HOTEL DETAILS</span>
        {onClose && (
          <Button
            className={styles.closeButton}
            variant="text"
            shape="circle"
            onClick={onClose}>
            <XIcon />
          </Button>
        )}
      </div>

      <div className={styles.content}>
        {/* Accommodation Reference */}
        <div className={styles.accommodationRef}>
          <span className={styles.refText}>
            Accommodation reference: {bookingReference || hotel.duffel_quote_id}
          </span>
          <button className={styles.copyButton} onClick={handleCopyReference}>
            <CopyIcon />
          </button>
        </div>

        <div className={styles.divider}></div>

        {/* Hotel Card */}
        <div className={styles.hotelCard}>
          <div className={styles.cardContent}>
            <div className={styles.cardHeader}>
              <div className={styles.cardLeft}>
                <div className={styles.hotelName}>{hotel.data.name}</div>
                <div className={styles.stars}>
                  <Rate
                    disabled
                    count={4}
                    defaultValue={0}
                    value={Number(hotel.data.rating)}
                    className={styles.starRating}
                  />
                </div>
              </div>
              <div className={styles.cardRight}>
                <div className={styles.actions}>
                  <ExpandButton
                    className={styles.expandButton}
                    isExpanded={isExpanded}
                    onToggle={toggleExpanded}
                    ariaLabel={{
                      expanded: "Collapse hotel details",
                      collapsed: "Expand hotel details",
                    }}
                  />
                </div>
              </div>
            </div>

            <div className={styles.divider}></div>

            {/* Action Buttons */}
            <div className={styles.actionButtons}>
              <Button
                className={styles.actionButton}
                onClick={handleDownloadConfirmation}
                loading={isDownloadingConfirmation}
                disabled={isDownloadingConfirmation || isCancelled}>
                <DownloadIcon />
                <span>Confirmation</span>
              </Button>
              {trip && !isItineraryCancelled(hotel) && (
                <Button
                  className={styles.actionButton}
                  onClick={handleCancelClick}
                  loading={cancellationMutation.isPending}
                  disabled={cancellationMutation.isPending}>
                  <ExternalLinkIcon />
                  <span>Cancel</span>
                </Button>
              )}
            </div>

            {/* Hotel Details */}
            {isExpanded && (
              <div className={styles.hotelDetails}>
                {/* Room Information */}
                <div className={styles.roomCard}>
                  <div className={styles.roomContent}>
                    <div className={styles.roomInfo}>
                      <div className={styles.roomName}>
                        {hotel.data.room.name}
                      </div>
                      <div className={styles.roomAmenities}>
                        <div className={styles.amenityItem}>
                          <BedIcon />
                          <span>{hotel.data.room.bedInfo}</span>
                        </div>
                        <div className={styles.amenityItem}>
                          <CouchIcon />
                          <span>1 sofa(s)</span>
                        </div>
                      </div>
                    </div>
                    <div className={styles.roomImage}>
                      <Image
                        src={hotel.data.photos[0]}
                        alt={hotel.data.room.name}
                        width={147}
                        height={118}
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                  </div>
                  {hotel.data.room.photos.length > 0 && (
                    <div className={styles.roomImage}>
                      <Image
                        src={hotel.data.room.photos[0]}
                        alt={hotel.data.room.name}
                        width={147}
                        height={118}
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                  )}
                </div>

                {/* Check-in / Check-out */}
                <div className={styles.checkInOut}>
                  <div className={styles.checkInfo}>
                    <div className={styles.checkLabel}>Check in</div>
                    <div className={styles.checkValue}>
                      {formatDate(hotel.data.checkIn)}{" "}
                      {formatTime(hotel.data.checkIn, "3:00PM")}
                    </div>
                  </div>
                  <div className={styles.checkInfo}>
                    <div className={styles.checkLabel}>Check out</div>
                    <div className={styles.checkValue}>
                      {formatDate(hotel.data.checkOut)}{" "}
                      {formatTime(hotel.data.checkOut, "11:00AM")}
                    </div>
                  </div>
                </div>

                {/* Room Policy */}
                <div className={styles.roomPolicy}>
                  <div className={styles.policyItem}>
                    <XIcon />
                    <span>Non-refundable</span>
                  </div>
                  {hotel.data.rate.breakfastIncluded && (
                    <div className={styles.policyItem}>
                      <CoffeeIcon />
                      <span>Breakfast included</span>
                    </div>
                  )}
                </div>

                {/* Booking Details Toggle */}
                <div className={styles.bookingDetailsToggle}>
                  <button
                    className={styles.bookingDetailsButton}
                    onClick={toggleBookingDetails}>
                    <span>View Booking details</span>
                    {showBookingDetails ? <CaretUpIcon /> : <CaretDownIcon />}
                  </button>
                </div>

                {/* Booking Details Content */}
                {showBookingDetails &&
                  (() => {
                    const contact = getPrimaryContact();
                    const guestInfo = getGuestInfo();

                    return (
                      <div className={styles.bookingDetails}>
                        <div className={styles.bookingDetailsContent}>
                          <div className={styles.bookingRow}>
                            <div className={styles.bookingInfo}>
                              <div className={styles.bookingLabel}>
                                Issuing date
                              </div>
                              <div className={styles.bookingValue}>
                                {formatIssuingDate(hotel.data.paid_at)}
                              </div>
                            </div>
                            <div className={styles.bookingInfo}>
                              <div className={styles.bookingLabel}>Booking</div>
                              <div className={styles.bookingValue}>
                                {formatBookingInfo()}
                              </div>
                            </div>
                          </div>
                          <div className={styles.bookingRow}>
                            <div className={styles.bookingInfo}>
                              <div className={styles.bookingLabel}>E-mail</div>
                              <div className={styles.bookingValue}>
                                {contact.email}
                              </div>
                            </div>
                            <div className={styles.bookingInfo}>
                              <div className={styles.bookingLabel}>
                                Guest phone number
                              </div>
                              <div className={styles.bookingValue}>
                                {contact.phone}
                              </div>
                            </div>
                          </div>
                          <div className={styles.bookingFullWidth}>
                            <div className={styles.bookingLabel}>
                              {guestInfo.summary}
                            </div>
                            <div className={styles.bookingValue}>
                              {guestInfo.names.map((name, index) => (
                                <span key={index}>
                                  {name}
                                  {index < guestInfo.names.length - 1 && ", "}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
              </div>
            )}

            <div className={styles.divider}></div>

            {/* Hotel Contacts */}
            <h3 className={styles.sectionTitle}>Hotel Contacts</h3>
            <div className={styles.hotelContacts}>
              <div className={styles.contactItem}>
                <MapMarkIcon />
                <a
                  href={`https://www.google.com/maps/search/${encodeURIComponent(
                    `${hotel.data.name}, ${hotel.data.location.address}, ${hotel.data.location.city}, ${hotel.data.location.country}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.locationLink}>
                  <p>
                    {`${hotel.data.location.city}, ${hotel.data.location.address}` ||
                      "Unknown"}
                  </p>
                </a>
              </div>
              {/* No data about phone is available from the API */}
              {/* <div className={styles.contactItem}>
                <PhoneIcon />
                <span>+34 (068) 000 0000</span>
              </div> */}
            </div>
          </div>
        </div>

        <div className={styles.divider}></div>

        {/* Cancellation Policy */}
        <h3 className={styles.sectionTitle}>Cancellation policy</h3>
        <div className={styles.cancellationPolicy}>
          <div className={styles.policyWarning}>
            <XIcon />
            <div className={styles.policyText}>
              <strong>Non refundable —</strong> You have chosen a non-refundable
              rate. If you cancel this booking, you will not receive any refund.
            </div>
          </div>
        </div>
      </div>

      {/* Cancellation Modal */}
      {trip && (
        <CancellationModal
          isOpen={isCancellationModalOpen}
          onClose={() => setIsCancellationModalOpen(false)}
          onConfirm={handleConfirmCancellation}
          componentType="stay"
          componentName={hotel.data.name}
          isLoading={cancellationMutation.isPending}
        />
      )}
    </div>
  );
}
