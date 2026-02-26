export interface ComponentCancellationRequest {
  cancellation_reason?: string;
}

export interface ComponentCancellationResponse {
  message: string;
  data: {
    itinerary_id: number;
    component_id: string;
    component_type: "flight" | "stay";
    cancelled_at: string;
    cancellation_reason?: string;
  };
  timestamp: string;
}

export interface CancellationError {
  detail: string;
  error_code: string;
  timestamp: string;
}

export type ComponentType = "flight" | "stay";
export type CancellationStatus = "active" | "cancelled";

export interface CancellationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => Promise<void>;
  componentType: ComponentType;
  componentName: string;
  isLoading?: boolean;
}

export interface CancelButtonProps {
  componentType: ComponentType;
  componentId: string;
  componentName: string;
  itineraryId: number;
  onCancellationSuccess?: (cancellationReason?: string) => void | Promise<void>;
  disabled?: boolean;
  className?: string;
}
