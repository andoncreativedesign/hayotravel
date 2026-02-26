"use client";

import { Typography } from 'antd';
import { ReactNode } from 'react';
import { Control, FieldPath, FieldValues } from 'react-hook-form';
import styles from './FormField.module.scss';

const { Text } = Typography;

interface FormFieldProps<TFieldValues extends FieldValues> {
  name: FieldPath<TFieldValues>;
  label?: string;
  children: ReactNode;
  required?: boolean;
  error?: string;
  helpText?: string;
  className?: string;
  control?: Control<TFieldValues>;
}

const FormField = <TFieldValues extends FieldValues>({
  label,
  children,
  required = false,
  error,
  helpText,
  className,
}: FormFieldProps<TFieldValues>) => {
  return (
    <div className={`${styles.formField} ${className || ''}`}>
      {label && (
        <Text className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </Text>
      )}
      <div className={styles.inputWrapper}>
        {children}
      </div>
      {error && (
        <Text type="danger" className={styles.error}>
          {error}
        </Text>
      )}
      {helpText && !error && (
        <Text type="secondary" className={styles.helpText}>
          {helpText}
        </Text>
      )}
    </div>
  );
};

export default FormField;