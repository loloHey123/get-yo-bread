import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BreadShelf } from "@/components/bread-shelf";

const mockRecs = [
  {
    id: "rec-1",
    user_id: "user-1",
    item_id: "item-1",
    week_of: "2026-03-27",
    tried: true,
    shelf_position: 1,
    created_at: "2026-03-27",
    item: {
      id: "item-1",
      name: "Chocolate Babka",
      description: "Rich chocolate bread",
      image_url: null,
      tags: ["pastry"],
      allergens: ["gluten"],
      seasonal: false,
      active: true,
    },
  },
  {
    id: "rec-2",
    user_id: "user-1",
    item_id: "item-2",
    week_of: "2026-03-20",
    tried: false,
    shelf_position: 2,
    created_at: "2026-03-20",
    item: {
      id: "item-2",
      name: "Sourdough Loaf",
      description: "Tangy bread",
      image_url: null,
      tags: ["bread"],
      allergens: ["gluten"],
      seasonal: false,
      active: true,
    },
  },
];

describe("BreadShelf", () => {
  it("renders all recommendation cards", () => {
    render(
      <BreadShelf
        recommendations={mockRecs}
        onReorder={vi.fn()}
        onMarkTried={vi.fn()}
      />
    );
    expect(screen.getByText("Chocolate Babka")).toBeDefined();
    expect(screen.getByText("Sourdough Loaf")).toBeDefined();
  });

  it("shows 'Tried it!' button for untried items", () => {
    render(
      <BreadShelf
        recommendations={mockRecs}
        onReorder={vi.fn()}
        onMarkTried={vi.fn()}
      />
    );
    expect(screen.getByText("Tried it!")).toBeDefined();
  });
});
