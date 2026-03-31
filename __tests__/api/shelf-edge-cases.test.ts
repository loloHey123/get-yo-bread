import { describe, it, expect } from "vitest";
import { reorderPositions } from "@/app/api/shelf/route";

describe("reorderPositions — edge cases", () => {
  // ── positions are 1-indexed ───────────────────────────────────────────────

  it("first item always gets shelf_position 1", () => {
    const result = reorderPositions(["rec-A", "rec-B", "rec-C"]);
    expect(result[0].shelf_position).toBe(1);
  });

  it("last item's shelf_position equals the array length", () => {
    const ids = ["a", "b", "c", "d", "e"];
    const result = reorderPositions(ids);
    expect(result[result.length - 1].shelf_position).toBe(ids.length);
  });

  // ── duplicate IDs ──────────────────────────────────────────────────────────

  it("assigns different positions to duplicate IDs (later entry gets the higher position)", () => {
    // The caller passes the same ID twice — both get different positions.
    // In the route handler the DB update runs twice for the same id, so the last
    // write wins.  reorderPositions itself should still produce two entries.
    const result = reorderPositions(["rec-1", "rec-1", "rec-2"]);
    expect(result).toHaveLength(3);
    // Both entries for rec-1 have different positions
    const rec1Entries = result.filter((r) => r.id === "rec-1");
    expect(rec1Entries).toHaveLength(2);
    expect(rec1Entries[0].shelf_position).toBe(1);
    expect(rec1Entries[1].shelf_position).toBe(2);
  });

  it("all-duplicate array produces sequential positions", () => {
    const result = reorderPositions(["x", "x", "x"]);
    expect(result.map((r) => r.shelf_position)).toEqual([1, 2, 3]);
  });

  // ── large arrays ──────────────────────────────────────────────────────────

  it("handles 100 items without throwing", () => {
    const ids = Array.from({ length: 100 }, (_, i) => `rec-${i}`);
    expect(() => reorderPositions(ids)).not.toThrow();
    const result = reorderPositions(ids);
    expect(result).toHaveLength(100);
  });

  it("assigns positions 1 through 100 for a 100-item array", () => {
    const ids = Array.from({ length: 100 }, (_, i) => `rec-${i}`);
    const result = reorderPositions(ids);
    const positions = result.map((r) => r.shelf_position);
    const expected = Array.from({ length: 100 }, (_, i) => i + 1);
    expect(positions).toEqual(expected);
  });

  it("handles 1000 items in reasonable time", () => {
    const ids = Array.from({ length: 1000 }, (_, i) => `rec-${i}`);
    const start = Date.now();
    const result = reorderPositions(ids);
    expect(Date.now() - start).toBeLessThan(500); // generous budget
    expect(result).toHaveLength(1000);
    expect(result[999].shelf_position).toBe(1000);
  });

  // ── IDs with special characters ───────────────────────────────────────────

  it("preserves IDs with UUID format", () => {
    const uuid = "550e8400-e29b-41d4-a716-446655440000";
    const result = reorderPositions([uuid]);
    expect(result[0].id).toBe(uuid);
    expect(result[0].shelf_position).toBe(1);
  });

  it("preserves IDs with spaces and special characters", () => {
    const weirdIds = ["rec 1", "rec/2", "rec?id=3", "rec#hash", "rec&amp;"];
    const result = reorderPositions(weirdIds);
    expect(result).toHaveLength(5);
    result.forEach((r, i) => {
      expect(r.id).toBe(weirdIds[i]);
      expect(r.shelf_position).toBe(i + 1);
    });
  });

  it("preserves IDs with unicode characters", () => {
    const unicodeIds = ["面包-1", "パン-2", "خبز-3"];
    const result = reorderPositions(unicodeIds);
    expect(result).toHaveLength(3);
    result.forEach((r, i) => {
      expect(r.id).toBe(unicodeIds[i]);
      expect(r.shelf_position).toBe(i + 1);
    });
  });

  it("preserves empty string as ID (edge: unlikely but should not crash)", () => {
    const result = reorderPositions(["", "rec-1"]);
    expect(result[0].id).toBe("");
    expect(result[0].shelf_position).toBe(1);
    expect(result[1].id).toBe("rec-1");
    expect(result[1].shelf_position).toBe(2);
  });

  it("preserves very long ID string", () => {
    const longId = "rec-" + "X".repeat(10_000);
    const result = reorderPositions([longId, "rec-2"]);
    expect(result[0].id).toBe(longId);
    expect(result[0].shelf_position).toBe(1);
  });

  // ── idempotent structure ──────────────────────────────────────────────────

  it("produces the same output for the same input (deterministic)", () => {
    const ids = ["c", "a", "b"];
    expect(reorderPositions(ids)).toEqual(reorderPositions(ids));
  });

  it("does not mutate the input array", () => {
    const ids = ["rec-3", "rec-1", "rec-2"];
    const copy = [...ids];
    reorderPositions(ids);
    expect(ids).toEqual(copy);
  });

  // ── output shape ──────────────────────────────────────────────────────────

  it("each result item has only id and shelf_position keys", () => {
    const result = reorderPositions(["rec-1"]);
    expect(Object.keys(result[0]).sort()).toEqual(["id", "shelf_position"]);
  });
});
