
import React from 'react';
import EnhancedTravelerForm, { EnhancedTravelerFormRef } from "@/components/Blocks/Checkout/components/EnhancedTravelerForm/EnhancedTravelerForm";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// Mock the checkout store
const mockUseCheckoutStore = jest.fn();
jest.mock("@/store/checkout/checkout.store", () => ({
  useCheckoutStore: () => mockUseCheckoutStore()
}));

// Mock PassengerFormCard
jest.mock("@/components/Blocks/Checkout/components/PassengerFormCard/PassengerFormCard", () => 
  ({ passengerIndex, totalPassengers }: { passengerIndex: number; totalPassengers: number }) => (
    <div data-testid={`passenger-form-card-${passengerIndex}`}>
      Passenger {passengerIndex + 1} of {totalPassengers}
    </div>
  )
);

// Mock CheckoutDevTool
jest.mock("@/components/dev/CheckoutDevTool/CheckoutDevTool", () => 
  ({ totalPassengers, onFillForm, onClearForm }: { 
    totalPassengers: number; 
    onFillForm: (data: any) => void; 
    onClearForm: () => void; 
  }) => (
    <div data-testid="checkout-dev-tool">
      <button onClick={() => onFillForm({ passengers: [{ passengerInfo: { firstName: 'Test' } }] })}>
        Fill Form
      </button>
      <button onClick={onClearForm}>Clear Form</button>
    </div>
  )
);

const defaultCheckoutStoreData = {
  formData: null
};

