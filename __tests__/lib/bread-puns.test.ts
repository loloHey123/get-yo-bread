import { describe, it, expect } from "vitest";
import { getRandomPun } from "@/lib/bread-puns";

describe("getRandomPun", () => {
  it("returns a string for clock_in context", () => {
    const pun = getRandomPun("clock_in");
    expect(typeof pun).toBe("string");
    expect(pun.length).toBeGreaterThan(0);
  });

  it("returns a string for clock_out context", () => {
    const pun = getRandomPun("clock_out");
    expect(typeof pun).toBe("string");
    expect(pun.length).toBeGreaterThan(0);
  });

  it("returns a string for friday context", () => {
    const pun = getRandomPun("friday");
    expect(typeof pun).toBe("string");
    expect(pun.length).toBeGreaterThan(0);
  });

  it("returns a string for error context", () => {
    const pun = getRandomPun("error");
    expect(typeof pun).toBe("string");
    expect(pun.length).toBeGreaterThan(0);
  });

  it("returns a string for milestone context", () => {
    const pun = getRandomPun("milestone");
    expect(typeof pun).toBe("string");
  });
});
