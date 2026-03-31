import { describe, it, expect } from "vitest";
import { getRandomPun, getAllPuns, PunContext } from "@/lib/bread-puns";

const ALL_CONTEXTS: PunContext[] = [
  "clock_in",
  "clock_out",
  "friday",
  "error",
  "milestone",
  "empty_shelf",
];

describe("getAllPuns — edge cases", () => {
  it.each(ALL_CONTEXTS)(
    'returns a non-empty array for context "%s"',
    (context) => {
      const puns = getAllPuns(context);
      expect(Array.isArray(puns)).toBe(true);
      expect(puns.length).toBeGreaterThan(0);
    }
  );

  it.each(ALL_CONTEXTS)(
    'every pun in context "%s" is a non-empty string',
    (context) => {
      const puns = getAllPuns(context);
      puns.forEach((pun) => {
        expect(typeof pun).toBe("string");
        expect(pun.trim().length).toBeGreaterThan(0);
      });
    }
  );

  it("returns the empty_shelf puns array (previously untested context)", () => {
    const puns = getAllPuns("empty_shelf");
    expect(puns.length).toBeGreaterThanOrEqual(1);
  });

  it("returns distinct arrays per context (no cross-contamination)", () => {
    const clockInPuns = getAllPuns("clock_in");
    const clockOutPuns = getAllPuns("clock_out");
    // The sets should not be identical
    expect(clockInPuns).not.toEqual(clockOutPuns);
  });

  it("returns the same reference on repeated calls (no defensive copy)", () => {
    // This documents the current behaviour — callers must not mutate
    const first = getAllPuns("error");
    const second = getAllPuns("error");
    expect(first).toBe(second);
  });
});

describe("getRandomPun — edge cases", () => {
  it.each(ALL_CONTEXTS)(
    'never returns undefined for context "%s"',
    (context) => {
      // Call many times to exercise the random index
      for (let i = 0; i < 50; i++) {
        const pun = getRandomPun(context);
        expect(pun).not.toBeUndefined();
      }
    }
  );

  it.each(ALL_CONTEXTS)(
    'always returns a non-empty string for context "%s"',
    (context) => {
      for (let i = 0; i < 50; i++) {
        const pun = getRandomPun(context);
        expect(typeof pun).toBe("string");
        expect(pun.trim().length).toBeGreaterThan(0);
      }
    }
  );

  it("returns the empty_shelf context pun (previously untested)", () => {
    const pun = getRandomPun("empty_shelf");
    expect(typeof pun).toBe("string");
    expect(pun.length).toBeGreaterThan(0);
  });

  it("result is always one of the known puns for that context", () => {
    ALL_CONTEXTS.forEach((context) => {
      const known = getAllPuns(context);
      for (let i = 0; i < 20; i++) {
        const pun = getRandomPun(context);
        expect(known).toContain(pun);
      }
    });
  });
});
