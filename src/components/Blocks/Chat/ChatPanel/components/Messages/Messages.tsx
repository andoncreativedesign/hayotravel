import { useMessages } from "@/hooks/useMessages/useMessages";
import type { UseChatHelpers } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import equal from "fast-deep-equal";
import { motion } from "framer-motion";
import { memo, useEffect } from "react";
import styles from "./Messages.module.scss";
import { PreviewMessage } from "./PreviewMessage";
import { ThinkingMessage } from "./ThinkingMessage";

interface MessagesProps {
  chatId: string;
  status: UseChatHelpers["status"];
  messages: UIMessage[];
  reload: UseChatHelpers["reload"];
}

function PureMessages({ chatId, status, messages, reload }: MessagesProps) {
  const {
    hasSentMessage,
    containerRef,
    endRef,
    onViewportEnter,
    onViewportLeave,
    scrollToBottom,
  } = useMessages({ chatId, status });

  useEffect(() => {
    if (status === "submitted") {
      scrollToBottom();
    }
  }, [status, scrollToBottom]);

  return (
    <div ref={containerRef} className={styles.container}>
      {messages.map((msg, i) => (
        <PreviewMessage
          key={msg.id}
          chatId={chatId}
          message={msg}
          reload={reload}
          requiresScrollPadding={hasSentMessage && i === messages.length - 1}
        />
      ))}

      {status === "submitted" &&
        messages.length > 0 &&
        messages[messages.length - 1].role === "user" && <ThinkingMessage />}

      <motion.div
        ref={endRef}
        className={styles.endMarker}
        onViewportEnter={onViewportEnter}
        onViewportLeave={onViewportLeave}
      />
    </div>
  );
}

export const Messages = memo(PureMessages, (prev, next) => {
  if (prev.status !== next.status) return false;
  if (prev.messages.length !== next.messages.length) return false;
  if (!equal(prev.messages, next.messages)) return false;
  return true;
});
