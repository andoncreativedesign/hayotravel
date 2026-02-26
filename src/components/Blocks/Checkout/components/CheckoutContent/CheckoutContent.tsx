"use client";

import { useDocumentTitle } from "@/hooks";
import { useAuthStore } from "@/store/auth/auth.store";
import { currentChatSelector, useChatStore } from "@/store/chat/chats.store";
import { useCheckoutStore } from "@/store/checkout/checkout.store";
import {
  ItineraryType,
  useItineraryStore,
  type Itinerary,
  type ItineraryFlight,
} from "@/store/itinerary/itinerary.store";
import {
  getItineraryByClientId,
  getItineraryById,
} from "@/utils/api/itinerary";
import { cn } from "@/utils/helpers/cn";
import { Chat } from "@/utils/types/chat";
import { useQuery } from "@tanstack/react-query";
import { Alert, Button, Spin } from "antd";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import Header from "../Header/Header";
import { LeaveCheckoutModal } from "../Modals";
import PaymentSummary from "../PaymentSummary/PaymentSummary";
import UnifiedProgressBar from "../UnifiedProgressBar/UnifiedProgressBar";
import styles from "./CheckoutContent.module.scss";
import { StepContent } from "./StepContent";

interface CheckoutContentProps {
  chatId: string;
  itineraryId: string;
}

