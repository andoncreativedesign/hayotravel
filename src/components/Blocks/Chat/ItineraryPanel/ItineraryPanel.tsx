import {
  ArrowLineRightIcon,
  CloseIcon,
  ToteSimpleIcon,
} from "@/components/icons";
import PaymentButton from "@/components/ui/PaymentButton/PaymentButton";
import { useAuthStore } from "@/store/auth/auth.store";
import { currentChatSelector, useChatStore } from "@/store/chat/chats.store";
import { useSplitStore } from "@/store/chat/split.store";
import {
  ItineraryType,
  useItineraryStore,
} from "@/store/itinerary/itinerary.store";
import { getDisplayItems } from "@/utils";
import { getItinerary, getItineraryById } from "@/utils/api/itinerary";
import { cn } from "@/utils/helpers/cn";
import { useQuery } from "@tanstack/react-query";
import { Alert, Flex, Spin, Typography } from "antd";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import ItineraryItem from "./ItineraryItem";
import styles from "./ItineraryPanel.module.scss";
import ItinerarySummary from "./ItinerarySummary";

const { Text } = Typography;

const ItineraryPanel = ({ chatId }: { chatId: string }) => {
  const { setIsFullWidth, setIsRightPanelOpen, isFullWidth } = useSplitStore(
    (state) => state
  );
  const { apiClient, user } = useAuthStore();
  const router = useRouter();
  const { chatList, setItineraryId, updateTravelersCount } = useChatStore(
    (state) => state
  );
  const currentChat = currentChatSelector(chatList, chatId);

  const {
    itinerary,
    setItemExpanded,
    setItinerary,
    initializeForChat,
    passengerCount,
    setPassengerCount,
    isItineraryPaid,
  } = useItineraryStore();

  const isPaid = isItineraryPaid();

  const handleProceedToCheckout = () => {
    // Don't allow navigation if already paid
    if (isPaid) {
      return;
    }

    const itineraryId = currentChat?.itinerary_id;
    if (itineraryId) {
      router.push(`/chat/${chatId}/checkout/${itineraryId}`);
    }
  };

  // Log whenever itinerary changes
  useEffect(() => {
    console.log("📋 ITINERARY STORE: Itinerary changed:", itinerary);
  }, [itinerary]);

  // Track if the itinerary has been initialized to prevent unwanted restoration
  const [isItineraryInitialized, setIsItineraryInitialized] = useState(false);

  // Memoized passenger count extraction to prevent unnecessary recalculations
  const totalPassengers = useMemo(() => {
    // 1. Use travelers_count from current chat (highest priority)
    if (currentChat?.travelers_count && currentChat.travelers_count > 0) {
      console.log(
        `👥 PASSENGERS: Using chat travelers_count: ${currentChat.travelers_count}`
      );
      return currentChat.travelers_count;
    }

    // 2. Use persisted passenger count from itinerary store
    if (passengerCount > 0) {
      console.log(
        `👥 PASSENGERS: Using persisted count from store: ${passengerCount}`
      );
      return passengerCount;
    }

    // 3. Extract from itinerary passenger data if available
    const flightItems = itinerary.filter(
      (item) => item.type === ItineraryType.Flight
    );
    if (flightItems.length > 0 && flightItems[0].data.passengers?.length > 0) {
      const passengerCountFromItinerary = flightItems[0].data.passengers.length;
      console.log(
        `👥 PASSENGERS: Using count from itinerary: ${passengerCountFromItinerary}`
      );
      return passengerCountFromItinerary;
    }

    // 4. Check localStorage directly as last resort
    try {
      const storedCount = localStorage.getItem(
        `hayo-passenger-count-${chatId}`
      );
      if (storedCount && parseInt(storedCount) > 0) {
        const count = parseInt(storedCount);
        console.log(`👥 PASSENGERS: Using localStorage count: ${count}`);
        return count;
      }
    } catch (error) {
      console.warn("Failed to read passenger count from localStorage:", error);
    }

    // 5. Fallback to 1 passenger
    console.log(`👥 PASSENGERS: Using fallback count: 1`);
    return 1;
  }, [passengerCount, currentChat?.travelers_count, itinerary, chatId]);

  const {
    data: itineraryData,
    isLoading: isItineraryLoading,
    isSuccess: isItinerarySuccess,
    dataUpdatedAt,
  } = useQuery({
    queryKey: ["itinerary", chatId, currentChat?.id, currentChat?.itinerary_id],
    queryFn: async () => {
      // If we have a specific itinerary ID, fetch that specific itinerary
      if (currentChat?.itinerary_id) {
        console.log(
          "📋 REACT QUERY: Fetching specific itinerary by ID:",
          currentChat.itinerary_id
        );
        const specificItinerary = await getItineraryById(
          currentChat.itinerary_id
        );
        // Return in array format to maintain consistency with existing code
        return [specificItinerary];
      } else {
        // Fall back to fetching all itineraries for the chat
        console.log(
          "📋 REACT QUERY: Fetching itinerary data for chat:",
          currentChat?.id
        );
        return getItinerary(currentChat?.id || 0);
      }
    },
    staleTime: 0,
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!currentChat?.id && !!apiClient && !!user, // Only run query when we have a chat and auth
  });

  // Initialize store when chat changes or becomes available
  useEffect(() => {
    if (currentChat?.id && chatId) {
      const initialPassengerCount = currentChat.travelers_count || 1;
      console.log(
        `🔄 INITIALIZATION: Setting up itinerary store for chat ${chatId} with ${initialPassengerCount} passengers`
      );

      // Initialize the store with chat context and passenger count
      initializeForChat(chatId, initialPassengerCount);
    }
  }, [currentChat?.id, chatId, initializeForChat]);

  // Separate effect for syncing passenger count to avoid circular dependency
  useEffect(() => {
    if (currentChat?.id && currentChat.travelers_count > 0) {
      const currentStoreCount = passengerCount;
      if (currentChat.travelers_count !== currentStoreCount) {
        console.log(
          `🔄 SYNC: Updating chat travelers_count from ${currentChat.travelers_count} to ${currentStoreCount}`
        );
        updateTravelersCount(currentStoreCount, currentChat.id);
      }
    }
  }, [
    currentChat?.id,
    currentChat?.travelers_count,
    passengerCount,
    updateTravelersCount,
  ]);

  // Log when query data changes
  useEffect(() => {
    console.log(
      "📋 REACT QUERY: Data updated at:",
      new Date(dataUpdatedAt),
      "Data:",
      itineraryData
    );
  }, [dataUpdatedAt, itineraryData]);

  // Enhanced synchronization logic with conflict resolution
  useEffect(() => {
    console.log("📋 ITINERARY PANEL: useEffect triggered", {
      itineraryData,
      isItinerarySuccess,
      isItineraryInitialized,
      currentItinerary: itinerary,
      hasLocalData: itinerary.length > 0,
    });

    if (itineraryData && isItinerarySuccess && !isItineraryInitialized) {
      console.log("📋 ITINERARY PANEL: Initializing itinerary from API data");

      const serverItinerary =
        itineraryData.length > 0
          ? itineraryData[0]?.itinerary_data?.itinerary || []
          : [];
      const hasLocalItinerary = itinerary.length > 0;

      // Conflict resolution: prefer local data if it exists and is more recent
      if (hasLocalItinerary && serverItinerary.length === 0) {
        console.log(
          "📋 CONFLICT RESOLUTION: Keeping local itinerary (server has none)"
        );
        // Keep local data, but update server reference
        if (itineraryData.length > 0) {
          setItineraryId(itineraryData[0]?.id || 0, currentChat?.id || 0);
        }
      } else if (serverItinerary.length > 0) {
        console.log("📋 SYNC: Using server itinerary data");

        // Sync passenger count from server data if available
        const serverPassengerCount =
          itineraryData[0]?.itinerary_data?.travelers_count;
        if (serverPassengerCount && serverPassengerCount !== passengerCount) {
          console.log(
            `👥 SYNC: Updating passenger count from server: ${serverPassengerCount}`
          );
          setPassengerCount(serverPassengerCount);
        }

        setItinerary(serverItinerary);
        setItineraryId(itineraryData[0]?.id, currentChat?.id || 0);
      } else {
        console.log("📋 SYNC: Both local and server are empty");
        setItinerary([]);
        setItineraryId(0, currentChat?.id || 0);
      }

      setIsItineraryInitialized(true);
    }

    // Handle recent server updates (mutations) with local state preservation
    if (
      itineraryData &&
      isItinerarySuccess &&
      isItineraryInitialized &&
      dataUpdatedAt
    ) {
      const timeSinceUpdate = Date.now() - dataUpdatedAt;
      // Only sync if update is very recent (likely from a mutation we triggered)
      if (timeSinceUpdate < 3000) {
        console.log(
          "📋 MUTATION SYNC: Recent server update detected, syncing carefully"
        );
        const serverItinerary =
          itineraryData.length > 0
            ? itineraryData[0]?.itinerary_data?.itinerary || []
            : [];

        // Only overwrite local state if server has more recent data
        if (JSON.stringify(serverItinerary) !== JSON.stringify(itinerary)) {
          console.log(
            "📋 MUTATION SYNC: Server data differs from local, updating"
          );
          setItinerary(serverItinerary);
        }
      }
    }
  }, [
    itineraryData,
    isItinerarySuccess,
    isItineraryInitialized,
    setItinerary,
    setItineraryId,
    currentChat?.id,
    dataUpdatedAt,
    itinerary,
  ]);

  // Reset initialization flag when chat changes
  useEffect(() => {
    setIsItineraryInitialized(false);
  }, [chatId]);

  // Calculate total price including flights, hotels, and taxes
  const flightItems = itinerary.filter(
    (item) => item.type === ItineraryType.Flight
  );
  const hotelItems = itinerary.filter(
    (item) => item.type === ItineraryType.Hotel
  );

  const flightPrice = flightItems.reduce(
    (acc, item) => acc + Number(item.price),
    0
  );
  const hotelPrice = hotelItems.reduce(
    (acc, item) => acc + Number(item.price),
    0
  );

  const totalItineraryPrice = flightPrice * totalPassengers + hotelPrice;

  const handleToggleFullWidth = () => {
    itinerary.forEach((item) => {
      setItemExpanded(item.id, true);
    });
    setIsFullWidth(!isFullWidth);
  };

  const handleClose = () => {
    setIsFullWidth(false);
    setIsRightPanelOpen(false);
  };

  return (
    <div className={styles.itinerary__container} data-testid="itinerary-panel">
      <div className={styles.itinerary__navigation}>
        <div className={styles.itinerary__navigation__title}>
          <span onClick={handleToggleFullWidth}>
            <ArrowLineRightIcon
              className={
                isFullWidth ? styles.itinerary__navigation__icon__rotated : ""
              }
            />
          </span>
          <h5 className={styles.itinerary__subtitle}>MY BASKET</h5>
        </div>
        <span onClick={handleClose}>
          <CloseIcon />
        </span>
      </div>

      <div className={styles.itinerary__items__wrapper}>
        <div
          className={styles.itinerary__items}
          style={{ width: isFullWidth ? "50%" : "100%" }}>
          <div
            className={cn(
              styles.itinerary__items__inner,
              isFullWidth && styles.itinerary__items__inner__full
            )}>
            {isItineraryLoading ? (
              <Flex
                justify="center"
                align="center"
                className={styles.itinerary__loading}>
                <Spin />
              </Flex>
            ) : (
              getDisplayItems(itinerary).map((item) => (
                <ItineraryItem key={item.id} item={item} />
              ))
            )}
          </div>
        </div>

        {isFullWidth && (
          <div className={styles.itinerary__summary}>
            <ItinerarySummary totalPassengers={totalPassengers} />
            <PaymentButton
              type="primary"
              className={styles.itinerary__summary__button}
              icon={<ToteSimpleIcon />}
              onClick={handleProceedToCheckout}
              disabled={isPaid}
              data-testid="proceed-to-checkout">
              {isPaid ? "✓ Already Paid" : "Proceed to Booking"}
            </PaymentButton>
            <Alert
              message="🔒 These rates are held for you for 15 minutes"
              type="success"
              showIcon={false}
              className={styles["itinerary__summary__alert--success"]}
            />
            <Alert
              message="Before You Book"
              description={
                <div
                  className={
                    styles["itinerary__summary__alert--warning__description"]
                  }>
                  <p>
                    • Ensure passport is valid for 6+ months from travel date
                  </p>
                  <p>
                    • Check <span>Portugal Visa Requirements</span>
                  </p>
                </div>
              }
              type="warning"
              showIcon
              className={styles["itinerary__summary__alert--warning"]}
            />
          </div>
        )}
      </div>

      {!isFullWidth && (
        <div className={styles.itinerary__footer}>
          <Flex vertical>
            <Text className={styles["itinerary__footer--info"]}>
              Total for {totalPassengers} travelers
            </Text>
            <Text className={styles["itinerary__footer--price"]}>
              ${totalItineraryPrice.toFixed(2)}
            </Text>
          </Flex>
          <PaymentButton
            type="primary"
            icon={<ToteSimpleIcon />}
            className={styles.itinerary__summary__button}
            onClick={handleProceedToCheckout}
            disabled={isPaid}
            data-testid="proceed-to-checkout">
            {isPaid ? "✓ Already Paid" : "Proceed to Booking"}
          </PaymentButton>
        </div>
      )}
    </div>
  );
};

export default ItineraryPanel;
