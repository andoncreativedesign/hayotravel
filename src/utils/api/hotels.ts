import { HotelOption } from "../types/hotels";

// Note: This function is deprecated in favor of hotelService.ts which uses backend API routes
// Keeping for backward compatibility, but hotelService.fetchHotelRates should be used instead
export const fetchHotelRates = async (
  hotelId: string
): Promise<{ data: HotelOption }> => {
  console.warn(
    "Direct fetchHotelRates call detected. Consider using hotelService.fetchHotelRates instead."
  );

  const response = await fetch("/api/hotel-rates", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ hotelId }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result = await response.json();
  return { data: result.data };
};
