import { create } from "zustand";

export enum SectionMode {
  Map = "map",
  Itinerary = "itinerary",
  HotelDetails = "hotelDetails",
  SelectFlight = "selectFlight",
  SelectHotel = "selectHotel",
}

export type SplitState = {
  isRightPanelOpen: boolean;
  isFullWidth: boolean;
  sectionMode: SectionMode;
};

export type SplitActions = {
  setIsRightPanelOpen: (isRightPanelOpen: boolean) => void;
  setIsFullWidth: (isFullWidth: boolean) => void;
  setSectionMode: (sectionMode: SectionMode) => void;
  openSection: (sectionMode: SectionMode) => void;
};

export const defaultState: SplitState = {
  isRightPanelOpen: false,
  isFullWidth: false,
  sectionMode: SectionMode.Itinerary,
};

export type SplitStore = SplitState & SplitActions;

export const useSplitStore = create<SplitStore>()((set) => ({
  ...defaultState,
  setIsRightPanelOpen: (isRightPanelOpen) => set({ isRightPanelOpen }),
  setIsFullWidth: (isFullWidth) => set({ isFullWidth }),
  setSectionMode: (sectionMode) => set({ sectionMode }),
  openSection: (sectionMode: SectionMode) => {
    set({ sectionMode, isRightPanelOpen: true, isFullWidth: false });
  },
}));
