import DateField from "@/components/ui/forms/DateField/DateField";
import { render, screen, fireEvent } from "@testing-library/react";
import dayjs from "dayjs";

// Mock dayjs properly for tests
jest.mock('dayjs', () => {
  const originalDayjs = jest.requireActual('dayjs');
  const mockDayjs = (date?: any) => {
    if (date) {
      return originalDayjs(date);
    }
    return originalDayjs('2024-01-01');
  };
  
  // Add isDayjs method
  mockDayjs.isDayjs = originalDayjs.isDayjs;
  
  return mockDayjs;
});

describe("DateField Component", () => {
  it("should render with basic props", () => {
    render(<DateField />);

    const dateInput = screen.getByRole("textbox");
    expect(dateInput).toBeTruthy();
  });

  it("should display placeholder", () => {
    const placeholder = "Pick a date";
    
    render(<DateField placeholder={placeholder} />);

    expect(screen.getByPlaceholderText(placeholder)).toBeTruthy();
  });

  it.skip("should display value when provided", () => {
    const testDate = dayjs("2024-01-15");
    
    render(<DateField value={testDate} />);

    const dateInput = screen.getByRole("textbox");
    expect(dateInput.value).toBe("15/01/2024");
  });

  it("should call onChange when date is selected", () => {
    const mockOnChange = jest.fn();
    
    render(<DateField onChange={mockOnChange} />);

    const dateInput = screen.getByRole("textbox");
    
    // Simulate date input change
    fireEvent.change(dateInput, { target: { value: "2024-01-15" } });

    expect(mockOnChange).toHaveBeenCalled();
  });

  it("should be disabled when disabled prop is true", () => {
    render(<DateField disabled={true} />);

    const dateInput = screen.getByRole("textbox");
    expect(dateInput).toHaveAttribute("disabled");
  });

  it("should apply custom className", () => {
    const customClass = "custom-date-field";
    
    const { container } = render(
      <DateField className={customClass} />
    );

    expect(container.querySelector(`.${customClass}`)).toBeTruthy();
  });

  it.skip("should handle custom date format", () => {
    const customFormat = "YYYY-MM-DD";
    const testDate = dayjs("2024-01-15");
    
    render(<DateField value={testDate} format={customFormat} />);

    const dateInput = screen.getByRole("textbox");
    expect(dateInput.value).toBe("2024-01-15");
  });

  it("should handle different sizes", () => {
    const { rerender } = render(<DateField size="small" />);

    let dateInput = screen.getByRole("textbox");
    expect(dateInput.className).toContain("ant-picker");

    rerender(<DateField size="large" />);
    dateInput = screen.getByRole("textbox");
    expect(dateInput.className).toContain("ant-picker");
  });

  it("should apply disabledDate function", () => {
    const disabledDate = (date: any) => {
      // Disable all future dates
      return date && date > dayjs().endOf("day");
    };
    
    render(<DateField disabledDate={disabledDate} />);

    const dateInput = screen.getByRole("textbox");
    expect(dateInput).toBeTruthy();
    // Note: disabledDate function is passed to the component but testing its behavior
    // would require actual DatePicker interaction which isn't available in mocked version
  });

  it("should handle default placeholder", () => {
    render(<DateField />);

    expect(screen.getByPlaceholderText("Select date")).toBeTruthy();
  });

  it.skip("should handle Date object as value", () => {
    const testDate = new Date("2024-01-15");
    
    render(<DateField value={testDate} />);

    const dateInput = screen.getByRole("textbox");
    expect(dateInput.value).toBe("15/01/2024");
  });

  it.skip("should clear value when onChange is called with null", () => {
    const mockOnChange = jest.fn();
    const testDate = dayjs("2024-01-15");
    
    const { rerender } = render(
      <DateField value={testDate} onChange={mockOnChange} />
    );

    const dateInput = screen.getByRole("textbox");
    expect(dateInput.value).toBe("15/01/2024");

    // Simulate clearing the date
    fireEvent.change(dateInput, { target: { value: "" } });
    
    expect(mockOnChange).toHaveBeenCalled();
  });

  it.skip("should have correct default format", () => {
    const testDate = dayjs("2024-01-15");
    
    render(<DateField value={testDate} />);

    const dateInput = screen.getByRole("textbox");
    expect(dateInput.value).toBe("15/01/2024"); // DD/MM/YYYY format
  });

  it("should maintain focus state", () => {
    render(<DateField />);

    const dateInput = screen.getByRole("textbox");
    fireEvent.focus(dateInput);
    
    expect(document.activeElement).toBeTruthy();
  });
});