const CheckoutContent = ({ chatId, itineraryId }: CheckoutContentProps) => {
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [itineraryTitle, setItineraryTitle] = useState<string>("");
  const router = useRouter();
  const { chatList, updateChatList } = useChatStore();
  const {
    currentStep,
    completedSteps,
    setCurrentStep,
    markStepCompleted,
    setItineraryId,
  } = useCheckoutStore();
  const currentChat = currentChatSelector(chatList, chatId);

  // Update document title for checkout
  useDocumentTitle(
    currentChat?.title ? `${currentChat.title} - Checkout` : "Checkout"
  );

  const {
    passengerCount: itineraryPassengerCount,
    initializeForChat,
    setItinerary,
  } = useItineraryStore();
  const { apiClient, user, backendUser } = useAuthStore();

  const { data: chatMetadata } = useQuery({
    queryKey: ["chat-metadata", chatId],
    queryFn: () => {
      if (!apiClient) {
        throw new Error("API client not available");
      }
      return apiClient.updateChatTravelInfo(
        chatId?.toString() || "0"
      ) as Promise<Chat>;
    },
    enabled: !!chatId && !!apiClient,
  });

  const { data: apiItineraryData, isLoading: isLoadingItinerary } = useQuery({
    queryKey: ["itinerary-by-client-id", chatId],
    queryFn: () => getItineraryByClientId(chatId),
    enabled: !!chatId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    if (chatMetadata) {
      console.log(
        "✅ CHECKOUT: Chat metadata loaded, updating chat store:",
        chatMetadata
      );
      updateChatList(chatMetadata);
    }
  }, [chatMetadata, updateChatList]);

  // Use centralized passenger count with fallback hierarchy
  const totalPassengers = useMemo(() => {
    const count =
      itineraryPassengerCount > 0
        ? itineraryPassengerCount
        : currentChat?.travelers_count || 1;
    return count;
  }, [itineraryPassengerCount, currentChat?.travelers_count]);

  // Memoize auth readiness to prevent excessive re-renders
  const isAuthReady = useMemo(() => {
    return !!(apiClient && user && backendUser);
  }, [apiClient, user, backendUser]);

  console.log(
    `👥 CHECKOUT: Using ${totalPassengers} passengers (itinerary: ${itineraryPassengerCount}, chat: ${currentChat?.travelers_count})`
  );

  // Check if initialization is complete
  // We consider initialized if we have basic passenger count info (even fallback of 1)
  // Auth is required for itinerary loading, so we also check for that
  const isInitialized = isAuthReady && totalPassengers > 0;

  // Initialize itinerary store with chat context and passenger count
  useEffect(() => {
    if (chatId) {
      // Use available passenger count or fallback to 1
      const initialPassengerCount = currentChat?.travelers_count || 1;
      console.log(
        `🔄 CHECKOUT INIT: Setting up itinerary store for chat ${chatId} with ${initialPassengerCount} passengers`
      );
      initializeForChat(chatId, initialPassengerCount);
    }
  }, [chatId, currentChat?.travelers_count, initializeForChat]);

  // Initialize checkout store with itinerary ID
  useEffect(() => {
    if (itineraryId) {
      setItineraryId(itineraryId);
    }
  }, [itineraryId, setItineraryId]);

  const fetchItinerary = useCallback(async () => {
    // Only require auth and itineraryId - chat data is not strictly needed for loading itinerary
    if (!itineraryId || !isAuthReady) return;

    setLoading(true);
    setError(null);

    try {
      const itineraryData = await getItineraryById(Number(itineraryId));
      if (itineraryData?.itinerary_data?.itinerary) {
        console.log(
          `📋 CHECKOUT: Loading itinerary data with ${itineraryData.itinerary_data.itinerary.length} items`
        );

        // Extract passenger count from itinerary_data (preferred) or fallback to flight data
        let passengerCountFromItinerary =
          itineraryData.itinerary_data.travelers_count;

        if (!passengerCountFromItinerary) {
          // Fallback: Extract from flight data if available
          const flights = itineraryData.itinerary_data.itinerary.filter(
            (item: Itinerary) => item.type === ItineraryType.Flight
          ) as ItineraryFlight[];
          if (flights.length > 0) {
            const flightItem = flights[0];
            if (flightItem.data?.passengers?.length > 0) {
              passengerCountFromItinerary = flightItem.data.passengers.length;
              console.log(
                `📋 CHECKOUT: Found ${passengerCountFromItinerary} passengers from flight data`
              );
            }
          }
        } else {
          console.log(
            `📋 CHECKOUT: Found ${passengerCountFromItinerary} passengers from itinerary_data`
          );
        }

        // Initialize store with passenger count - use fallback passenger count if chat data not yet available
        const effectivePassengerCount =
          passengerCountFromItinerary || totalPassengers || 1;
        console.log(
          `🔄 CHECKOUT: Initializing with passenger count: ${effectivePassengerCount}`
        );
        initializeForChat(chatId, effectivePassengerCount);

        setItinerary(itineraryData.itinerary_data.itinerary);
      }

      console.log("📋 CHECKOUT: Itinerary data loaded:", itineraryData);
      if (itineraryData?.title) {
        setItineraryTitle(itineraryData.title);
      }
    } catch (err) {
      console.error("Failed to fetch itinerary:", err);
      setError("Failed to load itinerary data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [
    itineraryId,
    chatId,
    setItinerary,
    initializeForChat,
    isAuthReady,
    totalPassengers,
  ]);

  useEffect(() => {
    fetchItinerary();
  }, [fetchItinerary]);

  const mainSteps = [
    {
      key: "review",
      title: "Trip Review",
      description: "Review your selections",
      completed: completedSteps.has(0),
      current: currentStep === 0,
    },
    {
      key: "travelers",
      title: "Travellers Info",
      description: "Enter passenger details",
      completed: completedSteps.has(1),
      current: currentStep === 1,
    },
    {
      key: "payment",
      title: "Overview & Payment",
      description: "Complete your booking",
      completed: completedSteps.has(2),
      current: currentStep === 2,
    },
  ];

  const handleCancelLeave = () => {
    setShowLeaveModal(false);
  };

  const handleConfirmLeave = () => {
    setShowLeaveModal(false);
    router.push(`/chat/${chatId}`);
  };

  const handleBackToPrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      setShowLeaveModal(true);
    }
  };

  const handleContinue = () => {
    if (currentStep < 2) {
      markStepCompleted(currentStep);
      setCurrentStep(currentStep + 1);
    } else {
      console.log(
        "❌ HANDLE CONTINUE: Cannot advance - already at final step",
        { currentStep }
      );
    }
  };

  if (loading || isLoadingItinerary || !isInitialized) {
    return (
      <div className={styles.checkoutContent}>
        <Header chatId={chatId} title={itineraryTitle} />
        <div className={styles.container}>
          <div style={{ textAlign: "center", padding: "50px" }}>
            <Spin size="large" />
            <p style={{ marginTop: "16px" }}>
              {loading || isLoadingItinerary
                ? "Loading itinerary data..."
                : "Initializing passenger data..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.checkoutContent}>
        <Header chatId={chatId} title={itineraryTitle} />
        <div className={styles.container}>
          <Alert
            message="Error Loading Itinerary"
            description={error}
            type="error"
            showIcon
            style={{ margin: "20px" }}
            action={
              <Button
                size="small"
                danger
                onClick={() => window.location.reload()}>
                Retry
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={styles.checkoutContent} data-testid="checkout-content">
        <Header chatId={chatId} title={itineraryTitle} />

        <div className={styles.container}>
          <UnifiedProgressBar
            mainSteps={mainSteps}
            currentMainStep={currentStep}
          />

          <div
            className={cn(
              styles.content,
              currentStep === 2 && styles.fullWidthSection
            )}>
            <div className={styles.leftSection}>
              <div className={styles.stepContent}>
                <StepContent
                  currentStep={currentStep}
                  totalPassengers={totalPassengers}
                  handleContinue={handleContinue}
                  handleBackToPrevious={handleBackToPrevious}
                  checkoutId={itineraryId}
                  apiItineraryData={apiItineraryData}
                />
              </div>
            </div>

            <div className={styles.rightSection}>
              {currentStep !== 2 && (
                <PaymentSummary totalPassengers={totalPassengers} />
              )}
            </div>
          </div>
        </div>
      </div>
      <LeaveCheckoutModal
        open={showLeaveModal}
        onCancel={handleCancelLeave}
        onConfirm={handleConfirmLeave}
      />
    </>
  );
};

export default CheckoutContent;
