/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { FormPassengerFields } from "@/components/Blocks/Checkout/components/EnhancedTravelerForm/utils/formSchema";
import { countryFilterOption, useCountryOptions } from "@/utils/countries";
import { Card, Col, Input, Row, Typography } from "antd";
import dayjs from "dayjs";
import { Control, Controller, FieldErrors } from "react-hook-form";
import DateField from "../DateField/DateField";
import FormField from "../FormField/FormField";
import SelectField from "../SelectField/SelectField";
import styles from "./DocumentSection.module.scss";

interface DocumentSectionProps {
  control: Control<FormPassengerFields>;
  errors: FieldErrors<FormPassengerFields>;
  passengerIndex?: number;
}

const DocumentSection = ({
  control,
  errors,
  passengerIndex = 0,
}: DocumentSectionProps) => {
  const { countries: countryOptions, loading: countriesLoading } =
    useCountryOptions();

  const getFieldName = (field: string) => {
    return `passengers.${passengerIndex}.document.${field}` as any;
  };

  const getFieldError = (field: string) => {
    // All passengers are structured as passengers[index].document.field
    const error = (errors as any)?.passengers?.[passengerIndex]?.document?.[
      field
    ];
    return error?.message as string | undefined;
  };

  return (
    <Card className={styles.documentSection}>
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <FormField
            name={getFieldName("countryOfIssue")}
            label="Country of Issue"
            required
            error={getFieldError("countryOfIssue")}
            // helpText="The country that issued your passport"
          >
            <Controller
              name={getFieldName("countryOfIssue")}
              control={control}
              render={({ field }) => (
                <SelectField
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  ref={field.ref}
                  id={getFieldName("countryOfIssue")}
                  placeholder="Select"
                  options={countryOptions}
                  showSearch
                  loading={countriesLoading}
                  filterOption={(input, option) =>
                    countryFilterOption(input, option, countryOptions)
                  }
                />
              )}
            />
          </FormField>
        </Col>

        <Col xs={24} sm={12}>
          <FormField
            name={getFieldName("nationality")}
            label="Nationality"
            required
            error={getFieldError("nationality")}>
            <Controller
              name={getFieldName("nationality")}
              control={control}
              render={({ field }) => (
                <SelectField
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  ref={field.ref}
                  id={getFieldName("nationality")}
                  placeholder="Select nationality"
                  options={countryOptions}
                  showSearch
                  loading={countriesLoading}
                  filterOption={(input, option) =>
                    countryFilterOption(input, option, countryOptions)
                  }
                />
              )}
            />
          </FormField>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <FormField
            name={getFieldName("passportNumber")}
            label="Passport Number"
            required
            error={getFieldError("passportNumber")}
            // helpText="Enter passport number without spaces"
          >
            <Controller
              name={getFieldName("passportNumber")}
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id={getFieldName("passportNumber")}
                  name={getFieldName("passportNumber")}
                  placeholder="FH5679988"
                  className={styles.input}
                  style={{ textTransform: "uppercase" }}
                  autoComplete="off"
                />
              )}
            />
          </FormField>
        </Col>

        <Col xs={24} sm={12}>
          <FormField
            name={getFieldName("expiryDate")}
            label="Expiry Date"
            required
            error={getFieldError("expiryDate")}
            // helpText="Must be valid for at least 6 months from travel date"
          >
            <Controller
              name={getFieldName("expiryDate")}
              control={control}
              render={({ field }) => (
                <DateField
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  ref={field.ref}
                  id={getFieldName("expiryDate")}
                  placeholder="Select date"
                  format="DD.MM.YYYY"
                  disabledDate={(date) => {
                    // Disable dates that are in the past (expired passports)
                    // Allow dates from today onwards for passport expiry
                    return date.isBefore(dayjs(), "day");
                  }}
                />
              )}
            />
          </FormField>
        </Col>
      </Row>

      <div className={styles.validationInfo}>
        <Typography.Text type="secondary" className={styles.infoText}>
          📋 <strong>Document Requirements:</strong>
        </Typography.Text>
        <ul className={styles.requirementsList}>
          <li>Passport must be valid for at least 6 months from travel date</li>
          <li>Name on passport must match exactly with ticket name</li>
          <li>Ensure passport is not damaged or expired</li>
          <li>Check visa requirements for your destination</li>
        </ul>
      </div>
    </Card>
  );
};

export default DocumentSection;
