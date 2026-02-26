"use client";

import { ChatInput } from "@/components/Blocks/Chat/ChatPanel/components/ChatInput/ChatInput";
import { ReplayIcon } from "@/components/icons";
import WarningCircleIcon from "@/components/icons/WarningCircle";
import { useDocumentTitle, useInitializeItinerary } from "@/hooks";
import { useAuthStore } from "@/store/auth/auth.store";
import { currentChatSelector, useChatStore } from "@/store/chat/chats.store";
import { transformMessageResponse } from "@/utils/helpers/transformMessagesResponse";
import { messagesMock } from "@/utils/mocks/message";
import {
  ChatMessage,
  MessageMutationBody,
  MessageResponse,
} from "@/utils/types/chat";
import { useMutation, useQuery } from "@tanstack/react-query";
import { UIMessage } from "ai";
import { Button, Tooltip, Typography } from "antd";
import React, { useCallback, useEffect, useRef, useState } from "react";
import styles from "./ChatPanel.module.scss";
import { MessagesSkeleton } from "./components/Messages";
import { Messages } from "./components/Messages/Messages";

interface ChatPanelProps {
  chatId: string | undefined;
  mocked?: boolean;
  initialInput?: string;
}

type ChatStatus = "ready" | "submitted" | "streaming" | "error";

// Convert ChatMessage to UIMessage for display
const convertToUIMessage = (chatMessage: ChatMessage): UIMessage => {
  return {
    id: chatMessage.id.toString(),
    role: chatMessage.chat_message_role.role,
    content: chatMessage.content,
    createdAt: new Date(chatMessage.created_at),
  } as UIMessage;
};

