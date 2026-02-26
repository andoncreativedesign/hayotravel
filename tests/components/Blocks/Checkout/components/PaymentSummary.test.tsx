import PaymentSummary from "@/components/Blocks/Checkout/components/PaymentSummary/PaymentSummary";
import { render, screen } from "@testing-library/react";
import { useItineraryStore, ItineraryType } from "@/store/itinerary/itinerary.store";

// Mock the itinerary store
jest.mock("@/store/itinerary/itinerary.store", () => ({
  useItineraryStore: jest.fn(),
  ItineraryType: {
    Flight: "flight",
    Hotel: "hotel"
  }
}));

const mockUseItineraryStore = useItineraryStore as jest.MockedFunction<typeof useItineraryStore>;

describe("PaymentSummary Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render with empty itinerary", () => {
    mockUseItineraryStore.mockReturnValue({
      itinerary: []
    });

    render(<PaymentSummary totalPassengers={1} />);

    expect(screen.getByText("Payment summary")).toBeTruthy();
    expect(screen.getByText("Total")).toBeTruthy();
  });

  it("should calculate and display flight costs using actual price field", () => {
    const mockItinerary = [
      {
        type: ItineraryType.Flight,
        price: "500.00",
        tax_amount: "50.00",
        tax_currency: "USD",
        data: { /* flight data */ }
      },
      {
        type: ItineraryType.Flight,
        price: "300.00",
        tax_amount: "30.00",
        tax_currency: "USD",
        data: { /* flight data */ }
      }
    ];

    mockUseItineraryStore.mockReturnValue({
      itinerary: mockItinerary
    });

    const { container } = render(<PaymentSummary totalPassengers={2} />);

    expect(screen.getByText("Round-trip flights")).toBeTruthy();
    const flightPriceElement = container.querySelector('.price');
    expect(flightPriceElement?.textContent).toContain("800.00");
    expect(screen.getByText("2 passengers")).toBeTruthy();
  });

  it("should calculate and display hotel costs with actual nights", () => {
    const mockItinerary = [
      {
        type: ItineraryType.Hotel,
        price: "200.00",
        tax_amount: "20.00",
        tax_currency: "USD",
        data: { nights: 2 }
      },
      {
        type: ItineraryType.Hotel,
        price: "150.00",
        tax_amount: "15.00",
        tax_currency: "USD",
        data: { nights: 1 }
      }
    ];

    mockUseItineraryStore.mockReturnValue({
      itinerary: mockItinerary
    });

    const { container } = render(<PaymentSummary totalPassengers={1} />);

    expect(screen.getByText("Hotel accommodation")).toBeTruthy();
    const hotelPriceElement = container.querySelector('.price');
    expect(hotelPriceElement?.textContent).toContain("350.00");
    expect(screen.getByText("3 nights")).toBeTruthy();
  });

  it("should display actual taxes and fees from API data", () => {
    const mockItinerary = [
      {
        type: ItineraryType.Flight,
        price: "1000.00",
        tax_amount: "87.50",
        tax_currency: "USD",
        data: { /* flight data */ }
      },
      {
        type: ItineraryType.Hotel,
        price: "500.00",
        tax_amount: "25.75",
        tax_currency: "USD",
        data: { nights: 2 }
      }
    ];

    mockUseItineraryStore.mockReturnValue({
      itinerary: mockItinerary
    });

    render(<PaymentSummary totalPassengers={1} />);

    expect(screen.getByText("Taxes & Fees")).toBeTruthy();
    expect(screen.getByText(/113.25/)).toBeTruthy();
    expect(screen.getByText("Hotel taxes, booking fees")).toBeTruthy();
  });

  it("should calculate grand total correctly using actual prices", () => {
    const mockItinerary = [
      {
        type: ItineraryType.Flight,
        price: "1000.00",
        tax_amount: "100.00",
        tax_currency: "USD",
        data: { /* flight data */ }
      },
      {
        type: ItineraryType.Hotel,
        price: "500.00",
        tax_amount: "50.00",
        tax_currency: "USD",
        data: { nights: 2 }
      }
    ];

    mockUseItineraryStore.mockReturnValue({
      itinerary: mockItinerary
    });

    render(<PaymentSummary totalPassengers={1} />);

    expect(screen.getByText(/1,500.00/)).toBeTruthy();
  });

  it("should handle missing prices gracefully", () => {
    const mockItinerary = [
      {
        type: ItineraryType.Flight,
        data: {} // No price
      },
      {
        type: ItineraryType.Hotel,
        data: { price: null } // Null price
      }
    ];

    mockUseItineraryStore.mockReturnValue({
      itinerary: mockItinerary
    });

    render(<PaymentSummary totalPassengers={1} />);

    // Should handle gracefully and calculate with 0 values
    expect(screen.getByText("Total")).toBeTruthy();
  });

  it("should display correct passenger count", () => {
    mockUseItineraryStore.mockReturnValue({
      itinerary: [
        {
          type: ItineraryType.Flight,
          data: { price: 500 }
        }
      ]
    });

    render(<PaymentSummary totalPassengers={3} />);

    expect(screen.getByText("3 passengers")).toBeTruthy();
  });

  it("should handle single passenger correctly", () => {
    mockUseItineraryStore.mockReturnValue({
      itinerary: [
        {
          type: ItineraryType.Flight,
          data: { price: 500 }
        }
      ]
    });

    render(<PaymentSummary totalPassengers={1} />);

    expect(screen.getByText("1 passenger")).toBeTruthy();
  });

  it("should not show flight section when no flights", () => {
    mockUseItineraryStore.mockReturnValue({
      itinerary: [
        {
          type: ItineraryType.Hotel,
          data: { price: 200 }
        }
      ]
    });

    render(<PaymentSummary totalPassengers={1} />);

    expect(screen.queryByText("Round-trip flights")).toBeFalsy();
    expect(screen.getByText("Hotel accommodation")).toBeTruthy();
  });

  it("should not show hotel section when no hotels", () => {
    mockUseItineraryStore.mockReturnValue({
      itinerary: [
        {
          type: ItineraryType.Flight,
          data: { price: 500 }
        }
      ]
    });

    render(<PaymentSummary totalPassengers={1} />);

    expect(screen.getByText("Round-trip flights")).toBeTruthy();
    expect(screen.queryByText("Hotel accommodation")).toBeFalsy();
  });

  it("should format large numbers with commas", () => {
    const mockItinerary = [
      {
        type: ItineraryType.Flight,
        price: "10000",
        tax_amount: "1500",
        tax_currency: "USD",
        data: { /* flight data */ }
      }
    ];

    mockUseItineraryStore.mockReturnValue({
      itinerary: mockItinerary
    });

    const { container } = render(<PaymentSummary totalPassengers={1} />);

    const flightPriceElement = container.querySelector('.price');
    expect(flightPriceElement?.textContent).toContain("10,000.00");
  });

  it.skip("should render card with correct styling", () => {
    mockUseItineraryStore.mockReturnValue({
      itinerary: []
    });

    const { container } = render(<PaymentSummary totalPassengers={1} />);

    const card = container.querySelector(".ant-card");
    expect(card).toBeTruthy();
    
    const cardHeader = container.querySelector(".ant-card-head");
    expect(cardHeader).toBeTruthy();
    
    const cardBody = container.querySelector(".ant-card-body");
    expect(cardBody).toBeTruthy();
  });

  it.skip("should show divider before total", () => {
    mockUseItineraryStore.mockReturnValue({
      itinerary: [
        {
          type: ItineraryType.Flight,
          price: "500.00"
        }
      ]
    });

    const { container } = render(<PaymentSummary totalPassengers={1} />);

    expect(container.querySelector(".ant-divider")).toBeTruthy();
  });

  it("should handle mixed itinerary with flights and hotels", () => {
    const mockItinerary = [
      {
        type: ItineraryType.Flight,
        price: "600",
        tax_amount: "60",
        tax_currency: "USD",
        data: {}
      },
      {
        type: ItineraryType.Hotel,
        price: "300",
        tax_amount: "30",
        tax_currency: "USD",
        data: { nights: 2 }
      },
      {
        type: ItineraryType.Flight,
        price: "400",
        tax_amount: "40",
        tax_currency: "USD",
        data: {}
      }
    ];

    mockUseItineraryStore.mockReturnValue({
      itinerary: mockItinerary
    });

    const { container } = render(<PaymentSummary totalPassengers={2} />);

    expect(screen.getByText("Round-trip flights")).toBeTruthy();
    expect(screen.getByText("Hotel accommodation")).toBeTruthy();
    
    const priceElements = container.querySelectorAll('.price');
    expect(priceElements[0]?.textContent).toContain("1,000.00"); // flight price
    expect(priceElements[1]?.textContent).toContain("300.00"); // hotel price
    
    expect(screen.getByText("2 passengers")).toBeTruthy();
  });

  it("should display currency correctly", () => {
    const mockItinerary = [
      {
        type: ItineraryType.Hotel,
        price: "261.38",
        tax_amount: "20.16",
        tax_currency: "EUR",
        data: { nights: 1 }
      }
    ];

    mockUseItineraryStore.mockReturnValue({
      itinerary: mockItinerary
    });

    const { container } = render(<PaymentSummary totalPassengers={1} />);

    const priceElements = container.querySelectorAll('.price');
    expect(priceElements[0]?.textContent).toContain("261.38"); // hotel price
    expect(priceElements[1]?.textContent).toContain("20.16"); // taxes
    
    const totalPriceElement = container.querySelector('.totalPrice');
    expect(totalPriceElement?.textContent).toContain("261.38");
  });

  it("should handle single vs plural nights correctly", () => {
    const mockItinerarySingle = [
      {
        type: ItineraryType.Hotel,
        price: "200.00",
        tax_amount: "20.00",
        tax_currency: "USD",
        data: { nights: 1 }
      }
    ];

    mockUseItineraryStore.mockReturnValue({
      itinerary: mockItinerarySingle
    });

    const { rerender, container } = render(<PaymentSummary totalPassengers={1} />);
    expect(screen.getByText("1 night")).toBeTruthy();
    
    let hotelPriceElement = container.querySelector('.price');
    expect(hotelPriceElement?.textContent).toContain("200.00");

    // Test multiple nights
    const mockItineraryMultiple = [
      {
        type: ItineraryType.Hotel,
        price: "400.00",
        tax_amount: "40.00",
        tax_currency: "USD",
        data: { nights: 3 }
      }
    ];

    mockUseItineraryStore.mockReturnValue({
      itinerary: mockItineraryMultiple
    });

    rerender(<PaymentSummary totalPassengers={1} />);
    expect(screen.getByText("3 nights")).toBeTruthy();
    
    hotelPriceElement = container.querySelector('.price');
    expect(hotelPriceElement?.textContent).toContain("400.00");
  });

  it("should handle single vs plural passengers correctly", () => {
    const mockItinerary = [
      {
        type: ItineraryType.Flight,
        price: "500.00",
        tax_amount: "50.00",
        tax_currency: "USD",
        data: { /* flight data */ }
      }
    ];

    mockUseItineraryStore.mockReturnValue({
      itinerary: mockItinerary
    });

    const { rerender, container } = render(<PaymentSummary totalPassengers={1} />);
    expect(screen.getByText("1 passenger")).toBeTruthy();
    
    let flightPriceElement = container.querySelector('.price');
    expect(flightPriceElement?.textContent).toContain("500.00");

    rerender(<PaymentSummary totalPassengers={3} />);
    expect(screen.getByText("3 passengers")).toBeTruthy();
    
    flightPriceElement = container.querySelector('.price');
    expect(flightPriceElement?.textContent).toContain("500.00");
  });

  it("should not show taxes section when no taxes", () => {
    const mockItinerary = [
      {
        type: ItineraryType.Hotel,
        price: "200.00",
        tax_amount: "0.00",
        tax_currency: "USD",
        data: { nights: 1 }
      }
    ];

    mockUseItineraryStore.mockReturnValue({
      itinerary: mockItinerary
    });

    const { container } = render(<PaymentSummary totalPassengers={1} />);

    expect(screen.queryByText("Taxes & Fees")).toBeFalsy();
    
    const hotelPriceElement = container.querySelector('.price');
    expect(hotelPriceElement?.textContent).toContain("200.00");
  });

  it("should handle missing tax_amount gracefully", () => {
    const mockItinerary = [
      {
        type: ItineraryType.Flight,
        price: "500.00",
        tax_currency: "USD",
        data: { /* flight data */ }
      }
    ];

    mockUseItineraryStore.mockReturnValue({
      itinerary: mockItinerary
    });

    render(<PaymentSummary totalPassengers={1} />);

    expect(screen.getAllByText(/500.00/).length).toBe(2);
  });

  it.skip("should default to USD when no currency specified", () => {
    const mockItinerary = [
      {
        type: ItineraryType.Hotel,
        price: "200.00",
        tax_amount: "20.00",
        data: { nights: 1 }
      }
    ];

    mockUseItineraryStore.mockReturnValue({
      itinerary: mockItinerary
    });

    render(<PaymentSummary totalPassengers={1} />);

    expect(screen.getByText(/180.00/)).toBeTruthy();
    expect(screen.getByText(/20.00/)).toBeTruthy();
    expect(screen.getByText(/220.00/)).toBeTruthy();
  });

  it.skip("should handle zero nights gracefully", () => {
    const mockItinerary = [
      {
        type: ItineraryType.Hotel,
        price: "200.00",
        tax_amount: "20.00",
        tax_currency: "USD",
        data: { nights: 0 }
      }
    ];

    mockUseItineraryStore.mockReturnValue({
      itinerary: mockItinerary
    });

    render(<PaymentSummary totalPassengers={1} />);

    expect(screen.getByText("0 nights")).toBeTruthy();
  });

  it("should format prices with two decimal places", () => {
    const mockItinerary = [
      {
        type: ItineraryType.Flight,
        price: "1234.5",
        tax_amount: "123.45",
        tax_currency: "USD",
        data: { /* flight data */ }
      }
    ];

    mockUseItineraryStore.mockReturnValue({
      itinerary: mockItinerary
    });

    const { container } = render(<PaymentSummary totalPassengers={1} />);

    const priceElements = container.querySelectorAll('.price');
    expect(priceElements[0]?.textContent).toContain("1,234.50"); // flight price
    expect(priceElements[1]?.textContent).toContain("123.45"); // taxes
    
    const totalPriceElement = container.querySelector('.totalPrice');
    expect(totalPriceElement?.textContent).toContain("1,234.50");
  });
});
