import { describe, it, expect, vi, afterEach } from "vitest";
import {
  calculateSessionEarnings,
  calculateWeeklyEarnings,
  getBaguetteProgress,
  formatEarnings,
  calculateLiveEarnings,
} from "@/lib/earnings";

describe("calculateSessionEarnings — edge cases", () => {
  it("returns a negative value when clockOut is before clockIn", () => {
    const clockIn = new Date("2026-03-30T10:00:00Z");
    const clockOut = new Date("2026-03-30T09:00:00Z");
    const result = calculateSessionEarnings(clockIn, clockOut, 50);
    expect(result).toBeLessThan(0);
    expect(result).toBe(-50);
  });

  it("handles a negative hourly rate", () => {
    const clockIn = new Date("2026-03-30T09:00:00Z");
    const clockOut = new Date("2026-03-30T10:00:00Z");
    const result = calculateSessionEarnings(clockIn, clockOut, -20);
    expect(result).toBe(-20);
  });

  it("handles a zero hourly rate", () => {
    const clockIn = new Date("2026-03-30T09:00:00Z");
    const clockOut = new Date("2026-03-30T17:00:00Z");
    const result = calculateSessionEarnings(clockIn, clockOut, 0);
    expect(result).toBe(0);
  });

  it("rounds fractional cents correctly (rounds half-up)", () => {
    // 1 hour at $0.015/hr = $0.015 → rounds to $0.02
    const clockIn = new Date("2026-03-30T09:00:00Z");
    const clockOut = new Date("2026-03-30T10:00:00Z");
    const result = calculateSessionEarnings(clockIn, clockOut, 0.015);
    expect(result).toBe(0.02);
  });

  it("rounds fractional cents down when below half", () => {
    // 1 hour at $0.014/hr = $0.014 → rounds to $0.01
    const clockIn = new Date("2026-03-30T09:00:00Z");
    const clockOut = new Date("2026-03-30T10:00:00Z");
    const result = calculateSessionEarnings(clockIn, clockOut, 0.014);
    expect(result).toBe(0.01);
  });

  it("handles extremely large hourly rates without crashing", () => {
    const clockIn = new Date("2026-03-30T09:00:00Z");
    const clockOut = new Date("2026-03-30T10:00:00Z");
    const result = calculateSessionEarnings(clockIn, clockOut, 1e15);
    expect(Number.isFinite(result)).toBe(true);
    expect(result).toBeGreaterThan(0);
  });

  it("handles very long sessions (multi-year) without overflow", () => {
    const clockIn = new Date("2020-01-01T00:00:00Z");
    const clockOut = new Date("2026-01-01T00:00:00Z");
    const result = calculateSessionEarnings(clockIn, clockOut, 100);
    expect(Number.isFinite(result)).toBe(true);
    expect(result).toBeGreaterThan(0);
  });
});

describe("calculateWeeklyEarnings — edge cases", () => {
  it("treats null earnings as 0", () => {
    const entries = [{ earnings: 100 }, { earnings: null }, { earnings: 200 }];
    expect(calculateWeeklyEarnings(entries)).toBe(300);
  });

  it("handles all-null earnings", () => {
    const entries = [{ earnings: null }, { earnings: null }];
    expect(calculateWeeklyEarnings(entries)).toBe(0);
  });

  it("handles negative earnings entries", () => {
    const entries = [{ earnings: 500 }, { earnings: -100 }];
    expect(calculateWeeklyEarnings(entries)).toBe(400);
  });

  it("handles a single entry", () => {
    expect(calculateWeeklyEarnings([{ earnings: 42.5 }])).toBe(42.5);
  });

  it("handles very large earnings without loss of precision", () => {
    const entries = [{ earnings: 1e12 }, { earnings: 1e12 }];
    expect(calculateWeeklyEarnings(entries)).toBe(2e12);
  });
});

