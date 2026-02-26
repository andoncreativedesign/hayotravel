import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, notification } from "antd";
import { CancelButtonProps, ComponentCancellationResponse } from "@/utils/types/cancellation";
import { CancellationModal } from "../CancellationModal/CancellationModal";
import { useAuthStore } from "@/store/auth/auth.store";
import { FastApiError } from "@/lib/fastapi-client";
import styles from "./CancelButton.module.scss";

export function CancelButton({
  componentType,
  componentId,
  componentName,
  itineraryId,
  onCancellationSuccess,
  disabled = false,
  className,
}: CancelButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { apiClient } = useAuthStore();
  const queryClient = useQueryClient();

  const cancellationMutation = useMutation({
    mutationFn: async (cancellationReason?: string): Promise<ComponentCancellationResponse> => {
      if (!apiClient) {
        throw new Error("API client not available");
      }

      if (componentType === "flight") {
        return apiClient.cancelFlightComponent(itineraryId, componentId, cancellationReason) as Promise<ComponentCancellationResponse>;
      } else {
        return apiClient.cancelStayComponent(itineraryId, componentId, cancellationReason) as Promise<ComponentCancellationResponse>;
      }
    },
    onSuccess: async (data, cancellationReason) => {
      notification.success({
        message: 'Cancellation Successful',
        description: `${componentType === "flight" ? "Flight" : "Stay"} cancelled successfully`,
        placement: 'topRight',
      });
      
      // Invalidate relevant queries to refresh the data
      queryClient.invalidateQueries({ 
        queryKey: ["travel-wallet-trips"] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ["trip", itineraryId.toString()] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ["itinerary", itineraryId.toString()] 
      });
      
      await onCancellationSuccess?.(cancellationReason);
      setIsModalOpen(false);
    },
    onError: (error: FastApiError) => {
      let errorMessage = `Failed to cancel ${componentType}`;
      
      if (error.details && typeof error.details === 'string') {
        if (error.details.includes('already cancelled')) {
          errorMessage = `This ${componentType} is already cancelled`;
        } else if (error.details.includes('not found')) {
          errorMessage = `${componentType === "flight" ? "Flight" : "Stay"} not found`;
        } else {
          errorMessage = error.details;
        }
      }
      
      notification.error({
        message: 'Cancellation Failed',
        description: errorMessage,
        placement: 'topRight',
      });
      console.error(`${componentType} cancellation failed:`, error);
    },
  });

  const handleCancelClick = () => {
    setIsModalOpen(true);
  };

  const handleConfirmCancellation = async (reason?: string) => {
    await cancellationMutation.mutateAsync(reason);
  };

  return (
    <>
      <Button
        danger
        size="small"
        onClick={handleCancelClick}
        disabled={disabled || cancellationMutation.isPending}
        className={`${styles.cancelButton} ${className || ""}`}
        loading={cancellationMutation.isPending}
      >
        Cancel {componentType === "flight" ? "Flight" : "Stay"}
      </Button>

      <CancellationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmCancellation}
        componentType={componentType}
        componentName={componentName}
        isLoading={cancellationMutation.isPending}
      />
    </>
  );
}
