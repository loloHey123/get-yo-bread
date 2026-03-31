import { describe, it, expect } from "vitest";
import {
  determineTapAction,
  type TapContext,
} from "@/app/api/tap/[breadId]/route";
import type { Bread, User, TimeEntry } from "@/lib/types";

// Helpers
const linkedBread: Bread = {
  id: "bread-1",
  nfc_uid: "DEADBEEF",
  user_id: "user-1",
  linked_at: "2026-01-01T00:00:00Z",
};

const fullUser: User = {
  id: "user-1",
  email: "worker@example.com",
  hourly_rate: 25,
  expected_hours_per_week: 40,
  location: "90210",
  created_at: "2026-01-01T00:00:00Z",
};

const openEntry: TimeEntry = {
  id: "entry-1",
  user_id: "user-1",
  clock_in: "2026-03-30T09:00:00Z",
  clock_out: null,
  earnings: null,
};

describe("determineTapAction — unhappy paths and edge cases", () => {
  // ── null bread ──────────────────────────────────────────────────────────────

  it("returns not_found when bread is null", () => {
    const context: TapContext = { bread: null, user: null, openEntry: null };
    expect(determineTapAction(context).action).toBe("not_found");
  });

  it("returns not_found regardless of user or entry when bread is null", () => {
    const context: TapContext = {
      bread: null,
      user: fullUser,
      openEntry,
    };
    expect(determineTapAction(context).action).toBe("not_found");
  });

  // ── onboarding data ──────────────────────────────────────────────────────────

  it("returns onboarding with breadId in data when bread has no user_id", () => {
    const unlinkedBread: Bread = {
      id: "bread-2",
      nfc_uid: "CAFE",
      user_id: null,
      linked_at: null,
    };
    const context: TapContext = {
      bread: unlinkedBread,
      user: null,
      openEntry: null,
    };
    const result = determineTapAction(context);
    expect(result.action).toBe("onboarding");
    expect(result.data?.breadId).toBe("bread-2");
  });

  // ── reauth data ───────────────────────────────────────────────────────────

  it("returns reauth with breadId in data when bread is linked but user session is missing", () => {
    const context: TapContext = {
      bread: linkedBread,
      user: null,
      openEntry: null,
    };
    const result = determineTapAction(context);
    expect(result.action).toBe("reauth");
    expect(result.data?.breadId).toBe("bread-1");
  });

  // ── day-of-week boundaries ────────────────────────────────────────────────

  it("returns clock_out (not friday_clock_out) on Thursday", () => {
    // 2026-04-02 is a Thursday
    const thursday = new Date("2026-04-02T17:00:00Z");
    const context: TapContext = {
      bread: linkedBread,
      user: fullUser,
      openEntry,
    };
    expect(determineTapAction(context, thursday).action).toBe("clock_out");
  });

  it("returns clock_out (not friday_clock_out) on Saturday", () => {
    // 2026-04-04 is a Saturday
    const saturday = new Date("2026-04-04T10:00:00Z");
    const context: TapContext = {
      bread: linkedBread,
      user: fullUser,
      openEntry,
    };
    expect(determineTapAction(context, saturday).action).toBe("clock_out");
  });

  it("returns clock_out (not friday_clock_out) on Sunday", () => {
    // 2026-04-05 is a Sunday
    const sunday = new Date("2026-04-05T10:00:00Z");
    const context: TapContext = {
      bread: linkedBread,
      user: fullUser,
      openEntry,
    };
    expect(determineTapAction(context, sunday).action).toBe("clock_out");
  });

  it("returns clock_out (not friday_clock_out) on Monday", () => {
    // 2026-03-30 is a Monday
    const monday = new Date("2026-03-30T17:00:00Z");
    const context: TapContext = {
      bread: linkedBread,
      user: fullUser,
      openEntry,
    };
    expect(determineTapAction(context, monday).action).toBe("clock_out");
  });

  it("returns friday_clock_out at start of Friday (00:00)", () => {
    // 2026-04-03 is a Friday — midnight start
    const fridayMidnight = new Date("2026-04-03T00:00:00");
    const context: TapContext = {
      bread: linkedBread,
      user: fullUser,
      openEntry,
    };
    expect(determineTapAction(context, fridayMidnight).action).toBe(
      "friday_clock_out"
    );
  });

  it("returns friday_clock_out at end of Friday (23:59:59)", () => {
    const fridayEndOfDay = new Date("2026-04-03T23:59:59");
    const context: TapContext = {
      bread: linkedBread,
      user: fullUser,
      openEntry,
    };
    expect(determineTapAction(context, fridayEndOfDay).action).toBe(
      "friday_clock_out"
    );
  });

  it("does NOT return friday_clock_out at Saturday 00:00:00 (just past midnight)", () => {
    // One second into Saturday — no longer Friday
    const saturdayStart = new Date("2026-04-04T00:00:00");
    const context: TapContext = {
      bread: linkedBread,
      user: fullUser,
      openEntry,
    };
    expect(determineTapAction(context, saturdayStart).action).toBe("clock_out");
  });

  it("friday_clock_out includes entryId in data", () => {
    const friday = new Date("2026-04-03T17:00:00Z");
    const context: TapContext = {
      bread: linkedBread,
      user: fullUser,
      openEntry,
    };
    const result = determineTapAction(context, friday);
    expect(result.action).toBe("friday_clock_out");
    expect(result.data?.entryId).toBe("entry-1");
  });

  it("clock_out includes entryId in data", () => {
    const monday = new Date("2026-03-30T17:00:00Z");
    const context: TapContext = {
      bread: linkedBread,
      user: fullUser,
      openEntry,
    };
    const result = determineTapAction(context, monday);
    expect(result.action).toBe("clock_out");
    expect(result.data?.entryId).toBe("entry-1");
  });

  // ── priority: bread null beats everything else ────────────────────────────

  it("null bread takes precedence over open entry", () => {
    const context: TapContext = {
      bread: null,
      user: fullUser,
      openEntry,
    };
    expect(determineTapAction(context).action).toBe("not_found");
  });

  // ── clock_in when user present but no open entry ──────────────────────────

  it("returns clock_in even on a Friday when there is no open entry", () => {
    // No open entry → we clock IN, not out — day of week is irrelevant here
    const friday = new Date("2026-04-03T09:00:00Z");
    const context: TapContext = {
      bread: linkedBread,
      user: fullUser,
      openEntry: null,
    };
    expect(determineTapAction(context, friday).action).toBe("clock_in");
  });

  // ── multiple open entries scenario: only first is used ───────────────────

  it("uses the provided openEntry object (simulating first of multiple)", () => {
    // The route currently passes only one entry (Supabase .single()).
    // determineTapAction receives that single entry, so whichever is passed, it acts on it.
    const firstEntry: TimeEntry = {
      id: "entry-first",
      user_id: "user-1",
      clock_in: "2026-03-30T08:00:00Z",
      clock_out: null,
      earnings: null,
    };
    const monday = new Date("2026-03-30T17:00:00Z");
    const context: TapContext = {
      bread: linkedBread,
      user: fullUser,
      openEntry: firstEntry,
    };
    const result = determineTapAction(context, monday);
    expect(result.action).toBe("clock_out");
    expect(result.data?.entryId).toBe("entry-first");
  });
});
