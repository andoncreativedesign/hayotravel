import { useAuthStore } from "@/store/auth/auth.store";
import { currentChatSelector, useChatStore } from "@/store/chat/chats.store";
import { useItineraryStore } from "@/store/itinerary/itinerary.store";
import { getItinerary, getItineraryById } from "@/utils/api/itinerary";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export const useInitializeItinerary = (chatId: string | null) => {
  const { apiClient, user } = useAuthStore();
  const { chatList, setItineraryId } = useChatStore((state) => state);
  const currentChat = currentChatSelector(chatList, chatId || "0");

  const {
    itinerary,
    setItinerary,
    initializeForChat,
    passengerCount,
    setPassengerCount,
  } = useItineraryStore();

  const [isItineraryInitialized, setIsItineraryInitialized] = useState(false);

  const {
    data: itineraryData,
    isSuccess: isItinerarySuccess,
    dataUpdatedAt,
  } = useQuery({
    queryKey: [
      "itinerary",
      chatId || "0",
      currentChat?.id,
      currentChat?.itinerary_id,
    ],
    queryFn: async () => {
      if (currentChat?.itinerary_id) {
        const specificItinerary = await getItineraryById(
          currentChat.itinerary_id
        );
        return [specificItinerary];
      } else {
        return getItinerary(currentChat?.id || 0);
      }
    },
    staleTime: 0,
    gcTime: 10 * 60 * 1000,
    enabled: !!chatId && !!currentChat?.id && !!apiClient && !!user,
  });

  useEffect(() => {
    if (chatId) {
      const initialPassengerCount = currentChat?.travelers_count || 1;
      initializeForChat(chatId, initialPassengerCount);
    }
  }, [chatId, currentChat?.travelers_count, initializeForChat]);

  useEffect(() => {
    if (itineraryData && isItinerarySuccess && !isItineraryInitialized) {
      const serverItinerary =
        itineraryData.length > 0
          ? itineraryData[0]?.itinerary_data?.itinerary || []
          : [];
      const hasLocalItinerary = itinerary.length > 0;

      if (hasLocalItinerary && serverItinerary.length === 0) {
        // if (itineraryData.length > 0) {
        //   setItineraryId(itineraryData[0]?.id, currentChat?.id || 0);
        // }
      } else if (serverItinerary.length > 0) {
        const serverPassengerCount =
          itineraryData[0]?.itinerary_data?.travelers_count;
        if (serverPassengerCount && serverPassengerCount !== passengerCount) {
          setPassengerCount(serverPassengerCount);
        }
        setItinerary(serverItinerary);
        setItineraryId(itineraryData[0]?.id, currentChat?.id || 0);
      } else {
        setItinerary([]);
        // setItineraryId(0, currentChat?.id || 0);
      }

      setIsItineraryInitialized(true);
    }

    if (
      itineraryData &&
      isItinerarySuccess &&
      isItineraryInitialized &&
      dataUpdatedAt
    ) {
      const timeSinceUpdate = Date.now() - dataUpdatedAt;
      if (timeSinceUpdate < 3000) {
        const serverItinerary =
          itineraryData.length > 0
            ? itineraryData[0]?.itinerary_data?.itinerary || []
            : [];
        if (JSON.stringify(serverItinerary) !== JSON.stringify(itinerary)) {
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

  useEffect(() => {
    setIsItineraryInitialized(false);
  }, [chatId]);
};
