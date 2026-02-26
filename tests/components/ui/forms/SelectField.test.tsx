import SelectField from "@/components/ui/forms/SelectField/SelectField";
import { render, screen, fireEvent } from "@testing-library/react";

describe("SelectField Component", () => {
  const mockOptions = [
    { value: "option1", label: "Option 1" },
    { value: "option2", label: "Option 2" },
    { value: "disabled-option", label: "Disabled Option", disabled: true }
  ];

  it("should render with basic props", () => {
    render(
      <SelectField options={mockOptions} />
    );

    const selectElement = screen.getByRole("combobox");
    expect(selectElement).toBeTruthy();
  });

  it("should display placeholder", () => {
    const placeholder = "Choose an option";
    
    render(
      <SelectField options={mockOptions} placeholder={placeholder} />
    );

    expect(screen.getByPlaceholderText(placeholder)).toBeTruthy();
  });

  it("should render all options when opened", () => {
    render(
      <SelectField options={mockOptions} />
    );

    const selectElement = screen.getByRole("combobox");
    fireEvent.click(selectElement);

    expect(screen.getByText("Option 1")).toBeTruthy();
    expect(screen.getByText("Option 2")).toBeTruthy();
    expect(screen.getByText("Disabled Option")).toBeTruthy();
  });

  it("should call onChange when option is selected", () => {
    const mockOnChange = jest.fn();
    
    render(
      <SelectField options={mockOptions} onChange={mockOnChange} />
    );

    const selectElement = screen.getByRole("combobox");
    fireEvent.click(selectElement);
    fireEvent.click(screen.getByText("Option 1"));

    expect(mockOnChange).toHaveBeenCalledWith("option1");
  });

  it("should be disabled when disabled prop is true", () => {
    render(
      <SelectField options={mockOptions} disabled={true} />
    );

    const selectElement = screen.getByRole("combobox");
    expect(selectElement).toHaveAttribute("disabled");
  });

  it("should apply custom className", () => {
    const customClass = "custom-select";
    
    const { container } = render(
      <SelectField options={mockOptions} className={customClass} />
    );

    expect(container.querySelector(`.${customClass}`)).toBeTruthy();
  });

  it("should handle different sizes", () => {
    const { rerender } = render(
      <SelectField options={mockOptions} size="small" />
    );

    let selectElement = screen.getByRole("combobox");
    expect(selectElement.closest(".ant-select-sm")).toBeTruthy();

    rerender(<SelectField options={mockOptions} size="large" />);
    selectElement = screen.getByRole("combobox");
    expect(selectElement.closest(".ant-select-lg")).toBeTruthy();
  });

  it("should show search functionality when showSearch is true", () => {
    render(
      <SelectField options={mockOptions} showSearch={true} />
    );

    const selectElement = screen.getByRole("combobox");
    fireEvent.click(selectElement);
    
    const searchInput = container.querySelector(".ant-select-selection-search-input");
    expect(searchInput).toBeTruthy();
  });

  it("should show clear button when allowClear is true and has value", () => {
    render(
      <SelectField 
        options={mockOptions} 
        allowClear={true} 
        value="option1" 
      />
    );

    const clearButton = container.querySelector(".ant-select-clear");
    expect(clearButton).toBeTruthy();
  });

  it("should handle numeric values", () => {
    const numericOptions = [
      { value: 1, label: "One" },
      { value: 2, label: "Two" }
    ];
    const mockOnChange = jest.fn();
    
    render(
      <SelectField options={numericOptions} onChange={mockOnChange} />
    );

    const selectElement = screen.getByRole("combobox");
    fireEvent.click(selectElement);
    fireEvent.click(screen.getByText("One"));

    expect(mockOnChange).toHaveBeenCalledWith(1);
  });

  it("should handle disabled options correctly", () => {
    render(
      <SelectField options={mockOptions} />
    );

    const selectElement = screen.getByRole("combobox");
    fireEvent.click(selectElement);

    const disabledOption = screen.getByText("Disabled Option");
    expect(disabledOption.closest(".ant-select-item-option-disabled")).toBeTruthy();
  });

  it("should filter options when custom filterOption is provided", () => {
    const customFilter = (input: string, option: any) => 
      option.children.toLowerCase().includes(input.toLowerCase());
    
    render(
      <SelectField 
        options={mockOptions} 
        showSearch={true}
        filterOption={customFilter}
      />
    );

    const selectElement = screen.getByRole("combobox");
    fireEvent.click(selectElement);
    
    const searchInput = container.querySelector(".ant-select-selection-search-input");
    fireEvent.change(searchInput, { target: { value: "Option 1" } });

    expect(screen.getByText("Option 1")).toBeTruthy();
    expect(screen.queryByText("Option 2")).toBeFalsy();
  });
});