describe("getBaguetteProgress — edge cases", () => {
  it("returns 0 when expectedHoursPerWeek is 0 (avoids division by zero)", () => {
    expect(getBaguetteProgress(500, 50, 0)).toBe(0);
  });

  it("returns 0 when hourlyRate is 0 (avoids division by zero)", () => {
    expect(getBaguetteProgress(500, 0, 40)).toBe(0);
  });

  it("returns 0 when both hourlyRate and expectedHoursPerWeek are 0", () => {
    expect(getBaguetteProgress(0, 0, 0)).toBe(0);
  });

  it("handles negative hourly rate gracefully", () => {
    // expectedWeeklyEarnings = -50 * 40 = -2000; result = 100 / -2000 = -0.05
    const result = getBaguetteProgress(100, -50, 40);
    expect(typeof result).toBe("number");
    expect(Number.isFinite(result)).toBe(true);
  });

  it("handles negative weeklyEarnings (e.g. corrections or refunds)", () => {
    const result = getBaguetteProgress(-200, 50, 40);
    expect(result).toBeLessThan(0);
  });

  it("handles extremely large weeklyEarnings", () => {
    const result = getBaguetteProgress(1e15, 50, 40);
    expect(Number.isFinite(result)).toBe(true);
    expect(result).toBeGreaterThan(0);
  });
});

describe("formatEarnings — edge cases", () => {
  it("formats zero", () => {
    expect(formatEarnings(0)).toBe("$0.00");
  });

  it("formats a positive integer", () => {
    expect(formatEarnings(1000)).toBe("$1,000.00");
  });

  it("formats a positive decimal", () => {
    expect(formatEarnings(99.5)).toBe("$99.50");
  });

  it("formats a negative amount", () => {
    const result = formatEarnings(-50);
    expect(result).toContain("50.00");
    expect(result).toMatch(/^-?\$|^\$-/);
  });

  it("formats a very large number", () => {
    const result = formatEarnings(1_000_000);
    expect(result).toContain("1,000,000.00");
  });

  it("does not crash with NaN — returns a string", () => {
    const result = formatEarnings(NaN);
    expect(typeof result).toBe("string");
  });

  it("does not crash with Infinity — returns a string", () => {
    const result = formatEarnings(Infinity);
    expect(typeof result).toBe("string");
  });

  it("does not crash with negative Infinity — returns a string", () => {
    const result = formatEarnings(-Infinity);
    expect(typeof result).toBe("string");
  });
});

describe("calculateLiveEarnings — edge cases", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns a positive value when clocked in in the past", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-30T10:00:00Z"));
    const clockIn = new Date("2026-03-30T09:00:00Z");
    const result = calculateLiveEarnings(clockIn, 60);
    expect(result).toBe(60); // 1 hour at $60/hr
  });

  it("returns 0 when clockIn equals current time", () => {
    vi.useFakeTimers();
    const now = new Date("2026-03-30T10:00:00Z");
    vi.setSystemTime(now);
    const result = calculateLiveEarnings(new Date(now), 50);
    expect(result).toBe(0);
  });

  it("returns 0 when clockIn is in the future (guarded against negative earnings)", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-30T09:00:00Z"));
    const futureClockIn = new Date("2026-03-30T10:00:00Z");
    // calculateLiveEarnings guards against future clock-in by returning 0
    const result = calculateLiveEarnings(futureClockIn, 50);
    expect(result).toBe(0);
  });

  it("handles zero hourly rate", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-30T10:00:00Z"));
    const clockIn = new Date("2026-03-30T09:00:00Z");
    expect(calculateLiveEarnings(clockIn, 0)).toBe(0);
  });

  it("handles a negative hourly rate", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-30T10:00:00Z"));
    const clockIn = new Date("2026-03-30T09:00:00Z");
    const result = calculateLiveEarnings(clockIn, -30);
    expect(result).toBe(-30); // 1 hour at -$30/hr
  });
});
