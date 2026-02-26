/**
 * Service for handling airline check-in URLs and related functionality
 */

interface AirlineCheckInUrls {
  [iataCode: string]: string;
}

// Comprehensive airline check-in URLs mapping
const AIRLINE_CHECKIN_URLS: AirlineCheckInUrls = {
  // Major European Airlines
  "BA": "https://www.britishairways.com/check-in/",
  "LH": "https://www.lufthansa.com/us/en/online-check-in",
  "AF": "https://wwws.airfrance.us/check-in",
  "KL": "https://www.klm.com/check-in",
  "IB": "https://www.iberia.com/us/check-in/",
  "AZ": "https://www.ita-airways.com/en_gb/fly-ita/online-check-in.html",
  "LX": "https://www.swiss.com/us/en/prepare/check-in",
  "OS": "https://www.austrian.com/us/en/online-check-in",
  "SN": "https://www.brusselsairlines.com/en-us/book/online-check-in",
  "TP": "https://www.flytap.com/en-ee/check-in/online-check-in",
  "TK": "https://www.turkishairlines.com/en-us/flights/manage-booking/",
  "SU": "https://www.aeroflot.ru/us-en/information/registration/checkin",
  "SK": "https://www.sas.com/us/book/check-in/",
  
  // Low-cost European Airlines
  "FR": "https://www.ryanair.com/gb/en/lp/check-in",
  "U2": "https://www.easyjet.com/en/help/booking-and-check-in/check-in",
  "W6": "https://www.wizzair.com/en-gb/help-centre/check-in-and-boarding/check-in",
  "VY": "https://www.vueling.com/en/check-in",
  "PC": "https://www.flypgs.com/check-in/online-check-in",
  
  // Major US Airlines
  "UA": "https://www.united.com/en/us/checkin/",
  "AA": "https://www.aa.com/reservation/flightCheckInViewReservationsAccess.do",
  "DL": "https://www.delta.com/us/en/check-in-security/overview",
  "B6": "https://www.jetblue.com/check-in/",
  "AS": "https://www.alaskaair.com/content/check-in/checkin",
  "F9": "https://www.flyfrontier.com/check-in/",
  "NK": "https://www.spirit.com/check-in",
  "WN": "https://www.southwest.com/check-in/",
  
  // Middle Eastern Airlines
  "EK": "https://www.emirates.com/us/english/manage-booking/online-check-in/",
  "QR": "https://www.qatarairways.com/en-us/services-checking-in.html",
  "EY": "https://www.etihad.com/en-us/manage-booking/check-in",
  "MS": "https://www.egyptair.com/en/book/manage-booking/online-check-in",
  
  // Asian Airlines
  "SQ": "https://www.singaporeair.com/en_UK/us/manage-booking/check-in-options/",
  "CX": "https://www.cathaypacific.com/cx/en_US/travel-info/check-in.html",
  "JL": "https://www.jal.co.jp/jp/en/inter/service/checkin/",
  "NH": "https://www.ana.co.jp/en/us/international/prepare/checkin/",
  "TG": "https://www.thaiairways.com/en_US/plan_my_trip/check_in/online_check_in.page",
  "AI": "https://www.airindia.in/check-in.htm",
  "6E": "https://www.goindigo.in/web-check-in.html",
  "MH": "https://www.malaysiaairlines.com/mx/en/plan-my-trip/check-in.html",
  "PR": "https://www.philippineairlines.com/en/book/manage-booking/web-checkin",
  
  // Canadian Airlines
  "AC": "https://www.aircanada.com/ca/en/aco/home/fly/check-in/online-check-in.html",
  "WS": "https://www.westjet.com/en-ca/travel-info/check-in",
  
  // Australian/Oceania Airlines
  "QF": "https://www.qantas.com/au/en/help-and-contacts/check-in.html",
  "VA": "https://www.virginaustralia.com/au/en/help/check-in/",
  "JQ": "https://www.jetstar.com/au/en/help/check-in",
  "NZ": "https://www.airnewzealand.com/check-in",
  
  // South American Airlines
  "LA": "https://www.latam.com/en_us/experience/check-in/",
  "AR": "https://www.aerolineas.com.ar/en-us/check_in",
  "G3": "https://www.voegol.com.br/en/check-in",
  "CM": "https://www.copaair.com/en/web/us/online-check-in",
  
  // African Airlines
  "SAA": "https://www.flysaa.com/za/en/flyingSAA/OnlineServices/webCheckin.html",
  "ET": "https://www.ethiopianairlines.com/aa/book/online-check-in",
  "RW": "https://www.rwandair.com/web/online-check-in/",
  
  // Regional European Airlines
  "BT": "https://www.airbaltic.com/en/check-in",
  "JP": "https://www.adria.si/en/travel-info/check-in/",
  "OU": "https://www.croatiaairlines.com/check-in",
};

/**
 * Get check-in URL for an airline by IATA code
 */
export const getAirlineCheckInUrl = (iataCode: string): string | null => {
  if (!iataCode) return null;
  return AIRLINE_CHECKIN_URLS[iataCode.toUpperCase()] || null;
};

/**
 * Check if airline supports online check-in through our service
 */
export const isCheckInSupported = (iataCode: string): boolean => {
  if (!iataCode) return false;
  return iataCode.toUpperCase() in AIRLINE_CHECKIN_URLS;
};

/**
 * Get all supported airline codes
 */
export const getSupportedAirlines = (): string[] => {
  return Object.keys(AIRLINE_CHECKIN_URLS);
};

/**
 * Open airline check-in page in a new tab
 */
export const openAirlineCheckIn = (iataCode: string): boolean => {
  const checkInUrl = getAirlineCheckInUrl(iataCode);
  if (checkInUrl) {
    window.open(checkInUrl, '_blank', 'noopener,noreferrer');
    return true;
  }
  return false;
};

/**
 * Get user-friendly message for unsupported airlines
 */
export const getUnsupportedAirlineMessage = (airlineName?: string): string => {
  const airline = airlineName ? `${airlineName}` : 'This airline';
  return `${airline} check-in is not available through our platform. Please visit the airline's website directly.`;
};
