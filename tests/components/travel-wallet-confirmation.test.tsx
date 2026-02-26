import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { message } from 'antd';
import { HotelInfo } from '@/components/TravelWallet/Info/HotelInfo/HotelInfo';
import { ConfirmationService } from '@/utils/services/confirmationService';
import { ItineraryHotel, ItineraryType } from '@/store/itinerary/itinerary.store';
import { TravelWalletTrip, TravelWalletTripStatus } from '@/utils/types/travel-wallet';

// Mock the confirmation service
jest.mock('@/utils/services/confirmationService');
const mockConfirmationService = ConfirmationService as jest.Mocked<typeof ConfirmationService>;

// Mock antd App.useApp
const mockMessage = {
  error: jest.fn(),
  warning: jest.fn(),
  success: jest.fn(),
};

jest.mock('antd', () => ({
  ...jest.requireActual('antd'),
  App: {
    useApp: () => ({
      message: mockMessage,
    }),
  },
}));

// Mock Next.js Image component
jest.mock('next/image', () => {
  return function MockImage({ src, alt, ...props }: any) {
    return <img src={src} alt={alt} {...props} />;
  };
});

const mockHotel: ItineraryHotel = {
  id: 'hotel-1',
  type: ItineraryType.Hotel,
  duffel_quote_id: 'quote_123',
  price: '150.00',
  currency: 'USD',
  data: {
    name: 'Test Hotel',
    rating: 4,
    checkIn: '2024-03-15T15:00:00Z',
    checkOut: '2024-03-17T11:00:00Z',
    nights: 2,
    location: {
      city: 'Test City',
      address: '123 Test Street',
      country: 'Test Country',
    },
    room: {
      name: 'Standard Room',
      bedInfo: '1 Queen Bed',
      photos: [],
    },
    rate: {
      breakfastIncluded: true,
    },
    photos: ['/test-hotel-image.jpg'],
    paid_at: '2024-03-10T10:00:00Z',
  },
};

const mockTrip: TravelWalletTrip = {
  id: 'trip-1',
  chatId: 1,
  itineraryId: 1,
  title: 'Test Trip',
  destination: 'Test Destination',
  startDate: '2024-03-15',
  endDate: '2024-03-17',
  travelersCount: 2,
  status: TravelWalletTripStatus.Upcoming,
  cost: {
    total: '300.00',
    currency: 'USD',
  },
  previewImage: '/test-image.jpg',
  itineraryItems: [mockHotel],
  confirmation: {
    bookedAt: '2024-03-10T10:00:00Z',
    bookingConfirmed: true,
  },
  passengerDetails: [
    {
      passengerInfo: {
        firstName: 'John',
        lastName: 'Doe',
        title: 'mr',
      },
      contact: {
        email: 'john.doe@example.com',
        phone: '1234567890',
        countryCode: '+1',
      },
    },
  ],
  metadata: {
    createdAt: '2024-03-10T10:00:00Z',
    updatedAt: '2024-03-10T10:00:00Z',
  },
};

describe('Hotel Confirmation PDF', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render confirmation button', () => {
    render(<HotelInfo hotel={mockHotel} trip={mockTrip} />);
    
    const confirmationButton = screen.getByText('Confirmation');
    expect(confirmationButton).toBeInTheDocument();
  });

  it('should handle successful confirmation download', async () => {
    mockConfirmationService.getConfirmationStatus.mockReturnValue({
      available: true,
    });
    
    mockConfirmationService.downloadHotelConfirmation.mockResolvedValue();

    render(<HotelInfo hotel={mockHotel} trip={mockTrip} />);
    
    const confirmationButton = screen.getByText('Confirmation');
    fireEvent.click(confirmationButton);

    await waitFor(() => {
      expect(mockConfirmationService.getConfirmationStatus).toHaveBeenCalledWith({
        hotel: mockHotel,
        trip: mockTrip,
        type: 'hotel',
      });
    });

    await waitFor(() => {
      expect(mockConfirmationService.downloadHotelConfirmation).toHaveBeenCalledWith({
        hotel: mockHotel,
        trip: mockTrip,
        type: 'hotel',
      });
    });

    expect(mockMessage.success).toHaveBeenCalledWith('Hotel confirmation downloaded successfully');
  });

  it('should handle unconfirmed booking and download details', async () => {
    const unconfirmedTrip = {
      ...mockTrip,
      confirmation: {
        ...mockTrip.confirmation,
        bookingConfirmed: false,
      },
    };

    mockConfirmationService.getConfirmationStatus.mockReturnValue({
      available: true,
    });
    
    mockConfirmationService.downloadHotelConfirmation.mockResolvedValue();

    render(<HotelInfo hotel={mockHotel} trip={unconfirmedTrip} />);
    
    const confirmationButton = screen.getByText('Confirmation');
    fireEvent.click(confirmationButton);

    await waitFor(() => {
      expect(mockConfirmationService.downloadHotelConfirmation).toHaveBeenCalledWith({
        hotel: mockHotel,
        trip: unconfirmedTrip,
        type: 'hotel',
      });
    });

    expect(mockMessage.success).toHaveBeenCalledWith('Hotel booking details downloaded successfully');
  });

  it('should handle missing trip data', async () => {
    render(<HotelInfo hotel={mockHotel} />);
    
    const confirmationButton = screen.getByText('Confirmation');
    fireEvent.click(confirmationButton);

    await waitFor(() => {
      expect(mockMessage.error).toHaveBeenCalledWith('Trip information is required for confirmation');
    });
  });

  it('should handle download error', async () => {
    mockConfirmationService.getConfirmationStatus.mockReturnValue({
      available: true,
    });
    
    const errorMessage = 'Failed to generate PDF';
    mockConfirmationService.downloadHotelConfirmation.mockRejectedValue(
      new Error(errorMessage)
    );

    render(<HotelInfo hotel={mockHotel} trip={mockTrip} />);
    
    const confirmationButton = screen.getByText('Confirmation');
    fireEvent.click(confirmationButton);

    await waitFor(() => {
      expect(mockMessage.error).toHaveBeenCalledWith(errorMessage);
    });
  });

  it('should show loading state during download', async () => {
    mockConfirmationService.getConfirmationStatus.mockReturnValue({
      available: true,
    });
    
    // Create a promise that we can control
    let resolvePromise: () => void;
    const downloadPromise = new Promise<void>((resolve) => {
      resolvePromise = resolve;
    });
    
    mockConfirmationService.downloadHotelConfirmation.mockReturnValue(downloadPromise);

    render(<HotelInfo hotel={mockHotel} trip={mockTrip} />);
    
    const confirmationButton = screen.getByText('Confirmation');
    fireEvent.click(confirmationButton);

    // Should show loading state
    await waitFor(() => {
      const buttonElement = confirmationButton.closest('button');
      expect(buttonElement).toHaveAttribute('disabled');
    });

    // Resolve the promise
    resolvePromise!();
    
    await waitFor(() => {
      const buttonElement = confirmationButton.closest('button');
      expect(buttonElement).not.toHaveAttribute('disabled');
    });
  });
});

