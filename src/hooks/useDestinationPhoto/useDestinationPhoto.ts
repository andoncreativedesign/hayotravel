import {
  searchDestinationPhotos,
  UnsplashPhoto,
} from "@/utils/services/unsplashService";
import { useQuery } from "@tanstack/react-query";

interface UseDestinationPhotoOptions {
  enabled?: boolean;
  staleTime?: number;
  cacheTime?: number;
}

export const useDestinationPhoto = (
  destination: string | undefined,
  options: UseDestinationPhotoOptions = {}
) => {
  const {
    enabled = true,
    staleTime = 1000 * 60 * 60 * 24, // 24 hours
    cacheTime = 1000 * 60 * 60 * 24 * 7, // 7 days
  } = options;

  return useQuery({
    queryKey: ["destinationPhoto", destination],
    queryFn: async (): Promise<UnsplashPhoto | null> => {
      if (!destination) {
        return null;
      }

      const photos = await searchDestinationPhotos(destination, 1);
      return photos.length > 0 ? photos[0] : null;
    },
    enabled: enabled && !!destination,
    staleTime,
    gcTime: cacheTime, // Updated property name for React Query v5
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

export type { UnsplashPhoto };
