"use client";

import { useItineraryStore } from "@/store/itinerary/itinerary.store";
import { Steps } from "antd";
import styles from "./UnifiedProgressBar.module.scss";

interface ProgressStep {
  key: string;
  title: string;
  description?: string;
  completed: boolean;
  current: boolean;
}

interface UnifiedProgressBarProps {
  mainSteps: ProgressStep[];
  currentMainStep: number;
}

const UnifiedProgressBar = ({
  mainSteps,
  currentMainStep,
}: UnifiedProgressBarProps) => {
  const { isItineraryPaid } = useItineraryStore();
  const isPaid = isItineraryPaid();

  // Transform our mainSteps to AntDesign Steps format
  const stepItems = mainSteps.map((step, index) => {
    const isLastStep = index === mainSteps.length - 1;
    const status = (
      index < currentMainStep
        ? "finish"
        : isLastStep && isPaid
        ? "finish"
        : "process"
    ) as "finish" | "process";

    return {
      title: step.title,
      status: status,
    };
  });

  return (
    <div className={styles.unifiedProgressBar}>
      <Steps
        current={currentMainStep}
        size="default"
        className={styles.customSteps}
        items={stepItems}
      />
    </div>
  );
};

export default UnifiedProgressBar;
