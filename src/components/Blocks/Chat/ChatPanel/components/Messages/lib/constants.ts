export enum TOOL_NAMES {
  FLIGHT_OPTIONS = "flight_options",
  HOTEL_OPTIONS = "hotel_options",
}

export enum MESSAGE_TYPES {
  TEXT = "text",
  TOOL_INVOCATION = "tool-invocation",
  STEP_START = "step-start",
}

export enum STATES {
  RESULT = "result",
}

export const MAX_SEGMENTS_PER_SLICE = 3;
export const MAX_SLICES = 2;
