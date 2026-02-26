import React, { useState } from "react";
import { Modal, Button, Input } from "antd";
import { CancellationModalProps } from "@/utils/types/cancellation";
import styles from "./CancellationModal.module.scss";

export function CancellationModal({
  isOpen,
  onClose,
  onConfirm,
  componentType,
  componentName,
  isLoading = false,
}: CancellationModalProps) {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm(reason.trim() || undefined);
      setReason("");
      onClose();
    } catch (error) {
      console.error("Cancellation failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setReason("");
      onClose();
    }
  };

  return (
    <Modal
      open={isOpen}
      onCancel={handleClose}
      title={`Cancel ${componentType}`}
      footer={[
        <Button
          key="cancel"
          onClick={handleClose}
          disabled={isSubmitting}
          style={{
            height: '32px',
            padding: '4px 16px',
            border: '1px solid #DADEE3',
            borderRadius: '8px',
            fontFamily: 'var(--font-nexa)',
            fontWeight: 400,
            fontSize: '14px',
            color: '#111820',
            background: 'white'
          }}
        >
          Keep {componentType}
        </Button>,
        <Button
          key="confirm"
          onClick={handleConfirm}
          loading={isSubmitting}
          disabled={isLoading}
          style={{
            height: '32px',
            padding: '4px 16px',
            border: 'none',
            borderRadius: '8px',
            fontFamily: 'var(--font-nexa)',
            fontWeight: 400,
            fontSize: '14px',
            color: 'white',
            background: '#cf1322'
          }}
        >
          Cancel {componentType}
        </Button>
      ]}
      closable={!isSubmitting}
      maskClosable={!isSubmitting}
      centered
      width={400}
      styles={{
        body: { padding: '24px' },
      }}
    >
      <div className={styles.content}>
        <div className={styles.warning}>
          <h3>Are you sure you want to cancel this {componentType}?</h3>
          <p className={styles.componentName}>{componentName}</p>
          <p className={styles.warningText}>
            This action cannot be undone. The {componentType} will be marked as cancelled
            in your itinerary.
          </p>
        </div>

        <div className={styles.reasonSection}>
          <label htmlFor="cancellation-reason" className={styles.label}>
            Reason for cancellation (optional)
          </label>
          <Input.TextArea
            id="cancellation-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={`Why are you cancelling this ${componentType}?`}
            disabled={isSubmitting}
            maxLength={500}
            rows={3}
            showCount
          />
        </div>
      </div>
    </Modal>
  );
}
