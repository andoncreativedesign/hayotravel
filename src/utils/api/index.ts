const isDev = process.env.NODE_ENV === "development";

export const API_URL = (() => {
  if (isDev) {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  }

  // In production, use Next.js API routes to avoid CORS issues
  const isClient = typeof window !== 'undefined';
  if (isClient) {
    return window.location.origin;
  }

  // For server-side requests, use the direct backend URL
  const url = process.env.NEXT_PUBLIC_API_URL || '';
  return url.replace(/^http:\/\//, 'https://');
})();

export const FASTAPI_BASE_URL = API_URL;

export * from './itinerary';
export * from './bookings';
