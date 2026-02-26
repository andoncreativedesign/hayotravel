import { SendPlaneIcon } from "@/components/icons";
import GradientWrapper from "@/components/ui/GradientWrapper/GradientWrapper";
import { UseChatHelpers } from "@ai-sdk/react";
import { Button } from "antd";
import TextArea from "antd/es/input/TextArea";
import { useMemo } from "react";
import styles from "./ChatInput.module.scss";

type ChatInputProps = Pick<
  UseChatHelpers,
  "input" | "handleInputChange" | "handleSubmit" | "status"
>;

export function ChatInput({
  input,
  handleInputChange,
  handleSubmit,
  status,
}: Partial<ChatInputProps>) {
  const isDisabled = useMemo(
    () => !input || status === "submitted" || status === "streaming",
    [input, status]
  );
  const isLoading = useMemo(() => status === "streaming", [status]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit?.();
    }
  };
  return (
    <GradientWrapper className={styles["chatWrapper--gradient"]}>
      <div className={styles.chatWrapper}>
        <TextArea
          autoSize={{ minRows: 2, maxRows: 6 }}
          className={styles.textArea}
          placeholder="Ask anything..."
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />
        <Button
          id="chat-input"
          type="primary"
          htmlType="submit"
          disabled={isDisabled}
          loading={isLoading}
          className={styles.sendButton}
          onClick={handleSubmit}>
          <SendPlaneIcon />
        </Button>
      </div>
    </GradientWrapper>
  );
}
