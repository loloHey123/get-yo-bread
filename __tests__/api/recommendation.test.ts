import { describe, it, expect } from "vitest";
import {
  pickRecommendation,
  type RecommendationContext,
} from "@/app/api/recommendation/route";

describe("pickRecommendation", () => {
  const items = [
    {
      id: "1",
      name: "Chocolate Babka",
      description: "Rich chocolate bread",
      image_url: null,
      tags: ["pastry", "chocolate"],
      allergens: ["gluten", "dairy"],
      seasonal: false,
      active: true,
    },
    {
      id: "2",
      name: "Almond Croissant",
      description: "Flaky almond pastry",
      image_url: null,
      tags: ["pastry", "croissant", "nuts"],
      allergens: ["gluten", "dairy", "nuts"],
      seasonal: false,
      active: true,
    },
    {
      id: "3",
      name: "Sourdough Loaf",
      description: "Tangy bread",
      image_url: null,
      tags: ["bread", "sourdough"],
      allergens: ["gluten"],
      seasonal: false,
      active: true,
    },
  ];

  it("picks an item matching user preferences", () => {
    const context: RecommendationContext = {
      items,
      prefs: ["pastry"],
      allergies: [],
      pastItemIds: [],
    };
    const result = pickRecommendation(context);
    expect(result).toBeDefined();
    expect(result!.tags).toContain("pastry");
  });

  it("excludes items with user allergens", () => {
    const context: RecommendationContext = {
      items,
      prefs: ["pastry"],
      allergies: ["nuts"],
      pastItemIds: [],
    };
    const result = pickRecommendation(context);
    expect(result).toBeDefined();
    expect(result!.name).not.toBe("Almond Croissant");
  });

  it("excludes previously recommended items", () => {
    const context: RecommendationContext = {
      items,
      prefs: ["pastry", "bread"],
      allergies: [],
      pastItemIds: ["1", "2"],
    };
    const result = pickRecommendation(context);
    expect(result).toBeDefined();
    expect(result!.id).toBe("3");
  });

  it("returns null when no items match", () => {
    const context: RecommendationContext = {
      items,
      prefs: ["pastry"],
      allergies: ["gluten"],
      pastItemIds: [],
    };
    const result = pickRecommendation(context);
    expect(result).toBeNull();
  });

  it("falls back to any unshown item when no prefs match", () => {
    const context: RecommendationContext = {
      items,
      prefs: ["donut"],
      allergies: [],
      pastItemIds: [],
    };
    const result = pickRecommendation(context);
    expect(result).toBeDefined();
  });
});
