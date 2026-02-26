import type { UseChatHelpers } from "@ai-sdk/react";
import { useEffect, useRef, useState } from "react";
import { useScrollToBottom } from "../useScrollToBottom/useScrollToBottom";

export function useMessages({
  chatId,
  status,
}: {
  chatId: string;
  status: UseChatHelpers["status"];
}) {
  const {
    containerRef,
    endRef,
    isAtBottom,
    scrollToBottom,
    onViewportEnter,
    onViewportLeave,
  } = useScrollToBottom();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [hasSentMessage, setHasSentMessage] = useState(false);

  useEffect(() => {
    if (chatId) {
      scrollToBottom("instant");
      setHasSentMessage(false);
    }
  }, [chatId, scrollToBottom]);

  useEffect(() => {
    if (status === "streaming") {
      intervalRef.current = setInterval(() => {
        scrollToBottom("smooth");
      }, 300);
    }
    if (status === "submitted") {
      setHasSentMessage(true);
    }
    if (status === "ready" || status === "error") {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [status, scrollToBottom]);

  return {
    containerRef,
    endRef,
    isAtBottom,
    scrollToBottom,
    onViewportEnter,
    onViewportLeave,
    hasSentMessage,
  };
}
