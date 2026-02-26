import { parseDuration } from "@/utils";

describe("parseDuration", () => {
  test("should parse simple hour and minute format", () => {
    expect(parseDuration("PT5H10M")).toBe("5h 10m");
  });

  test("should parse hour only format", () => {
    expect(parseDuration("PT3H")).toBe("3h 0m");
  });

  test("should parse minute only format", () => {
    expect(parseDuration("PT45M")).toBe("0h 45m");
  });

  test("should parse duration with days", () => {
    expect(parseDuration("P1DT5H10M")).toBe("29h 10m");
  });

  test("should parse duration with multiple days", () => {
    expect(parseDuration("P2DT3H15M")).toBe("51h 15m");
  });

  test("should parse duration with days only", () => {
    expect(parseDuration("P1D")).toBe("24h 0m");
  });

  test("should parse duration with days and hours only", () => {
    expect(parseDuration("P1DT6H")).toBe("30h 0m");
  });

  test("should parse duration with days and minutes only", () => {
    expect(parseDuration("P1DT30M")).toBe("24h 30m");
  });

  test("should handle long duration formats from flight data", () => {
    // Test cases from the actual JSON response
    expect(parseDuration("P1DT6H40M")).toBe("30h 40m");
    expect(parseDuration("P1DT4H20M")).toBe("28h 20m");
    expect(parseDuration("PT22H50M")).toBe("22h 50m");
  });

  test("should handle zero values", () => {
    expect(parseDuration("PT0H0M")).toBe("0h 0m");
    expect(parseDuration("P0DT0H0M")).toBe("0h 0m");
  });

  test("should handle missing components gracefully", () => {
    expect(parseDuration("P1DT")).toBe("24h 0m");
    expect(parseDuration("PT")).toBe("0h 0m");
  });

  test("should return original string for invalid format", () => {
    expect(parseDuration("invalid")).toBe("invalid");
    expect(parseDuration("")).toBe("");
    expect(parseDuration("5h 10m")).toBe("5h 10m");
  });
});
