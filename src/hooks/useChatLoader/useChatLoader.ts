import { useAuthStore } from "@/store/auth/auth.store";
import { useChatStore, getEffectiveUserId } from "@/store/chat/chats.store";
import { Chat } from "@/utils/types/chat";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

/**
 * Custom hook to handle chat loading logic
 * This ensures chats are loaded regardless of UI component visibility
 */
export const useChatLoader = () => {
  const { setChatList, adminSelectedUserId } = useChatStore();
  const chatState = useChatStore((state) => state);
  const { apiClient } = useAuthStore((state) => state);
  
  const effectiveUserId = getEffectiveUserId(chatState);
  
  const {
    data: chatList,
    isLoading,
    isSuccess,
    error,
  } = useQuery({
    queryKey: ["chats", effectiveUserId, adminSelectedUserId],
    queryFn: () => {
      if (!apiClient) {
        throw new Error("API client not available");
      }
      return apiClient.getChatSessionsByUser(effectiveUserId) as Promise<Chat[]>;
    },
    enabled: effectiveUserId > 0 && !!apiClient, // Only fetch when we have a valid user ID and API client
  });

  useEffect(() => {
    if (isSuccess && chatList) {
      setChatList(chatList);
    }
  }, [isSuccess, chatList, setChatList]);

  return {
    chatList,
    isLoading,
    isSuccess,
    error,
  };
};
