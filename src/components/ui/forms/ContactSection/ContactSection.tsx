/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { FormPassengerFields } from "@/components/Blocks/Checkout/components/EnhancedTravelerForm/utils/formSchema";
import {
  countryFilterOption,
  useCountryPhoneCodeOptions,
} from "@/utils/countries";
import { Card, Col, Input, Row, Typography } from "antd";
import { Control, Controller, FieldErrors } from "react-hook-form";
import FormField from "../FormField/FormField";
import SelectField from "../SelectField/SelectField";
import styles from "./ContactSection.module.scss";

interface ContactSectionProps {
  control: Control<FormPassengerFields>;
  errors: FieldErrors<FormPassengerFields>;
  passengerIndex?: number;
}

const ContactSection = ({
  control,
  errors,
  passengerIndex = 0,
}: ContactSectionProps) => {
  const { phoneCodeOptions, loading: phoneCodesLoading } =
    useCountryPhoneCodeOptions();
  const getFieldName = (field: string) => {
    return `passengers.${passengerIndex}.contact.${field}` as any;
  };

  const getFieldError = (field: string) => {
    // All passengers are structured as passengers[index].contact.field
    const error = (errors as any)?.passengers?.[passengerIndex]?.contact?.[
      field
    ];
    return error?.message;
  };

  return (
    <Card className={styles.contactSection}>
      <Row gutter={16}>
        <Col xs={24} sm={24}>
          <FormField
            name={getFieldName("email")}
            label="Email Address"
            required
            error={getFieldError("email")}
            // helpText="We'll send your booking confirmation to this email"
          >
            <Controller
              name={getFieldName("email")}
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id={getFieldName("email")}
                  name={getFieldName("email")}
                  type="email"
                  placeholder="Enter your email address"
                  className={styles.input}
                  autoComplete="email"
                />
              )}
            />
          </FormField>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} sm={8}>
          <FormField
            name={getFieldName("countryCode")}
            label="Country Code"
            required
            error={getFieldError("countryCode")}>
            <Controller
              name={getFieldName("countryCode")}
              control={control}
              render={({ field }) => (
                <SelectField
                  {...field}
                  id={getFieldName("countryCode")}
                  placeholder="Select country code"
                  options={phoneCodeOptions}
                  showSearch
                  loading={phoneCodesLoading}
                  filterOption={(input, option) =>
                    countryFilterOption(input, option, phoneCodeOptions)
                  }
                />
              )}
            />
          </FormField>
        </Col>

        <Col xs={24} sm={16}>
          <FormField
            name={getFieldName("phone")}
            label="Phone Number"
            required
            error={getFieldError("phone")}
            // helpText="For urgent travel updates and notifications"
          >
            <Controller
              name={getFieldName("phone")}
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id={getFieldName("phone")}
                  name={getFieldName("phone")}
                  type="tel"
                  placeholder="Enter your phone number"
                  className={styles.input}
                  autoComplete="tel"
                  onChange={(e) => {
                    // Auto-format phone number (remove non-digits)
                    const value = e.target.value.replace(/[^0-9]/g, "");
                    field.onChange(value);
                  }}
                />
              )}
            />
          </FormField>
        </Col>
      </Row>

      <div className={styles.privacyNotice}>
        <Typography.Text type="secondary" className={styles.noticeText}>
          🔒 <strong>Privacy Notice:</strong> Your contact information is used
          only for booking-related communications and will not be shared with
          third parties.
        </Typography.Text>
      </div>
    </Card>
  );
};

export default ContactSection;
