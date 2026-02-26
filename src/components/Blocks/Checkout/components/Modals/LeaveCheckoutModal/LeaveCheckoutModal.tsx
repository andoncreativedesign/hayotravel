"use client";

import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Button, Modal } from "antd";
import styles from "./LeaveCheckoutModal.module.scss";

interface LeaveCheckoutModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const LeaveCheckoutModal = ({
  open,
  onCancel,
  onConfirm,
}: LeaveCheckoutModalProps) => {
  return (
    <Modal
      open={open}
      title={null}
      footer={null}
      onCancel={onCancel}
      centered
      width={400}
      className={styles.modal}
      closeIcon={false}>
      <div className={styles.content}>
        <div className={styles.iconWrapper}>
          <ExclamationCircleOutlined className={styles.warningIcon} />
        </div>
        <div className={styles.textWrapper}>
          <h4 className={styles.title}>Leave checkout?</h4>
          <p className={styles.description}>
            {`Your booking progress and traveller information will not be saved.
            You'll need to start the checkout process again.`}
          </p>
          <div className={styles.buttonWrapper}>
            <Button
              type="default"
              onClick={onCancel}
              className={styles.secondaryButton}>
              Continue booking
            </Button>
            <Button
              type="primary"
              onClick={onConfirm}
              className={styles.primaryButton}>
              Yes, leave checkout
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default LeaveCheckoutModal;
