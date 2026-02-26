/* eslint-disable @typescript-eslint/no-explicit-any */

import { FlightOffer } from "@/utils/types/flight";
import { HotelOption } from "@/utils/types/hotels";
import { MAX_SEGMENTS_PER_SLICE, MAX_SLICES } from "./constants";
import {
  DEFAULT_CARRIER,
  DEFAULT_FLIGHT_OFFER,
  DEFAULT_HOTEL_ACCOMMODATION,
  DEFAULT_HOTEL_OPTION,
  DEFAULT_LOCATION,
  DEFAULT_PASSENGER,
  DEFAULT_SEGMENT,
  DEFAULT_SLICE,
} from "./defaults";

export const createLocation = (flatOption: any, prefix: string) => ({
  ...DEFAULT_LOCATION,
  id: flatOption[`${prefix}.id`] || "",
  name: flatOption[`${prefix}.name`] || "",
  iata_code: flatOption[`${prefix}.iata_code`] || "",
  iata_city_code: flatOption[`${prefix}.iata_city_code`] || "",
  iata_country_code: flatOption[`${prefix}.iata_country_code`] || "",
  city_name: flatOption[`${prefix}.city_name`] || "",
  latitude: flatOption[`${prefix}.latitude`] || 0,
  longitude: flatOption[`${prefix}.longitude`] || 0,
  icao_code: flatOption[`${prefix}.icao_code`] || "",
  type: flatOption[`${prefix}.type`] || "",
  time_zone: flatOption[`${prefix}.time_zone`] || "",
  city: flatOption[`${prefix}.city`] || "",
});

export const createCarrier = (flatOption: any, prefix: string) => ({
  ...DEFAULT_CARRIER,
  id: flatOption[`${prefix}.id`] || "",
  name: flatOption[`${prefix}.name`] || "",
  iata_code: flatOption[`${prefix}.iata_code`] || "",
  logo_symbol_url: flatOption[`${prefix}.logo_symbol_url`] || "",
  logo_lockup_url: flatOption[`${prefix}.logo_lockup_url`] || "",
  conditions_of_carriage_url:
    flatOption[`${prefix}.conditions_of_carriage_url`] || "",
});

export const createBaggage = (
  flatOption: any,
  prefix: string,
  index: number
) => ({
  type: flatOption[`${prefix}.baggages.${index}.type`] || "",
  quantity: flatOption[`${prefix}.baggages.${index}.quantity`] || 0,
});

export const createPassenger = (flatOption: any, prefix: string) => {
  const baggage0 = createBaggage(flatOption, prefix, 0);
  const baggage1 = createBaggage(flatOption, prefix, 1);
  const baggages = [baggage0, baggage1].filter((bag) => bag.type);

  return {
    ...DEFAULT_PASSENGER,
    passenger_id: flatOption[`${prefix}.passenger_id`] || "",
    fare_basis_code: flatOption[`${prefix}.fare_basis_code`] || "",
    cabin_class: flatOption[`${prefix}.cabin_class`] || "",
    cabin_class_marketing_name:
      flatOption[`${prefix}.cabin_class_marketing_name`] || "",
    cabin: {
      name: flatOption[`${prefix}.cabin.name`] || "",
      marketing_name: flatOption[`${prefix}.cabin.marketing_name`] || "",
      amenities: flatOption[`${prefix}.cabin.amenities`] || "",
    },
    baggages,
  };
};

export const createSegment = (flatOption: any, segmentPrefix: string) => {
  const segment = {
    ...DEFAULT_SEGMENT,
    id: flatOption[`${segmentPrefix}.id`] || "",
    origin_terminal: flatOption[`${segmentPrefix}.origin_terminal`] || "",
    destination_terminal:
      flatOption[`${segmentPrefix}.destination_terminal`] || "",
    departing_at: flatOption[`${segmentPrefix}.departing_at`] || "",
    arriving_at: flatOption[`${segmentPrefix}.arriving_at`] || "",
    duration: flatOption[`${segmentPrefix}.duration`] || "",
    distance: flatOption[`${segmentPrefix}.distance`] || "",
    operating_carrier_flight_number:
      flatOption[`${segmentPrefix}.operating_carrier_flight_number`] || "",
    marketing_carrier_flight_number:
      flatOption[`${segmentPrefix}.marketing_carrier_flight_number`] || "",
    aircraft: flatOption[`${segmentPrefix}.aircraft`] || "",
    origin: createLocation(flatOption, `${segmentPrefix}.origin`),
    destination: createLocation(flatOption, `${segmentPrefix}.destination`),
    operating_carrier: createCarrier(
      flatOption,
      `${segmentPrefix}.operating_carrier`
    ),
    marketing_carrier: createCarrier(
      flatOption,
      `${segmentPrefix}.marketing_carrier`
    ),
  };

  if (flatOption[`${segmentPrefix}.passengers.0.passenger_id`]) {
    segment.passengers = [
      createPassenger(flatOption, `${segmentPrefix}.passengers.0`),
    ];
  }

  return segment;
};

