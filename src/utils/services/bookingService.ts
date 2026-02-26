/* eslint-disable @typescript-eslint/no-explicit-any */
import { CheckoutFormData, PassengerData } from '@/store/checkout/checkout.store';
import { Itinerary, ItineraryType, ItineraryFlight, ItineraryHotel, useItineraryStore } from '@/store/itinerary/itinerary.store';
import { bookFlight, bookHotel, getHotelQuote, FlightBookingRequest, HotelBookingRequest } from '@/utils/api/bookings';

interface BookingResult {
  success: boolean;
  flightBookingData?: any;
  hotelBookingData?: any;
  error?: string;
}


const isValidPhoneNumber = (fullPhoneNumber: string): boolean => {
  // Validate full phone number with country code using the required regex pattern
  // Pattern: ^\+[1-9]\d{1,14}$ means:
  // ^ - start of string
  // \+ - literal plus sign
  // [1-9] - first digit must be 1-9 (not 0)
  // \d{1,14} - followed by 1-14 more digits
  // $ - end of string
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  return phoneRegex.test(fullPhoneNumber);
};

const convertGender = (gender: string): string => {
  switch (gender?.toLowerCase()) {
    case 'male':
      return 'm';
    case 'female':
      return 'f';
    default:
      return 'm'; // Default to male if unknown
  }
};

const convertTitle = (title: string): string => {
  switch (title?.toLowerCase()) {
    case 'mrs':
    case 'ms':
      return 'mrs';
    case 'dr':
      return 'dr';
    default:
      return 'mr';
  }
};

