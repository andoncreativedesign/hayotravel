import { WarningCircleIcon } from "@/components/icons";
import { Button, Modal } from "antd";
import styles from "./DeleteModal.module.scss";

export interface DeleteModalProps {
  /** Whether the modal is visible */
  open: boolean;
  /** Callback when the cancel button is clicked or modal is closed */
  onCancel: () => void;
  /** Callback when the confirm/remove button is clicked */
  onConfirm: () => void;
  /** Whether the confirm action is loading */
  loading?: boolean;
  /** Type of item being removed (e.g., "Flight", "Accommodation") */
  itemType: string;
  /** Name of the trip/context (e.g., "Summer trip to Greece") */
  tripName?: string;
  /** Custom description text (optional, will use default if not provided) */
  description?: string;
}

export function DeleteModal({
  open,
  onCancel,
  onConfirm,
  loading = false,
  itemType,
  tripName,
  description,
}: DeleteModalProps) {
  const defaultDescription = tripName
    ? `This will remove your selected ${itemType.toLowerCase()} from "${tripName}." You can always add it back later.`
    : `This will remove your selected ${itemType.toLowerCase()} from your itinerary. You can always add it back later.`;

  const displayDescription = description || defaultDescription;

  return (
    <Modal
      title={null}
      open={open}
      onCancel={onCancel}
      footer={null}
      centered
      width={400}
      styles={{
        body: { padding: "24px" },
      }}
      className={styles.deleteModal}>
      <div className={styles.modalContent}>
        <div className={styles.iconWrapper}>
          <WarningCircleIcon className={styles.warningIcon} />
        </div>

        <div className={styles.textWrapper}>
          <div className={styles.textContent}>
            <h3 className={styles.title}>Remove {itemType} from basket?</h3>
            <p className={styles.description}>{displayDescription}</p>
          </div>

          <div className={styles.buttonWrapper}>
            <Button
              onClick={onCancel}
              disabled={loading}
              className={styles.cancelButton}>
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              loading={loading}
              className={styles.confirmButton}>
              Yes, remove
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default DeleteModal;
