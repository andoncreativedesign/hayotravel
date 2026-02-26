"use client";

import { useAuthStore } from "@/store/auth/auth.store";
import { useChatStore } from "@/store/chat/chats.store";
import { GetItineraryResponse } from "@/utils/types/chat";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect } from "react";
import ChatPanel from "./ChatPanel";

interface ChatMediatorProps {
  chatId: string | undefined;
  mocked?: boolean;
  initialInput?: string;
}

/**
 * ChatMediator - Mediator component that handles data fetching and composition
 * This component follows the mediator pattern by separating data concerns from view logic
 * It fetches itineraries data and passes it to the ChatPanel view component
 */
const ChatMediator: React.FC<ChatMediatorProps> = ({
  chatId,
  mocked = false,
  initialInput,
}) => {
  const { apiClient } = useAuthStore((state) => state);
  const { chatList, setItineraryId } = useChatStore();

  const {
    data: itineraryResponse,
    // isLoading: itinerariesLoading,
    // error: itinerariesError,
  } = useQuery({
    queryKey: ["itineraries", chatId, chatList.length],
    queryFn: async () => {
      if (!apiClient || !chatId) {
        throw new Error("API client or chat ID not available");
      }
      const response = await apiClient.getItineraryByClientId(chatId);
      return response as GetItineraryResponse[];
    },
    enabled: !!chatId && !mocked && !!apiClient,
  });

  useEffect(() => {
    if (itineraryResponse) {
      console.log(
        "📋 CHAT MEDIATOR: Setting itinerary ID",
        itineraryResponse[0]?.id,
        itineraryResponse[0]?.chat_id
      );
      setItineraryId(itineraryResponse[0]?.id, itineraryResponse[0]?.chat_id);
    }
  }, [itineraryResponse, setItineraryId]);

  return (
    <ChatPanel chatId={chatId} mocked={mocked} initialInput={initialInput} />
  );
};

export default ChatMediator;