const formatDateOfBirth = (dateStr: string): string => {
  // Input might be in various formats, normalize to YYYY-MM-DD
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date format: ${dateStr}`);
  }
  return date.toISOString().split('T')[0];
};

// Remove generatePassengerId - we'll use IDs from the original flight offer

export const processBookings = async (
  formData: CheckoutFormData,
  itinerary: Itinerary[]
): Promise<BookingResult> => {
  console.log('Processing bookings with form data:', formData);
  console.log('Processing bookings with itinerary:', itinerary);

  const flights = itinerary.filter(item => item.type === ItineraryType.Flight) as ItineraryFlight[];
  const hotels = itinerary.filter(item => item.type === ItineraryType.Hotel) as ItineraryHotel[];

  let flightBookingData;
  let hotelBookingData;

  try {
    // Process flight bookings
    if (flights.length > 0) {
      console.log('Processing flight bookings...');
      
      // Get the flight offer ID from the first flight (assuming single flight selection for now)
      const flight = flights[0];
      const offerId = flight.duffel_offer_id || flight.id; // Use duffel_offer_id if available, fallback to id
      
      // Prepare passengers data
      const passengers = formData.passengers || [];
      
      if (passengers.length === 0) {
        throw new Error('No passenger information available for flight booking');
      }

      // Extract contact information from the first passenger (primary contact)
      const primaryContact = passengers[0]?.contact;
      
      if (!primaryContact?.email || !primaryContact?.phone) {
        throw new Error('Contact information (email and phone) is required for flight booking');
      }

      // Get passenger IDs from the original flight offer data
      const originalPassengers = flight.data.passengers || [];
      
      if (originalPassengers.length === 0) {
        throw new Error('No passenger IDs found in flight offer data');
      }
      
      const flightPassengers = passengers.map((passenger: PassengerData, index: number) => {
        const passengerInfo = passenger.passengerInfo;
        if (!passengerInfo?.firstName || !passengerInfo?.lastName || !passengerInfo?.dateOfBirth) {
          throw new Error(`Incomplete passenger information for passenger ${index + 1} (${passengerInfo?.firstName || 'Unknown'} ${passengerInfo?.lastName || 'Unknown'})`);
        }

        // Use passenger's own contact info if available, fallback to primary contact
        const passengerContact = passenger.contact || primaryContact;
        
        // Ensure we have valid contact information
        if (!passengerContact?.email || !passengerContact?.phone) {
          throw new Error(`Contact information (email and phone) is missing for passenger ${index + 1} (${passengerInfo.firstName} ${passengerInfo.lastName})`);
        }

        // Validate phone number format (phone should already be formatted with country code)
        if (!isValidPhoneNumber(passengerContact.phone)) {
          throw new Error(`Invalid phone number "${passengerContact.phone}" for passenger ${index + 1} (${passengerInfo.firstName} ${passengerInfo.lastName}). Please enter a valid phone number in international format.`);
        }

        // Get the corresponding passenger ID from the original offer
        const originalPassenger = originalPassengers[index];
        if (!originalPassenger?.id) {
          throw new Error(`Missing passenger ID for passenger ${index + 1} (${passengerInfo.firstName} ${passengerInfo.lastName}) in original flight offer`);
        }

        return {
          id: originalPassenger.id, // Use passenger ID from original flight offer
          given_name: passengerInfo.firstName,
          family_name: passengerInfo.lastName,
          title: convertTitle(passengerInfo.title || 'mr'),
          gender: convertGender(passengerInfo.gender || 'male'),
          born_on: formatDateOfBirth(passengerInfo.dateOfBirth),
          email: passengerContact.email,
          phone_number: passengerContact.phone, // Already formatted
        };
      });

      const flightBookingRequest: FlightBookingRequest = {
        type: 'instant',
        selected_offers: [offerId],
        payments: [{
          type: 'balance',
          amount: flight.price,
          currency: flight.tax_currency || 'USD',
        }],
        passengers: flightPassengers,
      };

      const flightResult = await bookFlight(flightBookingRequest);
      if (!flightResult.success) {
        // Handle specific validation errors
        let errorMessage = flightResult.error || 'Flight booking failed';
        
        // Check for expired/invalid offer error
        if (errorMessage.includes("selected_offers") && 
            errorMessage.includes("linked record(s) that were not found")) {
          errorMessage = "The selected flight offer has expired or is no longer available. Please return to the chat and select a new flight.";
        }
        
        throw new Error(errorMessage);
      }
      flightBookingData = flightResult.data;

      useItineraryStore.getState().updateBookingData(flight.id, flightResult.data);
    }

    // Process hotel bookings
    if (hotels.length > 0) {
      console.log('Processing hotel bookings...');
      
      const hotel = hotels[0];
      const rateId = hotel.data.rate?.id || hotel.id; // Get the rate ID for quote request
      
      const passengers = formData.passengers || [];
      
      if (passengers.length === 0) {
        throw new Error('No guest information available for hotel booking');
      }

      // Extract contact information from the first passenger (primary contact)
      const primaryContact = passengers[0]?.contact;
      
      if (!primaryContact?.email || !primaryContact?.phone) {
        throw new Error('Contact information (email and phone) is required for hotel booking');
      }

      if (!rateId) {
        throw new Error('Hotel rate ID is missing');
      }

      // Step 1: Get quote ID from rate ID
      console.log('Getting hotel quote for rate ID:', rateId);
      const quoteResult = await getHotelQuote(rateId);
      
      console.log('Quote result structure:', JSON.stringify(quoteResult, null, 2));
      
      if (!quoteResult.success) {
        throw new Error(quoteResult.error || 'Failed to get hotel quote');
      }
      
      // Duffel API returns data in a nested structure: { data: { data: { id: "quo_xxx" } } }
      const quoteId = quoteResult.data?.data?.id || quoteResult.data?.id;
      console.log('Extracted quote ID:', quoteId);
      
      if (!quoteId) {
        console.error('No quote ID found in response:', quoteResult.data);
        throw new Error('Quote ID not found in response');
      }
      
      console.log('Got hotel quote ID:', quoteId);

      const hotelGuests = passengers.map((passenger: PassengerData, index: number) => {
        const passengerInfo = passenger.passengerInfo;
        if (!passengerInfo?.firstName || !passengerInfo?.lastName || !passengerInfo?.dateOfBirth) {
          throw new Error(`Incomplete guest information for guest ${index + 1}`);
        }

        return {
          given_name: passengerInfo.firstName,
          family_name: passengerInfo.lastName,
          born_on: formatDateOfBirth(passengerInfo.dateOfBirth),
        };
      });

      // Step 2: Use quote ID for the actual booking
      // Validate phone number format (phone should already be formatted with country code)
      if (!isValidPhoneNumber(primaryContact.phone)) {
        throw new Error(`Invalid phone number "${primaryContact.phone}" for primary contact. Please enter a valid phone number in international format.`);
      }

      const hotelBookingRequest: HotelBookingRequest = {
        quote_id: quoteId, // Using quote ID from step 1
        phone_number: primaryContact.phone, // Already formatted
        email: primaryContact.email,
        guests: hotelGuests,
        accommodation_special_requests: 'Booking made through Hayo Travel',
      };

      const hotelResult = await bookHotel(hotelBookingRequest);
      if (!hotelResult.success) {
        throw new Error(hotelResult.error || 'Hotel booking failed');
      }
      hotelBookingData = hotelResult.data;

      useItineraryStore.getState().updateBookingData(hotel.id, hotelResult.data);
    }

    console.log('All bookings completed successfully');
    return {
      success: true,
      flightBookingData,
      hotelBookingData,
    };
    
  } catch (error) {
    console.error('Booking process failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown booking error',
    };
  }
};