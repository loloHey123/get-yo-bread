import { describe, it, expect } from "vitest";
import {
  pickRecommendation,
  type RecommendationContext,
} from "@/app/api/recommendation/route";
import type { CuratedItem } from "@/lib/types";

// ── shared fixture items ──────────────────────────────────────────────────────

const babka: CuratedItem = {
  id: "1",
  name: "Chocolate Babka",
  description: "Rich chocolate bread",
  image_url: null,
  tags: ["pastry", "chocolate"],
  allergens: ["gluten", "dairy"],
  seasonal: false,
  active: true,
};

const almondCroissant: CuratedItem = {
  id: "2",
  name: "Almond Croissant",
  description: "Flaky almond pastry",
  image_url: null,
  tags: ["pastry", "croissant", "nuts"],
  allergens: ["gluten", "dairy", "nuts"],
  seasonal: false,
  active: true,
};

const sourdough: CuratedItem = {
  id: "3",
  name: "Sourdough Loaf",
  description: "Tangy bread",
  image_url: null,
  tags: ["bread", "sourdough"],
  allergens: ["gluten"],
  seasonal: false,
  active: true,
};

const glutenFree: CuratedItem = {
  id: "4",
  name: "GF Muffin",
  description: "Gluten-free muffin",
  image_url: null,
  tags: ["muffin", "gluten-free"],
  allergens: [],
  seasonal: false,
  active: true,
};

const allItems = [babka, almondCroissant, sourdough, glutenFree];

