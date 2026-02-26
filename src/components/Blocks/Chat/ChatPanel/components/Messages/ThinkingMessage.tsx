import { LogoMiniIcon } from "@/components/icons";
import { cn } from "@/utils/helpers/cn";
import { LoadingOutlined } from "@ant-design/icons";
import { Spin } from "antd";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import styles from "./ThinkingMessage.module.scss";

const THINKING_MESSAGES = [
  "Hold tight — pulling up ideas...",
  "Processing your request...",
  "Analyzing available options...",
  "Gathering relevant information...",
  "Cross-referencing travel data...",
  "Reviewing current availability...",
  "Processing travel requirements...",
  "Evaluating different possibilities...",
  "Checking various sources...",
  "Organizing information...",
  "Considering your preferences...",
  "Reviewing travel patterns...",
  "Compiling relevant details...",
  "Finalizing recommendations...",
  "Almost ready with your response...",
];

export function ThinkingMessage() {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % THINKING_MESSAGES.length);
    }, Math.floor(Math.random() * (8000 - 4000 + 1)) + 4000);

    return () => {
      clearInterval(messageInterval);
    };
  }, []);

  return (
    <motion.div
      className={styles.wrapper}
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { delay: 1 } }}>
      <div className={styles.messageRow}>
        <div className={cn(styles.avatar, styles.avatar__ai)}>
          <LogoMiniIcon
            className={styles.avatar__logo}
            width={32}
            height={32}
          />
        </div>
        <div className={styles.bubble}>
          <Spin
            indicator={<LoadingOutlined style={{ color: "#FF5601" }} spin />}
          />
          <div className={styles.messageContainer}>
            <AnimatePresence mode="wait">
              <motion.span
                key={currentMessageIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
                className={styles.message}>
                {THINKING_MESSAGES[currentMessageIndex]}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
