/* eslint-disable @typescript-eslint/no-explicit-any */
import { CheckoutFormData } from "@/store/checkout/checkout.store";
import { updateItinerary } from "@/utils/api/itinerary";
import { FlightOffer, OfferPassenger, OfferSlice } from "@/utils/types/flight";
import { HotelOption, Rate, Room } from "@/utils/types/hotels";
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export enum ItineraryType {
  Flight = "flight",
  Hotel = "hotel",
}

export type PaymentStatus = {
  payment_status?: "PENDING" | "PAID" | "FAILED" | "CANCELLED" | "REFUNDED";
  payment_intent_id?: string;
  paid_at?: string;
};

export type ItineraryFlightData = {
  outbound: {
    airline: string;
    cabin_class: string;
    layovers: number;
    slice: OfferSlice;
    tax_amount: string;
    tax_currency: string;
    date: string;
  };
  return: {
    airline: string;
    cabin_class: string;
    layovers: number;
    slice: OfferSlice;
    tax_amount: string;
    tax_currency: string;
    date: string;
  } | null;
  // Store original passenger IDs from the offer for booking
  passengers: OfferPassenger[];
} & PaymentStatus;

export type ItineraryHotelData = {
  id: string;
  name: string;
  rating: number;
  reviewScore: number | null;
  location: {
    city: string;
    country: string;
    address: string;
  };
  checkIn: string;
  checkOut: string;
  nights: number;
  room: {
    name: string;
    bedInfo: string;
    photos: string[];
  };
  rate: {
    id: string;
    boardType: string;
    totalAmount: string;
    currency: string;
    taxAmount: string;
    cancellationPolicy: string;
    breakfastIncluded: boolean;
  };
  photos: string[];
} & PaymentStatus;

export type ItineraryBase = {
  id: string;
  price: string;
  isSelected?: boolean;
  isExpanded?: boolean;
  date: string;
  tax_amount: string;
  tax_currency: string;
  // Duffel-specific IDs for booking
  duffel_offer_id?: string; // For flights
  duffel_quote_id?: string; // For hotels
  // Duffel booking confirmation IDs (set after successful booking)
  duffel_order_id?: string; // For flights (starts with "ord_")
  duffel_booking_id?: string; // For hotels (starts with "bok_")
  // Complete booking data from Duffel API response
  booking_data?: any; // Store the entire booking response data
  // Cancellation information
  cancelled_at?: string; // ISO timestamp when component was cancelled
  cancellation_reason?: string; // Optional reason for cancellation
};

export interface ItineraryFlight extends ItineraryBase {
  type: ItineraryType.Flight;
  data: ItineraryFlightData;
}

export interface ItineraryHotel extends ItineraryBase {
  type: ItineraryType.Hotel;
  data: ItineraryHotelData;
}

export type Itinerary = ItineraryFlight | ItineraryHotel;

// Helper functions
export const isItineraryCancelled = (item: Itinerary): boolean => {
  return !!item.cancelled_at;
};

