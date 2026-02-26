import { FastApiClient } from '@/lib/fastapi-client';
import { useAuthStore } from '@/store/auth/auth.store';
import { secureLog } from '@/utils/secure-logger';

/**
 * Interface for flight booking reference response
 */
export interface FlightBookingReference {
  bookingReference: string;
  status: string;
  orderId: string;
  passengerNames: string[];
  flightDetails?: {
    segments: Array<{
      origin: string;
      destination: string;
      departureTime: string;
      arrivalTime: string;
      flightNumber: string;
      airline: string;
    }>;
  };
}

/**
 * Interface for hotel booking reference response
 */
export interface HotelBookingReference {
  bookingReference: string;
  status: string;
  bookingId: string;
  guestNames: string[];
  hotelDetails?: {
    name: string;
    address: string;
    checkIn: string;
    checkOut: string;
    roomType: string;
  };
}

/**
 * Service to retrieve booking references from Duffel API
 */
export class BookingReferenceService {
  private apiClient: FastApiClient;

  constructor() {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || '';
    this.apiClient = new FastApiClient(baseUrl, async () => {
      const { session } = useAuthStore.getState();
      return session?.access_token || null;
    });
  }

  /**
   * Get flight booking reference using order ID
   * @param orderId - Duffel order ID
   * @returns Flight booking reference data
   */
  async getFlightBookingReference(orderId: string): Promise<FlightBookingReference> {
    try {
      secureLog.log('Retrieving flight booking reference', { orderId });
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response: any = await this.apiClient.getFlightOrder(orderId);
      
      if (!response || !response.data) {
        throw new Error('Invalid response from flight order API');
      }

      const orderData = response.data;
      
      // Extract booking reference from the order data
      const bookingReference = orderData.booking_reference || orderData.reference || orderId;
      const status = orderData.status || 'unknown';
      
      // Extract passenger names
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const passengerNames = orderData.passengers?.map((passenger: any) => 
        `${passenger.given_name} ${passenger.family_name}`
      ) || [];

      // Extract flight details
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const flightDetails = orderData.slices?.map((slice: any) => 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        slice.segments?.map((segment: any) => ({
          origin: segment.origin?.iata_code || segment.origin?.name || '',
          destination: segment.destination?.iata_code || segment.destination?.name || '',
          departureTime: segment.departing_at || '',
          arrivalTime: segment.arriving_at || '',
          flightNumber: segment.marketing_carrier?.name ? 
            `${segment.marketing_carrier.name} ${segment.marketing_carrier_flight_number}` : 
            segment.marketing_carrier_flight_number || '',
          airline: segment.marketing_carrier?.name || segment.operating_carrier?.name || '',
        }))
      ).flat() || [];

      const result: FlightBookingReference = {
        bookingReference,
        status,
        orderId,
        passengerNames,
        flightDetails: flightDetails.length > 0 ? { segments: flightDetails } : undefined,
      };

      secureLog.log('Successfully retrieved flight booking reference', { 
        orderId, 
        bookingReference, 
        status 
      });

      return result;

    } catch (error) {
      secureLog.error('Failed to retrieve flight booking reference', { 
        orderId, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw new Error(`Failed to retrieve flight booking reference: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get hotel booking reference using booking ID
   * @param bookingId - Duffel hotel booking ID
   * @returns Hotel booking reference data
   */
  async getHotelBookingReference(bookingId: string): Promise<HotelBookingReference> {
    try {
      secureLog.log('Retrieving hotel booking reference', { bookingId });
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response: any = await this.apiClient.getHotelBooking(bookingId);
      
      if (!response || !response.data) {
        throw new Error('Invalid response from hotel booking API');
      }

      const bookingData = response.data;
      
      // Extract booking reference from the booking data
      const bookingReference = bookingData.reference || bookingData.booking_reference || bookingId;
      const status = bookingData.status || 'unknown';
      
      // Extract guest names
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const guestNames = bookingData.guests?.map((guest: any) => 
        `${guest.given_name} ${guest.family_name}`
      ) || [];

      // Extract hotel details
      const hotelDetails = bookingData.accommodation ? {
        name: bookingData.accommodation.name || '',
        address: bookingData.accommodation.location?.address?.line_one || '',
        checkIn: bookingData.check_in_date || '',
        checkOut: bookingData.check_out_date || '',
        roomType: bookingData.rooms?.[0]?.name || '',
      } : undefined;

      const result: HotelBookingReference = {
        bookingReference,
        status,
        bookingId,
        guestNames,
        hotelDetails,
      };

      secureLog.log('Successfully retrieved hotel booking reference', { 
        bookingId, 
        bookingReference, 
        status 
      });

      return result;

    } catch (error) {
      secureLog.error('Failed to retrieve hotel booking reference', { 
        bookingId, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw new Error(`Failed to retrieve hotel booking reference: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Export a singleton instance
export const bookingReferenceService = new BookingReferenceService();

/**
 * Utility functions for easy access
 */
export const getFlightBookingReference = (orderId: string) => 
  bookingReferenceService.getFlightBookingReference(orderId);

export const getHotelBookingReference = (bookingId: string) => 
  bookingReferenceService.getHotelBookingReference(bookingId);
