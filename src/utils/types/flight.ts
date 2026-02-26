export interface FlightOffer {
  /** Unique identifier of the flight offer. */
  id: string;

  /** Total CO2 emissions in kilograms for the flight. */
  total_emissions_kg: number;

  /** Payment-related rules and deadlines for the offer. */
  payment_requirements: PaymentRequirements;

  /** Optional services available for this offer. */
  available_services: unknown[] | null;

  /** List of supported document types for identity verification. */
  supported_passenger_identity_document_types: string[];

  /** Whether identity documents are mandatory for passengers. */
  passenger_identity_documents_required: boolean;

  /** Currency for tax values. */
  tax_currency: string;

  /** Currency for base fare. */
  base_currency: string;

  /** Base fare amount before taxes. */
  base_amount: string;

  /** Tax amount for the offer. */
  tax_amount: string;

  /** Currency for the total amount. */
  total_currency: string;

  /** Total amount payable for the offer. */
  total_amount: string;

  /** Date and time the offer was created (ISO format). */
  created_at: string;

  /** Date and time the offer was last updated (ISO format). */
  updated_at: string;

  /** Date and time the offer expires (ISO format). */
  expires_at: string;

  /** Indicates whether the offer is in live booking mode. */
  live_mode: boolean;

  /** Indicates whether the offer is a partial offer. */
  partial: boolean;

  /** Change and refund conditions for the offer. */
  conditions: FlightConditions;

  /** The carrier owning this offer. */
  owner: Carrier;

  /** List of supported loyalty programme codes. */
  supported_loyalty_programmes: string[];

  /** Private fare rules if applicable. */
  private_fares: unknown[];

  /** Passengers included in the offer. */
  passengers: OfferPassenger[];

  /** Travel slices in the itinerary (e.g., outbound and return). */
  slices: OfferSlice[];
}

export interface OfferPassenger {
  /** Unique identifier of the passenger. */
  id: string;

  /** Passenger type: adult, child, or infant. */
  type: "adult" | "child" | "infant";

  /** Fare type for the passenger, if available. */
  fare_type: string | null;

  /** Associated loyalty programme accounts. */
  loyalty_programme_accounts: unknown[];

  /** Passenger's family name (surname). */
  family_name: string | null;

  /** Passenger's given name (first name). */
  given_name: string | null;

  /** Age of the passenger, if available. */
  age: number | null;
}

export interface PaymentRequirements {
  /** Indicates whether instant payment is required. */
  requires_instant_payment: boolean;

  /** When the price guarantee expires (ISO format). */
  price_guarantee_expires_at: string | null;

  /** Latest date/time payment must be made (ISO format). */
  payment_required_by: string;
}

export interface FlightConditions {
  /** Refund conditions before departure. */
  refund_before_departure: RefundOrChangeCondition | null;

  /** Change conditions before departure. */
  change_before_departure: RefundOrChangeCondition | null;
}

export interface RefundOrChangeCondition {
  /** Indicates whether the action is allowed. */
  allowed: boolean;

  /** Penalty currency if applicable. */
  penalty_currency: string | null;

  /** Penalty amount if applicable. */
  penalty_amount: string | null;
}

export interface OfferSlice {
  /** Unique identifier of the slice. */
  id: string;

  /** Key used for comparing slices. */
  comparison_key: string;

  /** Shelf number in NGS presentation. */
  ngs_shelf: number;

  /** Type of the origin location (e.g., airport). */
  origin_type: string;

  /** Type of the destination location (e.g., airport). */
  destination_type: string;

  /** Marketing name for the fare brand. */
  fare_brand_name: string;

  /** Duration of the slice (ISO 8601 format). */
  duration: string;

  /** Origin airport data. */
  origin: Airport;

  /** Destination airport data. */
  destination: Airport;

  /** Conditions specific to this slice. */
  conditions: SliceConditions;

  /** Segments in the slice (flights). */
  segments: SliceSegment[];
}

export interface SliceConditions {
  /** Whether priority check-in is available. */
  priority_check_in: boolean | null;

  /** Whether priority boarding is available. */
  priority_boarding: boolean | null;

  /** Whether advance seat selection is available. */
  advance_seat_selection: boolean | null;