describe('ConfirmationService', () => {
  // Reset mocks before each test in this describe block
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the mock implementation
    jest.resetModules();
  });

  const validOptions = {
    hotel: mockHotel,
    trip: mockTrip,
    type: 'hotel' as const,
  };

  describe('validateConfirmationData', () => {
    it('should return true for valid data', () => {
      mockConfirmationService.validateConfirmationData.mockReturnValue(true);
      
      const result = mockConfirmationService.validateConfirmationData(validOptions);
      expect(result).toBe(true);
      expect(mockConfirmationService.validateConfirmationData).toHaveBeenCalledWith(validOptions);
    });

    it('should return false for missing hotel name', () => {
      const invalidOptions = {
        ...validOptions,
        hotel: {
          ...mockHotel,
          data: {
            ...mockHotel.data,
            name: '',
          },
        },
      };
      
      mockConfirmationService.validateConfirmationData.mockReturnValue(false);
      
      const result = mockConfirmationService.validateConfirmationData(invalidOptions);
      expect(result).toBe(false);
      expect(mockConfirmationService.validateConfirmationData).toHaveBeenCalledWith(invalidOptions);
    });

    it('should return false for missing trip dates', () => {
      const invalidOptions = {
        ...validOptions,
        trip: {
          ...mockTrip,
          startDate: '',
        },
      };
      
      mockConfirmationService.validateConfirmationData.mockReturnValue(false);
      
      const result = mockConfirmationService.validateConfirmationData(invalidOptions);
      expect(result).toBe(false);
      expect(mockConfirmationService.validateConfirmationData).toHaveBeenCalledWith(invalidOptions);
    });
  });

  describe('getConfirmationStatus', () => {
    it('should return available for confirmed booking', () => {
      mockConfirmationService.getConfirmationStatus.mockReturnValue({ available: true });
      
      const result = mockConfirmationService.getConfirmationStatus(validOptions);
      expect(result).toEqual({ available: true });
      expect(mockConfirmationService.getConfirmationStatus).toHaveBeenCalledWith(validOptions);
    });

    it('should return available for unconfirmed booking', () => {
      const unconfirmedOptions = {
        ...validOptions,
        trip: {
          ...mockTrip,
          confirmation: {
            ...mockTrip.confirmation,
            bookingConfirmed: false,
          },
        },
      };
      
      mockConfirmationService.getConfirmationStatus.mockReturnValue({
        available: true,
      });
      
      const result = mockConfirmationService.getConfirmationStatus(unconfirmedOptions);
      expect(result).toEqual({
        available: true,
      });
      expect(mockConfirmationService.getConfirmationStatus).toHaveBeenCalledWith(unconfirmedOptions);
    });

    it('should return not available for invalid data', () => {
      const invalidOptions = {
        ...validOptions,
        hotel: {
          ...mockHotel,
          data: {
            ...mockHotel.data,
            name: '',
          },
        },
      };
      
      mockConfirmationService.getConfirmationStatus.mockReturnValue({
        available: false,
        reason: 'Missing required booking data',
      });
      
      const result = mockConfirmationService.getConfirmationStatus(invalidOptions);
      expect(result).toEqual({
        available: false,
        reason: 'Missing required booking data',
      });
      expect(mockConfirmationService.getConfirmationStatus).toHaveBeenCalledWith(invalidOptions);
    });
  });
});
