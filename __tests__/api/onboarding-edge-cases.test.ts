import { describe, it, expect } from "vitest";
import {
  validateOnboardingData,
  type OnboardingData,
} from "@/app/api/onboarding/route";

// Valid baseline for partial overrides
const valid: OnboardingData = {
  breadId: "ABC123",
  hourlyRate: 25,
  expectedHoursPerWeek: 40,
  location: "90210",
  bakeryPrefs: ["sourdough"],
  allergies: [],
};

describe("validateOnboardingData — edge cases", () => {
  // ── breadId ───────────────────────────────────────────────────────────────

  it("rejects undefined breadId", () => {
    const data = { ...valid, breadId: undefined } as unknown as OnboardingData;
    expect(validateOnboardingData(data).valid).toBe(false);
  });

  it("rejects null breadId", () => {
    const data = { ...valid, breadId: null } as unknown as OnboardingData;
    expect(validateOnboardingData(data).valid).toBe(false);
  });

  it("rejects empty string breadId", () => {
    const data: OnboardingData = { ...valid, breadId: "" };
    expect(validateOnboardingData(data).valid).toBe(false);
  });

  it("accepts a breadId of a single character", () => {
    const data: OnboardingData = { ...valid, breadId: "X" };
    expect(validateOnboardingData(data).valid).toBe(true);
  });

  it("accepts an extremely long breadId string", () => {
    const data: OnboardingData = { ...valid, breadId: "A".repeat(10_000) };
    expect(validateOnboardingData(data).valid).toBe(true);
  });

  // ── hourlyRate ─────────────────────────────────────────────────────────────

  it("rejects hourlyRate of 0", () => {
    const data: OnboardingData = { ...valid, hourlyRate: 0 };
    expect(validateOnboardingData(data).valid).toBe(false);
  });

  it("rejects negative hourlyRate", () => {
    const data: OnboardingData = { ...valid, hourlyRate: -1 };
    expect(validateOnboardingData(data).valid).toBe(false);
  });

  it("rejects undefined hourlyRate", () => {
    const data = {
      ...valid,
      hourlyRate: undefined,
    } as unknown as OnboardingData;
    expect(validateOnboardingData(data).valid).toBe(false);
  });

  it("rejects null hourlyRate", () => {
    const data = { ...valid, hourlyRate: null } as unknown as OnboardingData;
    expect(validateOnboardingData(data).valid).toBe(false);
  });

  it("rejects string hourlyRate that looks like a number (type coercion bug)", () => {
    const data = { ...valid, hourlyRate: "50" } as unknown as OnboardingData;
    expect(validateOnboardingData(data).valid).toBe(false);
  });

  it("rejects NaN hourlyRate", () => {
    const data = { ...valid, hourlyRate: NaN } as unknown as OnboardingData;
    expect(validateOnboardingData(data).valid).toBe(false);
  });

  it("accepts very small positive hourlyRate (e.g. 0.01)", () => {
    const data: OnboardingData = { ...valid, hourlyRate: 0.01 };
    expect(validateOnboardingData(data).valid).toBe(true);
  });

  // ── expectedHoursPerWeek ───────────────────────────────────────────────────

  it("rejects expectedHoursPerWeek of 0", () => {
    const data: OnboardingData = { ...valid, expectedHoursPerWeek: 0 };
    expect(validateOnboardingData(data).valid).toBe(false);
  });

  it("rejects negative expectedHoursPerWeek", () => {
    const data: OnboardingData = { ...valid, expectedHoursPerWeek: -5 };
    expect(validateOnboardingData(data).valid).toBe(false);
  });

  it("rejects expectedHoursPerWeek > 168 (more hours than in a week)", () => {
    const data: OnboardingData = { ...valid, expectedHoursPerWeek: 169 };
    const result = validateOnboardingData(data);
    expect(result.valid).toBe(false);
  });

  it("rejects expectedHoursPerWeek of exactly 168 + 1 (boundary + 1)", () => {
    const data: OnboardingData = { ...valid, expectedHoursPerWeek: 169 };
    expect(validateOnboardingData(data).valid).toBe(false);
  });

  it("accepts expectedHoursPerWeek of exactly 168 (boundary: every hour of a week)", () => {
    const data: OnboardingData = { ...valid, expectedHoursPerWeek: 168 };
    expect(validateOnboardingData(data).valid).toBe(true);
  });

  it("accepts expectedHoursPerWeek of 1 (minimum non-zero)", () => {
    const data: OnboardingData = { ...valid, expectedHoursPerWeek: 1 };
    expect(validateOnboardingData(data).valid).toBe(true);
  });

  it("rejects string expectedHoursPerWeek (type coercion bug)", () => {
    const data = {
      ...valid,
      expectedHoursPerWeek: "40",
    } as unknown as OnboardingData;
    expect(validateOnboardingData(data).valid).toBe(false);
  });

  it("rejects undefined expectedHoursPerWeek", () => {
    const data = {
      ...valid,
      expectedHoursPerWeek: undefined,
    } as unknown as OnboardingData;
    expect(validateOnboardingData(data).valid).toBe(false);
  });

  it("rejects null expectedHoursPerWeek", () => {
    const data = {
      ...valid,
      expectedHoursPerWeek: null,
    } as unknown as OnboardingData;
    expect(validateOnboardingData(data).valid).toBe(false);
  });

  // ── location (optional but present) ──────────────────────────────────────

  it("accepts an extremely long location string", () => {
    const data: OnboardingData = { ...valid, location: "X".repeat(100_000) };
    expect(validateOnboardingData(data).valid).toBe(true);
  });

  it("accepts empty location string (location is not required)", () => {
    const data: OnboardingData = { ...valid, location: "" };
    expect(validateOnboardingData(data).valid).toBe(true);
  });

  // ── arrays (bakeryPrefs / allergies) ──────────────────────────────────────

  it("accepts empty bakeryPrefs array", () => {
    const data: OnboardingData = { ...valid, bakeryPrefs: [] };
    expect(validateOnboardingData(data).valid).toBe(true);
  });

  it("accepts empty allergies array", () => {
    const data: OnboardingData = { ...valid, allergies: [] };
    expect(validateOnboardingData(data).valid).toBe(true);
  });

  it("accepts huge bakeryPrefs array (1000 items)", () => {
    const data: OnboardingData = {
      ...valid,
      bakeryPrefs: Array.from({ length: 1000 }, (_, i) => `pref-${i}`),
    };
    expect(validateOnboardingData(data).valid).toBe(true);
  });

  it("accepts huge allergies array (1000 items)", () => {
    const data: OnboardingData = {
      ...valid,
      allergies: Array.from({ length: 1000 }, (_, i) => `allergen-${i}`),
    };
    expect(validateOnboardingData(data).valid).toBe(true);
  });

  // ── entire object missing ─────────────────────────────────────────────────

  it("does not throw when all fields are undefined", () => {
    const data = {} as unknown as OnboardingData;
    expect(() => validateOnboardingData(data)).not.toThrow();
    expect(validateOnboardingData(data).valid).toBe(false);
  });
});
