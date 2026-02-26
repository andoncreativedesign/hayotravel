/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Select } from "antd";
import { forwardRef } from "react";
import styles from "./SelectField.module.scss";

const { Option } = Select;

interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

interface SelectFieldProps {
  value?: string | number;
  onChange?: (value: string | number) => void;
  onBlur?: () => void;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  options: SelectOption[];
  className?: string;
  size?: "small" | "middle" | "large";
  allowClear?: boolean;
  showSearch?: boolean;
  filterOption?: (input: string, option?: any) => boolean;
  id?: string;
}

const SelectField = forwardRef<any, SelectFieldProps>(
  (
    {
      value,
      onChange,
      onBlur,
      placeholder = "Select option",
      disabled = false,
      loading = false,
      options,
      className,
      size = "middle",
      allowClear = false,
      showSearch = false,
      filterOption,
      id,
      ...props
    },
    ref
  ) => {
    return (
      <Select
        ref={ref}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled || loading}
        loading={loading}
        className={`${styles.selectField} ${className || ""}`}
        size={size}
        allowClear={allowClear}
        showSearch={showSearch}
        filterOption={filterOption}
        style={{ width: "100%", height: "32px" }}
        id={id}
        {...props}>
        {options.map((option, index) => (
          <Option
            key={`${option.value}-${index}`}
            value={option.value}
            disabled={option.disabled}>
            {option.label}
          </Option>
        ))}
      </Select>
    );
  }
);

SelectField.displayName = "SelectField";

export default SelectField;
