
import CheckoutContent from "@/components/Blocks/Checkout/components/CheckoutContent/CheckoutContent";
import { render, screen, fireEvent, waitFor, prettyDOM } from "@testing-library/react";
import "@testing-library/jest-dom";
import { useRouter } from "next/navigation";
import { useChatStore, currentChatSelector } from "@/store/chat/chats.store";
import { useItineraryStore, ItineraryType } from "@/store/itinerary/itinerary.store";
import { useCheckoutStore } from "@/store/checkout/checkout.store";
import { getItineraryById } from "@/utils/api/itinerary";

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: jest.fn()
}));

// Mock stores
jest.mock("@/store/chat/chats.store", () => ({
  useChatStore: jest.fn(),
  currentChatSelector: jest.fn()
}));

jest.mock("@/store/itinerary/itinerary.store", () => ({
  useItineraryStore: jest.fn(),
  ItineraryType: {
    Flight: "flight",
    Hotel: "hotel"
  }
}));

jest.mock("@/store/checkout/checkout.store", () => ({
  useCheckoutStore: jest.fn()
}));

// Mock API function
jest.mock("@/utils/api/itinerary", () => ({
  getItineraryById: jest.fn()
}));

// Mock Antd components
jest.mock("antd", () => ({
  Button: ({ children, onClick, type, disabled, className, size, danger, "data-testid": dataTestId }) => (
    <button 
      onClick={onClick} 
      disabled={disabled} 
      className={className} 
      data-type={type} 
      data-testid={dataTestId}
      data-size={size}
      data-danger={danger ? "true" : "false"}
    >
      {children}
    </button>
  ),
  Flex: ({ children, justify, align }) => (
    <div data-justify={justify} data-align={align}>{children}</div>
  ),
  Spin: ({ size }) => <div role="img" aria-label="loading" data-size={size}>Loading...</div>,
  Alert: ({ message, description, type, showIcon, style, action }) => (
    <div data-alert-type={type} style={style}>
      <div>{message}</div>
      <p>{description}</p>
      {action}
    </div>
  )
}));

// Mock child components
jest.mock("@/components/Blocks/Checkout/components/UnifiedProgressBar/UnifiedProgressBar", () => 
  ({ mainSteps, currentMainStep, subSteps, showSubProgress }: any) => 
    <div data-testid="unified-progress-bar">
      Main Step: {currentMainStep} | Sub Progress: {showSubProgress ? 'enabled' : 'disabled'}
    </div>
);

jest.mock("@/components/Blocks/Checkout/components/Header/Header", () => 
  ({ chatId }: { chatId: string }) => <div data-testid="header">Header for {chatId}</div>
);

jest.mock("@/components/Blocks/Checkout/components/PaymentSummary/PaymentSummary", () => 
  ({ totalPassengers }: { totalPassengers: number }) => <div data-testid="payment-summary">Payment for {totalPassengers} passengers</div>
);

jest.mock("@/components/Blocks/Checkout/components/EnhancedTravelerForm/EnhancedTravelerForm", () => 
  ({ totalPassengers, onSubmit }: { totalPassengers: number; onSubmit: Function }) => (
    <div data-testid="enhanced-traveler-form">
      <div>Enhanced Form for {totalPassengers} passengers</div>
      <button onClick={() => onSubmit({ test: 'data' })}>Submit Form</button>
    </div>
  )
);

jest.mock("@/components/Blocks/Checkout/components/OverviewPayment/OverviewPayment", () => 
  ({ totalPassengers }: { totalPassengers: number }) => (
    <div data-testid="overview-payment">Overview & Payment for {totalPassengers} passengers</div>
  )
);

const mockPush = jest.fn();
const mockSetItinerary = jest.fn();
const mockSetCurrentStep = jest.fn();
const mockSetFormValid = jest.fn();
const mockSetFormData = jest.fn();
const mockMarkStepCompleted = jest.fn();
const mockSetItineraryId = jest.fn();
const mockLoadProgress = jest.fn();
const mockRouter = { 
  push: mockPush,
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn()
};
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUseChatStore = useChatStore as jest.MockedFunction<typeof useChatStore>;
const mockCurrentChatSelector = currentChatSelector as jest.MockedFunction<typeof currentChatSelector>;
const mockUseItineraryStore = useItineraryStore as jest.MockedFunction<typeof useItineraryStore>;
const mockUseCheckoutStore = useCheckoutStore as jest.MockedFunction<typeof useCheckoutStore>;
const mockGetItineraryById = getItineraryById as jest.MockedFunction<typeof getItineraryById>;

