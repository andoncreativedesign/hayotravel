/* eslint-disable @typescript-eslint/no-explicit-any */
import { ExclamationIcon } from "@/components/icons";
import { Alert } from "antd";
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { FormPassengerFields } from "../EnhancedTravelerForm/utils/formSchema";
import styles from "./ValidationMessage.module.scss";

interface ValidationMessageProps {
  form: UseFormReturn<FormPassengerFields>;
}

// type guard for any RHF FieldError-like object
const hasMessage = (v: unknown): v is { message: string } =>
  !!v &&
  typeof v === "object" &&
  "message" in (v as any) &&
  typeof (v as any).message === "string";

// recursively collect all messages from arrays / objects / FieldError
const collectMessages = (node: unknown): string[] => {
  if (!node) return [];

  if (Array.isArray(node)) {
    return node.flatMap(collectMessages);
  }

  if (hasMessage(node)) {
    return [node.message];
  }

  if (typeof node === "object") {
    return Object.values(node as Record<string, unknown>).flatMap(
      collectMessages
    );
  }

  return [];
};

const ValidationMessage: React.FC<ValidationMessageProps> = ({ form }) => {
  const { errors } = form.formState;

  // Collect passenger-specific messages (handles undefined safely)
  const passengerMessages = collectMessages(errors.passengers ?? []);

  // (optional) also include root-level form messages if you use them
  const rootMessages = collectMessages(errors.root);

  const messages = [...rootMessages, ...passengerMessages];

  if (messages.length === 0) return null;

  return (
    <div className={styles.validationMessage}>
      <Alert
        message={
          <div className={styles.alertContent}>
            <div className={styles.header}>
              <ExclamationIcon className={styles.icon} />
              <span className={styles.title}>
                Please complete the following fields to continue:
              </span>
            </div>
          </div>
        }
        description={
          <ul className={styles.errorList}>
            {messages.map((msg, i) => (
              <li key={i} className={styles.errorItem}>
                {msg}
              </li>
            ))}
          </ul>
        }
        type="warning"
        showIcon={false}
        className={styles.alert}
      />
    </div>
  );
};

export default ValidationMessage;
