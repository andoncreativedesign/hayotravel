import { create } from "zustand";

export enum TravelWalletPanelMode {
  FlightDetails = "flightDetails",
  HotelDetails = "hotelDetails",
  Empty = "empty",
}

export type TravelWalletUIState = {
  selectedItineraryItemId: string | null;
  selectedFlightDirection: "outbound" | "return" | null;
  panelMode: TravelWalletPanelMode;
};

export type TravelWalletUIActions = {
  setSelectedItineraryItem: (itemId: string | null) => void;
  setPanelMode: (mode: TravelWalletPanelMode) => void;
  openItemDetails: (itemId: string, mode: TravelWalletPanelMode) => void;
  openFlightDetails: (itemId: string, direction: "outbound" | "return") => void;
  clearSelection: () => void;
};

export const defaultTravelWalletUIState: TravelWalletUIState = {
  selectedItineraryItemId: null,
  selectedFlightDirection: null,
  panelMode: TravelWalletPanelMode.Empty,
};

export type TravelWalletUIStore = TravelWalletUIState & TravelWalletUIActions;

export const useTravelWalletUIStore = create<TravelWalletUIStore>()((set) => ({
  ...defaultTravelWalletUIState,

  setSelectedItineraryItem: (itemId) =>
    set({ selectedItineraryItemId: itemId }),

  setPanelMode: (mode) => set({ panelMode: mode }),

  openItemDetails: (itemId: string, mode: TravelWalletPanelMode) => {
    set({
      selectedItineraryItemId: itemId,
      selectedFlightDirection: null,
      panelMode: mode,
    });
  },

  openFlightDetails: (itemId: string, direction: "outbound" | "return") => {
    set({
      selectedItineraryItemId: itemId,
      selectedFlightDirection: direction,
      panelMode: TravelWalletPanelMode.FlightDetails,
    });
  },

  clearSelection: () => {
    set({
      selectedItineraryItemId: null,
      selectedFlightDirection: null,
      panelMode: TravelWalletPanelMode.Empty,
    });
  },
}));
