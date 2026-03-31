import { describe, it, expect } from "vitest";
import { MockBakeryProvider } from "@/lib/bakery/mock-provider";

describe("MockBakeryProvider", () => {
  const provider = new MockBakeryProvider();

  it("returns bakeries for any location", async () => {
    const bakeries = await provider.findNearby("90210");
    expect(bakeries.length).toBeGreaterThan(0);
  });

  it("returns bakeries with required fields", async () => {
    const bakeries = await provider.findNearby("10001");
    bakeries.forEach((bakery) => {
      expect(bakery.name).toBeDefined();
      expect(bakery.address).toBeDefined();
    });
  });

  it("returns at most 5 bakeries by default", async () => {
    const bakeries = await provider.findNearby("10001");
    expect(bakeries.length).toBeLessThanOrEqual(5);
  });
});
