import { createApi } from "unsplash-js";

// Initialize Unsplash API client
const unsplash = createApi({
  accessKey: process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY || "",
});

export interface UnsplashPhoto {
  id: string;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  alt_description: string | null;
  user: {
    name: string;
    links: {
      html: string;
    };
  };
  links: {
    html: string;
  };
}

export interface UnsplashResponse {
  results: UnsplashPhoto[];
  total: number;
  total_pages: number;
}

/**
 * Search for photos by city/destination name
 * @param cityName - The name of the city/destination
 * @param perPage - Number of photos to return (default: 1)
 * @returns Promise with photo results
 */
export const searchDestinationPhotos = async (
  cityName: string,
  perPage: number = 1
): Promise<UnsplashPhoto[]> => {
  try {
    if (!process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY) {
      console.warn("Unsplash API key not configured");
      return [];
    }

    const result = await unsplash.search.getPhotos({
      query: `${cityName} travel destination landscape architecture`,
      page: 1,
      perPage,
      orientation: "landscape",
      orderBy: "relevant",
    });

    if (result.errors) {
      console.error("Unsplash API error:", result.errors);
      return [];
    }

    return result.response?.results || [];
  } catch (error) {
    console.error("Error fetching photos from Unsplash:", error);
    return [];
  }
};

/**
 * Generate attribution text for Unsplash photos
 * @param photo - The UnsplashPhoto object
 * @param appName - Your app name for attribution
 * @returns Attribution JSX
 */
export const getPhotoAttribution = (
  photo: UnsplashPhoto,
  appName: string = "Hayo"
) => {
  return {
    photographer: photo.user.name,
    photographerUrl: `${photo.user.links.html}?utm_source=${appName}&utm_medium=referral`,
    unsplashUrl: `https://unsplash.com/?utm_source=${appName}&utm_medium=referral`,
    photoUrl: `${photo.links.html}?utm_source=${appName}&utm_medium=referral`,
  };
};

export default unsplash;
