"use client";

import ContactSection from "@/components/ui/forms/ContactSection/ContactSection";
import DocumentSection from "@/components/ui/forms/DocumentSection/DocumentSection";
import PassengerSection from "@/components/ui/forms/PassengerSection/PassengerSection";
import type { CollapseProps } from "antd";
import { Card, Collapse, Typography } from "antd";
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { FormPassengerFields } from "../EnhancedTravelerForm/utils/formSchema";
import styles from "./PassengerFormCard.module.scss";

const { Text } = Typography;

interface PassengerFormCardProps {
  passengerIndex: number;
  totalPassengers: number;
  form: UseFormReturn<FormPassengerFields>;
  fieldPrefix: string;
  useProfileInfo?: boolean;
}

const getPassengerType = (index: number): string => {
  if (index === 0) {
    return "Primary traveller";
  }
  return `Traveler ${index + 1}`;
};

// TODO: Unmock this
const getAgeLabel = (): string => {
  // For now, assuming all travelers are adults (16+)
  // This could be enhanced to determine age from dateOfBirth in the future
  return "Adult";
};

const PassengerFormCard: React.FC<PassengerFormCardProps> = ({
  passengerIndex,
  form,
}) => {
  const passengerType = getPassengerType(passengerIndex);
  const ageLabel = getAgeLabel();

  const renderHeader = () => (
    <div className={styles.header}>
      <div className={styles.titleSection}>
        <div className={styles.left}>
          <Text className={styles.travelerTitle}>
            {passengerType}: {ageLabel}
          </Text>
        </div>
      </div>
    </div>
  );

  const collapseItems: CollapseProps["items"] = [
    {
      key: "form",
      label: renderHeader(),
      showArrow: false,
      children: (
        <div className={styles.formContent}>
          {/* Personal Information Section */}
          <div className={styles.section}>
            <PassengerSection
              control={form.control}
              errors={form.formState.errors}
              passengerIndex={passengerIndex}
            />
          </div>

          {/* Passport Details Section */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>
              <Text className={styles.sectionTitleText}>Passport details</Text>
            </div>
            <DocumentSection
              control={form.control}
              errors={form.formState.errors}
              passengerIndex={passengerIndex}
            />
          </div>

          {/* Contact Details Section */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>
              <Text className={styles.sectionTitleText}>Contact details</Text>
              <Text className={styles.sectionDescription}>
                To ensure you receive all important SMS updates from us about
                your flight, please provide us with a mobile number
              </Text>
            </div>
            <ContactSection
              control={form.control}
              errors={form.formState.errors}
              passengerIndex={passengerIndex}
            />
          </div>
        </div>
      ),
      className: styles.panel,
    },
  ];

  return (
    <Card className={styles.passengerCard}>
      <Collapse
        defaultActiveKey={["form"]}
        ghost
        className={styles.collapse}
        items={collapseItems}
      />
    </Card>
  );
};

export default PassengerFormCard;
