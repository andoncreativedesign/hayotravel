"use client";

import {
  BedIcon,
  CheckIcon,
  CoffeeIcon,
  ShoppingCartIcon,
  XIcon,
} from "@/components/icons";
import PaymentButton from "@/components/ui/PaymentButton/PaymentButton";
import { currentChatSelector, useChatStore } from "@/store/chat/chats.store";
import { useHotelStore } from "@/store/chat/hotel.store";
import { SectionMode, useSplitStore } from "@/store/chat/split.store";
import {
  createHotelItinerary,
  ItineraryType,
  useItineraryStore,
} from "@/store/itinerary/itinerary.store";
import { ensureISODateString } from "@/utils";
import { sendItinerary, updateItinerary } from "@/utils/api/itinerary";
import { formatCurrencyWithSymbol } from "@/utils/helpers/currency";
import { SendItineraryBody } from "@/utils/types/chat";
import { HotelOption, Rate, Room } from "@/utils/types/hotels";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert, message, Typography } from "antd";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useState } from "react";
import styles from "./RoomOptions.module.scss";

const { Text, Title } = Typography;

const RoomOptions = () => {
  const { hotel: option, hotelRates } = useHotelStore((state) => state);
  const { itinerary, addHotelItinerary, passengerCount, setItinerary } =
    useItineraryStore((state) => state);
  const { chatList, setItineraryId } = useChatStore((state) => state);
  const { setIsRightPanelOpen, setIsFullWidth, setSectionMode } = useSplitStore(
    (state) => state
  );
  const params = useParams<{ id: string }>();
  const chatId = params.id;
  const currentChat = currentChatSelector(chatList, chatId);
  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = message.useMessage();

  // Track which rate is being processed and mutation success state
  const [loadingRateId, setLoadingRateId] = useState<string | null>(null);
  const [successfulRateId, setSuccessfulRateId] = useState<string | null>(null);

  // Send itinerary mutation
  const sendItineraryMutation = useMutation({
    mutationFn: sendItinerary,
    onSuccess: (data) => {
      console.log("✅ SEND MUTATION: Itinerary created successfully:", data);

      // Update chat with new itinerary ID
      if (currentChat?.id) {
        setItineraryId(data.id, currentChat.id);
        console.log(
          `📎 SEND MUTATION: Set itinerary ID ${data.id} for chat ${currentChat.id}`
        );
      }

      // Sync complete itinerary from server response
      if (data.itinerary_data?.itinerary) {
        setItinerary(data.itinerary_data.itinerary);
        console.log("📦 SEND MUTATION: Synced itinerary from server response");
      }

      // Set UI state to show success
      setIsRightPanelOpen(true);
      setIsFullWidth(false);
      setSectionMode(SectionMode.Itinerary);

      // Show success message
      messageApi.success({
        content: "Hotel successfully added to your itinerary!",
        duration: 3,
      });

      // Mark this rate as successful and clear loading
      setSuccessfulRateId(loadingRateId);
      setLoadingRateId(null);

      // Invalidate queries to ensure fresh data
      queryClient.invalidateQueries({
        queryKey: ["itinerary", chatId, currentChat?.id],
      });
    },
    onError: (error: Error) => {
      console.error("❌ SEND MUTATION: Failed to create itinerary:", error);
      messageApi.error({
        content: `Failed to add hotel: ${error.message || "Please try again"}`,
        duration: 4,
      });

      // Clear loading state on error
      setLoadingRateId(null);
    },
  });

  // Update itinerary mutation
  const updateItineraryMutation = useMutation({
    mutationFn: updateItinerary,
    onSuccess: (data) => {
      // Update itinerary ID if it changed (shouldn't happen, but just in case)
      if (currentChat?.id && data.id && data.id !== currentChat.itinerary_id) {
        setItineraryId(data.id, currentChat.id);
      }

      // Sync complete itinerary from server response
      if (data.itinerary_data?.itinerary) {
        setItinerary(data.itinerary_data.itinerary);
      }

      // Set UI state to show success
      setIsRightPanelOpen(true);
      setIsFullWidth(false);
      setSectionMode(SectionMode.Itinerary);

      // Show success message
      messageApi.success({
        content: "Hotel successfully updated in your itinerary!",
        duration: 3,
      });

      // Mark this rate as successful and clear loading
      setSuccessfulRateId(loadingRateId);
      setLoadingRateId(null);

      // Invalidate queries to ensure fresh data
      queryClient.invalidateQueries({
        queryKey: [
          "itinerary",
          chatId,
          currentChat?.id,
          currentChat?.itinerary_id,
        ],
      });
    },
    onError: (error: Error) => {
      console.error("❌ UPDATE MUTATION: Failed to update itinerary:", error);
      messageApi.error({
        content: `Failed to update itinerary: ${
          error.message || "Please try again"
        }`,
        duration: 4,
      });

      // Clear loading state on error
      setLoadingRateId(null);
    },
  });

  if (!option) {
    return (
      <div className={styles.roomOptions}>
        <Title level={4} className={styles.roomsTitle}>
          Rooms
        </Title>
        <Text>TDA</Text>
      </div>
    );
  }

  // Use updated hotel data if available, otherwise fall back to original
  const hotelData = hotelRates?.data || option;
  const accommodation = hotelData.accommodation;

  // For room data, use updated data if available, but ensure we still have access to original rooms for itinerary creation
  const displayRooms = accommodation.rooms;

  // Calculate nights for pricing
  const checkInDate = new Date(hotelData.check_in_date);
  const checkOutDate = new Date(hotelData.check_out_date);
  const nights = Math.ceil(
    (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Use hotel photos as room images fallback
  const hotelPhotos = accommodation.photos || [];
  const fallbackImage = hotelPhotos[0]?.url || "/hotel_1.png";

  const handleAddToItinerary = (room: Room, rate: Rate, roomIndex: number) => {
    try {
      // Set loading state for this specific rate and clear any previous success
      setLoadingRateId(rate.id);
      setSuccessfulRateId(null);

      // Create a hybrid hotel option that uses original structure with updated data
      const hotelOptionForItinerary: HotelOption = {
        ...option,
        // Use updated pricing if available
        cheapest_rate_total_amount:
          hotelData.cheapest_rate_total_amount ||
          option.cheapest_rate_total_amount,
        cheapest_rate_currency:
          hotelData.cheapest_rate_currency || option.cheapest_rate_currency,
        accommodation: {
          ...option.accommodation,
          // Use updated rooms data but ensure the structure matches
          rooms: option.accommodation.rooms.map((originalRoom, idx) => {
            if (idx === roomIndex) {
              // Return the selected room with its rates
              return room;
            }
            return originalRoom;
          }),
        },
      };

      // Create the hotel itinerary item
      const hotelItinerary = createHotelItinerary(
        hotelOptionForItinerary,
        rate,
        room
      );

      const itineraryId = currentChat?.itinerary_id;
      if (itineraryId) {
        console.log(
          "🔄 HOTEL ADDITION: Updating existing itinerary with ID:",
          itineraryId
        );
        const updateItineraryBody: Partial<SendItineraryBody> = {
          title: currentChat?.title || "New Trip",
          itinerary_data: {
            travelers_count:
              currentChat?.travelers_count || passengerCount || 1,
            itinerary: [
              ...itinerary.filter((item) => item.type !== ItineraryType.Hotel),
              hotelItinerary,
            ],
          },
        };

        addHotelItinerary(hotelItinerary);

        // Persist to database - success callback will handle final state sync
        updateItineraryMutation.mutate({
          itinerary: updateItineraryBody,
          itinerary_id: itineraryId,
        });
      } else {
        const sendItineraryBody: SendItineraryBody = {
          start_date: ensureISODateString(
            currentChat?.travel_start_date || new Date().toISOString()
          ),
          chat_id: currentChat?.id || 0,
          title: currentChat?.title || "New Trip",
          currency: "USD",
          end_date: ensureISODateString(hotelOptionForItinerary.check_out_date),
          itinerary_data: {
            travelers_count:
              currentChat?.travelers_count || passengerCount || 1,
            itinerary: [hotelItinerary],
          },
        };

        sendItineraryMutation.mutate(sendItineraryBody);
      }
    } catch (error) {
      console.error("Error adding hotel to itinerary:", error);
      setLoadingRateId(null);
    }
  };

  // Flatten all rates from all rooms into a single array with room context
  const allRates = displayRooms.flatMap((room: Room, roomIndex: number) =>
    (room.rates || []).map((rate: Rate) => ({
      ...rate,
      roomData: room,
      roomIndex,
    }))
  );

  // Get the first room for the header display
  const firstRoom = displayRooms[0];

  return (
    <div className={styles["room-options"]}>
      {contextHolder}
      {/* Single Room Card Header */}
      {firstRoom && (
        <div className={styles["room-card"]}>
          <div className={styles["room-card__content"]}>
            <div className={styles["room-card__header"]}>
              <Text className={styles["room-card__name"]}>
                {firstRoom.name || "TDA"}
              </Text>
              <div className={styles["room-card__details"]}>
                {firstRoom.beds && firstRoom.beds.length > 0 && (
                  <div className={styles["room-card__detail"]}>
                    {firstRoom.beds.map((bed) => (
                      <div
                        key={bed.type}
                        className={styles["room-card__detail"]}>
                        <BedIcon className={styles["room-card__detail-icon"]} />
                        <Text className={styles["room-card__detail-text"]}>
                          {bed.count} {bed.type} bed(s)
                        </Text>
                      </div>
                    ))}
                  </div>
                )}
                {/* Since there's no size or view in the Room type, we'll use placeholder or remove these */}
                <div className={styles["room-card__detail"]}>
                  <Text className={styles["room-card__detail-text"]}>TDA</Text>
                </div>
              </div>
            </div>
          </div>
          <div className={styles["room-card__image"]}>
            <Image
              src={firstRoom.photos?.[0]?.url || fallbackImage}
              alt={firstRoom.name || "Room"}
              fill
              className={styles.image}
              style={{ objectFit: "cover" }}
            />
          </div>
        </div>
      )}

      {/* Horizontal Scrolling Options */}
      <div className={styles["room-options-list"]}>
        {allRates.map((rateWithRoom, index) => {
          const { roomData, roomIndex, ...rate } = rateWithRoom;
          return (
            <div key={rate.id || index} className={styles["room-option"]}>
              <div className={styles["option__content"]}>
                <div className={styles["option__top"]}>
                  <div className={styles["option__header"]}>
                    <Text className={styles["option__title"]}>
                      {getReadableBoardType(rate.board_type)}{" "}
                      {rate.code && `(${rate.code})`}
                    </Text>
                  </div>

                  <div className={styles["amenities__list"]}>
                    {/* Cancellation policy */}
                    {rate.cancellation_timeline &&
                    rate.cancellation_timeline.length > 0 ? (
                      <div className={styles["amenities__tag"]}>
                        <CheckIcon />
                        <Text className={styles["amenities__text"]}>
                          Free cancellation until{" "}
                          {new Date(
                            rate.cancellation_timeline[0].before
                          ).toLocaleDateString()}
                        </Text>
                      </div>
                    ) : (
                      <div className={styles["amenities__tag"]}>
                        <XIcon />
                        <Text className={styles["amenities__text"]}>
                          Non-refundable
                        </Text>
                      </div>
                    )}

                    {/* Breakfast */}
                    {rate.board_type.includes("breakfast") && (
                      <div className={styles["amenities__tag"]}>
                        <CoffeeIcon />
                        <Text className={styles["amenities__text"]}>
                          Breakfast included
                        </Text>
                      </div>
                    )}
                  </div>
                </div>

                <div className={styles.divider}></div>

                <div className={styles["option__bottom"]}>
                  <div className={styles["total-pricing"]}>
                    <div className={styles["option__price-display"]}>
                      <Text className={styles["total-pricing__price"]}>
                        {formatCurrencyWithSymbol(
                          parseFloat(rate.total_amount),
                          rate.total_currency
                        )}
                      </Text>
                      <Text className={styles["option__price-unit"]}>
                        /{nights} nights
                      </Text>
                    </div>
                    <Text className={styles["total-pricing__taxes"]}>
                      {rate.tax_amount && parseFloat(rate.tax_amount) > 0
                        ? `+${formatCurrencyWithSymbol(
                            parseFloat(rate.tax_amount),
                            rate.tax_currency
                          )} taxes`
                        : "Taxes and fees included"}
                    </Text>
                  </div>
                  <AnimatePresence>
                    {successfulRateId === rate.id ? (
                      <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}>
                        <Alert
                          message="Added to your trip"
                          type="success"
                          showIcon
                        />
                      </motion.div>
                    ) : (
                      <PaymentButton
                        type="primary"
                        className={styles["add-button"]}
                        loading={loadingRateId === rate.id}
                        disabled={
                          loadingRateId !== null && loadingRateId !== rate.id
                        }
                        onClick={() =>
                          handleAddToItinerary(roomData, rate, roomIndex)
                        }>
                        <ShoppingCartIcon />
                        Add to Basket
                      </PaymentButton>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Helper function to convert board_type to readable text
function getReadableBoardType(boardType: string): string {
  switch (boardType) {
    case "room_only":
      return "Room Only";
    case "breakfast":
      return "With Breakfast";
    case "half_board":
      return "Half Board";
    case "full_board":
      return "Full Board";
    case "all_inclusive":
      return "All Inclusive";
    default:
      return boardType
        .replace(/_/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase());
  }
}

export default RoomOptions;
