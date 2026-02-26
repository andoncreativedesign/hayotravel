import { ArrowLeftIcon } from "@/components/icons";
import { cn } from "@/utils/helpers/cn";
import { Button, ConfigProvider } from "antd";
import React from "react";
import styles from "./ExpandButton.module.scss";

export interface ExpandButtonProps {
  /**
   * Whether the component is in expanded state
   */
  isExpanded: boolean;
  /**
   * Callback function called when the button is clicked
   */
  onToggle: () => void;
  /**
   * Additional CSS class names
   */
  className?: string;
  /**
   * Custom aria-label for accessibility. If not provided, defaults will be used.
   */
  ariaLabel?: {
    expanded: string;
    collapsed: string;
  };
  /**
   * Whether the button is disabled
   */
  disabled?: boolean;
}

const ExpandButton: React.FC<ExpandButtonProps> = ({
  isExpanded,
  onToggle,
  className,
  ariaLabel,
  disabled = false,
}) => {
  const defaultAriaLabel = {
    expanded: "Collapse details",
    collapsed: "Expand details",
  };

  const labels = ariaLabel || defaultAriaLabel;

  return (
    <ConfigProvider
      theme={{
        components: {
          Button: {
            controlHeight: 24,
            controlHeightSM: 24,
            controlHeightLG: 24,
            paddingInline: 0,
            paddingBlock: 0,
          },
        },
      }}>
      <Button
        variant="text"
        shape="circle"
        className={cn(
          styles.expandButton,
          isExpanded && styles["expandButton--expanded"],
          className
        )}
        onClick={onToggle}
        disabled={disabled}
        aria-label={isExpanded ? labels.expanded : labels.collapsed}>
        <ArrowLeftIcon />
      </Button>
    </ConfigProvider>
  );
};

export default ExpandButton;
