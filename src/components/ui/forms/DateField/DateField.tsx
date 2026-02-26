/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { cn } from "@/utils/helpers/cn";
import { DatePicker } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { forwardRef } from "react";
import styles from "./DateField.module.scss";

interface DateFieldProps {
  value?: Dayjs | Date | string;
  onChange?: (date: Dayjs | Date | null) => void;
  onBlur?: () => void;
  placeholder?: string;
  format?: string;
  disabled?: boolean;
  disabledDate?: (date: Dayjs) => boolean;
  className?: string;
  size?: "small" | "middle" | "large";
  id?: string;
}

const DateField = forwardRef<any, DateFieldProps>(
  (
    {
      value,
      onChange,
      onBlur,
      placeholder = "Select date",
      format = "DD/MM/YYYY",
      disabled = false,
      disabledDate,
      className,
      size = "middle",
      id,
      ...props
    },
    ref
  ) => {
    // Convert value to Dayjs object if it's a string or Date
    const dayJsValue = (() => {
      if (!value) return undefined;
      if (dayjs.isDayjs(value)) return value;
      return dayjs(value);
    })();

    return (
      <DatePicker
        ref={ref}
        value={dayJsValue}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        format={format}
        disabled={disabled}
        disabledDate={disabledDate}
        className={cn(styles.dateField, className)}
        size={size}
        style={{ width: "100%", height: "32px" }}
        id={id}
        {...props}
      />
    );
  }
);

DateField.displayName = "DateField";

export default DateField;
