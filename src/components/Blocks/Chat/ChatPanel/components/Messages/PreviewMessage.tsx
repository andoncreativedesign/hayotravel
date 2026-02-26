/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  AirPlaneTiltIcon,
  BuildingsIcon,
  LogoMiniIcon,
  UserMiniIcon,
} from "@/components/icons";
import { useAuth } from "@/providers/Auth.provider";
import { sanitizeText } from "@/utils";
import { FlightOffer } from "@/utils/types/flight";
import { HotelOption } from "@/utils/types/hotels";
import type { UseChatHelpers } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { Avatar } from "antd";
import { AnimatePresence, motion } from "framer-motion";
import React from "react";
import { FlightTool } from "../Tools/FlightTool";
import { HotelTool } from "../Tools/HotelTool/HotelTool";
import { Markdown } from "./Markdown";
import styles from "./PreviewMessage.module.scss";

// Import from library
import ToolSelectionBase from "@/components/ui/ToolSelectionBase/ToolSelectionBase";
import { useChatStore } from "@/store/chat/chats.store";
import { SectionMode, useSplitStore } from "@/store/chat/split.store";
import { cn } from "@/utils/helpers/cn";
import {
  AnnotationReply,
  MESSAGE_TYPES,
  MessagePart,
  RetrieverResource,
  STATES,
  TOOL_NAMES,
  ToolResult,
  UsageMetrics,
  extractFlightDataFromWorkflow,
  extractHotelDataFromWorkflow,
  extractTextFromWorkflow,
  isFlattenedFormat,
  isWorkflowFormat,
  renderWorkflowFallback,
  transformFlattenedFlightData,
  tryParseJSON,
} from "./lib";

interface PreviewProps {
  chatId: string;
  message: UIMessage & {
    content?: string;
    conversation_id?: string;
    message_id?: string;
    metadata?: {
      annotation_reply?: AnnotationReply;
      retriever_resources?: RetrieverResource[];
      usage?: UsageMetrics;
    };
    created_at?: number;
  };
  reload?: UseChatHelpers["reload"];
  requiresScrollPadding: boolean;
}

