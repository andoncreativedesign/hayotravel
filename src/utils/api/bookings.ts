/* eslint-disable @typescript-eslint/no-explicit-any */
// Note: Direct API calls to Duffel are handled by backend routes to avoid CORS issues

export interface HotelBookingRequest {
  quote_id: string;
  phone_number: string;
  email: string;
  guests: Array<{
    given_name: string;
    family_name: string;
    born_on: string;
  }>;
  accommodation_special_requests?: string;
}

export interface FlightBookingRequest {
  type: 'instant';
  selected_offers: string[];
  payments: Array<{
    type: 'balance';
    amount: string;
    currency: string;
  }>;
  passengers: Array<{
    id: string; // Required passenger ID for Duffel API
    given_name: string;
    family_name: string;
    title: string;
    gender: string;
    born_on: string;
    email: string;
    phone_number: string;
  }>;
}

export interface BookingResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export interface HotelQuoteRequest {
  rate_id: string;
}

export interface HotelQuoteResponse {
  success: boolean;
  data?: {
    data?: {
      id: string; // Quote ID starting with "quo_"
      [key: string]: any;
    };
    id?: string; // Fallback if ID is at top level
    [key: string]: any;
  };
  error?: string;
}

export const bookHotel = async (bookingData: HotelBookingRequest): Promise<BookingResponse> => {
  try {
    console.log('Booking hotel with data:', bookingData);
    
    const response = await fetch('/api/hotel-booking', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData),
    });

    console.log(`Backend hotel booking API response status: ${response.status}`);

    const result = await response.json();

    if (!response.ok) {
      console.error('Hotel booking failed:', result);
      return {
        success: false,
        error: result.error || 'Hotel booking failed',
      };
    }

    console.log('Hotel booking successful:', result);
    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    console.error('Hotel booking error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};

export const getHotelQuote = async (rateId: string): Promise<HotelQuoteResponse> => {
  try {
    console.log('Getting hotel quote for rate ID:', rateId);
    
    const response = await fetch('/api/hotel-quote', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ rate_id: rateId }),
    });

    console.log(`Backend hotel quote API response status: ${response.status}`);

    const result = await response.json();

    if (!response.ok) {
      console.error('Hotel quote failed:', result);
      return {
        success: false,
        error: result.error || 'Hotel quote failed',
      };
    }

    console.log('Hotel quote successful:', result);
    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    console.error('Hotel quote error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};

export const bookFlight = async (bookingData: FlightBookingRequest): Promise<BookingResponse> => {
  try {
    console.log('Booking flight with data:', bookingData);
    
    const response = await fetch('/api/flight-booking', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData),
    });

    console.log(`Backend flight booking API response status: ${response.status}`);

    const result = await response.json();

    if (!response.ok) {
      console.error('Flight booking failed:', result);
      return {
        success: false,
        error: result.error || 'Flight booking failed',
      };
    }

    console.log('Flight booking successful:', result);
    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    console.error('Flight booking error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};