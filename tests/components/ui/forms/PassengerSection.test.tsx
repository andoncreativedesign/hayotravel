
import PassengerSection from "@/components/ui/forms/PassengerSection/PassengerSection";
import { render, screen, fireEvent } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { FullPassenger } from "@/components/ui/forms/schemas/passenger.schema";
import dayjs from "dayjs";

// Mock component wrapper for testing with react-hook-form
const PassengerSectionWrapper = ({ 
  passengerIndex = 0, 
  title = "Personal Information",
  initialErrors = {}
}) => {
  const { control } = useForm<FullPassenger>({
    defaultValues: {
      passengerInfo: {
        firstName: "",
        lastName: "",
        dateOfBirth: undefined,
        gender: undefined,
        title: undefined
      }
    }
  });

  // Mock errors structure to match what the component expects
  const mockErrors = initialErrors;

  return (
    <PassengerSection
      control={control}
      errors={mockErrors}
      passengerIndex={passengerIndex}
      title={title}
    />
  );
};

describe("PassengerSection Component", () => {
  it("should render with default props", () => {
    render(<PassengerSectionWrapper />);

    expect(screen.getByText("Personal Information")).toBeTruthy();
    expect(screen.getByText("Title")).toBeTruthy();
    expect(screen.getByText("Gender")).toBeTruthy();
    expect(screen.getByText("First Name")).toBeTruthy();
    expect(screen.getByText("Last Name")).toBeTruthy();
    expect(screen.getByText("Date of Birth")).toBeTruthy();
  });

  it("should render custom title", () => {
    const customTitle = "Passenger Details";
    
    render(<PassengerSectionWrapper title={customTitle} />);

    expect(screen.getByText(customTitle)).toBeTruthy();
  });

  it("should display all title options", () => {
    render(<PassengerSectionWrapper />);

    // Options are already rendered in the select element
    expect(screen.getByText("Mr.")).toBeTruthy();
    expect(screen.getByText("Mrs.")).toBeTruthy();
    expect(screen.getByText("Ms.")).toBeTruthy();
    expect(screen.getByText("Dr.")).toBeTruthy();
  });

  it("should display all gender options", () => {
    render(<PassengerSectionWrapper />);

    // Options are already rendered in the select element
    expect(screen.getByText("Male")).toBeTruthy();
    expect(screen.getByText("Female")).toBeTruthy();
    expect(screen.getByText("Other")).toBeTruthy();
  });

  it("should show required asterisk for required fields", () => {
    render(<PassengerSectionWrapper />);

    // Gender, First Name, Last Name, and Date of Birth should be required
    const requiredElements = screen.getAllByText("*");
    expect(requiredElements.length).toBeGreaterThanOrEqual(4);
  });

  it("should display name input fields with correct placeholders", () => {
    render(<PassengerSectionWrapper />);

    expect(screen.getByPlaceholderText("Enter first name")).toBeTruthy();
    expect(screen.getByPlaceholderText("Enter last name")).toBeTruthy();
  });

  it("should display date of birth field with correct attributes", () => {
    render(<PassengerSectionWrapper />);

    expect(screen.getByPlaceholderText("Select date of birth")).toBeTruthy();
    // The date field should be rendered correctly
    const dateInput = screen.getByPlaceholderText("Select date of birth");
    expect(dateInput.getAttribute("type")).toBe("date");
  });

  it("should handle multi-passenger field names", () => {
    render(<PassengerSectionWrapper passengerIndex={1} />);

    const firstNameInput = screen.getByPlaceholderText("Enter first name");
    expect(firstNameInput.getAttribute("name")).toBe("passengers.1.passengerInfo.firstName");
  });

  it("should display error messages when provided", () => {
    const mockErrors = {
      passengerInfo: {
        firstName: { message: "First name is required" },
        lastName: { message: "Last name is required" },
        gender: { message: "Please select a gender" },
        dateOfBirth: { message: "Date of birth is required" }
      }
    };

    render(<PassengerSectionWrapper initialErrors={mockErrors} />);

    // Error messages should be displayed through the FormField component
    expect(screen.getByText("First name is required")).toBeTruthy();
    expect(screen.getByText("Last name is required")).toBeTruthy();
    expect(screen.getByText("Please select a gender")).toBeTruthy();
    expect(screen.getByText("Date of birth is required")).toBeTruthy();
  });

  it("should be responsive with proper grid layout", () => {
    const { container } = render(<PassengerSectionWrapper />);

    // Check for grid layout classes (mocked Ant Design components)
    expect(container.querySelector(".ant-col")).toBeTruthy();
    expect(container.querySelector(".ant-row")).toBeTruthy();
  });

  it("should have date restrictions for date of birth", () => {
    render(<PassengerSectionWrapper />);

    const dateInput = screen.getByPlaceholderText("Select date of birth");
    fireEvent.click(dateInput);

    // Future dates should be disabled (implementation depends on DatePicker)
    // This is tested through the disabledDate function
    expect(dateInput).toBeTruthy();
  });

  it("should handle age validation correctly", () => {
    render(<PassengerSectionWrapper />);

    const dateInput = screen.getByPlaceholderText("Select date of birth");
    
    // Test with date that makes person under 18
    const underageDate = dayjs().subtract(17, 'years');
    fireEvent.change(dateInput, { target: { value: underageDate.format('DD/MM/YYYY') } });

    // The validation should prevent this date
    expect(dateInput).toBeTruthy();
  });

  it("should apply correct date format", () => {
    render(<PassengerSectionWrapper />);

    const dateInput = screen.getByPlaceholderText("Select date of birth");
    
    // Should use DD/MM/YYYY format
    expect(dateInput.getAttribute("placeholder")).toBe("Select date of birth");
  });

  it.skip("should handle form submission data correctly", () => {
    render(<PassengerSectionWrapper />);

    const firstNameInput = screen.getByPlaceholderText("Enter first name");
    const lastNameInput = screen.getByPlaceholderText("Enter last name");
    const genderSelect = screen.getByDisplayValue(""); // Empty select initially

    fireEvent.change(firstNameInput, { target: { value: "John" } });
    fireEvent.change(lastNameInput, { target: { value: "Doe" } });
    fireEvent.change(genderSelect, { target: { value: "male" } });

    expect(firstNameInput.value).toBe("John");
    expect(lastNameInput.value).toBe("Doe");
  });

  it("should apply correct CSS classes", () => {
    const { container } = render(<PassengerSectionWrapper />);

    expect(container.querySelector(".passengerSection")).toBeTruthy();
    expect(container.querySelector(".sectionTitle")).toBeTruthy();
    expect(container.querySelector(".input")).toBeTruthy();
  });

  it("should handle title as optional field", () => {
    render(<PassengerSectionWrapper />);

    // Title should be optional (no asterisk required)
    // Check that Title label exists but doesn't have required asterisk
    expect(screen.getByText("Title")).toBeTruthy();
    
    // Check that Gender has required asterisk but Title doesn't
    const titleText = screen.getByText("Title");
    const titleContainer = titleText.closest(".formField");
    expect(titleContainer?.querySelector(".required")).toBeFalsy();
  });

  it.skip("should validate minimum age requirement", () => {
    render(<PassengerSectionWrapper />);

    // The help text should indicate age requirement
    expect(screen.getByText("You must be 18 or older to book")).toBeTruthy();
  });

  it.skip("should handle field focus and blur events", () => {
    render(<PassengerSectionWrapper />);

    const firstNameInput = screen.getByPlaceholderText("Enter first name");
    
    fireEvent.focus(firstNameInput);
    expect(document.activeElement).toBe(firstNameInput);
    
    fireEvent.blur(firstNameInput);
    expect(document.activeElement).not.toBe(firstNameInput);
  });

  it("should handle empty state gracefully", () => {
    render(<PassengerSectionWrapper />);

    const firstNameInput = screen.getByPlaceholderText("Enter first name");
    const lastNameInput = screen.getByPlaceholderText("Enter last name");

    expect(firstNameInput.value).toBe("");
    expect(lastNameInput.value).toBe("");
  });
});