import { describe, it, expect } from "vitest";
import { reorderPositions } from "@/app/api/shelf/route";

describe("reorderPositions", () => {
  it("assigns sequential positions from top to bottom", () => {
    const ids = ["rec-3", "rec-1", "rec-2"];
    const result = reorderPositions(ids);
    expect(result).toEqual([
      { id: "rec-3", shelf_position: 1 },
      { id: "rec-1", shelf_position: 2 },
      { id: "rec-2", shelf_position: 3 },
    ]);
  });

  it("handles single item", () => {
    const result = reorderPositions(["rec-1"]);
    expect(result).toEqual([{ id: "rec-1", shelf_position: 1 }]);
  });

  it("handles empty array", () => {
    const result = reorderPositions([]);
    expect(result).toEqual([]);
  });
});
