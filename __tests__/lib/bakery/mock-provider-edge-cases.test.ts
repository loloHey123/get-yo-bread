import { describe, it, expect } from "vitest";
import { MockBakeryProvider } from "@/lib/bakery/mock-provider";

describe("MockBakeryProvider.findNearby — edge cases", () => {
  const provider = new MockBakeryProvider();

  it("returns an empty array when limit is 0", async () => {
    const bakeries = await provider.findNearby("90210", 0);
    expect(bakeries).toEqual([]);
  });

  it("returns all bakeries when limit exceeds the available count", async () => {
    const bakeries = await provider.findNearby("90210", 9999);
    // There are 10 mock bakeries; should return all of them, not crash
    expect(bakeries.length).toBe(10);
  });

  it("returns an empty array when limit is negative (bug fix coverage)", async () => {
    // slice(0, -1) returns all-but-last which is wrong; fixed implementation
    // should treat negative limit as 0 and return []
    const bakeries = await provider.findNearby("90210", -1);
    expect(bakeries).toEqual([]);
  });

  it("returns an empty array for large negative limit", async () => {
    const bakeries = await provider.findNearby("90210", -999);
    expect(bakeries).toEqual([]);
  });

  it("returns correct number of results for limit exactly equal to available count", async () => {
    const bakeries = await provider.findNearby("10001", 10);
    expect(bakeries.length).toBe(10);
  });

  it("ignores the location argument and still returns results", async () => {
    const result1 = await provider.findNearby("New York, NY", 3);
    const result2 = await provider.findNearby("", 3);
    expect(result1).toEqual(result2);
  });

  it("returns bakeries with valid name and address for any limit", async () => {
    const bakeries = await provider.findNearby("anywhere", 10);
    bakeries.forEach((b) => {
      expect(typeof b.name).toBe("string");
      expect(b.name.trim().length).toBeGreaterThan(0);
      expect(typeof b.address).toBe("string");
      expect(b.address.trim().length).toBeGreaterThan(0);
    });
  });

  it("rating, when present, is a positive number", async () => {
    const bakeries = await provider.findNearby("anywhere", 10);
    bakeries.forEach((b) => {
      if (b.rating !== undefined) {
        expect(typeof b.rating).toBe("number");
        expect(b.rating).toBeGreaterThan(0);
      }
    });
  });

  it("is deterministic across multiple calls with the same limit", async () => {
    const first = await provider.findNearby("test", 5);
    const second = await provider.findNearby("test", 5);
    expect(first).toEqual(second);
  });
});