describe("pickRecommendation — edge cases", () => {
  // ── empty items array ─────────────────────────────────────────────────────

  it("returns null for an empty items array", () => {
    const context: RecommendationContext = {
      items: [],
      prefs: ["pastry"],
      allergies: [],
      pastItemIds: [],
    };
    expect(pickRecommendation(context)).toBeNull();
  });

  // ── all items already recommended ─────────────────────────────────────────

  it("returns null when pastItemIds covers all items", () => {
    const context: RecommendationContext = {
      items: allItems,
      prefs: ["pastry"],
      allergies: [],
      pastItemIds: ["1", "2", "3", "4"],
    };
    expect(pickRecommendation(context)).toBeNull();
  });

  it("returns null when pastItemIds exactly matches the single available item", () => {
    const context: RecommendationContext = {
      items: [babka],
      prefs: [],
      allergies: [],
      pastItemIds: ["1"],
    };
    expect(pickRecommendation(context)).toBeNull();
  });

  // ── user has no preferences at all ───────────────────────────────────────

  it("still picks an item when prefs are empty (falls back to full safe pool)", () => {
    const context: RecommendationContext = {
      items: allItems,
      prefs: [],
      allergies: [],
      pastItemIds: [],
    };
    const result = pickRecommendation(context);
    expect(result).not.toBeNull();
    expect(allItems).toContainEqual(result);
  });

  // ── user is allergic to everything ────────────────────────────────────────

  it("returns null when user is allergic to an allergen present in every item", () => {
    // babka, almondCroissant, sourdough all have gluten; glutenFree has none.
    // If user is allergic to both gluten AND the allergens in glutenFree (none)...
    // Actually glutenFree has no allergens, so it would still be safe.
    // Use a case where user is allergic to "special" which only glutenFree has conceptually:
    // Easiest: use items where all have at least one allergen the user has.
    const glutenAndDairyFree: CuratedItem = {
      id: "5",
      name: "Vegan Cookie",
      description: "No major allergens",
      image_url: null,
      tags: ["cookie"],
      allergens: ["soy"], // soy is in user's allergy list below
      seasonal: false,
      active: true,
    };
    const allAllergic = [babka, almondCroissant, sourdough, glutenAndDairyFree];
    const context: RecommendationContext = {
      items: allAllergic,
      prefs: [],
      allergies: ["gluten", "soy"],
    pastItemIds: [],
    };
    // babka → gluten (blocked), almondCroissant → gluten (blocked), sourdough → gluten (blocked),
    // glutenAndDairyFree → soy (blocked)
    expect(pickRecommendation(context)).toBeNull();
  });

  it("skips only items with user allergens, returns safe items", () => {
    const context: RecommendationContext = {
      items: allItems,
      prefs: [],
      allergies: ["nuts"],
      pastItemIds: [],
    };
    const result = pickRecommendation(context);
    expect(result).not.toBeNull();
    expect(result!.allergens).not.toContain("nuts");
  });

  // ── single item that matches ──────────────────────────────────────────────

  it("returns the only available item when it matches prefs", () => {
    const context: RecommendationContext = {
      items: [babka],
      prefs: ["pastry"],
      allergies: [],
      pastItemIds: [],
    };
    expect(pickRecommendation(context)).toEqual(babka);
  });

  it("returns the only available item even when it does not match prefs", () => {
    const context: RecommendationContext = {
      items: [sourdough],
      prefs: ["croissant"],
      allergies: [],
      pastItemIds: [],
    };
    expect(pickRecommendation(context)).toEqual(sourdough);
  });

  // ── items with overlapping tags ───────────────────────────────────────────

  it("considers any item whose tags overlap with prefs, including partially overlapping ones", () => {
    // babka has ["pastry","chocolate"]; almondCroissant has ["pastry","croissant","nuts"]
    // pref is "chocolate" — only babka should be in the pref pool
    const context: RecommendationContext = {
      items: [babka, almondCroissant, sourdough],
      prefs: ["chocolate"],
      allergies: [],
      pastItemIds: [],
    };
    const result = pickRecommendation(context);
    expect(result).toEqual(babka);
  });

  it("uses pref-matched pool when multiple items share a tag", () => {
    // Both babka and almondCroissant have "pastry"
    // With pref "pastry", neither sourdough nor glutenFree should be returned
    const results = new Set<string>();
    for (let i = 0; i < 50; i++) {
      const context: RecommendationContext = {
        items: allItems,
        prefs: ["pastry"],
        allergies: [],
        pastItemIds: [],
      };
      const r = pickRecommendation(context);
      if (r) results.add(r.id);
    }
    // Should only ever return babka (1) or almondCroissant (2), not sourdough (3) or glutenFree (4)
    expect(results.has("3")).toBe(false);
    expect(results.has("4")).toBe(false);
  });

  // ── all items are the same (duplicate objects) ────────────────────────────

  it("handles items array where all entries are identical objects", () => {
    const duplicateItems: CuratedItem[] = Array.from({ length: 5 }, () => ({
      ...babka,
    }));
    const context: RecommendationContext = {
      items: duplicateItems,
      prefs: ["pastry"],
      allergies: [],
      pastItemIds: [],
    };
    const result = pickRecommendation(context);
    expect(result).not.toBeNull();
    expect(result!.id).toBe("1");
  });

  it("all items excluded by pastItemIds even when duplicated", () => {
    const duplicateItems: CuratedItem[] = Array.from({ length: 5 }, () => ({
      ...babka,
    }));
    const context: RecommendationContext = {
      items: duplicateItems,
      prefs: [],
      allergies: [],
      pastItemIds: ["1"],
    };
    // All items have id "1" which is in pastItemIds → all filtered out
    expect(pickRecommendation(context)).toBeNull();
  });

  // ── allergy + pastItems interaction ──────────────────────────────────────

  it("applies both pastItemIds and allergen filters simultaneously", () => {
    // pastItemIds excludes sourdough, allergies exclude gluten (removes babka + almondCroissant)
    // Only glutenFree should remain
    const context: RecommendationContext = {
      items: allItems,
      prefs: [],
      allergies: ["gluten"],
      pastItemIds: ["3"], // sourdough already seen — but it would be excluded by allergy anyway
    };
    const result = pickRecommendation(context);
    // gluten items: babka(1), almondCroissant(2), sourdough(3) — all blocked
    // glutenFree(4) is safe and not in pastItemIds
    expect(result).toEqual(glutenFree);
  });

  // ── no past recs, no prefs — pure fallback ────────────────────────────────

  it("returns a result from the full pool when pastItemIds is empty and prefs is empty", () => {
    const context: RecommendationContext = {
      items: [sourdough],
      prefs: [],
      allergies: [],
      pastItemIds: [],
    };
    expect(pickRecommendation(context)).toEqual(sourdough);
  });

  // ── large arrays ─────────────────────────────────────────────────────────

  it("handles 500 items without throwing", () => {
    const bigItems: CuratedItem[] = Array.from({ length: 500 }, (_, i) => ({
      id: `item-${i}`,
      name: `Item ${i}`,
      description: "",
      image_url: null,
      tags: i % 2 === 0 ? ["even"] : ["odd"],
      allergens: [],
      seasonal: false,
      active: true,
    }));
    const context: RecommendationContext = {
      items: bigItems,
      prefs: ["even"],
      allergies: [],
      pastItemIds: [],
    };
    const result = pickRecommendation(context);
    expect(result).not.toBeNull();
    expect(result!.tags).toContain("even");
  });

  it("handles 500 pastItemIds without throwing", () => {
    const bigItems: CuratedItem[] = Array.from({ length: 502 }, (_, i) => ({
      id: `item-${i}`,
      name: `Item ${i}`,
      description: "",
      image_url: null,
      tags: ["bread"],
      allergens: [],
      seasonal: false,
      active: true,
    }));
    // Mark first 500 as already seen — items 500 and 501 remain
    const pastItemIds = Array.from({ length: 500 }, (_, i) => `item-${i}`);
    const context: RecommendationContext = {
      items: bigItems,
      prefs: [],
      allergies: [],
      pastItemIds,
    };
    const result = pickRecommendation(context);
    expect(result).not.toBeNull();
    expect(["item-500", "item-501"]).toContain(result!.id);
  });
});
