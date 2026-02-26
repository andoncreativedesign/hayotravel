/* eslint-disable @typescript-eslint/no-explicit-any */
import { sanitizeText } from "@/utils";
import { Markdown } from "../Markdown";

export const renderWorkflowFallback = (data: any, styles: any) => {
  const rawResponseText = data?.action_input || "Processing options...";
  const responseText =
    typeof rawResponseText === "string"
      ? rawResponseText
      : JSON.stringify(rawResponseText);

  return (
    <div className={[styles.textRow, styles.botText].join(" ")}>
      <div className={[styles.bubble, styles.botBubble].join(" ")}>
        <Markdown>{sanitizeText(responseText)}</Markdown>
      </div>
    </div>
  );
};
