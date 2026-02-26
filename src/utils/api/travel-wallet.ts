import { FastApiClient } from "@/lib/fastapi-client";
import { useAuthStore } from "@/store/auth/auth.store";
import { PassengerData } from "@/store/checkout/checkout.store";
import { Itinerary } from "@/store/itinerary/itinerary.store";
import { 
  TravelWalletTrip, 
  TravelWalletTripsResponse, 
  TravelWalletQuery,
  TravelWalletTripStatus 
} from "@/utils/types/travel-wallet";

/**
 * Third-party booking confirmation data structure
 */
interface BookingConfirmationData {
  confirmation_number?: string;
  flight_booking?: {
    reference?: string;
    status?: string;
    [key: string]: unknown;
  };
  hotel_booking?: {
    reference?: string;
    status?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

/**
 * Backend response structure (snake_case)
 */
interface BackendTravelWalletTrip {
  id: number;
  chat_id: number;
  title: string;
  start_date: string;
  end_date: string;
  currency: string;
  itinerary_data: {
    itinerary: ItineraryItem[];
    travelers_count: number;
    passenger_details?: PassengerData[];
  };
  payment_status: string;
  booking_confirmation_data?: BookingConfirmationData;
  created_at: string;
  updated_at: string;
  chat_session: {
    destination: string;
    [key: string]: unknown;
  };
}

interface ItineraryItem {
  id?: string;
  type: string;
  price?: string;
  data?: {
    payment_intent_id?: string;
    [key: string]: unknown;
  };
  cancelled_at?: string;
  cancellation_reason?: string;
  [key: string]: unknown;
}

/**
 * Get authenticated API client
 */
const getApiClient = (): FastApiClient => {
  const { apiClient } = useAuthStore.getState();
  
  if (!apiClient) {
    throw new Error('Authentication required. Please ensure you are signed in and try again.');
  }
  
  return apiClient;
};

/**
 * Map frontend trip status to backend-expected status values
 * Backend expects payment/order statuses: PENDING, PAID, FAILED, CANCELLED, REFUNDED
 */
const mapTripStatusToBackendStatus = (status: TravelWalletTripStatus): string => {
  switch (status) {
    case TravelWalletTripStatus.Upcoming:
      return 'PAID'; // Confirmed/paid upcoming trips
    case TravelWalletTripStatus.Active:
      return 'PAID'; // Currently active trips that are paid
    case TravelWalletTripStatus.Past:
      return 'PAID'; // Completed trips
    case TravelWalletTripStatus.Cancelled:
      return 'CANCELLED'; // Cancelled trips
    default:
      return 'PAID'; // Default fallback
  }
};

/**
 * Map backend payment status to frontend trip status
 */
const mapBackendStatusToTripStatus = (paymentStatus: string, startDate: string, endDate: string): TravelWalletTripStatus => {
  if (paymentStatus === 'CANCELLED') {
    return TravelWalletTripStatus.Cancelled;
  }
  
  if (paymentStatus === 'PAID') {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > now) {
      return TravelWalletTripStatus.Upcoming;
    } else if (end >= now) {
      return TravelWalletTripStatus.Active;
    } else {
      return TravelWalletTripStatus.Past;
    }
  }
  
  // Default for other payment statuses
  return TravelWalletTripStatus.Upcoming;
};

/**
 * Calculate total cost from itinerary data
 */
const calculateTotalCost = (itineraryData: { itinerary?: ItineraryItem[] }): string => {
  try {
    if (!itineraryData?.itinerary || !Array.isArray(itineraryData.itinerary)) {
      return '0';
    }
    
    const total = itineraryData.itinerary.reduce((sum: number, item: ItineraryItem) => {
      const itemPrice = parseFloat(item.price || '0');
      return sum + itemPrice;
    }, 0);
    
    return total.toFixed(2);
  } catch (error) {
    console.warn('Failed to calculate total cost:', error);
    return '0';
  }
};

/**
 * Transform backend response to frontend format
 */
const transformBackendTripToFrontend = (backendTrip: BackendTravelWalletTrip): TravelWalletTrip => {
  const totalCost = calculateTotalCost(backendTrip.itinerary_data);
  const status = mapBackendStatusToTripStatus(
    backendTrip.payment_status, 
    backendTrip.start_date, 
    backendTrip.end_date
  );

  return {
    id: backendTrip.id.toString(),
    chatId: backendTrip.chat_id,
    itineraryId: backendTrip.id, // Using same ID for itinerary
    title: backendTrip.title,
    destination: backendTrip.chat_session?.destination || 'Unknown Destination',
    startDate: backendTrip.start_date,
    endDate: backendTrip.end_date,
    travelersCount: backendTrip.itinerary_data?.travelers_count || 1,
    status,
    cost: {
      total: totalCost,
      currency: backendTrip.currency || 'USD',
    },
    previewImage: '/plane.png', // Default image
    itineraryItems: (backendTrip.itinerary_data?.itinerary || []).map((item: ItineraryItem) => ({
      ...item,
      cancelled_at: item.cancelled_at,
      cancellation_reason: item.cancellation_reason,
    })) as unknown as Itinerary[], // Cast to match Itinerary type
    confirmation: {
      bookedAt: backendTrip.created_at,
      paymentIntentId: backendTrip.itinerary_data?.itinerary?.[0]?.data?.payment_intent_id,
      bookingConfirmed: !!backendTrip.booking_confirmation_data,
      confirmationNumber: backendTrip.booking_confirmation_data?.confirmation_number || 
                          (backendTrip.booking_confirmation_data ? "Confirmed" : undefined),
    },
    passengerDetails: backendTrip.itinerary_data?.passenger_details || undefined,
    metadata: {
      createdAt: backendTrip.created_at,
      updatedAt: backendTrip.updated_at,
      chatMetadata: backendTrip.chat_session,
    },
  };
};

/**
 * Map frontend sort field names to backend-expected field names
 * Backend expects snake_case: created_at, start_date, end_date, title, updated_at
 */
const mapSortFieldToBackendField = (sortBy: string): string => {
  switch (sortBy) {
    case 'startDate':
      return 'start_date';
    case 'createdAt':
      return 'created_at';
    case 'endDate':
      return 'end_date';
    case 'updatedAt':
      return 'updated_at';
    case 'title':
      return 'title'; // No change needed
    default:
      return 'created_at'; // Default fallback
  }
};

/**
 * Build query string from TravelWalletQuery parameters
 */
const buildQueryString = (query: TravelWalletQuery): string => {
  const params = new URLSearchParams();
  
  if (query.status && query.status.length > 0) {
    // Map frontend status values to backend-expected values
    const mappedStatuses = query.status.map(mapTripStatusToBackendStatus);
    // Remove duplicates (e.g., multiple statuses mapping to 'PAID')
    const uniqueStatuses = [...new Set(mappedStatuses)];
    uniqueStatuses.forEach(status => params.append('status', status));
  }
  
  if (query.limit) {
    params.set('limit', query.limit.toString());
  }
  
  if (query.page) {
    params.set('page', query.page.toString());
  }
  
  if (query.sortBy) {
    params.set('sort_by', mapSortFieldToBackendField(query.sortBy));
  }
  
  if (query.sortOrder) {
    params.set('sort_order', query.sortOrder);
  }
  
  return params.toString();
};

/**
 * Fetch all travel wallet trips for the current user
 */
export const getTravelWalletTrips = async (
  query: TravelWalletQuery = {}
): Promise<TravelWalletTripsResponse> => {
  try {
    const apiClient = getApiClient();
    const queryString = buildQueryString(query);
    
    console.log('Fetching travel wallet trips:', { query });
    
    // Get raw backend response
    const backendResponse = await apiClient.getTravelWalletTrips(queryString || undefined) as BackendTravelWalletTrip[] | { trips: BackendTravelWalletTrip[]; total?: number };
    
    // Handle case where backend returns array directly instead of wrapped response
    let backendTrips: BackendTravelWalletTrip[] = [];
    let total = 0;
    
    if (Array.isArray(backendResponse)) {
      // Backend returns array directly
      backendTrips = backendResponse as BackendTravelWalletTrip[];
      total = backendTrips.length;
    } else if (backendResponse?.trips && Array.isArray(backendResponse.trips)) {
      // Backend returns wrapped response
      backendTrips = backendResponse.trips as BackendTravelWalletTrip[];
      total = backendResponse.total || backendTrips.length;
    } else {
      console.warn('Unexpected backend response format:', backendResponse);
    }

    // Transform backend trips to frontend format
    const transformedTrips = backendTrips.map(transformBackendTripToFrontend);
    
    console.log('Backend trips:', backendTrips.length);
    console.log('Transformed trips:', transformedTrips.length);
    console.log('Sample transformed trip:', transformedTrips[0]);
    
    return {
      trips: transformedTrips,
      total,
      pagination: {
        page: query.page || 0,
        limit: query.limit || 20,
        hasMore: false, // Backend doesn't provide this info yet
      },
    };
  } catch (error) {
    console.error('Failed to fetch travel wallet trips:', error);
    throw error;
  }
};

/**
 * Fetch a specific trip by ID
 */
export const getTravelWalletTripById = async (
  tripId: string
): Promise<TravelWalletTrip> => {
  try {
    const apiClient = getApiClient();
    
    console.log('Fetching travel wallet trip by ID:', tripId);
    
    const backendTrip = await apiClient.getTravelWalletTrip(tripId) as BackendTravelWalletTrip;
    return transformBackendTripToFrontend(backendTrip);
  } catch (error) {
    console.error(`Failed to fetch travel wallet trip ${tripId}:`, error);
    throw error;
  }
};

/**
 * Get upcoming trips (convenience method)
 */
export const getUpcomingTrips = async (): Promise<TravelWalletTripsResponse> => {
  return getTravelWalletTrips({
    status: [TravelWalletTripStatus.Upcoming, TravelWalletTripStatus.Active],
    sortBy: 'startDate',
    sortOrder: 'asc',
  });
};

/**
 * Get past trips (convenience method)
 */
export const getPastTrips = async (): Promise<TravelWalletTripsResponse> => {
  return getTravelWalletTrips({
    status: [TravelWalletTripStatus.Past],
    sortBy: 'startDate',
    sortOrder: 'desc',
  });
};

/**
 * Mark a trip as viewed (for analytics)
 */
export const markTripAsViewed = async (tripId: string): Promise<void> => {
  try {
    const apiClient = getApiClient();
    
    await apiClient.markTripAsViewed(tripId);
    
    console.log('Trip marked as viewed:', tripId);
  } catch (error) {
    // Non-critical operation, just log the error
    console.warn('Failed to mark trip as viewed:', error);
  }
};
