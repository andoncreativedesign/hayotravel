import { FlightOffer } from "@/utils/types/flight";
import { HotelOption } from "@/utils/types/hotels";

export interface AnnotationReply {
  [key: string]: unknown;
}

export interface RetrieverResource {
  [key: string]: unknown;
}

export interface UsageMetrics {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
  total_price?: string;
  currency?: string;
  latency?: number;
  [key: string]: unknown;
}

export interface RawFlightOption {
  departure_date?: string;
  return_date?: string;
  departure_airport?: string;
  arrival_airport?: string;
  duration?: string;
  return_duration?: string;
  airline?: string;
  cabin_class?: string;
  price_usd?: string;
  layovers?: number;
  refundable?: boolean;
  changeable?: boolean;
  emissions_kg?: number;
  [key: string]: unknown;
}

export interface ToolInvocation {
  toolName: string;
  toolCallId?: string;
  state: string;
  result?: ToolResult;
}

export interface MessagePart {
  type: string;
  text?: string;
  toolInvocation?: ToolInvocation;
  state?: string;
  toolName?: string;
  result?: ToolResult;
  toolCallId?: string;
  [key: string]: unknown;
}

export interface ToolResult {
  options: FlightOffer[] | HotelOption[] | RawFlightOption[];
} 