const ChatPanel: React.FC<ChatPanelProps> = ({ chatId, mocked = false }) => {
  const {
    userId,
    chatList,
    currentChatMessages: messages,
    setCurrentChatMessages,
    initialInput,
    setInitialInput,
    updateChatExternalId,
    pendingConversationIds,
  } = useChatStore();
  const { apiClient } = useAuthStore((state) => state);
  const initialInputProcessedRef = useRef(false);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<ChatStatus>("ready");
  const currentChat = currentChatSelector(chatList, chatId || "0");

  useInitializeItinerary(chatId || null);

  // Update document title based on chat
  useDocumentTitle(
    currentChat?.title && currentChat.title !== "New Trip"
      ? currentChat.title
      : undefined
  );

  // Enhanced chat with pending conversation_id if available
  const enhancedCurrentChat = currentChat ? currentChat : null;
  const effectiveConversationId =
    enhancedCurrentChat?.external_id ||
    (chatId ? pendingConversationIds[chatId] : undefined);
  const isInitialInputEmpty = initialInput.trim() === "";
  const { data, isLoading } = useQuery({
    queryKey: ["messages", chatId],
    queryFn: () => {
      if (!apiClient) {
        throw new Error("API client not available");
      }
      return apiClient.getChatMessagesByChat(String(chatId));
    },
    enabled: isInitialInputEmpty && !!chatId && !mocked && !!apiClient,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (message: MessageMutationBody) => {
      if (!apiClient) {
        throw new Error("API client not available");
      }
      return apiClient.sendChatMessageDirect(message);
    },
    onSuccess: (response) => {
      // Transform the response and add to messages
      if (response) {
        const transformedMessage = transformMessageResponse(
          response as MessageResponse,
          chatId || "0"
        );
        setCurrentChatMessages([...(messages || []), transformedMessage]);

        // Save conversation_id to chat's external_id for future requests
        if ((response as MessageResponse).conversation_id && chatId) {
          updateChatExternalId(
            (response as MessageResponse).conversation_id,
            chatId
          );
        }
      }
      setInitialInput("");
      setStatus("ready");
    },
    onError: (error) => {
      console.error("Error sending message:", error);
      setStatus("error");
    },
  });

  // Load existing messages for existing chats
  useEffect(() => {
    if (data && !initialInput) {
      console.log("data", data);
      setCurrentChatMessages(data);
    }
  }, [data, setCurrentChatMessages, initialInput, chatId]);

  // Set status to submitted when mutation is pending
  useEffect(() => {
    if (isPending) {
      setStatus("submitted");
    }
  }, [isPending, setStatus]);

  // Handle initial input for new chats
  useEffect(() => {
    if (initialInput && !initialInputProcessedRef.current) {
      initialInputProcessedRef.current = true;

      // Create user message for immediate UI update
      const tempUserMessage: ChatMessage = {
        id: Date.now(), // temporary ID
        chat_id: parseInt(chatId || "0"),
        chat_role_id: 1, // assuming 1 is user role
        content: initialInput,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        chat_message_role: {
          role: "user",
          id: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      };

      // Update UI immediately with user message
      setCurrentChatMessages([tempUserMessage]);

      // Send mutation
      const initialMessageData = {
        user_id: userId,
        query: initialInput,
        chat_client_id: chatId,
        conversation_id: currentChat?.external_id,
      };
      mutate(initialMessageData);
    }
  }, [
    initialInput,
    mutate,
    userId,
    setInitialInput,
    chatId,
    setCurrentChatMessages,
    currentChat,
  ]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      setInput(e.target.value);
    },
    []
  );

  // Convert UIMessage array for Messages component
  const uiMessages = (messages || []).map(convertToUIMessage);

  const handleSubmit = useCallback(
    async (event?: { preventDefault?: () => void }) => {
      event?.preventDefault?.();
      if (
        !input.trim() ||
        status === "submitted" ||
        status === "streaming" ||
        !chatId
      )
        return;

      setStatus("submitted");
      setInput("");

      // Create user message for immediate UI update
      const tempUserMessage: ChatMessage = {
        id: Date.now(), // temporary ID
        chat_id: parseInt(chatId),
        chat_role_id: 1, // assuming 1 is user role
        content: input,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        chat_message_role: {
          role: "user",
          id: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      };

      // Update UI immediately with user message
      setCurrentChatMessages([...(messages || []), tempUserMessage]);

      // Send message via API
      const messageData: MessageMutationBody = {
        user_id: userId,
        query: input,
        conversation_id: effectiveConversationId,
        chat_client_id: typeof chatId === "string" ? chatId : undefined, // Include UUID for backend association
      };

      mutate(messageData);
    },
    [
      input,
      status,
      chatId,
      messages,
      setCurrentChatMessages,
      mutate,
      userId,
      effectiveConversationId,
    ]
  );

  const reload = useCallback(async (): Promise<string | null | undefined> => {
    if (!messages || messages.length === 0) return null;

    const lastUserMessage = (messages || [])
      .slice()
      .reverse()
      .find((m) => m.chat_message_role.role === "user");
    if (lastUserMessage) {
      setInput(lastUserMessage.content);
      setCurrentChatMessages((messages || []).slice(0, -1)); // Remove last assistant message
      return lastUserMessage.content;
    }
    return null;
  }, [messages, setCurrentChatMessages]);

  return (
    <div className={styles.panel}>
      <div className={styles.messages}>
        <div className={styles.messages__inner}>
          {isLoading ? (
            <MessagesSkeleton />
          ) : (
            <Messages
              chatId={chatId || ""}
              status={status}
              messages={mocked ? (messagesMock as UIMessage[]) : uiMessages}
              reload={reload}
            />
          )}
        </div>
      </div>

      {/* Replay button - only show if hydrated and there are messages and the last message is from assistant */}
      {messages &&
        messages.length > 0 &&
        (messages || [])[messages.length - 1]?.chat_message_role.role ===
          "assistant" && (
          <div className={styles.replayButton}>
            <Tooltip title="Replay last request">
              <Button
                type="text"
                size="small"
                icon={<ReplayIcon />}
                onClick={() => reload()}
                className={styles.replayBtn}>
                Replay
              </Button>
            </Tooltip>
          </div>
        )}

      <div className={styles.input}>
        <ChatInput
          status={status}
          input={input}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
        />
        <Typography.Text
          className={styles.chatInput__disclaimer}
          type="secondary">
          <WarningCircleIcon /> AI might make mistakes — always double-check key
          info.
        </Typography.Text>
      </div>
    </div>
  );
};

export default ChatPanel;
