export interface Room {
  beds: {
    type: string;
    count: number;
  }[];
  photos: {
    url: string;
  }[];
  rates: Rate[];
  name: string;
}

export interface Rate {
  id: string;
  code: string | null;

  total_currency: string;
  total_amount: string;

  base_currency: string;
  base_amount: string;

  tax_currency: string;
  tax_amount: string;

  fee_currency: string;
  fee_amount: string;

  public_currency: string;
  public_amount: string;

  due_at_accommodation_currency: string;
  due_at_accommodation_amount: string;

  payment_type: string; // e.g. "pay_now"
  payment_instruction_allowed: boolean;
  loyalty_programme_required: boolean;
  supported_loyalty_programme: string | null;
  available_payment_methods: string[];
  quantity_available: number;
  board_type: string; // e.g. "room_only"
  deal_types: string[];

  cancellation_timeline: {
    refund_amount: string;
    currency: string;
    before: string; // ISO datetime
  }[];

  conditions: {
    title: string;
    description: string;
  }[];

  source: string;
}

export interface HotelOption {
  id: string;
  check_in_date: string; // "YYYY-MM-DD"
  check_out_date: string; // "YYYY-MM-DD"
  rooms: number;
  guests: {
    age?: number | null;
    type: "adult" | "child" | string;
  }[];

  cheapest_rate_total_amount: string;
  cheapest_rate_currency: string;
  cheapest_rate_public_amount: string | null;
  cheapest_rate_public_currency: string | null;

  accommodation: {
    id: string;
    name: string;
    description: string;
    review_score: number | null;
    rating: number | null;

    payment_instruction_supported: boolean;
    check_in_information: {
      check_in_after_time?: string | null;
      check_in_before_time?: string | null;
      check_out_before_time?: string | null;
    } | null;

    supported_loyalty_programme: string | null;

    photos: { url: string }[];
    ratings: { source: string; value: number }[];

    key_collection: { instructions?: string } | null;

    amenities: { type: string; description: string }[];

    rooms: Room[];

    brand: { id: string; name: string } | null;
    chain: { name: string } | null;

    phone_number: string | null;
    email: string | null;

    location: {
      geographic_coordinates: { latitude: number; longitude: number };
      address: {
        line_one: string;
        city_name: string;
        postal_code: string;
        country_code: string;
        region: string | null;
      };
    };
  };
}

export interface HotelOptionsResponse {
  options: HotelOption[];
}
