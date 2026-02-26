"use client";
import { CheckOutlined } from "@ant-design/icons";
import { Button, Modal } from "antd";
import styles from "./PaymentSuccessModal.module.scss";

interface PaymentSuccessModalProps {
  open: boolean;
  onClose: () => void;
  onViewTravelWallet: () => void;
}

export const PaymentSuccessModal = ({
  open,
  onClose,
  onViewTravelWallet,
}: PaymentSuccessModalProps) => {
  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={400}
      closable={false}
      className={styles.paymentSuccessModal}>
      <div className={styles.content}>
        <div className={styles.iconWrapper}>
          <div className={styles.successIcon}>
            <CheckOutlined />
          </div>
        </div>

        <div className={styles.textContent}>
          <h2 className={styles.title}>Awesome!</h2>
          <p className={styles.description}>
            Your transaction is successfully completed. All your booking
            details, e-tickets, and travel documents are now safely stored in
            your Travel Wallet.
          </p>
        </div>
      </div>

      <div className={styles.footer}>
        <Button
          type="primary"
          size="large"
          onClick={onViewTravelWallet}
          className={styles.walletButton}>
          View Travel Wallet
        </Button>
      </div>
    </Modal>
  );
};
