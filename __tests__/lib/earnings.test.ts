import { describe, it, expect } from "vitest";
import {
  calculateSessionEarnings,
  calculateWeeklyEarnings,
  getWeekStart,
  getBaguetteProgress,
} from "@/lib/earnings";

describe("calculateSessionEarnings", () => {
  it("calculates earnings for a simple session", () => {
    const clockIn = new Date("2026-03-30T09:00:00Z");
    const clockOut = new Date("2026-03-30T17:00:00Z");
    const hourlyRate = 50;
    expect(calculateSessionEarnings(clockIn, clockOut, hourlyRate)).toBe(400);
  });

  it("handles partial hours", () => {
    const clockIn = new Date("2026-03-30T09:00:00Z");
    const clockOut = new Date("2026-03-30T09:30:00Z");
    const hourlyRate = 60;
    expect(calculateSessionEarnings(clockIn, clockOut, hourlyRate)).toBe(30);
  });

  it("returns 0 for same clock in and out", () => {
    const time = new Date("2026-03-30T09:00:00Z");
    expect(calculateSessionEarnings(time, time, 50)).toBe(0);
  });
});

describe("calculateWeeklyEarnings", () => {
  it("sums earnings from multiple time entries", () => {
    const entries = [
      { earnings: 400 },
      { earnings: 350 },
      { earnings: 400 },
    ];
    expect(calculateWeeklyEarnings(entries)).toBe(1150);
  });

  it("returns 0 for empty entries", () => {
    expect(calculateWeeklyEarnings([])).toBe(0);
  });
});

describe("getWeekStart", () => {
  it("returns Monday 00:00 for a Wednesday", () => {
    const wednesday = new Date("2026-04-01T14:30:00Z");
    const weekStart = getWeekStart(wednesday);
    expect(weekStart.getUTCDay()).toBe(1);
    expect(weekStart.getUTCHours()).toBe(0);
    expect(weekStart.getUTCMinutes()).toBe(0);
  });

  it("returns same day for a Monday", () => {
    const monday = new Date("2026-03-30T10:00:00Z");
    const weekStart = getWeekStart(monday);
    expect(weekStart.toISOString().split("T")[0]).toBe("2026-03-30");
  });
});

describe("getBaguetteProgress", () => {
  it("returns 0 for no earnings", () => {
    expect(getBaguetteProgress(0, 50, 40)).toBe(0);
  });

  it("returns 1 for full week earnings", () => {
    expect(getBaguetteProgress(2000, 50, 40)).toBe(1);
  });

  it("returns 0.5 for half week", () => {
    expect(getBaguetteProgress(1000, 50, 40)).toBe(0.5);
  });

  it("can exceed 1 for overtime", () => {
    expect(getBaguetteProgress(3000, 50, 40)).toBe(1.5);
  });
});
