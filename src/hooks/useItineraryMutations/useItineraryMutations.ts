import { useChatStore } from "@/store/chat/chats.store";
import { SectionMode, useSplitStore } from "@/store/chat/split.store";
import { useItineraryStore } from "@/store/itinerary/itinerary.store";
import { sendItinerary, updateItinerary } from "@/utils/api/itinerary";
import { Chat, SendItineraryBody } from "@/utils/types/chat";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { useCallback, useRef } from "react";

interface MutationState {
  isSending: boolean;
  isUpdating: boolean;
  lastMutationTime: number;
}

export const useItineraryMutations = (
  chatId: string,
  currentChat: Chat | undefined,
  options?: {
    offerId?: string;
    onSuccess?: () => void;
  }
) => {
  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = message.useMessage();
  const { setItineraryId } = useChatStore((state) => state);
  const { setItinerary, setChoosedFlight } = useItineraryStore(
    (state) => state
  );
  const { setIsRightPanelOpen, setIsFullWidth, setSectionMode } = useSplitStore(
    (state) => state
  );

  // Track mutation state to prevent race conditions
  const mutationState = useRef<MutationState>({
    isSending: false,
    isUpdating: false,
    lastMutationTime: 0,
  });

  // Debounce rapid successive calls
  const DEBOUNCE_DELAY = 1000; // 1 second

  const shouldPreventMutation = useCallback((action: "send" | "update") => {
    const now = Date.now();
    const { isSending, isUpdating, lastMutationTime } = mutationState.current;

    // Prevent if another mutation is already in progress
    if (isSending || isUpdating) {
      console.warn(
        `🚫 RACE CONDITION PREVENTED: ${action} blocked - another mutation in progress`
      );
      return true;
    }

    // Prevent rapid successive calls
    if (now - lastMutationTime < DEBOUNCE_DELAY) {
      console.warn(
        `🚫 RACE CONDITION PREVENTED: ${action} blocked - too soon after last mutation`
      );
      return true;
    }

    return false;
  }, []);

  const sendItineraryMutation = useMutation({
    mutationFn: sendItinerary,
    onMutate: () => {
      console.log("🔄 SEND MUTATION: Starting send itinerary");
      mutationState.current.isSending = true;
      mutationState.current.lastMutationTime = Date.now();
    },
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
      if (options?.offerId) {
        setChoosedFlight(options.offerId);
        setIsRightPanelOpen(true);
        setIsFullWidth(false);
        setSectionMode(SectionMode.Itinerary);
      }

      // Show success message
      messageApi.success({
        content: "Flight successfully added to your itinerary!",
        duration: 3,
      });

      // Call custom success callback if provided
      options?.onSuccess?.();

      // Invalidate queries to ensure fresh data
      queryClient.invalidateQueries({
        queryKey: ["itinerary", chatId, currentChat?.id],
      });
    },
    onError: (error) => {
      console.error("❌ SEND MUTATION: Failed to create itinerary:", error);
      messageApi.error({
        content: `Failed to add flight: ${error.message || "Please try again"}`,
        duration: 4,
      });
    },
    onSettled: () => {
      mutationState.current.isSending = false;
      console.log("🏁 SEND MUTATION: Mutation settled");
    },
  });

  const updateItineraryMutation = useMutation({
    mutationFn: updateItinerary,
    onMutate: () => {
      console.log("🔄 UPDATE MUTATION: Starting update itinerary");
      mutationState.current.isUpdating = true;
      mutationState.current.lastMutationTime = Date.now();
    },
    onSuccess: (data) => {
      console.log("✅ UPDATE MUTATION: Itinerary updated successfully:", data);

      // Update itinerary ID if it changed (shouldn't happen, but just in case)
      if (currentChat?.id && data.id && data.id !== currentChat.itinerary_id) {
        setItineraryId(data.id, currentChat.id);
        console.log(
          `📎 UPDATE MUTATION: Updated itinerary ID to ${data.id} for chat ${currentChat.id}`
        );
      }

      // Sync complete itinerary from server response
      if (data.itinerary_data?.itinerary) {
        setItinerary(data.itinerary_data.itinerary);
        console.log(
          "📦 UPDATE MUTATION: Synced itinerary from server response"
        );
      }

      // Set UI state to show success
      if (options?.offerId) {
        setChoosedFlight(options.offerId);
        setIsRightPanelOpen(true);
        setIsFullWidth(false);
        setSectionMode(SectionMode.Itinerary);
      }

      // Show success message
      messageApi.success({
        content: "Flight successfully updated in your itinerary!",
        duration: 3,
      });

      // Call custom success callback if provided
      options?.onSuccess?.();

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
    onError: (error) => {
      console.error("❌ UPDATE MUTATION: Failed to update itinerary:", error);
      messageApi.error({
        content: `Failed to update itinerary: ${
          error.message || "Please try again"
        }`,
        duration: 4,
      });
    },
    onSettled: () => {
      mutationState.current.isUpdating = false;
      console.log("🏁 UPDATE MUTATION: Mutation settled");
    },
  });

  // Safe wrapper for sending itinerary that prevents race conditions
  const safeSendItinerary = useCallback(
    (data: SendItineraryBody) => {
      if (shouldPreventMutation("send")) {
        return;
      }

      console.log(
        "🚀 SAFE SEND: Proceeding with send itinerary mutation",
        data
      );
      sendItineraryMutation.mutate(data);
    },
    [sendItineraryMutation, shouldPreventMutation]
  );

  // Safe wrapper for updating itinerary that prevents race conditions
  const safeUpdateItinerary = useCallback(
    (data: { itinerary: Partial<SendItineraryBody>; itinerary_id: number }) => {
      if (shouldPreventMutation("update")) {
        return;
      }

      console.log(
        "🚀 SAFE UPDATE: Proceeding with update itinerary mutation",
        data
      );
      updateItineraryMutation.mutate(data);
    },
    [updateItineraryMutation, shouldPreventMutation]
  );

  return {
    // Safe mutation functions
    safeSendItinerary,
    safeUpdateItinerary,

    // State
    isSendingItinerary: sendItineraryMutation.isPending,
    isUpdatingItinerary: updateItineraryMutation.isPending,
    isMutating:
      sendItineraryMutation.isPending || updateItineraryMutation.isPending,

    // Error states
    sendError: sendItineraryMutation.error,
    updateError: updateItineraryMutation.error,
    hasError: !!sendItineraryMutation.error || !!updateItineraryMutation.error,

    // Reset functions
    resetSendError: sendItineraryMutation.reset,
    resetUpdateError: updateItineraryMutation.reset,

    // Mutation state for debugging
    mutationState: mutationState.current,

    // Message context holder
    messageContextHolder: contextHolder,
  };
};
