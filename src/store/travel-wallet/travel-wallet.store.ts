import {
  TravelWalletTrip,
  TravelWalletTripStatus,
  TravelWalletTripSummary,
} from "@/utils/types/travel-wallet";
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

/**
 * Travel Wallet Store State
 */
export type TravelWalletState = {
  /** All loaded trips */
  trips: TravelWalletTrip[];

  /** Currently selected trip (for detail view) */
  selectedTrip: TravelWalletTrip | null;
};

/**
 * Travel Wallet Store Actions
 */
export type TravelWalletActions = {
  /** Set trips data (from successful API response) */
  setTrips: (trips: TravelWalletTrip[]) => void;

  /** Add trips to existing list (for pagination) */
  addTrips: (trips: TravelWalletTrip[]) => void;

  /** Set the selected trip */
  setSelectedTrip: (trip: TravelWalletTrip | null) => void;

  /** Clear all data */
  clearData: () => void;

  /** Get upcoming trips */
  getUpcomingTrips: () => TravelWalletTripSummary[];

  /** Get past trips */
  getPastTrips: () => TravelWalletTripSummary[];

  /** Update a specific trip in the store */
  updateTrip: (tripId: string, updatedTrip: TravelWalletTrip) => void;
};

/**
 * Default state
 */
const defaultState: TravelWalletState = {
  trips: [],
  selectedTrip: null,
};

/**
 * Helper functions
 */
const getTripSummary = (trip: TravelWalletTrip): TravelWalletTripSummary => ({
  id: trip.id,
  title: trip.title,
  destination: trip.destination,
  startDate: trip.startDate,
  endDate: trip.endDate,
  status: trip.status,
  previewImage: trip.previewImage,
  totalCost: trip.cost.total,
  currency: trip.cost.currency,
  travelersCount: trip.travelersCount,
});

const isUpcoming = (trip: TravelWalletTrip): boolean => {
  const today = new Date();
  const startDate = new Date(trip.startDate);
  return startDate > today && trip.status === TravelWalletTripStatus.Upcoming;
};

const isPast = (trip: TravelWalletTrip): boolean => {
  const today = new Date();
  const endDate = new Date(trip.endDate);
  return endDate < today || trip.status === TravelWalletTripStatus.Past;
};

/**
 * Travel Wallet Store
 */
export const useTravelWalletStore = create<
  TravelWalletState & TravelWalletActions
>()(
  subscribeWithSelector((set, get) => ({
    ...defaultState,

    setTrips: (trips) => {
      set({ trips });
    },

    addTrips: (newTrips) => {
      set((state) => ({
        trips: [...state.trips, ...newTrips],
      }));
    },

    setSelectedTrip: (trip) => {
      set({ selectedTrip: trip });
    },

    clearData: () => {
      set(defaultState);
    },

    getUpcomingTrips: () => {
      const { trips } = get();
      return trips.filter(isUpcoming).map(getTripSummary);
    },

    getPastTrips: () => {
      const { trips } = get();
      return trips.filter(isPast).map(getTripSummary);
    },

    updateTrip: (tripId, updatedTrip) => {
      set((state) => ({
        trips: state.trips.map((trip) =>
          trip.id === tripId ? updatedTrip : trip
        ),
        selectedTrip:
          state.selectedTrip?.id === tripId ? updatedTrip : state.selectedTrip,
      }));
    },
  }))
);

/**
 * Selector hooks for convenience
 */
export const useTravelWalletTrips = () =>
  useTravelWalletStore((state) => state.trips || []);
export const useSelectedTrip = () =>
  useTravelWalletStore((state) => state.selectedTrip);
export const useUpcomingTrips = () =>
  useTravelWalletStore((state) => state.getUpcomingTrips());
export const usePastTrips = () =>
  useTravelWalletStore((state) => state.getPastTrips());
