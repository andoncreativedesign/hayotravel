export interface HotelRatesResponse {
  data: unknown;
  status: 'success' | 'error';
  message?: string;
}

export const fetchHotelRates = async (hotelId: string): Promise<HotelRatesResponse> => {
  console.log(`Fetching hotel rates for hotel ID: ${hotelId}`);
  
  try {
    const response = await fetch('/api/hotel-rates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ hotelId })
    });

    console.log(`Backend API response status: ${response.status}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    console.log('Hotel rates API response:', responseData);
    
    return {
      data: responseData.data,
      status: 'success'
    };
  } catch (error) {
    console.error('Error fetching hotel rates:', error);
    return {
      data: null,
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}; 