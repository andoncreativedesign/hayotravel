import { Button, Modal } from "antd";
import { WarningCircleIcon } from "@/components/icons";
import styles from "../ChatHeader.module.scss";

interface DeleteModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  loading: boolean;
}

export function DeleteModal({
  open,
  onCancel,
  onConfirm,
  loading,
}: DeleteModalProps) {
  return (
    <Modal
      title={null}
      open={open}
      onCancel={onCancel}
      footer={null}
      centered
      width={400}
      styles={{
        body: { padding: '24px' },
      }}
      className={styles.deleteModal}>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        <div 
          style={{ 
            width: '24px', 
            height: '24px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            flexShrink: 0
          }}>
          <WarningCircleIcon style={{ fontSize: 24, color: '#FAAD14' }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '20px' }}>
            <h3 style={{ 
              fontFamily: 'var(--font-nexa)', 
              fontWeight: 700, 
              fontStyle: 'normal',
              fontSize: '16px', 
              lineHeight: '24px',
              letterSpacing: '0%',
              color: '#111820',
              margin: 0
            }}>
              Delete Chat?
            </h3>
            <p style={{ 
              fontFamily: 'var(--font-nexa)', 
              fontStyle: 'normal',
              fontWeight: 400, 
              fontSize: '14px', 
              lineHeight: '22px',
              color: '#485A6E',
              flex: 'none',
              alignSelf: 'stretch',
              flexGrow: 0,
              margin: 0
            }}>
              This conversation will be permanently deleted and cannot be recovered. Are you sure you want to continue?
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <Button
              onClick={onCancel}
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
              }}>
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              loading={loading}
              style={{
                height: '32px',
                padding: '4px 16px',
                border: 'none',
                borderRadius: '8px',
                fontFamily: 'var(--font-nexa)',
                fontWeight: 400,
                fontSize: '14px',
                color: 'white',
                background: '#111820'
              }}>
              Delete
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
