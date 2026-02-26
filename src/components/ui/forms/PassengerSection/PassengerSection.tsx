/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { FormPassengerFields } from "@/components/Blocks/Checkout/components/EnhancedTravelerForm/utils/formSchema";
import { Card, Col, Input, Row, Typography } from "antd";
import dayjs from "dayjs";
import { Control, Controller, FieldErrors } from "react-hook-form";
import DateField from "../DateField/DateField";
import FormField from "../FormField/FormField";
import SelectField from "../SelectField/SelectField";
import styles from "./PassengerSection.module.scss";

const { Title } = Typography;

interface PassengerSectionProps {
  control: Control<FormPassengerFields>;
  errors: FieldErrors<FormPassengerFields>;
  passengerIndex?: number; // For multi-passenger forms
  title?: string;
}

const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

const titleOptions = [
  { value: "mr", label: "Mr." },
  { value: "mrs", label: "Mrs." },
  { value: "ms", label: "Ms." },
  { value: "dr", label: "Dr." },
];

const PassengerSection = ({
  control,
  errors,
  passengerIndex = 0,
  title = "Personal Information",
}: PassengerSectionProps) => {
  const getFieldName = (field: string) => {
    return `passengers.${passengerIndex}.passengerInfo.${field}` as any;
  };

  const getFieldError = (field: string) => {
    // All passengers are structured as passengers[index].passengerInfo.field
    const error = (errors as any)?.passengers?.[passengerIndex]
      ?.passengerInfo?.[field];
    return error?.message as string | undefined;
  };

  return (
    <Card className={styles.passengerSection}>
      <Title level={4} className={styles.sectionTitle}>
        {title}
      </Title>

      <Row gutter={16}>
        <Col span={4}>
          <FormField
            name={getFieldName("title")}
            label="Title"
            error={getFieldError("title")}>
            <Controller
              name={getFieldName("title")}
              control={control}
              render={({ field }) => (
                <SelectField
                  {...field}
                  id={getFieldName("title")}
                  placeholder="Select title"
                  options={titleOptions}
                />
              )}
            />
          </FormField>
        </Col>

        <Col span={10}>
          <FormField
            name={getFieldName("firstName")}
            label="Given Names"
            required
            error={getFieldError("firstName")}>
            <Controller
              name={getFieldName("firstName")}
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id={getFieldName("firstName")}
                  name={getFieldName("firstName")}
                  placeholder="Name on passport"
                  className={styles.input}
                  autoComplete="given-name"
                />
              )}
            />
          </FormField>
        </Col>

        <Col span={10}>
          <FormField
            name={getFieldName("lastName")}
            label="Surname"
            required
            error={getFieldError("lastName")}>
            <Controller
              name={getFieldName("lastName")}
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id={getFieldName("lastName")}
                  name={getFieldName("lastName")}
                  placeholder="Surname on passport"
                  className={styles.input}
                  autoComplete="family-name"
                />
              )}
            />
          </FormField>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <FormField
            name={getFieldName("dateOfBirth")}
            label="Date of Birth"
            required
            error={getFieldError("dateOfBirth")}>
            <Controller
              name={getFieldName("dateOfBirth")}
              control={control}
              render={({ field }) => (
                <DateField
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  ref={field.ref}
                  id={getFieldName("dateOfBirth")}
                  placeholder="Select date"
                  format="DD.MM.YYYY"
                  disabledDate={(date) => {
                    // Disable future dates (can't be born in the future)
                    // and dates that would make person under 18 (for travel booking)
                    const today = dayjs();
                    const eighteenYearsAgo = today.subtract(18, "year");
                    return (
                      date.isAfter(today, "day") || // No future dates
                      date.isAfter(eighteenYearsAgo, "day") // Must be 18+ years old
                    );
                  }}
                />
              )}
            />
          </FormField>
        </Col>
        <Col span={12}>
          <FormField
            name={getFieldName("gender")}
            label="Gender"
            required
            error={getFieldError("gender")}>
            <Controller
              name={getFieldName("gender")}
              control={control}
              render={({ field }) => (
                <SelectField
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  ref={field.ref}
                  id={getFieldName("gender")}
                  placeholder="Select"
                  options={genderOptions}
                />
              )}
            />
          </FormField>
        </Col>
      </Row>
    </Card>
  );
};

export default PassengerSection;