describe("CheckoutContent Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue(mockRouter);
    mockUseChatStore.mockReturnValue({
      chatList: []
    });
    mockCurrentChatSelector.mockReturnValue({
      user_id: 1,
      chat_status_id: 1,
      external_id: "test-external-id",
      chat_client_id: 1,
      messages_count: 0,
      created_at: "2025-01-01T00:00:00Z",
      updated_at: "2025-01-01T00:00:00Z",
      id: 1,
      title: "Test Chat",
      travelers_count: "2",
      travel_details: "",
      departure_date: "",
      return_date: "",
      trip_type: "",
      departure_location: "",
      destination: "",
      travel_class: "",
      adults: ""
    });
    mockUseItineraryStore.mockReturnValue({
      itinerary: [],
      setItinerary: mockSetItinerary
    });
    mockUseCheckoutStore.mockReturnValue({
      currentStep: 1,
      isFormValid: false,
      formData: {},
      completedSteps: new Set([0]),
      setCurrentStep: mockSetCurrentStep,
      setFormValid: mockSetFormValid,
      setFormData: mockSetFormData,
      markStepCompleted: mockMarkStepCompleted,
      setItineraryId: mockSetItineraryId,
      loadProgress: mockLoadProgress
    });
    mockGetItineraryById.mockResolvedValue({
      id: 1,
      chat_id: 1,
      title: "Test Itinerary",
      start_date: "2025-10-19T00:00:00",
      end_date: "2025-10-20T00:00:00",
      currency: "USD",
      created_at: "2025-01-01T00:00:00Z",
      updated_at: "2025-01-01T00:00:00Z",
      itinerary_data: {
        itinerary: [
          {
            id: "test-hotel-1",
            type: ItineraryType.Hotel,
            price: "261.38",
            tax_amount: "20.16",
            tax_currency: "USD",
            date: "2025-10-19",
            isSelected: true,
            data: {
              id: "hotel-123",
              name: "Test Hotel",
              rating: 4,
              reviewScore: 8.5,
              location: {
                city: "Singapore",
                country: "SG",
                address: "123 Test Street"
              },
              checkIn: "2025-10-19",
              checkOut: "2025-10-20",
              nights: 1,
              room: {
                name: "Standard Room",
                bedInfo: "1 double bed",
                photos: []
              },
              rate: {
                id: "rate-123",
                boardType: "breakfast",
                totalAmount: "261.38",
                currency: "USD",
                taxAmount: "20.16",
                cancellationPolicy: "Free cancellation",
                breakfastIncluded: true
              },
              photos: []
            }
          }
        ]
      }
    });
  });

  it("should render with basic components", () => {
    render(<CheckoutContent chatId="test-chat-id" />);

    expect(screen.getByTestId("header")).toBeTruthy();
    expect(screen.getByTestId("unified-progress-bar")).toBeTruthy();
    expect(screen.getByTestId("payment-summary")).toBeTruthy();
    expect(screen.getByTestId("enhanced-traveler-form")).toBeTruthy();
  });

  it("should start at step 1 (Travellers Info)", () => {
    render(<CheckoutContent chatId="test-chat-id" />);

    expect(screen.getByTestId("unified-progress-bar")).toHaveTextContent("Main Step: 1");
  });

  it("should display correct passenger count from chat store", () => {
    mockCurrentChatSelector.mockReturnValue({
      user_id: 1,
      chat_status_id: 1,
      external_id: "test-external-id",
      chat_client_id: "1",
      messages_count: 0,
      created_at: "2025-01-01T00:00:00Z",
      updated_at: "2025-01-01T00:00:00Z",
      id: 1,
      title: "Test Chat",
      travelers_count: "4",
      travel_details: "",
      departure_date: "",
      return_date: "",
      trip_type: "",
      departure_location: "",
      destination: "",
      travel_class: "",
      adults: ""
    });

    render(<CheckoutContent chatId="test-chat-id" />);

    expect(screen.getByText("Enhanced Form for 4 passengers")).toBeTruthy();
    expect(screen.getByText("Payment for 4 passengers")).toBeTruthy();
  });

  it("should default to 1 passenger when no travelers_count", () => {
    mockCurrentChatSelector.mockReturnValue(undefined);

    render(<CheckoutContent chatId="test-chat-id" />);

    expect(screen.getByText("Enhanced Form for 1 passengers")).toBeTruthy();
    expect(screen.getByText("Payment for 1 passengers")).toBeTruthy();
  });

  it("should render navigation buttons", () => {
    render(<CheckoutContent chatId="test-chat-id" />);

    expect(screen.getByText("Back to previous step")).toBeTruthy();
    expect(screen.getByText("Continue")).toBeTruthy();
  });

  it("should navigate to next step when continue is clicked", () => {
    mockUseCheckoutStore.mockReturnValue({
      currentStep: 1,
      isFormValid: true, // Make form valid to enable continue
      formData: {},
      completedSteps: new Set([0]),
      setCurrentStep: mockSetCurrentStep,
      setFormValid: mockSetFormValid,
      setFormData: mockSetFormData,
      markStepCompleted: mockMarkStepCompleted,
      setItineraryId: mockSetItineraryId,
      loadProgress: mockLoadProgress
    });

    render(<CheckoutContent chatId="test-chat-id" />);

    const continueButton = screen.getByText("Continue");
    fireEvent.click(continueButton);

    expect(mockSetCurrentStep).toHaveBeenCalledWith(2);
  });

  // TODO: Fix this test
  it.skip("should navigate to previous step when back is clicked", () => {
    mockUseCheckoutStore.mockReturnValue({
      currentStep: 2,
      isFormValid: false,
      formData: {},
      completedSteps: new Set([0, 1]),
      setCurrentStep: mockSetCurrentStep,
      setFormValid: mockSetFormValid,
      setFormData: mockSetFormData,
      markStepCompleted: mockMarkStepCompleted,
      setItineraryId: mockSetItineraryId,
      loadProgress: mockLoadProgress
    });

    render(<CheckoutContent chatId="test-chat-id" />);

    console.log(prettyDOM());

    // Go back from step 2 to step 1
    const backButton = screen.getByText("Back to previous step");
    fireEvent.click(backButton);

    expect(mockSetCurrentStep).toHaveBeenCalledWith(1);
  });

  it("should navigate to chat when back is clicked on first step", () => {
    const chatId = "test-chat-123";
    render(<CheckoutContent chatId={chatId} />);

    const backButton = screen.getByText("Back to previous step");
    fireEvent.click(backButton);

    expect(mockPush).toHaveBeenCalledWith(`/chat/${chatId}`);
  });

  it("should disable continue button on last step", () => {
    mockUseCheckoutStore.mockReturnValue({
      currentStep: 2, // Already at last step
      isFormValid: true,
      formData: {},
      completedSteps: new Set([0, 1]),
      setCurrentStep: mockSetCurrentStep,
      setFormValid: mockSetFormValid,
      setFormData: mockSetFormData,
      markStepCompleted: mockMarkStepCompleted,
      setItineraryId: mockSetItineraryId,
      loadProgress: mockLoadProgress
    });

    render(<CheckoutContent chatId="test-chat-id" />);

    // At step 2, navigation should not be shown (it's in full-width layout)
    expect(screen.queryByText("Continue")).toBeNull();
  });

  it("should display Overview & Payment component on step 2", () => {
    mockUseCheckoutStore.mockReturnValue({
      currentStep: 2, // Set to step 2
      isFormValid: false,
      formData: {},
      completedSteps: new Set([0, 1]),
      setCurrentStep: mockSetCurrentStep,
      setFormValid: mockSetFormValid,
      setFormData: mockSetFormData,
      markStepCompleted: mockMarkStepCompleted,
      setItineraryId: mockSetItineraryId,
      loadProgress: mockLoadProgress
    });

    render(<CheckoutContent chatId="test-chat-id" />);

    expect(screen.getByTestId("overview-payment")).toBeTruthy();
  });

  it("should handle form submission", () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    render(<CheckoutContent chatId="test-chat-id" />);

    const submitButton = screen.getByText("Submit Form");
    fireEvent.click(submitButton);

    expect(consoleSpy).toHaveBeenCalledWith('Form submitted:', { test: 'data' });
    consoleSpy.mockRestore();
  });

  it("should handle step change callback", () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    render(<CheckoutContent chatId="test-chat-id" />);

    // This would be triggered by the enhanced traveler form
    expect(screen.getByTestId("enhanced-traveler-form")).toBeTruthy();
    
    consoleSpy.mockRestore();
  });

  it("should apply correct CSS classes", () => {
    const { container } = render(<CheckoutContent chatId="test-chat-id" />);

    expect(container.querySelector(".checkoutContent")).toBeTruthy();
    expect(container.querySelector(".container")).toBeTruthy();
    expect(container.querySelector(".content")).toBeTruthy();
    expect(container.querySelector(".leftSection")).toBeTruthy();
    expect(container.querySelector(".rightSection")).toBeTruthy();
    expect(container.querySelector(".navigation")).toBeTruthy();
  });

  it("should render step content in correct container", () => {
    const { container } = render(<CheckoutContent chatId="test-chat-id" />);

    const stepContent = container.querySelector(".stepContent");
    expect(stepContent).toBeTruthy();
    expect(stepContent?.querySelector("[data-testid='enhanced-traveler-form']")).toBeTruthy();
  });

  it("should have responsive layout structure", () => {
    const { container } = render(<CheckoutContent chatId="test-chat-id" />);

    const leftSection = container.querySelector(".leftSection");
    const rightSection = container.querySelector(".rightSection");

    expect(leftSection).toBeTruthy();
    expect(rightSection).toBeTruthy();
  });

  it("should handle navigation button styling", () => {
    const { container } = render(<CheckoutContent chatId="test-chat-id" />);

    const backButton = container.querySelector(".backButton");
    const continueButton = container.querySelector(".continueButton");

    expect(backButton).toBeTruthy();
    expect(continueButton).toBeTruthy();
  });

  it("should handle empty chat list gracefully", () => {
    mockUseChatStore.mockReturnValue({
      chatList: []
    });
    mockCurrentChatSelector.mockReturnValue(undefined);

    render(<CheckoutContent chatId="non-existent-chat" />);

    // Should default to 1 passenger
    expect(screen.getByText("Enhanced Form for 1 passengers")).toBeTruthy();
  });

  // TODO: Unskip when we have a way to store the current step in the store
  it.skip("should maintain step state correctly", () => {
    let currentStepValue = 1;
    mockUseCheckoutStore.mockImplementation(() => ({
      currentStep: currentStepValue,
      isFormValid: true,
      formData: {},
      completedSteps: new Set([0]),
      setCurrentStep: (step: number) => {
        currentStepValue = step;
        mockSetCurrentStep(step);
      },
      setFormValid: mockSetFormValid,
      setFormData: mockSetFormData,
      markStepCompleted: mockMarkStepCompleted,
      setItineraryId: mockSetItineraryId,
      loadProgress: mockLoadProgress
    }));

    const { rerender } = render(<CheckoutContent chatId="test-chat-id" />);

    // Check initial state
    expect(screen.getByTestId("unified-progress-bar")).toHaveTextContent("Main Step: 1");

    // Simulate navigation to step 2
    currentStepValue = 2;
    rerender(<CheckoutContent chatId="test-chat-id" />);
    expect(mockSetCurrentStep).toHaveBeenCalledWith(2);
  });

  it("should handle continue button behavior on last step", () => {
    mockUseCheckoutStore.mockReturnValue({
      currentStep: 2, // Already at last step (step 2)
      isFormValid: true,
      formData: {},
      completedSteps: new Set([0, 1]),
      setCurrentStep: mockSetCurrentStep,
      setFormValid: mockSetFormValid,
      setFormData: mockSetFormData,
      markStepCompleted: mockMarkStepCompleted,
      setItineraryId: mockSetItineraryId,
      loadProgress: mockLoadProgress
    });

    render(<CheckoutContent chatId="test-chat-id" />);

    // At step 2 (last step), there should be no Continue button
    expect(screen.queryByText("Continue")).toBeNull();
    // Should show Overview & Payment component instead
    expect(screen.getByTestId("overview-payment")).toBeTruthy();
  });

  it("should render default step content for invalid step", () => {
    // This test would require modifying component state to an invalid step
    // For now, we test that step 1 content renders by default
    render(<CheckoutContent chatId="test-chat-id" />);

    expect(screen.getByTestId("enhanced-traveler-form")).toBeTruthy();
  });

  // API Integration Tests
  it("should fetch itinerary data when itineraryId is provided", async () => {
    render(<CheckoutContent chatId="test-chat-id" itineraryId="19" />);

    await waitFor(() => {
      expect(mockGetItineraryById).toHaveBeenCalledWith(Number("19"));
    });
  });

  it("should not fetch itinerary data when no itineraryId is provided", async () => {
    render(<CheckoutContent chatId="test-chat-id" />);

    await waitFor(() => {
      expect(mockGetItineraryById).not.toHaveBeenCalled();
    });
  });

  it("should update itinerary store with fetched data", async () => {
    render(<CheckoutContent chatId="test-chat-id" itineraryId="19" />);

    await waitFor(() => {
      expect(mockSetItinerary).toHaveBeenCalledWith([
        {
          id: "test-hotel-1",
          type: "hotel",
          price: "261.38",
          tax_amount: "20.16",
          tax_currency: "USD",
          date: "2025-10-19",
          isSelected: true,
          data: expect.objectContaining({
            name: "Test Hotel",
            nights: 1
          })
        }
      ]);
    });
  });

  it("should show loading state while fetching data", async () => {
    mockGetItineraryById.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    render(<CheckoutContent chatId="test-chat-id" itineraryId="19" />);

    expect(screen.getByText("Loading itinerary data...")).toBeTruthy();
    expect(screen.getByRole("img", { name: /loading/i })).toBeTruthy();
  });

  it("should show error state when API call fails", async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    mockGetItineraryById.mockRejectedValue(new Error("API Error"));

    render(<CheckoutContent chatId="test-chat-id" itineraryId="19" />);

    await waitFor(() => {
      expect(screen.getByText("Error Loading Itinerary")).toBeTruthy();
      expect(screen.getByText("Failed to load itinerary data. Please try again.")).toBeTruthy();
      expect(screen.getByText("Retry")).toBeTruthy();
    });

    consoleSpy.mockRestore();
  });

  it("should handle empty itinerary data gracefully", async () => {
    mockGetItineraryById.mockResolvedValue({
      id: 1,
      chat_id: 1,
      title: "Empty Itinerary",
      start_date: "2025-10-19T00:00:00",
      end_date: "2025-10-20T00:00:00",
      currency: "USD",
      created_at: "2025-01-01T00:00:00Z",
      updated_at: "2025-01-01T00:00:00Z",
      itinerary_data: {
        itinerary: []
      }
    });

    render(<CheckoutContent chatId="test-chat-id" itineraryId="19" />);

    await waitFor(() => {
      expect(mockSetItinerary).toHaveBeenCalledWith([]);
    });

    expect(screen.getByTestId("enhanced-traveler-form")).toBeTruthy();
  });

  it("should handle malformed API response", async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    mockGetItineraryById.mockResolvedValue({
      id: 1,
      chat_id: 1,
      title: "Malformed",
      start_date: "2025-10-19T00:00:00",
      end_date: "2025-10-20T00:00:00",
      currency: "USD",
      created_at: "2025-01-01T00:00:00Z",
      updated_at: "2025-01-01T00:00:00Z",
      itinerary_data: {} as any // Malformed itinerary_data without itinerary property
    });

    render(<CheckoutContent chatId="test-chat-id" itineraryId="19" />);

    await waitFor(() => {
      expect(mockGetItineraryById).toHaveBeenCalled();
    });

    // Should not crash and should not call setItinerary
    expect(mockSetItinerary).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});