"use client";

import {
  CaseIcon,
  PalmIcon,
  SendPlaneIcon,
  TicketIcon,
} from "@/components/icons";
import WarningCircleIcon from "@/components/icons/WarningCircle";
import GradientWrapper from "@/components/ui/GradientWrapper/GradientWrapper";
import { createNewChat, useChatStore } from "@/store/chat/chats.store";
import { useSplitStore } from "@/store/chat/split.store";
import { generateUUID } from "@/utils";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { Button, Segmented, Space, Typography } from "antd";
import TextArea from "antd/es/input/TextArea";
import { SegmentedOptions } from "antd/es/segmented";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useCallback, useMemo, useState } from "react";
import styles from "./EmptyChat.module.scss";

const { Title, Text } = Typography;

const quotes = {
  leisure: "I need to escape and recharge – where should I go?",
  business: "Book a downtown hotel near our office",
  event: "Find a quiet beach retreat for a long weekend",
};

const labels = [
  {
    label: (
      <>
        <PalmIcon /> Leisure travel
      </>
    ),
    value: "leisure",
  },
  {
    label: (
      <>
        <CaseIcon /> Business travel
      </>
    ),
    value: "business",
  },
  {
    label: (
      <>
        <TicketIcon /> Attend an event
      </>
    ),
    value: "event",
  },
] as const;

type Mode = keyof typeof quotes;

export function EmptyChat() {
  const {
    userId,
    initialInput,
    setInitialInput,
    setCurrentChatMessages,
    addChatToList,
  } = useChatStore();
  const { setIsRightPanelOpen, setIsFullWidth } = useSplitStore(
    (state) => state
  );
  const [mode, setMode] = useState<Mode>("leisure");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Memoize labels to prevent recreation on every render
  const memoizedLabels = useMemo(
    () => labels as unknown as SegmentedOptions<Mode>,
    []
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInitialInput(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (!userId || userId === 0 || isSubmitting || !initialInput.trim()) {
      console.warn(
        "Cannot create chat: User not authenticated or user ID not initialized"
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const clientId = generateUUID();
      addChatToList(createNewChat(clientId, userId));
      setCurrentChatMessages([]);
      setIsRightPanelOpen(false);
      setIsFullWidth(false);
      router.push(`/chat/${clientId}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onChangeSegment = useCallback(
    (value: Mode) => {
      // Use React 18's automatic batching to prevent double renders
      React.startTransition(() => {
        setMode(value);
        setInitialInput(quotes[value]);
      });
    },
    [setInitialInput]
  );

  return (
    <section className={styles.section}>
      <div className={styles.plane}>
        <Image src="/plane.png" alt="Plane" width={1140} height={140} />
      </div>

      <div className={styles.content}>
        <div className={styles.content__body}>
          <div className={styles["content__header"]}>
            <Title level={1} className={styles["content__header--title"]}>
              Plan less. Roam more.
            </Title>
            <Title level={4} className={styles["content__header--subtitle"]}>
              Travel Booking, powered by AI.
            </Title>
          </div>
        </div>
        <div className={styles.chatInput}>
          <GradientWrapper className={styles["chatWrapper--gradient"]}>
            <div className={styles.chatWrapper}>
              <TextArea
                autoSize={{ minRows: 1, maxRows: 4 }}
                className={styles.textArea}
                placeholder="Ask anything..."
                value={initialInput}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
              />
              <Button
                id="chat-input"
                type="primary"
                htmlType="submit"
                disabled={
                  !initialInput?.trim() ||
                  !userId ||
                  userId === 0 ||
                  isSubmitting
                }
                loading={isSubmitting}
                className={styles.sendButton}
                onClick={handleSubmit}>
                <SendPlaneIcon />
              </Button>
            </div>
          </GradientWrapper>
          <Space size={16} className={styles.controls}>
            <Segmented
              options={memoizedLabels}
              value={mode}
              onChange={onChangeSegment}
              className={styles.segmented}
            />

            <Button
              type="text"
              icon={<QuestionCircleOutlined />}
              className={styles.helpBtn}>
              How it works?
            </Button>
          </Space>
          <Text className={styles.disclaimer}>
            <WarningCircleIcon /> AI might make mistakes — always double-check
            key info. Press <kbd>Shift + Enter</kbd> for new line.
          </Text>
        </div>
      </div>
    </section>
  );
}
