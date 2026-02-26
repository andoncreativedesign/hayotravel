import { Itinerary } from "@/store/itinerary/itinerary.store";

export * from "./admin";
export * from "./session-storage";

export function sanitizeText(text: string) {
  return text.replace("<has_function_call>", "").replace(/^"(.*)"$/, "$1"); // Remove surrounding quotes if they exist
}

export function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const parseDuration = (iso: string) => {
  const match = iso.match(/^P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?$/);
  if (!match) return iso;
  
  const days = parseInt(match?.[1] ?? "0");
  const hours = parseInt(match?.[2] ?? "0");
  const minutes = parseInt(match?.[3] ?? "0");
  
  const totalHours = days * 24 + hours;
  return `${totalHours}h ${minutes}m`;
};

export const parseDateToLocal = (
  date: string,
  options?: Intl.DateTimeFormatOptions
): string =>
  date ? new Date(date).toLocaleTimeString("en-US", options) : "Unknown";

export const ensureISOString = (date: string | Date): string => {
  if (typeof date === 'string') {
    if (date.includes('T') && !date.endsWith('Z') && !date.includes('+') && !date.includes('-', 10)) {
      return new Date(date + 'Z').toISOString();
    }
    return new Date(date).toISOString();
  }
  return date.toISOString();
};

export const ensureISODateString = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Create a new date with zero time components (00:00:00.000) in UTC
  // Use UTC components to avoid timezone issues
  const dateOnly = new Date(Date.UTC(dateObj.getUTCFullYear(), dateObj.getUTCMonth(), dateObj.getUTCDate()));
  
  return dateOnly.toISOString();
};

export const getDisplayItems = (itinerary: Itinerary[]) =>
  itinerary
    .map((item) => {
      return item;
    })
    .sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA;
    });
