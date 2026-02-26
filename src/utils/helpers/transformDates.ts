// Helper function to format time in 12-hour format with AM/PM
export const formatTime12Hour = (date: Date): string => {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

// Helper function to format date as "1 Aug" format
export const formatShortDate = (date: Date): string => {
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
  });
};

// Helper function to format duration from "PT4H5M" to "4h 05"
export const formatDuration = (duration: string): string => {
  if (!duration) return "";

  // Parse ISO 8601 duration format like "PT4H5M"
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return duration;

  const hours = parseInt(match[1] || "0", 10);
  const minutes = parseInt(match[2] || "0", 10);

  const formattedMinutes = minutes.toString().padStart(2, "0");
  return `${hours}h ${formattedMinutes}`;
};

// Helper function to format date as "Day, 1 Mon" format
export const formatDayWithDate = (date: Date): string => {
  const weekday = date.toLocaleDateString("en-US", { weekday: "short" });
  const day = date.getDate();
  const month = date.toLocaleDateString("en-US", { month: "short" });
  return `${weekday}, ${day} ${month}`;
};

// Helper function to format date as "1 Mon" format (day number + 3-letter month)
export const formatDateShort = (date: Date): string => {
  const day = date.getDate();
  const month = date.toLocaleDateString("en-US", { month: "short" });
  return `${day} ${month}`;
};

// Helper function to get only the year from a date
export const getYear = (date: Date): number => {
  return date.getFullYear();
};

// Helper function to convert 24-hour time string to 12-hour AM/PM format
export const formatTime24To12Hour = (timeString: string): string => {
  // Handle "TDA" or other non-time strings
  if (!timeString || timeString === "TDA" || !timeString.includes(":")) {
    return timeString;
  }

  try {
    // Parse the time string (e.g., "15:00" or "17:30")
    const [hoursStr, minutesStr] = timeString.split(":");
    const hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);

    // Validate the time values
    if (
      isNaN(hours) ||
      isNaN(minutes) ||
      hours < 0 ||
      hours > 23 ||
      minutes < 0 ||
      minutes > 59
    ) {
      return timeString; // Return original if invalid
    }

    // Create a date object with the time (using today's date as base)
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);

    // Format using the existing formatTime12Hour function
    return formatTime12Hour(date);
  } catch {
    // Return original string if parsing fails
    return timeString;
  }
};
