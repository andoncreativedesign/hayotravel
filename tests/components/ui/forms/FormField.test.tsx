import FormField from "@/components/ui/forms/FormField/FormField";
import { render, screen } from "@testing-library/react";
import { ReactNode } from "react";

describe("FormField Component", () => {
  const mockFieldName = "test-field";
  const mockChildren: ReactNode = <input data-testid="test-input" />;

  it("should render with basic props", () => {
    const { container } = render(
      <FormField name={mockFieldName}>
        {mockChildren}
      </FormField>
    );

    expect(container.querySelector('[class*="formField"]')).toBeTruthy();
    expect(screen.getByTestId("test-input")).toBeTruthy();
  });

  it("should render label when provided", () => {
    const testLabel = "Test Label";
    
    render(
      <FormField name={mockFieldName} label={testLabel}>
        {mockChildren}
      </FormField>
    );

    expect(screen.getByText(testLabel)).toBeTruthy();
  });

  it("should show required asterisk when required is true", () => {
    const testLabel = "Required Field";
    
    render(
      <FormField name={mockFieldName} label={testLabel} required={true}>
        {mockChildren}
      </FormField>
    );

    expect(screen.getByText("*")).toBeTruthy();
  });

  it("should not show required asterisk when required is false", () => {
    const testLabel = "Optional Field";
    
    const { container } = render(
      <FormField name={mockFieldName} label={testLabel} required={false}>
        {mockChildren}
      </FormField>
    );

    expect(container.querySelector('[class*="required"]')).toBeFalsy();
  });

  it("should display error message when error prop is provided", () => {
    const errorMessage = "This field is required";
    
    render(
      <FormField name={mockFieldName} error={errorMessage}>
        {mockChildren}
      </FormField>
    );

    expect(screen.getByText(errorMessage)).toBeTruthy();
  });

  it("should display help text when provided and no error", () => {
    const helpText = "This is helpful information";
    
    render(
      <FormField name={mockFieldName} helpText={helpText}>
        {mockChildren}
      </FormField>
    );

    expect(screen.getByText(helpText)).toBeTruthy();
  });

  it("should prioritize error message over help text", () => {
    const errorMessage = "Error occurred";
    const helpText = "This is helpful information";
    
    render(
      <FormField name={mockFieldName} error={errorMessage} helpText={helpText}>
        {mockChildren}
      </FormField>
    );

    expect(screen.getByText(errorMessage)).toBeTruthy();
    expect(screen.queryByText(helpText)).toBeFalsy();
  });

  it("should apply custom className", () => {
    const customClass = "custom-form-field";
    
    const { container } = render(
      <FormField name={mockFieldName} className={customClass}>
        {mockChildren}
      </FormField>
    );

    expect(container.querySelector(`.${customClass}`)).toBeTruthy();
  });

  it("should render children in input wrapper", () => {
    const { container } = render(
      <FormField name={mockFieldName}>
        <div data-testid="custom-child">Custom Input</div>
      </FormField>
    );

    const inputWrapper = container.querySelector('[class*="inputWrapper"]');
    expect(inputWrapper).toBeTruthy();
    expect(screen.getByTestId("custom-child")).toBeTruthy();
  });
});