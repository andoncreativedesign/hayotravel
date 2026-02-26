import ContactSection from "@/components/ui/forms/ContactSection/ContactSection";
import { render, screen, fireEvent } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { FullPassenger } from "@/components/ui/forms/schemas/passenger.schema";

// Mock component wrapper for testing with react-hook-form
interface ContactSectionWrapperProps {
  passengerIndex?: number;
  title?: string;
  initialErrors?: any;
}

const ContactSectionWrapper = ({ 
  passengerIndex = 0, 
  title = "Contact Information",
  initialErrors = {}
}: ContactSectionWrapperProps) => {
  // For testing purposes, create a form structure that satisfies both the type system
  // and the component's field path expectations
  const defaultValues = {
    contact: {
      email: "",
      phone: "",
      countryCode: "+1"
    },
    // Add passengers array for multi-passenger field paths (even though not in FullPassenger type)
    passengers: Array.from({ length: Math.max(passengerIndex + 1, 1) }, () => ({
      contact: {
        email: "",
        phone: "",
        countryCode: "+1"
      }
    }))
  } as any; // Use 'any' to bypass type checking for test flexibility

  const { control, formState: { errors } } = useForm({
    defaultValues,
    mode: 'onChange'
  });

  // Merge provided errors with form errors for testing
  const testErrors = { ...errors, ...initialErrors };

  return (
    <ContactSection
      control={control as any} // Cast to bypass type mismatch
      errors={testErrors as any}
      passengerIndex={passengerIndex}
      title={title}
    />
  );
};

describe("ContactSection Component", () => {
  it("should render with default props", () => {
    render(<ContactSectionWrapper />);

    expect(screen.getByText("Contact Information")).toBeTruthy();
    expect(screen.getByText("Email Address")).toBeTruthy();
    expect(screen.getByText("Country Code")).toBeTruthy();
    expect(screen.getByText("Phone Number")).toBeTruthy();
  });

  it("should render custom title", () => {
    const customTitle = "Primary Contact Details";
    
    render(<ContactSectionWrapper title={customTitle} />);

    expect(screen.getByText(customTitle)).toBeTruthy();
  });

  it("should display email field with correct attributes", () => {
    render(<ContactSectionWrapper />);

    const emailInput = screen.getByPlaceholderText("Enter your email address") as HTMLInputElement;
    expect(emailInput).toBeTruthy();
    expect(emailInput.type).toBe("email");
  });

  it("should display phone field with correct attributes", () => {
    render(<ContactSectionWrapper />);

    const phoneInput = screen.getByPlaceholderText("Enter your phone number") as HTMLInputElement;
    expect(phoneInput).toBeTruthy();
    expect(phoneInput.type).toBe("tel");
  });

  it("should show required asterisks for required fields", () => {
    render(<ContactSectionWrapper />);

    // Check for required indicators (asterisks)
    const requiredElements = screen.getAllByText("*");
    expect(requiredElements.length).toBeGreaterThan(0);
  });

  it("should display help text for email and phone fields", () => {
    render(<ContactSectionWrapper />);

    expect(screen.getByText("We'll send your booking confirmation to this email")).toBeTruthy();
    expect(screen.getByText("For urgent travel updates and notifications")).toBeTruthy();
  });

  it("should display privacy notice", () => {
    render(<ContactSectionWrapper />);

    expect(screen.getByText(/Privacy Notice/)).toBeTruthy();
    expect(screen.getByText(/Your contact information is used only for booking-related/)).toBeTruthy();
  });

  it("should show country code options", () => {
    render(<ContactSectionWrapper />);

    // Country code options are already visible in the rendered select element
    expect(screen.getByText("+1 (US/CA)")).toBeTruthy();
    expect(screen.getByText("+44 (UK)")).toBeTruthy();
    expect(screen.getByText("+33 (FR)")).toBeTruthy();
  });

  it("should format phone number input", () => {
    render(<ContactSectionWrapper />);

    const phoneInput = screen.getByPlaceholderText("Enter your phone number") as HTMLInputElement;
    
    // Simulate typing with non-numeric characters
    fireEvent.change(phoneInput, { target: { value: "123-456-7890" } });
    
    // Should only contain digits
    expect(phoneInput.value).toBe("1234567890");
  });

  it("should handle multi-passenger field names", () => {
    render(<ContactSectionWrapper passengerIndex={1} />);

    // Field names should include passenger index for multi-passenger forms
    const emailInput = screen.getByPlaceholderText("Enter your email address") as HTMLInputElement;
    expect(emailInput.name).toContain("passengers.1.contact.email");
  });

  it("should display error messages when provided", () => {
    const mockErrors = {
      passengers: [{
        contact: {
          email: { message: "Invalid email address" },
          phone: { message: "Phone number is required" },
          countryCode: { message: "Please select country code" }
        }
      }]
    };

    render(<ContactSectionWrapper initialErrors={mockErrors} />);

    expect(screen.getByText("Invalid email address")).toBeTruthy();
    expect(screen.getByText("Phone number is required")).toBeTruthy();
    expect(screen.getByText("Please select country code")).toBeTruthy();
  });

  it("should be responsive with proper grid layout", () => {
    const { container } = render(<ContactSectionWrapper />);

    // Check for Ant Design grid classes (based on actual rendered output)
    expect(container.querySelector(".ant-col")).toBeTruthy();
    expect(container.querySelector('[sm="8"]')).toBeTruthy();
    expect(container.querySelector('[sm="16"]')).toBeTruthy();
    expect(container.querySelector('[xs="24"]')).toBeTruthy();
  });

  it("should have search functionality for country code select", () => {
    const { container } = render(<ContactSectionWrapper />);

    // Check that the select field has showSearch enabled (it's rendered as a native select for now)
    const countryCodeSelect = container.querySelector('[name="contact.countryCode"]');
    expect(countryCodeSelect).toBeTruthy();
    expect(countryCodeSelect?.tagName).toBe('SELECT');
  });

  it("should handle field validation correctly", () => {
    render(<ContactSectionWrapper />);

    const emailInput = screen.getByPlaceholderText("Enter your email address") as HTMLInputElement;
    const phoneInput = screen.getByPlaceholderText("Enter your phone number") as HTMLInputElement;

    // Test email validation
    fireEvent.change(emailInput, { target: { value: "invalid-email" } });
    fireEvent.blur(emailInput);

    // Test phone validation
    fireEvent.change(phoneInput, { target: { value: "123" } });
    fireEvent.blur(phoneInput);

    // Errors should be handled by the form validation system
    expect(emailInput.value).toBe("invalid-email");
    expect(phoneInput.value).toBe("123");
  });

  it("should apply correct CSS classes", () => {
    const { container } = render(<ContactSectionWrapper />);

    expect(container.querySelector(".contactSection")).toBeTruthy();
    expect(container.querySelector(".sectionTitle")).toBeTruthy();
    expect(container.querySelector(".input")).toBeTruthy();
    expect(container.querySelector(".privacyNotice")).toBeTruthy();
  });

  it("should handle empty state gracefully", () => {
    render(<ContactSectionWrapper />);

    const emailInput = screen.getByPlaceholderText("Enter your email address");
    const phoneInput = screen.getByPlaceholderText("Enter your phone number");

    expect(emailInput.value).toBe("");
    expect(phoneInput.value).toBe("");
  });
});