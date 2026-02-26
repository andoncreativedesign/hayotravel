import { Itinerary } from "@/store/itinerary/itinerary.store";

/**
 * Travel Wallet Entry - represents a booked/completed itinerary
 * This extends the existing itinerary system for wallet display
 */
export interface TravelWalletTrip {
  /** Unique identifier for the trip */
  id: string;
  
  /** Associated chat/conversation ID */
  chatId: number;
  
  /** Itinerary ID from backend */
  itineraryId: number;
  
  /** Trip title/name */
  title: string;
  
  /** Trip destination(s) */
  destination: string;
  
  /** Trip start date (ISO string) */
  startDate: string;
  
  /** Trip end date (ISO string) */
  endDate: string;
  
  /** Number of travelers */
  travelersCount: number;
  
  /** Trip status */
  status: TravelWalletTripStatus;
  
  /** Total cost information */
  cost: {
    total: string;
    currency: string;
  };
  
  /** Preview image URL */
  previewImage: string;
  
  /** Associated itinerary items (flights, hotels, etc.) */
  itineraryItems: Itinerary[];
  
  /** Booking confirmation info */
  confirmation: {
    confirmationNumber?: string;
    bookedAt: string; // ISO string
    paymentIntentId?: string;
    bookingConfirmed?: boolean; // Whether third-party booking was confirmed
  };
  
  /** Passenger details from checkout */
  passengerDetails?: Array<{
    passengerInfo?: {
      title?: "mr" | "mrs" | "ms" | "dr";
      firstName?: string;
      middleName?: string;
      lastName?: string;
      dateOfBirth?: string;
      gender?: "male" | "female" | "other";
      nationality?: string;
    };
    contact?: {
      email?: string;
      phone?: string;
      countryCode?: string;
    };
    document?: {
      type?: string;
      number?: string;
      issueCountry?: string;
      expiryDate?: string;
    };
  }>;
  
  /** Trip metadata */
  metadata: {
    createdAt: string;
    updatedAt: string;
    chatMetadata?: Record<string, unknown>;
  };
}

/**
 * Trip status enumeration
 */
export enum TravelWalletTripStatus {
  /** Upcoming trip */
  Upcoming = "upcoming",
  /** Currently traveling */
  Active = "active", 
  /** Past/completed trip */
  Past = "past",
  /** Cancelled trip */
  Cancelled = "cancelled"
}

/**
 * API response for travel wallet trips
 */
export interface TravelWalletTripsResponse {
  trips: TravelWalletTrip[];
  total: number;
  pagination?: {
    page: number;
    limit: number;
    hasMore: boolean;
  };
}

/**
 * Query parameters for fetching travel wallet trips
 */
export interface TravelWalletQuery {
  /** Filter by status */
  status?: TravelWalletTripStatus[];
  /** Limit number of results */
  limit?: number;
  /** Page number for pagination */
  page?: number;
  /** Sort order */
  sortBy?: 'startDate' | 'endDate' | 'createdAt' | 'updatedAt' | 'title';
  /** Sort direction */
  sortOrder?: 'asc' | 'desc';
}

/**
 * Trip summary for preview cards
 */
export interface TravelWalletTripSummary {
  id: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  status: TravelWalletTripStatus;
  previewImage: string;
  totalCost: string;
  currency: string;
  travelersCount: number;
}
