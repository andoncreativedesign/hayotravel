"use client";
import { ItineraryDebugPanel } from "@/components/dev/ItineraryDebugPanel/ItineraryDebugPanel";
import { useSplitStore } from "@/store/chat/split.store";
import { motion } from "framer-motion";
import ChatMediator from "../ChatPanel/ChatMediator";
import { ChatHeader } from "../ChatPanel/components/ChatHeader/ChatHeader";
import { RightSection } from "./RightSection";
import styles from "./SplitLayout.module.scss";

interface SplitLayoutProps {
  chatId: string;
  mocked?: boolean;
}

const SplitLayout: React.FC<SplitLayoutProps> = ({ chatId, mocked }) => {
  const { isRightPanelOpen, isFullWidth, setIsFullWidth, sectionMode } =
    useSplitStore((state) => state);
  const leftWidth = isRightPanelOpen ? "50%" : "100%";

  const rightWidth = isRightPanelOpen ? (isFullWidth ? "100%" : "50%") : "0%";

  return (
    <div className={styles.wrapper}>
      <ChatHeader chatId={chatId || "0"} />

      <motion.div
        className={styles.left}
        initial={{ width: "100%" }}
        exit={{ width: "100%" }}
        animate={{ width: leftWidth }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}>
        <ChatMediator chatId={chatId} mocked={mocked} />
      </motion.div>

      <motion.div
        className={styles.rightAbsolute}
        animate={{ width: rightWidth }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        style={{ overflow: isRightPanelOpen ? "auto" : "hidden" }}>
        {isRightPanelOpen && (
          <RightSection
            chatId={chatId}
            mode={sectionMode}
            setIsFullWidth={setIsFullWidth}
            isFullWidth={isFullWidth}
          />
        )}
      </motion.div>

      {/* Debug Panel - Only in development */}
      {process.env.NODE_ENV === "development" && <ItineraryDebugPanel />}
    </div>
  );
};

export default SplitLayout;
