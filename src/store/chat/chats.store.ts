/* eslint-disable @typescript-eslint/no-unused-vars */

import { Chat, ChatMessages, ChatStatus, UserRole } from "@/utils/types/chat";
import { FlightOffer } from "@/utils/types/flight";
import { HotelOption } from "@/utils/types/hotels";
import { create } from "zustand";

export type ChatState = {
  initialInput: string;
  chatList: Chat[];
  userId: number;
  currentChatMessages: ChatMessages;
  flightSectionData: FlightOffer[];
  hotelSectionData: HotelOption[];
  // Temporary storage for conversation_ids while chat identity is being resolved
  pendingConversationIds: Record<string, string>; // chatId -> conversation_id
  // Admin context
  adminSelectedUserId: number | null;
  adminSelectedUserInfo: { id: number; email: string; full_name: string; is_active: boolean } | null;
  // Loading states
  renamingChatId: string | number | null; // Track which chat is being renamed
};

export type ChatActions = {
  setUserId: (userId: number) => void;
  setCurrentChatMessages: (currentChatMessages: ChatMessages) => void;
  setInitialInput: (initialInput: string) => void;
  updateChatListTitle: (title: string, chatId: string) => void;
  setChatList: (chatList: Chat[]) => void;
  addChatToList: (chat: Chat) => void;
  updateChatList: (chat: Chat) => void;
  setItineraryId: (itineraryId: number, chatId: number) => void;
  updateChatExternalId: (externalId: string, chatId: string) => void;
  setPendingConversationId: (chatId: string, conversationId: string) => void;
  clearPendingConversationId: (chatId: string) => void;
  updateTravelersCount: (
    travelersCount: number,
    chatId: string | number
  ) => void;
  setFlightSectionData: (data: FlightOffer[]) => void;
  setHotelSectionData: (data: HotelOption[]) => void;
  // Chat management actions
  deleteChatFromList: (chatId: string | number) => void;
  renameChatInList: (chatId: string | number, newTitle: string) => void;
  // Admin actions
  setAdminSelectedUser: (userId: number, userInfo: { id: number; email: string; full_name: string; is_active: boolean }) => void;
  clearAdminSelectedUser: () => void;
  // Loading state actions
  setRenamingChatId: (chatId: string | number | null) => void;
};

export const defaultState: ChatState = {
  initialInput: "",
  chatList: [],
  userId: 0, // Will be set when backend user is fetched
  currentChatMessages: [],
  pendingConversationIds: {},
  flightSectionData: [],
  hotelSectionData: [],
  adminSelectedUserId: null,
  adminSelectedUserInfo: null,
  renamingChatId: null,
};

export type ChatStore = ChatState & ChatActions;

