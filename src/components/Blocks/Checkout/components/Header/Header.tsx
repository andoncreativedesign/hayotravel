"use client";

import { LogoIcon } from "@/components/icons";
import GoBackIcon from "@/components/icons/GoBack";
import { Button, Typography } from "antd";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LeaveCheckoutModal } from "../Modals";
import styles from "./Header.module.scss";

const { Title } = Typography;

interface HeaderProps {
  chatId: string;
  title?: string;
}

const Header = ({ chatId, title }: HeaderProps) => {
  const router = useRouter();
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  const handleBackToBasket = () => {
    setShowLeaveModal(true);
  };

  const handleConfirmLeave = () => {
    setShowLeaveModal(false);
    router.push(`/chat/${chatId}`);
  };

  const handleCancelLeave = () => {
    setShowLeaveModal(false);
  };

  return (
    <>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.logo} onClick={handleBackToBasket}>
            <LogoIcon width={80} height={42} />
          </div>
          <Title level={4} className={styles.title}>
            {title || "Checkout"}
          </Title>
          <Button
            type="text"
            icon={<GoBackIcon />}
            onClick={handleBackToBasket}
            className={styles.backButton}>
            Back to My Basket
          </Button>
        </div>
        <div className={styles.bottomBorder} />
      </div>
      <LeaveCheckoutModal
        open={showLeaveModal}
        onCancel={handleCancelLeave}
        onConfirm={handleConfirmLeave}
      />
    </>
  );
};

export default Header;
