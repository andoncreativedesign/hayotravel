import type { ButtonProps } from "antd";
import { Button, ConfigProvider } from "antd";
import React from "react";
import styles from "./PaymentButton.module.scss";

export interface PaymentButtonProps extends ButtonProps {
  children: React.ReactNode;
}

const PaymentButton: React.FC<PaymentButtonProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <ConfigProvider
      theme={{
        components: {
          Button: {
            colorPrimary: "#b0b6ec", // основной фон
            colorPrimaryHover: "#9ca3e8", // hover
            colorPrimaryActive: "#8890e4", // active
            colorTextLightSolid: "var(--colorText)", // цвет текста на кнопке
          },
        },
      }}>
      <Button
        type="primary"
        className={`${styles.paymentButton} ${className || ""}`}
        {...props}>
        {children}
      </Button>
    </ConfigProvider>
  );
};

export default PaymentButton;
