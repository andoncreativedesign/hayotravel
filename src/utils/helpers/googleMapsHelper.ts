/**
 * Utility functions for Google Maps integration
 */

export interface LocationData {
  name?: string;
  address?: string;
  city?: string;
  country?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

/**
 * Generates a Google Maps URL for a given location
 * @param location - Location data object
 * @returns Google Maps URL string
 */
export function generateGoogleMapsUrl(location: LocationData): string {
  const baseUrl = 'https://www.google.com/maps/search/';
  
  // If coordinates are available, use them for precise location
  if (location.coordinates?.latitude && location.coordinates?.longitude) {
    const { latitude, longitude } = location.coordinates;
    return `${baseUrl}${latitude},${longitude}`;
  }
  
  // Otherwise, construct search query from address components
  const queryParts: string[] = [];
  
  if (location.name) {
    queryParts.push(location.name);
  }
  
  if (location.address) {
    queryParts.push(location.address);
  }
  
  if (location.city) {
    queryParts.push(location.city);
  }
  
  if (location.country) {
    queryParts.push(location.country);
  }
  
  // Join query parts and encode for URL
  const query = queryParts.join(', ');
  const encodedQuery = encodeURIComponent(query);
  
  return `${baseUrl}${encodedQuery}`;
}

/**
 * Opens Google Maps in a new tab/window
 * @param location - Location data object
 */
export function openGoogleMaps(location: LocationData): void {
  const mapsUrl = generateGoogleMapsUrl(location);
  window.open(mapsUrl, '_blank', 'noopener,noreferrer');
}

