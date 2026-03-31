import { describe, it, expect } from "vitest";
import {
  determineTapAction,
  type TapContext,
} from "@/app/api/tap/[breadId]/route";

describe("determineTapAction", () => {
  it("returns 'onboarding' when bread is not linked", () => {
    const context: TapContext = {
      bread: { id: "1", nfc_uid: "ABC", user_id: null, linked_at: null },
      user: null,
      openEntry: null,
    };
    const result = determineTapAction(context);
    expect(result.action).toBe("onboarding");
  });

  it("returns 'reauth' when bread is linked but no user session", () => {
    const context: TapContext = {
      bread: {
        id: "1",
        nfc_uid: "ABC",
        user_id: "user-1",
        linked_at: "2026-01-01",
      },
      user: null,
      openEntry: null,
    };
    const result = determineTapAction(context);
    expect(result.action).toBe("reauth");
  });

  it("returns 'clock_in' when user is clocked out", () => {
    const context: TapContext = {
      bread: {
        id: "1",
        nfc_uid: "ABC",
        user_id: "user-1",
        linked_at: "2026-01-01",
      },
      user: {
        id: "user-1",
        email: "test@test.com",
        hourly_rate: 50,
        expected_hours_per_week: 40,
        location: "90210",
        created_at: "2026-01-01",
      },
      openEntry: null,
    };
    const result = determineTapAction(context);
    expect(result.action).toBe("clock_in");
  });

  it("returns 'clock_out' when user is clocked in", () => {
    const context: TapContext = {
      bread: {
        id: "1",
        nfc_uid: "ABC",
        user_id: "user-1",
        linked_at: "2026-01-01",
      },
      user: {
        id: "user-1",
        email: "test@test.com",
        hourly_rate: 50,
        expected_hours_per_week: 40,
        location: "90210",
        created_at: "2026-01-01",
      },
      openEntry: {
        id: "entry-1",
        user_id: "user-1",
        clock_in: "2026-03-30T09:00:00Z",
        clock_out: null,
        earnings: null,
      },
    };
    const result = determineTapAction(context);
    expect(result.action).toBe("clock_out");
  });

  it("returns 'friday_clock_out' when clocking out on Friday", () => {
    const context: TapContext = {
      bread: {
        id: "1",
        nfc_uid: "ABC",
        user_id: "user-1",
        linked_at: "2026-01-01",
      },
      user: {
        id: "user-1",
        email: "test@test.com",
        hourly_rate: 50,
        expected_hours_per_week: 40,
        location: "90210",
        created_at: "2026-01-01",
      },
      openEntry: {
        id: "entry-1",
        user_id: "user-1",
        clock_in: "2026-04-03T09:00:00Z",
        clock_out: null,
        earnings: null,
      },
    };
    const result = determineTapAction(context, new Date("2026-04-03T17:00:00Z"));
    expect(result.action).toBe("friday_clock_out");
  });
});