export const useChatStore = create<ChatStore>()((set) => ({
  ...defaultState,
  setUserId: (userId) => set({ userId }),
  setCurrentChatMessages: (currentChatMessages) => set({ currentChatMessages }),
  setInitialInput: (initialInput) => set({ initialInput }),
  setChatList: (chatList) =>
    set((state) => {
      // Preserve conversation_ids (external_id) from current state when merging with backend data
      const mergedChatList = chatList.map((backendChat) => {
        let finalChat = backendChat;

        // Try to find matching chat in current state that might have a conversation_id
        const existingChat = state.chatList.find(
          (existingChat) =>
            existingChat.id === backendChat.id ||
            (existingChat.chat_client_id && backendChat.chat_client_id === null)
        );

        if (
          existingChat &&
          existingChat.external_id &&
          !backendChat.external_id
        ) {
          // Preserve the conversation_id from the existing chat
          finalChat = { ...backendChat, external_id: existingChat.external_id };
        }

        // Also check pending conversation IDs for UUID-based matches
        const pendingConversationId = Object.entries(
          state.pendingConversationIds
        ).find(([chatId, conversationId]) => {
          // Check if this backend chat could be the match for a pending UUID
          return (
            typeof chatId === "string" &&
            chatId.length > 10 &&
            !finalChat.external_id
          );
        });

        if (pendingConversationId && !finalChat.external_id) {
          const [, conversationId] = pendingConversationId;
          finalChat = { ...finalChat, external_id: conversationId };
        }

        return finalChat;
      });

      return { chatList: mergedChatList };
    }),
  setItineraryId: (itineraryId, chatId) =>
    set((state) => ({
      chatList: state.chatList.map((chat) =>
        chat.id === chatId ? { ...chat, itinerary_id: itineraryId } : chat
      ),
    })),
  updateChatListTitle: (title, chatId) =>
    set((state) => ({
      chatList: state.chatList.map((chat) =>
        chatId === chat.chat_client_id ? { ...chat, title } : chat
      ),
    })),
  updateChatList: (chat) =>
    set((state) => ({
      chatList: state.chatList.map((c) =>
        c.chat_client_id === chat.chat_client_id || c.id === chat.id ? chat : c
      ),
    })),
  addChatToList: (chat) =>
    set((state) => ({
      chatList: [chat, ...state.chatList],
    })),
  updateChatExternalId: (externalId, chatId) =>
    set((state) => {
      // Use the same logic as currentChatSelector to find the right chat
      let targetChat = state.chatList.find((chat) => {
        const clientIdMatch = chat.chat_client_id === chatId;
        const idMatch =
          typeof chatId === "number"
            ? chat.id === chatId
            : chat.id === Number(chatId);
        return (
          clientIdMatch ||
          ((typeof chatId === "number" || !isNaN(Number(chatId))) && idMatch)
        );
      });

      // If not found and chatId is a UUID, look for the most recent backend chat
      if (!targetChat && typeof chatId === "string" && chatId.length > 10) {
        const candidates = state.chatList.filter(
          (chat) => chat.chat_client_id === null
        );
        if (candidates.length > 0) {
          targetChat = candidates[0]; // Most recent chat
        }
      }

      if (!targetChat) {
        // Store as pending conversation_id for later merging
        return {
          ...state,
          pendingConversationIds: {
            ...state.pendingConversationIds,
            [chatId]: externalId,
          },
        };
      }

      const updatedChatList = state.chatList.map((chat) => {
        // Update the chat we found (by id since that's the reliable identifier)
        if (targetChat && chat.id === targetChat.id) {
          return { ...chat, external_id: externalId };
        }
        return chat;
      });

      return { chatList: updatedChatList };
    }),
  setPendingConversationId: (chatId, conversationId) =>
    set((state) => ({
      pendingConversationIds: {
        ...state.pendingConversationIds,
        [chatId]: conversationId,
      },
    })),
  clearPendingConversationId: (chatId) =>
    set((state) => {
      const { [chatId]: removed, ...rest } = state.pendingConversationIds;
      return {
        pendingConversationIds: rest,
      };
    }),
  updateTravelersCount: (travelersCount, chatId) =>
    set((state) => {
      const targetChat = state.chatList.find((chat) => {
        const clientIdMatch = chat.chat_client_id === chatId;
        const idMatch =
          typeof chatId === "number"
            ? chat.id === chatId
            : chat.id === Number(chatId);
        return (
          clientIdMatch ||
          ((typeof chatId === "number" || !isNaN(Number(chatId))) && idMatch)
        );
      });

      if (!targetChat) {
        console.warn(`Chat not found for updating travelers count: ${chatId}`);
        return state;
      }

      const updatedChatList = state.chatList.map((chat) => {
        if (chat.id === targetChat.id) {
          return { ...chat, travelers_count: travelersCount };
        }
        return chat;
      });

      return { chatList: updatedChatList };
    }),
  setFlightSectionData: (data: FlightOffer[]) =>
    set({ flightSectionData: data }),
  setHotelSectionData: (data: HotelOption[]) => set({ hotelSectionData: data }),

  deleteChatFromList: (chatId) =>
    set((state) => {
      const targetChat = state.chatList.find((chat) => {
        const clientIdMatch = chat.chat_client_id === chatId;
        const idMatch =
          typeof chatId === "number"
            ? chat.id === chatId
            : chat.id === Number(chatId);
        return (
          clientIdMatch ||
          ((typeof chatId === "number" || !isNaN(Number(chatId))) && idMatch)
        );
      });

      if (!targetChat) {
        console.warn(`Chat not found for deletion: ${chatId}`);
        return state;
      }

      const updatedChatList = state.chatList.filter((chat) => chat.id !== targetChat.id);
      return { chatList: updatedChatList };
    }),
  renameChatInList: (chatId, newTitle) =>
    set((state) => {
      const targetChat = state.chatList.find((chat) => {
        const clientIdMatch = chat.chat_client_id === chatId;
        const idMatch =
          typeof chatId === "number"
            ? chat.id === chatId
            : chat.id === Number(chatId);
        return (
          clientIdMatch ||
          ((typeof chatId === "number" || !isNaN(Number(chatId))) && idMatch)
        );
      });

      if (!targetChat) {
        console.warn(`Chat not found for renaming: ${chatId}`);
        return state;
      }

      const updatedChatList = state.chatList.map((chat) => {
        if (chat.id === targetChat.id) {
          return { ...chat, title: newTitle };
        }
        return chat;
      });

      return { chatList: updatedChatList };
    }),
  // Admin actions
  setAdminSelectedUser: (userId, userInfo) => 
    set({ adminSelectedUserId: userId, adminSelectedUserInfo: userInfo }),
  clearAdminSelectedUser: () => 
    set({ adminSelectedUserId: null, adminSelectedUserInfo: null }),
  // Loading state actions
  setRenamingChatId: (chatId) => 
    set({ renamingChatId: chatId }),
}));

