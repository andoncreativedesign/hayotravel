import {
  passengerInfoSchema,
  documentSchema,
  contactSchema,
  specialRequirementsSchema,
  fullPassengerSchema,
  multiPassengerSchema,
  PassengerInfo,
  Document,
  Contact,
  FullPassenger
} from "@/components/ui/forms/schemas/passenger.schema";

describe("Passenger Schema Validation", () => {
  describe("passengerInfoSchema", () => {
    it("should validate valid passenger info", () => {
      const validData: PassengerInfo = {
        firstName: "John",
        lastName: "Doe",
        dateOfBirth: new Date("1990-01-01"),
        gender: "male",
        title: "mr"
      };

      const result = passengerInfoSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should require firstName", () => {
      const invalidData = {
        firstName: "",
        lastName: "Doe",
        dateOfBirth: new Date("1990-01-01"),
        gender: "male"
      };

      const result = passengerInfoSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("First name is required");
      }
    });

    it("should require lastName", () => {
      const invalidData = {
        firstName: "John",
        lastName: "",
        dateOfBirth: new Date("1990-01-01"),
        gender: "male"
      };

      const result = passengerInfoSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Last name is required");
      }
    });

    it("should require valid gender", () => {
      const invalidData = {
        firstName: "John",
        lastName: "Doe",
        dateOfBirth: new Date("1990-01-01"),
        gender: "invalid"
      };

      const result = passengerInfoSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should validate age constraints", () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      const invalidData = {
        firstName: "John",
        lastName: "Doe",
        dateOfBirth: futureDate,
        gender: "male"
      };

      const result = passengerInfoSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should make title optional", () => {
      const validData = {
        firstName: "John",
        lastName: "Doe",
        dateOfBirth: new Date("1990-01-01"),
        gender: "male"
        // title is omitted
      };

      const result = passengerInfoSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe("documentSchema", () => {
    it("should validate valid document info", () => {
      const validData: Document = {
        passportNumber: "AB123456",
        countryOfIssue: "US",
        expiryDate: new Date("2030-01-01"),
        nationality: "US"
      };

      const result = documentSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should require minimum passport number length", () => {
      const invalidData = {
        passportNumber: "12345", // Too short
        countryOfIssue: "US",
        expiryDate: new Date("2030-01-01"),
        nationality: "US"
      };

      const result = documentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Passport number must be at least 6 characters");
      }
    });

    it("should require country of issue", () => {
      const invalidData = {
        passportNumber: "AB123456",
        countryOfIssue: "X", // Too short
        expiryDate: new Date("2030-01-01"),
        nationality: "US"
      };

      const result = documentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should validate expiry date is in future", () => {
      const pastDate = new Date("2020-01-01");

      const invalidData = {
        passportNumber: "AB123456",
        countryOfIssue: "US",
        expiryDate: pastDate,
        nationality: "US"
      };

      const result = documentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Passport must be valid for at least 6 months from today");
      }
    });

    it("should require nationality", () => {
      const invalidData = {
        passportNumber: "AB123456",
        countryOfIssue: "US",
        expiryDate: new Date("2030-01-01"),
        nationality: "X" // Too short
      };

      const result = documentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("contactSchema", () => {
    it("should validate valid contact info", () => {
      const validData: Contact = {
        email: "test@example.com",
        phone: "234567890", // Phone number without country code
        countryCode: "+1",
        address: {
          street: "123 Main St",
          city: "New York",
          postalCode: "10001",
          country: "US"
        }
      };

      const result = contactSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should require valid email", () => {
      const invalidData = {
        email: "invalid-email",
        phone: "1234567890",
        countryCode: "+1"
      };

      const result = contactSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Please enter a valid email address");
      }
    });

    it("should require valid phone number format", () => {
      const invalidData = {
        email: "test@example.com",
        phone: "234567890",
        countryCode: "+0" // Invalid country code - first digit after + cannot be 0
      };

      const result = contactSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Please enter a valid phone number. Combined country code and phone number must be in format +1234567890");
      }
    });

    it("should require country code", () => {
      const invalidData = {
        email: "test@example.com",
        phone: "1234567890",
        countryCode: "" // Empty
      };

      const result = contactSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should make address optional", () => {
      const validData = {
        email: "test@example.com",
        phone: "1234567890",
        countryCode: "+1"
        // address is omitted
      };

      const result = contactSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe("specialRequirementsSchema", () => {
    it("should validate valid special requirements", () => {
      const validData = {
        dietaryRestrictions: ["vegetarian", "gluten-free"],
        mobilityAssistance: true,
        seatPreference: "window" as const,
        frequentFlyerNumber: "FF123456"
      };

      const result = specialRequirementsSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should make all fields optional", () => {
      const validData = {};

      const result = specialRequirementsSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should validate seat preference enum", () => {
      const invalidData = {
        seatPreference: "invalid" // Not in enum
      };

      const result = specialRequirementsSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("fullPassengerSchema", () => {
    it("should validate complete passenger data", () => {
      const validData: FullPassenger = {
        passengerInfo: {
          firstName: "John",
          lastName: "Doe",
          dateOfBirth: new Date("1990-01-01"),
          gender: "male",
          title: "mr"
        },
        document: {
          passportNumber: "AB123456",
          countryOfIssue: "US",
          expiryDate: new Date("2030-01-01"),
          nationality: "US"
        },
        contact: {
          email: "test@example.com",
          phone: "1234567890",
          countryCode: "+1"
        }
      };

      const result = fullPassengerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should require all main sections", () => {
      const invalidData = {
        passengerInfo: {
          firstName: "John",
          lastName: "Doe",
          dateOfBirth: new Date("1990-01-01"),
          gender: "male"
        }
        // Missing document and contact
      };

      const result = fullPassengerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should make optional fields optional", () => {
      const validData = {
        passengerInfo: {
          firstName: "John",
          lastName: "Doe",
          dateOfBirth: new Date("1990-01-01"),
          gender: "male"
        },
        document: {
          passportNumber: "AB123456",
          countryOfIssue: "US",
          expiryDate: new Date("2030-01-01"),
          nationality: "US"
        },
        contact: {
          email: "test@example.com",
          phone: "1234567890",
          countryCode: "+1"
        }
        // specialRequirements and emergencyContact are omitted
      };

      const result = fullPassengerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe("multiPassengerSchema", () => {
    it("should validate multi-passenger data", () => {
      const validData = {
        passengers: [
          {
            passengerInfo: {
              firstName: "John",
              lastName: "Doe",
              dateOfBirth: new Date("1990-01-01"),
              gender: "male"
            },
            document: {
              passportNumber: "AB123456",
              countryOfIssue: "US",
              expiryDate: new Date("2030-01-01"),
              nationality: "US"
            },
            contact: {
              email: "test@example.com",
              phone: "1234567890",
              countryCode: "+1"
            }
          }
        ],
        primaryContact: {
          isPrimaryPassenger: true
        }
      };

      const result = multiPassengerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should require at least one passenger", () => {
      const invalidData = {
        passengers: [], // Empty array
        primaryContact: {
          isPrimaryPassenger: true
        }
      };

      const result = multiPassengerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("At least one passenger is required");
      }
    });

    it("should validate primary contact", () => {
      const validData = {
        passengers: [
          {
            passengerInfo: {
              firstName: "John",
              lastName: "Doe",
              dateOfBirth: new Date("1990-01-01"),
              gender: "male"
            },
            document: {
              passportNumber: "AB123456",
              countryOfIssue: "US",
              expiryDate: new Date("2030-01-01"),
              nationality: "US"
            },
            contact: {
              email: "test@example.com",
              phone: "1234567890",
              countryCode: "+1"
            }
          }
        ],
        primaryContact: {
          isPrimaryPassenger: false,
          passengerIndex: 0,
          email: "contact@example.com",
          phone: "0987654321"
        }
      };

      const result = multiPassengerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe("Step Schemas", () => {
    it("should export step schemas correctly", () => {
      expect(typeof passengerInfoSchema).toBe('object');
      expect(typeof documentSchema).toBe('object');
      expect(typeof contactSchema).toBe('object');
      expect(typeof specialRequirementsSchema).toBe('object');
    });

    it("should validate individual steps", () => {
      const personalInfoData = {
        firstName: "John",
        lastName: "Doe",
        dateOfBirth: new Date("1990-01-01"),
        gender: "male"
      };

      const result = passengerInfoSchema.safeParse(personalInfoData);
      expect(result.success).toBe(true);
    });
  });
});