import { GetItineraryResponse, SendItineraryBody } from "../types/chat";
import { FastApiClient } from "@/lib/fastapi-client";
import { useAuthStore } from "@/store/auth/auth.store";

const getApiClient = (): FastApiClient => {
  const { apiClient } = useAuthStore.getState();
  
  if (!apiClient) {
    throw new Error('Authentication required. Please ensure you are signed in and try again.');
  }
  
  return apiClient;
};

export const getItinerary = async (
  chatId: number
): Promise<GetItineraryResponse[]> => {
  try {
    const apiClient = getApiClient();
    return await apiClient.get(`/itineraries/chat/${chatId}`);
  } catch (error) {
    console.error('Failed to fetch itinerary:', error);
    throw error;
  }
};

export const sendItinerary = async (
  itinerary: SendItineraryBody
): Promise<GetItineraryResponse> => {
  try {
    const apiClient = getApiClient();
    console.log('Sending itinerary with auth:', itinerary);
    return await apiClient.createItinerary(itinerary) as GetItineraryResponse;
  } catch (error) {
    console.error('Failed to send itinerary:', error);
    throw error;
  }
};

export const getItineraryById = async (
  itineraryId: number
): Promise<GetItineraryResponse> => {
  try {
    const apiClient = getApiClient();
    return await apiClient.getItinerary(itineraryId.toString()) as GetItineraryResponse;
  } catch (error) {
    console.error('Failed to fetch itinerary by ID:', error);
    throw error;
  }
};

export const getItineraryByClientId = async (
  clientId: string
): Promise<GetItineraryResponse> => {
  try {
    const apiClient = getApiClient();
    return await apiClient.getItineraryByClientId(clientId) as GetItineraryResponse;
  } catch (error) {
    console.error(`Failed to fetch itinerary for client ${clientId}:`, error);
    throw error;
  }
};

export const updateItinerary = async ({
  itinerary,
  itinerary_id,
}: {
  itinerary: Partial<SendItineraryBody>;
  itinerary_id: number;
}): Promise<GetItineraryResponse> => {
  try {
    const apiClient = getApiClient();
    return await apiClient.updateItinerary(itinerary_id.toString(), itinerary) as GetItineraryResponse;
  } catch (error) {
    console.error('Failed to update itinerary:', error);
    throw error;
  }
};