export const createSlice = (flatOption: any, sliceIndex: number) => {
  const slicePrefix = `slices.${sliceIndex}`;

  if (!flatOption[`${slicePrefix}.id`]) {
    return null;
  }

  const slice = {
    ...DEFAULT_SLICE,
    id: flatOption[`${slicePrefix}.id`] || "",
    comparison_key: flatOption[`${slicePrefix}.comparison_key`] || "",
    ngs_shelf: flatOption[`${slicePrefix}.ngs_shelf`] || "",
    origin_type: flatOption[`${slicePrefix}.origin_type`] || "",
    destination_type: flatOption[`${slicePrefix}.destination_type`] || "",
    fare_brand_name: flatOption[`${slicePrefix}.fare_brand_name`] || "",
    duration: flatOption[`${slicePrefix}.duration`] || "",
    origin: createLocation(flatOption, `${slicePrefix}.origin`),
    destination: createLocation(flatOption, `${slicePrefix}.destination`),
    conditions: {
      priority_check_in:
        flatOption[`${slicePrefix}.conditions.priority_check_in`] || false,
      priority_boarding:
        flatOption[`${slicePrefix}.conditions.priority_boarding`] || false,
      advance_seat_selection:
        flatOption[`${slicePrefix}.conditions.advance_seat_selection`] || false,
      change_before_departure:
        flatOption[
          `${slicePrefix}.conditions.change_before_departure.allowed`
        ] !== undefined
          ? {
              allowed:
                flatOption[
                  `${slicePrefix}.conditions.change_before_departure.allowed`
                ] || false,
              penalty_currency:
                flatOption[
                  `${slicePrefix}.conditions.change_before_departure.penalty_currency`
                ] || "USD",
              penalty_amount:
                flatOption[
                  `${slicePrefix}.conditions.change_before_departure.penalty_amount`
                ] || "0",
            }
          : null,
    },
  };

  // Add segments
  const segments = [];
  for (
    let segmentIndex = 0;
    segmentIndex < MAX_SEGMENTS_PER_SLICE;
    segmentIndex++
  ) {
    const segmentPrefix = `${slicePrefix}.segments.${segmentIndex}`;
    if (flatOption[`${segmentPrefix}.id`]) {
      segments.push(createSegment(flatOption, segmentPrefix));
    }
  }
  slice.segments = segments;

  return slice;
};

export const transformFlattenedFlightData = (
  flattenedOptions: any[]
): FlightOffer[] => {
  return flattenedOptions.map((flatOption) => {
    const transformed = {
      ...DEFAULT_FLIGHT_OFFER,
      id: flatOption.id || "",
      total_emissions_kg: flatOption.total_emissions_kg || 0,
      total_amount: flatOption.total_amount || "0",
      total_currency: flatOption.total_currency || "USD",
      base_amount: flatOption.base_amount || "0",
      base_currency: flatOption.base_currency || "USD",
      tax_amount: flatOption.tax_amount || "0",
      tax_currency: flatOption.tax_currency || "USD",
      created_at: flatOption.created_at || "",
      updated_at: flatOption.updated_at || "",
      expires_at: flatOption.expires_at || "",
      live_mode: flatOption.live_mode || false,
      partial: flatOption.partial || false,
      passenger_identity_documents_required:
        flatOption.passenger_identity_documents_required || false,
      available_services: flatOption.available_services || [],
    };

    // Transform owner
    if (flatOption["owner.name"]) {
      transformed.owner = createCarrier(flatOption, "owner");
    }

    // Transform passengers
    if (flatOption["passengers.0.id"]) {
      transformed.passengers = [
        {
          id: flatOption["passengers.0.id"] || "",
          type: flatOption["passengers.0.type"] || "",
          fare_type: flatOption["passengers.0.fare_type"] || "",
          family_name: flatOption["passengers.0.family_name"] || "",
          given_name: flatOption["passengers.0.given_name"] || "",
          age: flatOption["passengers.0.age"] || 0,
          loyalty_programme_accounts: [],
        },
      ];
    }

    // Transform conditions
    if (
      flatOption["conditions.change_before_departure.allowed"] !== undefined
    ) {
      transformed.conditions = {
        change_before_departure: {
          allowed:
            flatOption["conditions.change_before_departure.allowed"] || false,
          penalty_currency:
            flatOption["conditions.change_before_departure.penalty_currency"] ||
            "USD",
          penalty_amount:
            flatOption["conditions.change_before_departure.penalty_amount"] ||
            "0",
        },
        refund_before_departure: {
          allowed:
            flatOption["conditions.refund_before_departure.allowed"] || false,
          penalty_currency:
            flatOption["conditions.refund_before_departure.penalty_currency"] ||
            "USD",
          penalty_amount:
            flatOption["conditions.refund_before_departure.penalty_amount"] ||
            "0",
        },
      };
    }

    // Transform payment requirements
    transformed.payment_requirements = {
      requires_instant_payment:
        flatOption["payment_requirements.requires_instant_payment"] || false,
      price_guarantee_expires_at:
        flatOption["payment_requirements.price_guarantee_expires_at"] || "",
      payment_required_by:
        flatOption["payment_requirements.payment_required_by"] || "",
    };

    // Transform slices
    const slices = [];
    for (let sliceIndex = 0; sliceIndex < MAX_SLICES; sliceIndex++) {
      const slice = createSlice(flatOption, sliceIndex);
      if (slice) {
        slices.push(slice);
      }
    }
    transformed.slices = slices;

    return transformed as FlightOffer;
  });
};