export const getItineraryCancellationInfo = (item: Itinerary) => {
  if (!item.cancelled_at) return null;

  return {
    cancelledAt: new Date(item.cancelled_at),
    reason: item.cancellation_reason,
    formattedDate: new Date(item.cancelled_at).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
};

type ItineraryStore = {
  /** Currently selected flight ID (offer.id). */
  choosedFlight: string | null;

  /** Currently selected hotel ID. */
  choosedHotel: string | null;

  /** List of items in the itinerary. */
  itinerary: Itinerary[];

  /** Current chat ID for persistence key. */
  currentChatId: string | null;

  /** Passenger count for consistent calculations. */
  passengerCount: number;

  /** Add a single flight itinerary. */
  addFlightItinerary: (itinerary: Itinerary) => void;

  /** Replace all flight-type itineraries with new entries. */
  addFlightItineraries: (itineraries: Itinerary[]) => void;

  /** Add a single hotel itinerary. */
  addHotelItinerary: (itinerary: Itinerary) => void;

  /** Mark selected flight by ID. */
  setChoosedFlight: (id: string) => void;

  /** Mark selected hotel by ID. */
  setChoosedHotel: (id: string) => void;

  /** Remove an item from the itinerary by ID. */
  removeItineraryItem: (id: string) => void;

  /** Toggle selected state of an item. */
  toggleItemSelection: (id: string) => void;

  /** Toggle expanded state of an item. */
  toggleItemExpanded: (id: string) => void;

  /** Set expanded state of an item. */
  setItemExpanded: (id: string, expanded: boolean) => void;

  /** Set itinerary and persist if chat ID is set. */
  setItinerary: (itinerary: Itinerary[]) => void;

  /** Mark itinerary as paid. */
  markItineraryAsPaid: (paymentIntentId: string) => void;

  /** Mark itinerary as paid and persist to database. */
  markItineraryAsPaidAndPersist: (
    paymentIntentId: string,
    itineraryId: number,
    passengerData?: CheckoutFormData
  ) => Promise<void>;

  /** Check if current itinerary is paid. */
  isItineraryPaid: () => boolean;

  /** Initialize store with chat context. */
  initializeForChat: (chatId: string, passengerCount: number) => void;

  /** Update passenger count. */
  setPassengerCount: (count: number) => void;

  /** Update booking IDs after successful Duffel booking. */
  updateBookingIds: (
    itineraryId: string,
    orderId?: string,
    bookingId?: string
  ) => void;

  /** Update booking data after successful Duffel booking. */
  updateBookingData: (
    itineraryId: string,
    bookingData: any,
    orderId?: string,
    bookingId?: string
  ) => void;

  /** Persist booking data to database after booking completion. */
  persistBookingData: (itineraryId: number) => Promise<void>;

  /** Mark an itinerary item as cancelled. */
  markItemAsCancelled: (itemId: string, cancellationReason?: string) => void;

  /** Mark an itinerary item as cancelled and persist to database. */
  markItemAsCancelledAndPersist: (
    itemId: string,
    itineraryId: number,
    cancellationReason?: string
  ) => Promise<void>;

  /** Mark an itinerary item as cancelled and persist to database using existing itinerary data. */
  markItemAsCancelledWithData: (
    itemId: string,
    itineraryId: number,
    existingItinerary: Itinerary[],
    travelersCount: number,
    cancellationReason?: string
  ) => Promise<void>;

  /** Save current state to localStorage. */
  saveToStorage: () => void;

  /** Load state from localStorage. */
  loadFromStorage: (chatId: string) => void;

  /** Clear stored data for a chat. */
  clearStorage: (chatId?: string) => void;
};

// Storage helpers
const STORAGE_KEY_PREFIX = "hayo-itinerary";
const PASSENGER_COUNT_KEY_PREFIX = "hayo-passenger-count";

const getStorageKey = (chatId: string) => `${STORAGE_KEY_PREFIX}-${chatId}`;
const getPassengerCountKey = (chatId: string) =>
  `${PASSENGER_COUNT_KEY_PREFIX}-${chatId}`;

interface PersistedItineraryState {
  itinerary: Itinerary[];
  choosedFlight: string | null;
  choosedHotel: string | null;
  passengerCount: number;
  timestamp: number;
}

const saveToLocalStorage = (chatId: string, state: PersistedItineraryState) => {
  try {
    const storageData = {
      ...state,
      timestamp: Date.now(),
    };
    localStorage.setItem(getStorageKey(chatId), JSON.stringify(storageData));
    localStorage.setItem(
      getPassengerCountKey(chatId),
      state.passengerCount.toString()
    );
    console.log(
      `🗄️ PERSISTENCE: Saved itinerary state for chat ${chatId}:`,
      storageData
    );
  } catch (error) {
    console.error("Failed to save itinerary state to localStorage:", error);
  }
};

const loadFromLocalStorage = (
  chatId: string
): Partial<PersistedItineraryState> | null => {
  try {
    const stored = localStorage.getItem(getStorageKey(chatId));
    if (!stored) return null;

    const data = JSON.parse(stored);

    // Expire after 24 hours to prevent stale data
    const maxAge = 24 * 60 * 60 * 1000;
    if (data.timestamp && Date.now() - data.timestamp > maxAge) {
      localStorage.removeItem(getStorageKey(chatId));
      localStorage.removeItem(getPassengerCountKey(chatId));
      return null;
    }

    console.log(
      `🗄️ PERSISTENCE: Loaded itinerary state for chat ${chatId}:`,
      data
    );
    return {
      itinerary: data.itinerary || [],
      choosedFlight: data.choosedFlight || null,
      choosedHotel: data.choosedHotel || null,
      passengerCount: data.passengerCount || 1,
    };
  } catch (error) {
    console.error("Failed to load itinerary state from localStorage:", error);
    return null;
  }
};

const clearLocalStorage = (chatId: string) => {
  try {
    localStorage.removeItem(getStorageKey(chatId));
    localStorage.removeItem(getPassengerCountKey(chatId));
    console.log(`🗄️ PERSISTENCE: Cleared storage for chat ${chatId}`);
  } catch (error) {
    console.error("Failed to clear itinerary storage:", error);
  }
};

// Cleanup function for stale localStorage data
export const cleanupStaleItineraryData = () => {
  try {
    const keys = Object.keys(localStorage);
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    let cleanedCount = 0;

    keys.forEach((key) => {
      if (
        key.startsWith(STORAGE_KEY_PREFIX) ||
        key.startsWith(PASSENGER_COUNT_KEY_PREFIX)
      ) {
        try {
          if (key.startsWith(STORAGE_KEY_PREFIX)) {
            const data = JSON.parse(localStorage.getItem(key) || "{}");
            if (data.timestamp && Date.now() - data.timestamp > maxAge) {
              localStorage.removeItem(key);
              // Also remove associated passenger count
              const chatId = key.replace(STORAGE_KEY_PREFIX + "-", "");
              localStorage.removeItem(getPassengerCountKey(chatId));
              cleanedCount++;
              console.log(
                `🧹 CLEANUP: Removed stale itinerary data for key: ${key}`
              );
            }
          }
        } catch {
          // If we can't parse the data, it's corrupted - remove it
          localStorage.removeItem(key);
          cleanedCount++;
          console.log(`🧹 CLEANUP: Removed corrupted data for key: ${key}`);
        }
      }
    });

    if (cleanedCount > 0) {
      console.log(
        `🧹 CLEANUP: Cleaned up ${cleanedCount} stale itinerary entries`
      );
    }
  } catch (error) {
    console.error("Failed to cleanup stale itinerary data:", error);
  }
};

export const useItineraryStore = create<ItineraryStore>()(
  subscribeWithSelector((set, get) => ({
    choosedFlight: null,
    choosedHotel: null,
    itinerary: [],
    currentChatId: null,
    passengerCount: 1,
    // New persistence methods
    initializeForChat: (chatId: string, passengerCount: number) => {
      console.log(
        `🗄️ PERSISTENCE: Initializing itinerary store for chat ${chatId} with ${passengerCount} passengers`
      );
      set({ currentChatId: chatId });

      // Load from storage first
      get().loadFromStorage(chatId);

      // Then update passenger count from chat data (overrides stored value)
      const currentState = get();
      if (currentState.passengerCount !== passengerCount) {
        console.log(
          `🗄️ PERSISTENCE: Updating passenger count from ${currentState.passengerCount} to ${passengerCount} based on chat data`
        );
        set({ passengerCount });
        get().saveToStorage();
      }
    },

    setPassengerCount: (count: number) => {
      set({ passengerCount: count });
      get().saveToStorage();
    },

    saveToStorage: () => {
      const state = get();
      if (state.currentChatId) {
        saveToLocalStorage(state.currentChatId, {
          itinerary: state.itinerary,
          choosedFlight: state.choosedFlight,
          choosedHotel: state.choosedHotel,
          passengerCount: state.passengerCount,
          timestamp: Date.now(),
        });
      }
    },

    loadFromStorage: (chatId: string) => {
      const savedState = loadFromLocalStorage(chatId);
      if (savedState) {
        set((state) => ({
          ...state,
          ...savedState,
          currentChatId: chatId,
        }));
      }
    },

    clearStorage: (chatId?: string) => {
      const targetChatId = chatId || get().currentChatId;
      if (targetChatId) {
        clearLocalStorage(targetChatId);
      }
    },

    setItinerary: (itinerary: Itinerary[]) => {
      set(() => ({ itinerary }));
      get().saveToStorage();
    },

    addFlightItinerary: (itinerary: Itinerary) => {
      set((state) => {
        const filtered = state.itinerary.filter(
          (i) => i.type !== ItineraryType.Flight
        );
        return {
          itinerary: [...filtered, itinerary],
        };
      });
      get().saveToStorage();
    },

    addFlightItineraries: (itineraries: Itinerary[]) => {
      set((state) => {
        const filtered = state.itinerary.filter(
          (i) => i.type !== ItineraryType.Flight
        );
        return {
          itinerary: [...filtered, ...itineraries],
        };
      });
      get().saveToStorage();
    },

    addHotelItinerary: (itinerary: Itinerary) => {
      console.log("🏨 STORE: addHotelItinerary called with:", itinerary);
      set((state) => {
        console.log(
          "🏨 STORE: Current state before adding hotel:",
          state.itinerary
        );
        const filtered = state.itinerary.filter(
          (i) => i.type !== ItineraryType.Hotel
        );
        console.log(
          "🏨 STORE: Filtered itinerary (removed existing hotels):",
          filtered
        );
        const newItinerary = [...filtered, itinerary];
        console.log(
          "🏨 STORE: New itinerary after adding hotel:",
          newItinerary
        );
        return {
          itinerary: newItinerary,
        };
      });
      get().saveToStorage();
    },

    setChoosedFlight: (id: string) => {
      set(() => ({ choosedFlight: id }));
      get().saveToStorage();
    },

    setChoosedHotel: (id: string) => {
      set(() => ({ choosedHotel: id }));
      get().saveToStorage();
    },

    removeItineraryItem: (id: string) => {
      set((state) => ({
        itinerary: state.itinerary.filter((item) => item.id !== id),
      }));
      get().saveToStorage();
    },

    toggleItemSelection: (id: string) => {
      set((state) => ({
        itinerary: state.itinerary.map((item) =>
          item.id === id ? { ...item, isSelected: !item.isSelected } : item
        ),
      }));
      get().saveToStorage();
    },

    toggleItemExpanded: (id: string) => {
      set((state) => ({
        itinerary: state.itinerary.map((item) =>
          item.id === id ? { ...item, isExpanded: !item.isExpanded } : item
        ),
      }));
      // get().saveToStorage();
    },

    setItemExpanded: (id: string, expanded: boolean) => {
      set((state) => ({
        itinerary: state.itinerary.map((item) =>
          item.id === id ? { ...item, isExpanded: expanded } : item
        ),
      }));
      // get().saveToStorage();
    },

    markItineraryAsPaid: (paymentIntentId: string) => {
      const currentTime = new Date().toISOString();
      set((state) => ({
        itinerary: state.itinerary.map(
          (item) =>
            ({
              ...item,
              data: {
                ...item.data,
                payment_status: "PAID" as const,
                payment_intent_id: paymentIntentId,
                paid_at: currentTime,
              },
            } as any)
        ),
      }));
      get().saveToStorage();
      console.log(
        "💳 ITINERARY: Marked all items as paid with payment intent:",
        paymentIntentId
      );
    },

    markItineraryAsPaidAndPersist: async (
      paymentIntentId: string,
      itineraryId: number,
      passengerData?: CheckoutFormData
    ) => {
      // First update local state
      get().markItineraryAsPaid(paymentIntentId);

      try {
        // Then persist to database
        const state = get();
        const currentTime = new Date().toISOString();
        const updatedItineraryData = {
          itinerary_data: {
            itinerary: state.itinerary,
            travelers_count: state.passengerCount,
            passenger_details: passengerData?.passengers || null,
          },
          // Also update top-level payment status
          payment_status: "PAID" as const,
          payment_intent_id: paymentIntentId,
          paid_at: currentTime,
          booking_confirmation_data: null,
        };

        await updateItinerary({
          itinerary: updatedItineraryData as any, // Cast to any since payment fields aren't in SendItineraryBody interface
          itinerary_id: itineraryId,
        });

        console.log(
          "✅ Payment status and passenger data persisted to database"
        );
      } catch (error) {
        console.error("❌ Failed to persist payment status:", error);
        // Could potentially revert local state here, but keeping it for now
        // since the payment was successful even if DB update failed
        throw error;
      }
    },

    isItineraryPaid: () => {
      const state = get();
      return (
        state.itinerary.length > 0 &&
        state.itinerary.every((item) => item.data.payment_status === "PAID")
      );
    },

    updateBookingIds: (
      itineraryId: string,
      orderId?: string,
      bookingId?: string
    ) => {
      set((state) => ({
        itinerary: state.itinerary.map((item) =>
          item.id === itineraryId
            ? {
                ...item,
                duffel_order_id: orderId || item.duffel_order_id,
                duffel_booking_id: bookingId || item.duffel_booking_id,
              }
            : item
        ),
      }));
      get().saveToStorage();
      console.log(
        `📝 BOOKING ID UPDATE: Updated itinerary ${itineraryId} with orderId: ${orderId}, bookingId: ${bookingId}`
      );
    },

    updateBookingData: (
      itineraryId: string,
      bookingData: any,
      orderId?: string,
      bookingId?: string
    ) => {
      set((state) => ({
        itinerary: state.itinerary.map((item) =>
          item.id === itineraryId
            ? {
                ...item,
                booking_data: bookingData,
                duffel_order_id: orderId || item.duffel_order_id,
                duffel_booking_id: bookingId || item.duffel_booking_id,
              }
            : item
        ),
      }));
      get().saveToStorage();
      console.log(
        `📝 BOOKING DATA UPDATE: Updated itinerary ${itineraryId} with complete booking data and IDs - orderId: ${orderId}, bookingId: ${bookingId}`
      );
    },

    persistBookingData: async (itineraryId: number) => {
      try {
        const state = get();
        const updatedItineraryData = {
          itinerary_data: {
            itinerary: state.itinerary,
            travelers_count: state.passengerCount,
          },
          booking_confirmation_data: {
            flight_bookings: state.itinerary
              .filter(
                (item) =>
                  item.type === ItineraryType.Flight && item.booking_data
              )
              .map((item) => item.booking_data),
            hotel_bookings: state.itinerary
              .filter(
                (item) => item.type === ItineraryType.Hotel && item.booking_data
              )
              .map((item) => item.booking_data),
          },
        };

        await updateItinerary({
          itinerary: updatedItineraryData as any,
          itinerary_id: itineraryId,
        });

        console.log("✅ Booking data persisted to database");
      } catch (error) {
        console.error("❌ Failed to persist booking data:", error);
        throw error;
      }
    },

    markItemAsCancelled: (itemId: string, cancellationReason?: string) => {
      const currentTime = new Date().toISOString();
      set((state) => ({
        itinerary: state.itinerary.map((item) =>
          item.id === itemId
            ? {
                ...item,
                cancelled_at: currentTime,
                cancellation_reason: cancellationReason,
              }
            : item
        ),
      }));
      get().saveToStorage();
      console.log(
        `🚫 CANCELLATION: Marked item ${itemId} as cancelled at ${currentTime}`
      );
    },

    markItemAsCancelledAndPersist: async (
      itemId: string,
      itineraryId: number,
      cancellationReason?: string
    ) => {
      // First update local state
      get().markItemAsCancelled(itemId, cancellationReason);

      try {
        // Then persist to database
        const state = get();
        const updatedItineraryData = {
          itinerary_data: {
            itinerary: state.itinerary,
            travelers_count: state.passengerCount,
          },
        };

        await updateItinerary({
          itinerary: updatedItineraryData as any,
          itinerary_id: itineraryId,
        });

        console.log("✅ Cancellation status persisted to database");
      } catch (error) {
        console.error("❌ Failed to persist cancellation status:", error);
        // Could potentially revert local state here, but keeping it for now
        // since the cancellation was successful even if DB update failed
        throw error;
      }
    },

    markItemAsCancelledWithData: async (
      itemId: string,
      itineraryId: number,
      existingItinerary: Itinerary[],
      travelersCount: number,
      cancellationReason?: string
    ) => {
      try {
        // Create updated itinerary with cancelled item
        const currentTime = new Date().toISOString();
        const updatedItinerary = existingItinerary.map((item) =>
          item.id === itemId
            ? {
                ...item,
                cancelled_at: currentTime,
                cancellation_reason: cancellationReason,
              }
            : item
        );

        const updatedItineraryData = {
          itinerary_data: {
            itinerary: updatedItinerary,
            travelers_count: travelersCount,
          },
        };

        await updateItinerary({
          itinerary: updatedItineraryData as any,
          itinerary_id: itineraryId,
        });

        console.log(
          `✅ Cancellation status persisted to database for item ${itemId}`
        );
      } catch (error) {
        console.error("❌ Failed to persist cancellation status:", error);
        throw error;
      }
    },
  }))
);

export const createFlightItinerary = (
  offer: FlightOffer,
  searchPassengers?: any[],
  fallbackPassengerCount?: number
): ItineraryFlight => {
  console.log("createFlightItinerary - offer.id:", offer.id);
  console.log("createFlightItinerary - searchPassengers:", searchPassengers);
  console.log("createFlightItinerary - offer.passengers:", offer.passengers);
  console.log(
    "createFlightItinerary - fallbackPassengerCount:",
    fallbackPassengerCount
  );

  const cabin_class =
    offer.slices[0]?.segments[0]?.passengers[0]?.cabin_class_marketing_name ||
    "";
  const airline = offer.owner.name;

  const outbound_slice = offer.slices[0];
  const return_slice = offer.slices[1] || null;

  const outbound = {
    airline,
    cabin_class,
    layovers: outbound_slice.segments.length - 1,
    slice: outbound_slice,
    tax_amount: offer.tax_amount,
    tax_currency: offer.tax_currency,
    date: outbound_slice.segments[0].departing_at,
  };

  const returnFlight = return_slice
    ? {
        airline,
        cabin_class,
        layovers: return_slice.segments.length - 1,
        slice: return_slice,
        tax_amount: offer.tax_amount,
        tax_currency: offer.tax_currency,
        date: return_slice.segments[0].departing_at,
      }
    : null;

  // Ensure we have passenger data with proper fallback hierarchy
  let passengers = searchPassengers || offer.passengers || [];

  // If we still don't have passengers, create minimal passenger data based on count
  if (
    passengers.length === 0 &&
    fallbackPassengerCount &&
    fallbackPassengerCount > 0
  ) {
    console.log(
      `⚠️ PASSENGERS: Creating ${fallbackPassengerCount} minimal passenger entries as fallback`
    );
    passengers = Array.from({ length: fallbackPassengerCount }, (_, index) => ({
      id: `passenger-${index + 1}`,
      type: "adult",
      age: 30,
      given_name: "",
      family_name: "",
    }));
  }

  console.log("createFlightItinerary - final passengers:", passengers);

  return {
    id: offer.id,
    type: ItineraryType.Flight,
    data: {
      outbound,
      return: returnFlight,
      passengers,
    },
    price: offer.total_amount,
    isSelected: true,
    date: outbound_slice.segments[0].departing_at,
    tax_amount: offer.tax_amount,
    tax_currency: offer.tax_currency,
    duffel_offer_id: offer.id,
  };
};

export const createHotelItinerary = (
  hotelOption: HotelOption,
  selectedRate: Rate,
  selectedRoom: Room
): ItineraryHotel => {
  const checkInDate = new Date(hotelOption.check_in_date);
  const checkOutDate = new Date(hotelOption.check_out_date);
  const nights = Math.ceil(
    (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Format bed information
  const bedInfo =
    selectedRoom.beds.length > 0
      ? selectedRoom.beds.map((bed) => `${bed.count} ${bed.type}`).join(", ")
      : "TDA";

  // Determine cancellation policy
  const cancellationPolicy =
    selectedRate.cancellation_timeline &&
    selectedRate.cancellation_timeline.length > 0
      ? `Free cancellation until ${new Date(
          selectedRate.cancellation_timeline[0].before
        ).toLocaleDateString()}`
      : "Non-refundable";

  // Check if breakfast is included
  const breakfastIncluded = selectedRate.board_type.includes("breakfast");

  const hotelData: ItineraryHotelData = {
    id: hotelOption.id,
    name: hotelOption.accommodation.name,
    rating: hotelOption.accommodation.rating || 4,
    reviewScore: hotelOption.accommodation.review_score,
    location: {
      city: hotelOption.accommodation.location.address.city_name,
      country: hotelOption.accommodation.location.address.country_code,
      address: hotelOption.accommodation.location.address.line_one,
    },
    checkIn: hotelOption.check_in_date,
    checkOut: hotelOption.check_out_date,
    nights,
    room: {
      name: selectedRoom.name,
      bedInfo,
      photos: selectedRoom.photos.map((photo) => photo.url),
    },
    rate: {
      id: selectedRate.id,
      boardType: selectedRate.board_type,
      totalAmount: selectedRate.total_amount,
      currency: selectedRate.total_currency,
      taxAmount: selectedRate.tax_amount,
      cancellationPolicy,
      breakfastIncluded,
    },
    photos: hotelOption.accommodation.photos.map((photo) => photo.url),
  };

  return {
    id: selectedRate.id, // Use the actual Duffel rate ID instead of generateUUID()
    type: ItineraryType.Hotel,
    data: hotelData,
    price: selectedRate.total_amount,
    isSelected: true,
    date: hotelOption.check_in_date,
    tax_amount: selectedRate.tax_amount,
    tax_currency: selectedRate.tax_currency,
    duffel_quote_id: selectedRate.id, // Store the Duffel rate/quote ID for booking
  };
};
