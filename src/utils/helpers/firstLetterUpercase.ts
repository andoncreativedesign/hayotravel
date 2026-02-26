export function capitalizeFirstLetter(str: string | undefined) {
  if (typeof str !== "string" || str.length === 0) {
    return "Unknown";
  }
  const newStr = str.toLowerCase();
  return newStr.charAt(0).toUpperCase() + newStr.slice(1);
}
