/**
 * Duffel API service for fetching detailed flight offer information
 * Uses backend API proxy to avoid CORS issues
 */
import { FastApiClient } from "@/lib/fastapi-client";
import { useAuthStore } from "@/store/auth/auth.store";

const getApiClient = (): FastApiClient => {
  const { apiClient } = useAuthStore.getState();
  
  if (!apiClient) {
    throw new Error('Authentication required. Please ensure you are signed in and try again.');
  }
  
  return apiClient;
};

export interface DuffelOfferDetails {
  data: {
    id: string;
    total_amount: string;
    total_currency: string;
    tax_amount: string;
    tax_currency: string;
    base_amount: string;
    base_currency: string;
    slices: DuffelSlice[];
    passengers: DuffelPassengerOffer[];
    conditions: {
      change_before_departure?: {
        allowed: boolean;
        penalty_amount?: string;
        penalty_currency?: string;
      };
      cancel_before_departure?: {
        allowed: boolean;
        penalty_amount?: string;
        penalty_currency?: string;
      };
    };
    passenger_identity_documents_required: boolean;
    supported_passenger_identity_document_types: string[];
  };
}

export interface DuffelSlice {
  id: string;
  origin: DuffelPlace;
  destination: DuffelPlace;
  departure_date: string;
  duration: string;
  segments: DuffelSegment[];
  fare_brand_name?: string;
}

export interface DuffelSegment {
  id: string;
  origin: DuffelPlace;
  destination: DuffelPlace;
  departing_at: string;
  arriving_at: string;
  marketing_carrier: DuffelCarrier;
  operating_carrier: DuffelCarrier;
  marketing_carrier_flight_number: string;
  operating_carrier_flight_number: string;
  duration: string;
  distance: string;
  aircraft: {
    id: string;
    name: string;
    iata_code: string;
  };
  passengers: DuffelSegmentPassenger[];
}

export interface DuffelSegmentPassenger {
  passenger_id: string;
  cabin_class: string;
  cabin_class_marketing_name: string;
  fare_basis_code?: string;
  baggages: DuffelBaggage[];
  seat?: {
    name: string;
    designator: string;
  };
}

export interface DuffelBaggage {
  quantity: number;
  type: 'checked' | 'carry_on';
}

export interface DuffelPlace {
  id: string;
  name: string;
  iata_code: string;
  iata_country_code: string;
  city_name?: string;
  city_iata_code?: string;
  time_zone: string;
  type: string;
  latitude?: number;
  longitude?: number;
}

export interface DuffelCarrier {
  id: string;
  name: string;
  iata_code: string;
  logo_symbol_url?: string;
  logo_lockup_url?: string;
}

export interface DuffelPassengerOffer {
  id: string;
  type: 'adult' | 'child' | 'infant';
  given_name?: string;
  family_name?: string;
  fare_type?: string;
  baggages: DuffelBaggage[];
}

/**
 * Fetch detailed offer information via backend API proxy
 */
export async function fetchOfferDetails(offerId: string): Promise<DuffelOfferDetails> {
  try {
    const apiClient = getApiClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await apiClient.get<any>(`/duffel/offers/${offerId}`);
    
    // Extract the actual Duffel data from the backend response wrapper
    return response.data || response;
  } catch (error) {
    console.error('Error fetching offer details:', error);
    throw error;
  }
}

/**
 * Extract flight number from segment
 */
export function getFlightNumber(segment: DuffelSegment): string {
  return `${segment.marketing_carrier.iata_code}${segment.marketing_carrier_flight_number}`;
}

/**
 * Format baggage information for display
 */
export function formatBaggageInfo(baggages: DuffelBaggage[], fareBrandName?: string): string {
  if (!baggages || baggages.length === 0) {
    // If no baggage included, show fare brand info if available
    return fareBrandName ? `${fareBrandName} (Baggage not included)` : 'Baggage not included';
  }

  const checkedBags = baggages.filter(b => b.type === 'checked');
  const cabinBags = baggages.filter(b => b.type === 'carry_on');
  
  const parts = [];
  
  if (checkedBags.length > 0) {
    const totalChecked = checkedBags.reduce((sum, bag) => sum + bag.quantity, 0);
    parts.push(`${totalChecked} checked bag${totalChecked > 1 ? 's' : ''}`);
  }
  
  if (cabinBags.length > 0) {
    const totalCabin = cabinBags.reduce((sum, bag) => sum + bag.quantity, 0);
    parts.push(`${totalCabin} cabin bag${totalCabin > 1 ? 's' : ''}`);
  }
  
  return parts.join(', ');
}

/**
 * Format seat assignment for display
 */
export function formatSeatAssignment(seat?: { name: string; designator: string }): string {
  return seat ? `Seat ${seat.designator}` : '';
}
