import {
  Airport,
  Carrier,
  FlightOffer,
  OfferSlice,
  SegmentPassenger,
  SliceSegment,
} from "@/utils/types/flight";
import { HotelOption } from "@/utils/types/hotels";

export const DEFAULT_LOCATION: Airport = {
  id: "",
  name: "",
  iata_code: "",
  iata_city_code: "",
  iata_country_code: "",
  city_name: "",
  latitude: 0,
  longitude: 0,
  icao_code: "",
  type: "airport",
  time_zone: "",
  city: {
    id: "",
    name: "",
    iata_code: "",
    iata_city_code: "",
    iata_country_code: "",
    type: "city",
    latitude: null,
    longitude: null,
    icao_code: null,
    city_name: null,
    time_zone: null,
  },
};

export const DEFAULT_CARRIER: Carrier = {
  id: "",
  name: "",
  iata_code: "",
  logo_symbol_url: "",
  logo_lockup_url: "",
  conditions_of_carriage_url: "",
};

export const DEFAULT_PASSENGER: SegmentPassenger = {
  passenger_id: "",
  fare_basis_code: "",
  cabin_class: "",
  cabin_class_marketing_name: "",
  cabin: {
    name: "",
    marketing_name: "",
    amenities: {
      wifi: { available: false, cost: "" },
      power: { available: false },
      seat: { pitch: "", legroom: "", type: null },
    },
  },
  baggages: [],
};

export const DEFAULT_SEGMENT: SliceSegment = {
  id: "",
  origin_terminal: "",
  destination_terminal: "",
  departing_at: "",
  arriving_at: "",
  duration: "",
  distance: "",
  operating_carrier_flight_number: "",
  marketing_carrier_flight_number: "",
  aircraft: "",
  stops: [],
  media: [],
  passengers: [],
  origin: DEFAULT_LOCATION,
  destination: DEFAULT_LOCATION,
  operating_carrier: DEFAULT_CARRIER,
  marketing_carrier: DEFAULT_CARRIER,
};

export const DEFAULT_SLICE: OfferSlice = {
  id: "",
  comparison_key: "",
  ngs_shelf: 0,
  origin_type: "",
  destination_type: "",
  fare_brand_name: "",
  duration: "",
  segments: [],
  origin: DEFAULT_LOCATION,
  destination: DEFAULT_LOCATION,
  conditions: {
    priority_check_in: false,
    priority_boarding: false,
    advance_seat_selection: false,
    change_before_departure: null,
  },
};

export const DEFAULT_FLIGHT_OFFER: FlightOffer = {
  id: "",
  total_emissions_kg: 0,
  total_amount: "0",
  total_currency: "USD",
  base_amount: "0",
  base_currency: "USD",
  tax_amount: "0",
  tax_currency: "USD",
  created_at: "",
  updated_at: "",
  expires_at: "",
  live_mode: false,
  partial: false,
  passenger_identity_documents_required: false,
  slices: [],
  passengers: [],
  owner: DEFAULT_CARRIER,
  conditions: {
    change_before_departure: {
      allowed: false,
      penalty_currency: "USD",
      penalty_amount: "0",
    },
    refund_before_departure: {
      allowed: false,
      penalty_currency: "USD",
      penalty_amount: "0",
    },
  },
  payment_requirements: {
    requires_instant_payment: false,
    price_guarantee_expires_at: "",
    payment_required_by: "",
  },
  available_services: [],
  supported_passenger_identity_document_types: [],
  supported_loyalty_programmes: [],
  private_fares: [],
};

export const DEFAULT_HOTEL_ACCOMMODATION: HotelOption["accommodation"] = {
  id: "",
  name: "Unknown Hotel",
  description: "",
  review_score: null,
  rating: null,
  payment_instruction_supported: false,
  check_in_information: {},
  supported_loyalty_programme: null,
  photos: [],
  ratings: [],
  key_collection: null,
  amenities: [],
  rooms: [],
  brand: null,
  chain: null,
  phone_number: null,
  email: null,
  location: {
    geographic_coordinates: { latitude: 0, longitude: 0 },
    address: {
      line_one: "",
      city_name: "Unknown",
      postal_code: "",
      country_code: "US",
      region: null,
    },
  },
};

export const DEFAULT_HOTEL_OPTION: HotelOption = {
  id: "",
  check_in_date: "",
  check_out_date: "",
  rooms: 1,
  guests: [{ type: "adult" }],
  cheapest_rate_total_amount: "0",
  cheapest_rate_currency: "USD",
  cheapest_rate_public_amount: null,
  cheapest_rate_public_currency: null,
  accommodation: DEFAULT_HOTEL_ACCOMMODATION,
};