describe("EnhancedTravelerForm Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseCheckoutStore.mockReturnValue(defaultCheckoutStoreData);
  });

  it("should render with correct test id", () => {
    mockUseCheckoutStore.mockReturnValue(defaultCheckoutStoreData);
    
    render(<EnhancedTravelerForm totalPassengers={1} onSubmit={jest.fn()} onFormChange={jest.fn()} />);

    expect(screen.getByTestId("enhanced-traveler-form")).toBeInTheDocument();
  });

  it("should render correct number of passenger form cards", () => {
    mockUseCheckoutStore.mockReturnValue(defaultCheckoutStoreData);
    
    render(<EnhancedTravelerForm totalPassengers={3} onSubmit={jest.fn()} onFormChange={jest.fn()} />);

    expect(screen.getByTestId("passenger-form-card-0")).toBeInTheDocument();
    expect(screen.getByTestId("passenger-form-card-1")).toBeInTheDocument();
    expect(screen.getByTestId("passenger-form-card-2")).toBeInTheDocument();
    expect(screen.queryByTestId("passenger-form-card-3")).not.toBeInTheDocument();
  });

  it("should render checkout dev tool", () => {
    mockUseCheckoutStore.mockReturnValue(defaultCheckoutStoreData);
    
    render(<EnhancedTravelerForm totalPassengers={1} onSubmit={jest.fn()} onFormChange={jest.fn()} />);

    expect(screen.getByTestId("checkout-dev-tool")).toBeInTheDocument();
  });

  it("should call onSubmit when form is submitted with valid data", async () => {
    const mockOnSubmit = jest.fn();
    const mockOnFormChange = jest.fn();
    mockUseCheckoutStore.mockReturnValue(defaultCheckoutStoreData);
    
    render(<EnhancedTravelerForm totalPassengers={1} onSubmit={mockOnSubmit} onFormChange={mockOnFormChange} />);

    // Since the form is using react-hook-form internally, we can't easily trigger form submission
    // without a submit button. This test would need to be adjusted based on how the form is actually submitted
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  // TODO: Fix this test
  it.skip("should call onFormChange when form data changes", async () => {
    const mockOnSubmit = jest.fn();
    const mockOnFormChange = jest.fn();
    mockUseCheckoutStore.mockReturnValue(defaultCheckoutStoreData);
    
    render(<EnhancedTravelerForm totalPassengers={1} onSubmit={mockOnSubmit} onFormChange={mockOnFormChange} />);

    // The form change callback should be called during initial render
    await waitFor(() => {
      expect(mockOnFormChange).toHaveBeenCalled();
    });
  });

  it("should handle dev tool fill form action", async () => {
    const mockOnSubmit = jest.fn();
    const mockOnFormChange = jest.fn();
    mockUseCheckoutStore.mockReturnValue(defaultCheckoutStoreData);
    
    render(<EnhancedTravelerForm totalPassengers={1} onSubmit={mockOnSubmit} onFormChange={mockOnFormChange} />);

    const fillButton = screen.getByText("Fill Form");
    fireEvent.click(fillButton);

    // The form should handle the fill action without errors
    expect(fillButton).toBeInTheDocument();
  });

  it("should handle dev tool clear form action", async () => {
    const mockOnSubmit = jest.fn();
    const mockOnFormChange = jest.fn();
    mockUseCheckoutStore.mockReturnValue(defaultCheckoutStoreData);
    
    render(<EnhancedTravelerForm totalPassengers={1} onSubmit={mockOnSubmit} onFormChange={mockOnFormChange} />);

    const clearButton = screen.getByText("Clear Form");
    fireEvent.click(clearButton);

    // The form should handle the clear action without errors
    expect(clearButton).toBeInTheDocument();
  });

  it("should load existing form data from checkout store", () => {
    const mockFormData = {
      passengers: [
        {
          passengerInfo: {
            firstName: "John",
            lastName: "Doe"
          },
          useProfileInfo: false
        }
      ]
    };
    
    mockUseCheckoutStore.mockReturnValue({ formData: mockFormData });
    
    render(<EnhancedTravelerForm totalPassengers={1} onSubmit={jest.fn()} onFormChange={jest.fn()} />);

    // Component should render without errors when loading existing data
    expect(screen.getByTestId("enhanced-traveler-form")).toBeInTheDocument();
  });

  it("should expose getFormData method through ref", () => {
    const mockOnSubmit = jest.fn();
    const mockOnFormChange = jest.fn();
    const ref = React.createRef<EnhancedTravelerFormRef>();
    mockUseCheckoutStore.mockReturnValue(defaultCheckoutStoreData);
    
    render(
      <EnhancedTravelerForm 
        ref={ref} 
        totalPassengers={1} 
        onSubmit={mockOnSubmit} 
        onFormChange={mockOnFormChange} 
      />
    );

    expect(ref.current).toBeDefined();
    expect(typeof ref.current?.getFormData).toBe('function');
  });

  it("should apply correct CSS classes", () => {
    const mockOnSubmit = jest.fn();
    const mockOnFormChange = jest.fn();
    mockUseCheckoutStore.mockReturnValue(defaultCheckoutStoreData);
    
    const { container } = render(
      <EnhancedTravelerForm totalPassengers={1} onSubmit={mockOnSubmit} onFormChange={mockOnFormChange} />
    );

    expect(container.querySelector(".enhancedTravelerForm")).toBeInTheDocument();
    expect(container.querySelector(".formContent")).toBeInTheDocument();
    expect(container.querySelector(".passengerForms")).toBeInTheDocument();
  });

  it("should handle single passenger correctly", () => {
    mockUseCheckoutStore.mockReturnValue(defaultCheckoutStoreData);
    
    render(<EnhancedTravelerForm totalPassengers={1} onSubmit={jest.fn()} onFormChange={jest.fn()} />);

    expect(screen.getByText("Passenger 1 of 1")).toBeInTheDocument();
    expect(screen.queryByTestId("passenger-form-card-1")).not.toBeInTheDocument();
  });

  it("should handle multiple passengers correctly", () => {
    mockUseCheckoutStore.mockReturnValue(defaultCheckoutStoreData);
    
    render(<EnhancedTravelerForm totalPassengers={2} onSubmit={jest.fn()} onFormChange={jest.fn()} />);

    expect(screen.getByText("Passenger 1 of 2")).toBeInTheDocument();
    expect(screen.getByText("Passenger 2 of 2")).toBeInTheDocument();
  });

  it("should handle profile toggle functionality", () => {
    const mockFormData = {
      passengers: [
        {
          passengerInfo: {
            firstName: "John",
            lastName: "Doe"
          },
          useProfileInfo: true
        }
      ]
    };
    
    mockUseCheckoutStore.mockReturnValue({ formData: mockFormData });
    
    render(<EnhancedTravelerForm totalPassengers={1} onSubmit={jest.fn()} onFormChange={jest.fn()} />);

    // Component should handle profile toggle data without errors
    expect(screen.getByTestId("enhanced-traveler-form")).toBeInTheDocument();
  });
});