// Selector to get the effective user ID (admin selected or current user)
export const getEffectiveUserId = (state: ChatState): number => {
  return state.adminSelectedUserId || state.userId;
};

export const currentChatSelector = (
  chatList: Chat[],
  chatId: string | number
) => {
  // First try exact matching
  const foundChat = chatList.find((chat) => {
    const clientIdMatch = chat.chat_client_id === chatId;
    const idMatch =
      typeof chatId === "number"
        ? chat.id === chatId
        : chat.id === Number(chatId);
    return (
      clientIdMatch ||
      ((typeof chatId === "number" || !isNaN(Number(chatId))) && idMatch)
    );
  });

  if (foundChat) {
    return foundChat;
  }

  // Enhanced fallback logic for chat identity transition
  // If looking for a UUID and no exact match, find the most recent chat that could be a match
  if (typeof chatId === "string" && chatId.length > 10 && chatList.length > 0) {
    // This is likely a UUID from frontend chat creation
    const candidates = chatList.filter((chat) => {
      // Look for chats that were recently created and have null client_id
      // These are likely backend chats that correspond to our frontend chat
      return chat.chat_client_id === null;
    });

    if (candidates.length > 0) {
      // Use the most recent chat (first in list due to chronological ordering)
      return candidates[0];
    }
  }

  // If looking for numeric ID and no match, try exact numeric comparison
  if (typeof chatId === "number" || !isNaN(Number(chatId))) {
    const numericId = Number(chatId);
    const numericMatch = chatList.find((chat) => chat.id === numericId);

    if (numericMatch) {
      return numericMatch;
    }
  }

  return undefined;
};

export const createNewChat = (clientId: string, userId: number): Chat => {
  return {
    id: 0,
    user_id: userId,
    title: "New Trip",
    chat_client_id: clientId,
    chat_status_id: 1,
    itinerary_id: null,
    started_at: new Date().toISOString(),
    last_message_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    chat_metadata: {},
    user: {
      email: "",
      full_name: "",
      is_active: true,
      user_role_id: 1,
      external_id: "",
      id: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_role: {
        role: UserRole.User,
        id: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    },
    external_id: "",
    destination: "",
    travel_start_date: "",
    travel_end_date: "",
    travelers_count: 0,
    chat_status: {
      status: ChatStatus.Active,
      id: 0,
      created_at: "",
      updated_at: "",
    },
  };
};
