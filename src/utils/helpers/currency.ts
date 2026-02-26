/**
 * Currency utility functions for formatting and displaying currencies
 */

/**
 * Map of currency codes to their symbols
 */
export const CURRENCY_SYMBOLS: Record<string, string> = {
  // Major currencies
  USD: "$", // US Dollar
  EUR: "€", // Euro
  GBP: "£", // British Pound
  JPY: "¥", // Japanese Yen
  CNY: "¥", // Chinese Yuan
  CAD: "C$", // Canadian Dollar
  AUD: "A$", // Australian Dollar
  CHF: "CHF", // Swiss Franc
  SEK: "kr", // Swedish Krona
  NOK: "kr", // Norwegian Krone
  DKK: "kr", // Danish Krone

  // Other common currencies
  INR: "₹", // Indian Rupee
  KRW: "₩", // South Korean Won
  SGD: "S$", // Singapore Dollar
  HKD: "HK$", // Hong Kong Dollar
  NZD: "NZ$", // New Zealand Dollar
  MXN: "$", // Mexican Peso
  BRL: "R$", // Brazilian Real
  RUB: "₽", // Russian Ruble
  ZAR: "R", // South African Rand

  // Middle East & Africa
  AED: "د.إ", // UAE Dirham
  SAR: "﷼", // Saudi Riyal
  EGP: "£", // Egyptian Pound

  // Additional currencies
  PLN: "zł", // Polish Złoty
  CZK: "Kč", // Czech Koruna
  HUF: "Ft", // Hungarian Forint
  ILS: "₪", // Israeli Shekel
  THB: "฿", // Thai Baht
  PHP: "₱", // Philippine Peso
  MYR: "RM", // Malaysian Ringgit
  IDR: "Rp", // Indonesian Rupiah
  VND: "₫", // Vietnamese Dong

  // Crypto (if needed)
  BTC: "₿", // Bitcoin
  ETH: "Ξ", // Ethereum
};

/**
 * Get currency symbol from currency code
 * @param currencyCode - 3-letter currency code (e.g., 'USD', 'EUR')
 * @returns Currency symbol or the original code if not found
 */
export const getCurrencySymbol = (currencyCode: string): string => {
  if (!currencyCode) return "$"; // Default to USD symbol

  const upperCode = currencyCode.toUpperCase();
  return CURRENCY_SYMBOLS[upperCode] || upperCode;
};

/**
 * Format currency value with symbol
 * @param value - Numeric value to format
 * @param currencyCode - 3-letter currency code
 * @param options - Formatting options
 * @returns Formatted currency string with symbol
 */
export const formatCurrencyWithSymbol = (
  value: number,
  currencyCode: string,
  options: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    showSymbolAfter?: boolean; // For currencies like 'kr' that come after the amount
  } = {}
): string => {
  const {
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
    showSymbolAfter = false,
  } = options;

  const formattedValue = value.toLocaleString("en-US", {
    minimumFractionDigits,
    maximumFractionDigits,
  });

  const symbol = getCurrencySymbol(currencyCode);

  // Some currencies (like Scandinavian krona) are typically shown after the amount
  const currenciesAfterAmount = ["kr", "zł", "Kč", "Ft"];
  const shouldShowAfter =
    showSymbolAfter || currenciesAfterAmount.includes(symbol);

  return shouldShowAfter
    ? `${formattedValue} ${symbol}`
    : `${symbol}${formattedValue}`;
};

/**
 * Check if a currency typically shows its symbol after the amount
 * @param currencyCode - 3-letter currency code
 * @returns true if symbol should be shown after the amount
 */
export const isCurrencySymbolAfterAmount = (currencyCode: string): boolean => {
  const symbol = getCurrencySymbol(currencyCode);
  const currenciesAfterAmount = ["kr", "zł", "Kč", "Ft"];
  return currenciesAfterAmount.includes(symbol);
};