export const extractFlightDataFromWorkflow = (
  data: any
): { offers: FlightOffer[], passengers: any[] } | null => {
  if (!data?.observation) {
    console.log('No observation data found in workflow:', data);
    return null;
  }

  try {
    const parsedObservation = JSON.parse(data.observation);
    const offers = parsedObservation?.data?.offers;
    const passengers = parsedObservation?.data?.passengers || [];

    if (offers && Array.isArray(offers)) {
      console.log(`Successfully extracted ${offers.length} flight offers and ${passengers.length} passengers from workflow`);
      return { offers: offers as FlightOffer[], passengers };
    } else {
      console.log('No offers array found in parsed observation:', parsedObservation);
      return null;
    }
  } catch (error) {
    console.error("Error parsing flight observation data:", error);
    console.error("Raw observation:", data.observation);
    return null;
  }
};

export const extractHotelDataFromWorkflow = (
  data: any
): HotelOption[] | null => {
  if (!data?.observation) {
    console.log('No observation data found in hotel workflow:', data);
    return null;
  }

  try {
    const parsedObservation = JSON.parse(data.observation);
    if (
      !parsedObservation?.data?.results ||
      !Array.isArray(parsedObservation.data.results)
    ) {
      console.log('No results array found in hotel observation:', parsedObservation);
      return null;
    }

    console.log(`Successfully extracted ${parsedObservation.data.results.length} hotel options from workflow`);
    return parsedObservation.data.results.map((result: any) => ({
      ...DEFAULT_HOTEL_OPTION,
      id: result.id || "",
      check_in_date: result.check_in_date || "",
      check_out_date: result.check_out_date || "",
      cheapest_rate_total_amount: result.cheapest_rate_total_amount || "0",
      accommodation: result.accommodation
        ? {
            ...DEFAULT_HOTEL_ACCOMMODATION,
            ...result.accommodation,
            check_in_information:
              result.accommodation.check_in_information || {},
            rooms: result.accommodation.rooms || [],
          }
        : DEFAULT_HOTEL_ACCOMMODATION,
    }));
  } catch (error) {
    console.error("Error parsing hotel observation data:", error);
    console.error("Raw observation:", data.observation);
    return null;
  }
};

export const extractTextFromWorkflow = (options: any[]): string | null => {
  if (!options || !Array.isArray(options)) {
    console.log('extractTextFromWorkflow: No options array provided');
    return null;
  }

  console.log(`extractTextFromWorkflow: Processing ${options.length} workflow options`);

  // Look for the final answer step - check both action_name and action fields
  const finalAnswerStep = options.find(
    (option) => 
      option?.data?.action_name === "Final Answer" || 
      option?.data?.action === "Final Answer"
  );

  if (finalAnswerStep?.data?.action_input) {
    console.log('Found Final Answer step with action_input');
    return finalAnswerStep.data.action_input;
  }

  // Also check if any option has action_input directly without being a Final Answer
  const actionInputStep = options.find(
    (option) => 
      option?.data?.action_input && 
      typeof option.data.action_input === "string" &&
      option.data.action_input.length > 100 && // Substantial content
      !option.data.action_input.includes("search_flights") && // Not a tool call
      !option.data.action_input.includes("search_stays")
  );

  if (actionInputStep?.data?.action_input) {
    console.log('Found substantial action_input step');
    return actionInputStep.data.action_input;
  }

  // Look for any step with a thought that contains substantial content
  const thoughtStep = options.find(
    (option) => 
      option?.data?.thought && 
      option.data.thought.length > 50 && 
      !option.data.thought.includes("I am thinking about how to help you")
  );

  if (thoughtStep?.data?.thought) {
    console.log('Found substantial thought step');
    return thoughtStep.data.thought;
  }

  // If no final answer found, check for error patterns and provide fallback
  const hasErrors = options.some(
    (option) => 
      option?.data?.observation && 
      option.data.observation.includes("Error")
  );

  if (hasErrors) {
    console.log('Found error patterns in workflow options');
    return "I'm currently unable to access the search tools needed to find flight or hotel options. Please try again later or contact support for assistance.";
  }

  console.log('No text content found in workflow options');
  return null;
};
