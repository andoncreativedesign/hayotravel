import { HotelOption } from "@/utils/types/hotels";
import { fetchHotelRates } from "@/utils/services";
import { create } from "zustand";

export type HotelState = {
  hotel: HotelOption | null;
  isLoadingRates: boolean;
  hotelRates: { data: HotelOption } | null;
  ratesError: string | null;
};

export type HotelActions = {
  setHotel: (hotel: HotelOption) => void;
  fetchRates: (hotelId: string) => Promise<void>;
  clearRates: () => void;
};

export const defaultState: HotelState = {
  hotel: null,
  isLoadingRates: false,
  hotelRates: null,
  ratesError: null,
};

export type HotelStore = HotelState & HotelActions;

export const useHotelStore = create<HotelStore>()((set) => ({
  ...defaultState,
  setHotel: (hotel) => set({ hotel }),
  fetchRates: async (hotelId: string) => {
    set({ isLoadingRates: true, ratesError: null });
    
    try {
      const response = await fetchHotelRates(hotelId);
      
      if (response.status === 'success') {
        set({ hotelRates: response.data as { data: HotelOption } | null, isLoadingRates: false });
      } else {
        set({ 
          ratesError: response.message || 'Failed to fetch hotel rates',
          isLoadingRates: false 
        });
      }
    } catch {
      set({ 
        ratesError: 'Failed to fetch hotel rates',
        isLoadingRates: false 
      });
    }
  },
  clearRates: () => set({ hotelRates: null, ratesError: null, isLoadingRates: false })
}));
