import { describe, it, expect } from "vitest";
import { validateOnboardingData, type OnboardingData } from "@/app/api/onboarding/route";

describe("validateOnboardingData", () => {
  it("accepts valid data", () => {
    const data: OnboardingData = {
      breadId: "ABC123",
      hourlyRate: 50,
      expectedHoursPerWeek: 40,
      location: "90210",
      bakeryPrefs: ["croissants", "bread"],
      allergies: ["nuts"],
    };
    expect(validateOnboardingData(data)).toEqual({ valid: true });
  });

  it("rejects missing breadId", () => {
    const data = {
      hourlyRate: 50,
      expectedHoursPerWeek: 40,
      location: "90210",
      bakeryPrefs: [],
      allergies: [],
    } as unknown as OnboardingData;
    expect(validateOnboardingData(data).valid).toBe(false);
  });

  it("rejects zero hourly rate", () => {
    const data: OnboardingData = {
      breadId: "ABC123",
      hourlyRate: 0,
      expectedHoursPerWeek: 40,
      location: "90210",
      bakeryPrefs: [],
      allergies: [],
    };
    expect(validateOnboardingData(data).valid).toBe(false);
  });

  it("rejects negative hourly rate", () => {
    const data: OnboardingData = {
      breadId: "ABC123",
      hourlyRate: -10,
      expectedHoursPerWeek: 40,
      location: "90210",
      bakeryPrefs: [],
      allergies: [],
    };
    expect(validateOnboardingData(data).valid).toBe(false);
  });
});