function PurePreviewMessage({
  chatId,
  message,
  requiresScrollPadding,
}: PreviewProps) {
  const isUser = message.role === "user";
  const { user } = useAuth();
  const { setFlightSectionData, setHotelSectionData } = useChatStore();
  const { openSection } = useSplitStore();

  const renderToolResult = (
    toolName: string,
    result: ToolResult,
    toolCallId?: string
  ) => {
    const { options } = result;
    const firstOption = options[0];

    console.log("renderToolResult called with:", {
      toolName,
      result,
      firstOption,
      optionsLength: options.length,
    });

    // Check if this is workflow format and detect actual content type
    if (isWorkflowFormat(firstOption)) {
      console.log("Using workflow format detection");

      // Check if any workflow step contains hotel data (search_stays action)
      let hotelData = null;
      let flightData = null;
      let workflowText = null;

      for (const option of options as any[]) {
        if (
          option?.data?.action_name === "search_stays" &&
          option?.data?.observation &&
          !option.data.observation.includes("Error")
        ) {
          console.log("Found hotel search workflow in option:", option.id);
          const workflowData = option.data;
          const extractedHotelData = extractHotelDataFromWorkflow(workflowData);
          if (extractedHotelData && extractedHotelData.length > 0) {
            console.log(
              "Successfully extracted hotel data:",
              extractedHotelData
            );
            hotelData = extractedHotelData;
          }
        } else if (
          option?.data?.action_name === "search_flights" &&
          option?.data?.observation &&
          !option.data.observation.includes("Error")
        ) {
          console.log("Found flight search workflow in option:", option.id);
          const workflowData = option.data;
          const extractedFlightResult =
            extractFlightDataFromWorkflow(workflowData);
          if (
            extractedFlightResult &&
            extractedFlightResult.offers.length > 0
          ) {
            console.log(
              "Successfully extracted flight data:",
              extractedFlightResult
            );
            flightData = extractedFlightResult.offers;

            (flightData as any).searchPassengers =
              extractedFlightResult.passengers;
          }
        }
      }

      workflowText = extractTextFromWorkflow(options as any[]);

      // Render based on actual data types found
      const components = [];

      if (flightData) {
        const lowPrice = flightData.reduce((min, offer) => {
          return Math.min(min, Number(offer.total_amount));
        }, Infinity);
        components.push(
          <ToolSelectionBase
            key={`${toolCallId}-flights`}
            title="Flight Options"
            description={`Found ${
              flightData.length || 0
            } options from $${lowPrice} per person`}
            icon={<AirPlaneTiltIcon />}
            onClick={() => {
              openSection(SectionMode.SelectFlight);
              setFlightSectionData(flightData as FlightOffer[]);
            }}
          />
        );
      }

      if (hotelData) {
        const lowPrice = hotelData.reduce((min, offer) => {
          return Math.min(min, Number(offer.cheapest_rate_total_amount));
        }, Infinity);
        components.push(
          <ToolSelectionBase
            key={`${toolCallId}-hotels`}
            title="Hotel Options"
            description={`Found ${
              hotelData.length || 0
            } options from $${lowPrice} per night`}
            icon={<BuildingsIcon />}
            onClick={() => {
              openSection(SectionMode.SelectHotel);
              setHotelSectionData(hotelData as HotelOption[]);
            }}
          />
        );
      }

      if (workflowText) {
        console.log("Found workflow text content:", workflowText);
        components.push(
          <div
            key={`${toolCallId}-text`}
            className={[styles.textRow, styles.botText].join(" ")}>
            <div className={[styles.bubble, styles.botBubble].join(" ")}>
              <Markdown preserveLineBreaks={false}>
                {sanitizeText(workflowText)}
              </Markdown>
            </div>
          </div>
        );
      }

      if (components.length > 0) {
        return components.length === 1 ? (
          components[0]
        ) : (
          <React.Fragment key={toolCallId}>{components}</React.Fragment>
        );
      }

      console.log("No successful data found, using fallback");
      return renderWorkflowFallback((firstOption as any)?.data || {}, styles);
    }

    // Handle non-workflow formats based on toolName
    if (toolName === TOOL_NAMES.FLIGHT_OPTIONS) {
      console.log("Processing FLIGHT_OPTIONS with firstOption:", firstOption);
      console.log("isFlattenedFormat check:", isFlattenedFormat(firstOption));

      if (isFlattenedFormat(firstOption)) {
        console.log("Using flattened format transformation");
        const transformedOptions = transformFlattenedFlightData(
          options as any[]
        );
        return <FlightTool key={toolCallId} options={transformedOptions} />;
      }

      console.log("Using direct flight options");
      return <FlightTool key={toolCallId} options={options as FlightOffer[]} />;
    }

    if (toolName === TOOL_NAMES.HOTEL_OPTIONS) {
      console.log("Processing HOTEL_OPTIONS with firstOption:", firstOption);
      console.log("Using direct hotel options");
      return <HotelTool key={toolCallId} options={options as HotelOption[]} />;
    }

    return <pre key={toolCallId}>{JSON.stringify(result, null, 2)}</pre>;
  };

  const renderTextPart = (
    part: MessagePart,
    key: string,
    isLastPart: boolean
  ) => (
    <div
      key={key}
      className={[
        styles.textRow,
        requiresScrollPadding && isLastPart ? styles.withPadding : "",
        isUser ? styles.userText : styles.botText,
      ].join(" ")}>
      <div
        className={[
          styles.bubble,
          isUser ? styles.userBubble : styles.botBubble,
        ].join(" ")}>
        <Markdown preserveLineBreaks={isUser}>
          {sanitizeText(part.text || "")}
        </Markdown>
      </div>
    </div>
  );

  const renderToolInvocationPart = (part: MessagePart) => {
    const toolInvocation = part.toolInvocation;
    if (toolInvocation?.state === STATES.RESULT) {
      return renderToolResult(
        toolInvocation.toolName,
        toolInvocation.result || { options: [] },
        toolInvocation.toolCallId
      );
    }

    // Handle new format where tool invocation properties are at the top level
    if (part.state === STATES.RESULT && part.toolName) {
      return renderToolResult(
        part.toolName,
        part.result || { options: [] },
        part.toolCallId
      );
    }

    return null;
  };

  const renderParts = (parts: MessagePart[], messageId: string) => {
    const renderedParts = parts
      ?.map((part, idx) => {
        const key = `message-${messageId}-part-${idx}`;
        const isLastPart = idx === parts.length - 1;

        switch (part.type) {
          case MESSAGE_TYPES.TEXT:
            return renderTextPart(part, key, isLastPart);

          case MESSAGE_TYPES.TOOL_INVOCATION:
            return renderToolInvocationPart(part);

          case MESSAGE_TYPES.STEP_START:
            return null;

          default:
            // Handle parts without explicit type but with tool data
            if (part.state === STATES.RESULT && part.toolName) {
              return renderToolInvocationPart(part);
            }
            return null;
        }
      })
      .filter(Boolean); // Remove null values

    return renderedParts;
  };

  const handleDirectOptionsParsing = (parsedContent: any) => {
    if (!parsedContent.options || !Array.isArray(parsedContent.options)) {
      return null;
    }

    const firstOption = parsedContent.options[0];
    if (firstOption && "flight_number" in firstOption) {
      return <FlightTool options={parsedContent.options as FlightOffer[]} />;
    }
    if (firstOption && "hotel_name" in firstOption) {
      return <HotelTool options={parsedContent.options as HotelOption[]} />;
    }

    return null;
  };

  const renderStringContent = (content: string) => {
    let parsedContent = tryParseJSON(content);

    if (typeof parsedContent === "string") {
      parsedContent = tryParseJSON(parsedContent);
    }

    // Handle parsed JSON array
    if (Array.isArray(parsedContent)) {
      return renderParts(parsedContent as MessagePart[], message.id);
    }

    if (parsedContent && typeof parsedContent === "object") {
      // Handle parts format
      if (parsedContent.parts && Array.isArray(parsedContent.parts)) {
        return renderParts(
          parsedContent.parts as MessagePart[],
          parsedContent.id || message.id
        );
      }

      // Handle single tool result
      if (parsedContent.toolName && parsedContent.result) {
        return renderToolResult(
          parsedContent.toolName,
          parsedContent.result as ToolResult,
          parsedContent.toolCallId
        );
      }

      // Handle direct options format
      const directOptionsResult = handleDirectOptionsParsing(parsedContent);
      if (directOptionsResult) {
        return directOptionsResult;
      }
    }

    return (
      <div
        className={[
          styles.textRow,
          requiresScrollPadding ? styles.withPadding : "",
          isUser ? styles.userText : styles.botText,
        ].join(" ")}>
        <div
          className={[
            styles.bubble,
            isUser ? styles.userBubble : styles.botBubble,
          ].join(" ")}>
          <Markdown preserveLineBreaks={isUser}>
            {sanitizeText(content)}
          </Markdown>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    // Handle new format: direct array of message parts
    if (Array.isArray(message.content)) {
      return renderParts(message.content as MessagePart[], message.id);
    }

    if ("content" in message && typeof message.content === "string") {
      return renderStringContent(message.content);
    }

    if (message.parts) {
      return renderParts(message.parts as MessagePart[], message.id);
    }

    return null;
  };

  return (
    <AnimatePresence>
      <motion.div
        className={styles.wrapper}
        data-chat-id={chatId}
        initial={{ y: 5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        data-role={message.role}>
        <div
          className={[
            styles.messageRow,
            isUser ? styles.userRow : styles.botRow,
          ].join(" ")}>
          {!isUser && (
            <div className={cn(styles.avatar, styles.avatar__ai)}>
              <LogoMiniIcon
                className={styles.avatar__logo}
                width={32}
                height={32}
              />
            </div>
          )}
          <div
            className={[
              styles.content,
              isUser ? styles.userBubble : styles.botBubble,
            ].join(" ")}>
            {renderContent()}
          </div>
          {isUser && (
            <div className={styles.avatar}>
              <Avatar
                src={user?.user_metadata?.avatar_url}
                icon={<UserMiniIcon />}
                size={32}
                style={{
                  width: "100%",
                  height: "100%",
                  border: "none",
                }}
              />
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export const PreviewMessage = React.memo(PurePreviewMessage);
