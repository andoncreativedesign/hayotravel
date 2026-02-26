import dayjs from "dayjs";
import { z } from "zod";

export const simplePassengerSchema = z.object({
  passengers: z
    .array(
      z.object({
        passengerInfo: z.object({
          firstName: z.string().min(1, "First name is required"),
          lastName: z.string().min(1, "Last name is required"),
          dateOfBirth: z
            .union([
              z.date(),
              z.string().datetime(),
              z
                .string()
                .refine(
                  (val) => !isNaN(Date.parse(val)),
                  "Invalid date format"
                ),
              z.custom((val) => dayjs.isDayjs(val), "Expected a valid date"),
              z.undefined(),
            ])
            .transform((val) => {
              if (val === undefined) return undefined;
              if (dayjs.isDayjs(val)) return val.toDate();
              if (val instanceof Date) return val;
              return new Date(val);
            })
            .optional(),
          gender: z.enum(["male", "female", "other"]).optional(),
          title: z.enum(["mr", "mrs", "ms", "dr"]).optional(),
        }),
        document: z.object({
          passportNumber: z
            .string()
            .min(6, "Passport number must be at least 6 characters"),
          countryOfIssue: z.string().min(2, "Please select country of issue"),
          expiryDate: z
            .union([
              z.date(),
              z.string().datetime(),
              z
                .string()
                .refine(
                  (val) => !isNaN(Date.parse(val)),
                  "Invalid date format"
                ),
              z.custom((val) => dayjs.isDayjs(val), "Expected a valid date"),
              z.undefined(),
            ])
            .transform((val) => {
              if (val === undefined) return undefined;
              if (dayjs.isDayjs(val)) return val.toDate();
              if (val instanceof Date) return val;
              return new Date(val);
            })
            .optional(),
          nationality: z.string().min(2, "Please select nationality"),
        }),
        contact: z.object({
          email: z
            .string()
            .email("Please enter a valid email")
            .min(1, "Email is required"),
          phone: z.string().min(1, "Phone number is required"),
          countryCode: z.string().min(1, "Country code is required"),
        }).refine((contact) => {
          const fullPhoneNumber = `${contact.countryCode}${contact.phone}`;
          const phoneRegex = /^\+[1-9]\d{1,14}$/;
          return phoneRegex.test(fullPhoneNumber);
        }, {
          message: "Please enter a valid phone number. Combined country code and phone number must be in format +1234567890",
          path: ["phone"], // Show error on phone field
        }),
      })
    )
    .min(1),
});

export type FormPassengerFields = z.infer<typeof simplePassengerSchema>;
