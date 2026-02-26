import { z } from 'zod';
import dayjs, { Dayjs } from 'dayjs';

// Enhanced date schema that handles multiple input types
const flexibleDateSchema = z.union([
  z.date(),
  z.string().datetime(),
  z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date format'),
  z.custom<Dayjs>((val) => dayjs.isDayjs(val), 'Expected a valid date')
]).transform((val) => {
  if (dayjs.isDayjs(val)) return val.toDate();
  if (val instanceof Date) return val;
  return new Date(val);
});

// Base passenger information schema
export const passengerInfoSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  dateOfBirth: flexibleDateSchema.refine((date) => {
    const today = new Date();
    const birthDate = new Date(date);
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    // Adjust age if birthday hasn't occurred this year
    const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) ? age - 1 : age;
    
    if (actualAge < 18) {
      return false;
    }
    return actualAge >= 18 && actualAge <= 120;
  }, 'Passenger must be at least 18 years old'),
  gender: z.enum(['male', 'female', 'other'], {
    required_error: 'Please select a gender',
  }),
  title: z.enum(['mr', 'mrs', 'ms', 'dr'], {
    required_error: 'Please select a title',
  }).optional(),
});

// Document/Passport schema
export const documentSchema = z.object({
  passportNumber: z.string().min(6, 'Passport number must be at least 6 characters'),
  countryOfIssue: z.string().min(2, 'Please select country of issue'),
  expiryDate: flexibleDateSchema.refine((date) => {
    const today = new Date();
    const sixMonthsFromNow = new Date();
    sixMonthsFromNow.setMonth(today.getMonth() + 6);
    
    return date >= sixMonthsFromNow;
  }, 'Passport must be valid for at least 6 months from today'),
  nationality: z.string().min(2, 'Please select nationality'),
});

// Contact information schema
export const contactSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .refine((email) => {
      // More flexible email validation regex
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      return emailRegex.test(email);
    }, 'Please enter a valid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  countryCode: z.string().min(1, 'Please select country code'),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
}).refine((contact) => {
  const fullPhoneNumber = `${contact.countryCode}${contact.phone}`;
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  return phoneRegex.test(fullPhoneNumber);
}, {
  message: "Please enter a valid phone number. Combined country code and phone number must be in format +1234567890",
  path: ["phone"],
});

// Special requirements schema
export const specialRequirementsSchema = z.object({
  dietaryRestrictions: z.array(z.string()).optional(),
  mobilityAssistance: z.boolean().optional(),
  seatPreference: z.enum(['window', 'aisle', 'middle']).optional(),
  frequentFlyerNumber: z.string().optional(),
});

// Combined passenger schema
export const fullPassengerSchema = z.object({
  passengerInfo: passengerInfoSchema,
  document: documentSchema,
  contact: contactSchema,
  specialRequirements: specialRequirementsSchema.optional(),
  emergencyContact: z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
    relationship: z.string().optional(),
  }).optional(),
});

// Multi-passenger schema for group bookings
export const multiPassengerSchema = z.object({
  passengers: z.array(fullPassengerSchema).min(1, 'At least one passenger is required'),
  primaryContact: z.object({
    isPrimaryPassenger: z.boolean(),
    passengerIndex: z.number().optional(), // If not primary passenger
    email: z.string().email().optional(),
    phone: z.string().optional(),
  }),
});

// TypeScript types
export type PassengerInfo = z.infer<typeof passengerInfoSchema>;
export type Document = z.infer<typeof documentSchema>;
export type Contact = z.infer<typeof contactSchema>;
export type SpecialRequirements = z.infer<typeof specialRequirementsSchema>;
export type FullPassenger = z.infer<typeof fullPassengerSchema>;
export type MultiPassenger = z.infer<typeof multiPassengerSchema>;

// Form step schemas for progressive validation
export const passengerStepSchemas = {
  personalInfo: passengerInfoSchema,
  document: documentSchema,
  contact: contactSchema,
  specialRequirements: specialRequirementsSchema,
} as const;

export type PassengerStepKey = keyof typeof passengerStepSchemas;