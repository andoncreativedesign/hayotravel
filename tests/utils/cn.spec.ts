import { cn } from "@/utils/helpers/cn";
import { expect, test } from "@playwright/test";

test("should merge multiple class names into a single string", () => {
  expect(cn("foo", "bar", "baz")).toBe("foo bar baz");
});

test("should ignore falsy values", () => {
  expect(cn("foo", undefined, "bar", null, "baz", false)).toBe("foo bar baz");
});

test("should return empty string when no valid class names provided", () => {
  expect(cn(undefined, null, false)).toBe("");
});

test("should handle empty strings", () => {
  expect(cn("foo", "", "bar")).toBe("foo bar");
});

test("should handle single class name", () => {
  expect(cn("foo")).toBe("foo");
});

test("should handle no arguments", () => {
  expect(cn()).toBe("");
});

test("should preserve whitespace in class names", () => {
  expect(cn("foo bar", "baz")).toBe("foo bar baz");
});