  /** Change conditions before departure. */
  change_before_departure: RefundOrChangeCondition | null;
}

export interface SliceSegment {
  /** Unique identifier for the segment. */
  id: string;

  /** Terminal at the origin airport. */
  origin_terminal: string | null;

  /** Terminal at the destination airport. */
  destination_terminal: string | null;

  /** Departure date and time (ISO format). */
  departing_at: string;

  /** Arrival date and time (ISO format). */
  arriving_at: string;

  /** Segment duration (ISO 8601 format). */
  duration: string;

  /** Segment distance in kilometers. */
  distance: string | null;

  /** Origin airport details. */
  origin: Airport;

  /** Destination airport details. */
  destination: Airport;

  /** Operating airline carrier information. */
  operating_carrier: Carrier;

  /** Marketing airline carrier information. */
  marketing_carrier: Carrier;

  /** Flight number assigned by operating carrier. */
  operating_carrier_flight_number: string;

  /** Flight number assigned by marketing carrier. */
  marketing_carrier_flight_number: string;

  /** List of intermediate stops, if any. */
  stops: unknown[];

  /** Passengers traveling in this segment. */
  passengers: SegmentPassenger[];

  /** Aircraft information, if available. */
  aircraft: unknown;

  /** Media resources for the segment (e.g., photos). */
  media: unknown[];
}

export interface SegmentPassenger {
  /** Passenger identifier. */
  passenger_id: string;

  /** Fare basis code assigned to the passenger. */
  fare_basis_code: string;

  /** Cabin class (e.g., economy). */
  cabin_class: string;

  /** Marketing name of the cabin class. */
  cabin_class_marketing_name: string;

  /** Cabin details and amenities. */
  cabin: Cabin;

  /** Baggage details for the passenger. */
  baggages: Baggage[];
}

export interface Cabin {
  /** Internal name for the cabin. */
  name: string;

  /** Marketing-friendly name for the cabin. */
  marketing_name: string;

  /** Amenities available in the cabin. */
  amenities: {
    /** Wi-Fi availability and cost. */
    wifi: { available: boolean; cost: string };

    /** Power availability. */
    power: { available: boolean };

    /** Seat-related features. */
    seat: {
      pitch: string;
      legroom: string;
      type: string | null;
    };
  };
}

export interface Baggage {
  /** Type of baggage: checked or carry-on. */
  type: "checked" | "carry_on";

  /** Quantity allowed for the passenger. */
  quantity: number;
}

export interface Carrier {
  /** Unique identifier of the carrier. */
  id: string;

  /** Name of the carrier. */
  name: string;

  /** IATA carrier code. */
  iata_code: string;

  /** URL to the carrier's logo symbol. */
  logo_symbol_url: string;

  /** URL to the carrier's logo lockup. */
  logo_lockup_url: string | null;

  /** URL to conditions of carriage. */
  conditions_of_carriage_url: string;
}

export interface Airport {
  /** Unique airport ID. */
  id: string;

  /** Name of the airport. */
  name: string;

  /** IATA code of the airport. */
  iata_code: string;

  /** IATA city code. */
  iata_city_code: string;

  /** IATA country code. */
  iata_country_code: string;

  /** City name of the airport. */
  city_name: string | null;

  /** Latitude of the airport. */
  latitude: number;

  /** Longitude of the airport. */
  longitude: number;

  /** ICAO code of the airport. */
  icao_code: string | null;

  /** Type of location (always "airport"). */
  type: "airport";

  /** Time zone of the airport. */
  time_zone: string;

  /** City details the airport belongs to. */
  city: {
    /** Unique city ID. */
    id: string;

    /** City name. */
    name: string;

    /** IATA city code. */
    iata_code: string;

    /** IATA city code. */
    iata_city_code: string;

    /** IATA country code. */
    iata_country_code: string;

    /** Type of location (always "city"). */
    type: "city";

    /** Latitude of the city (if available). */
    latitude: number | null;

    /** Longitude of the city (if available). */
    longitude: number | null;

    /** ICAO code of the city (if available). */
    icao_code: string | null;

    /** Alternative city name. */
    city_name: string | null;

    /** Time zone of the city. */
    time_zone: string | null;
  } | null;
}
