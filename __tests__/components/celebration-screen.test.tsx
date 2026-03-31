import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { CelebrationScreen } from "@/components/friday/celebration-screen";

global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () =>
      Promise.resolve({
        item: {
          id: "1",
          name: "Chocolate Babka",
          description: "Rich chocolate bread",
          image_url: null,
          tags: ["pastry"],
          allergens: ["gluten"],
          seasonal: false,
          active: true,
        },
        bakeries: [
          { name: "Test Bakery", address: "123 Main St", distance: "0.3 mi" },
        ],
      }),
  })
) as unknown as typeof fetch;

Object.defineProperty(navigator, "vibrate", {
  value: vi.fn(),
  writable: true,
});

describe("CelebrationScreen", () => {
  it("renders weekly earnings", () => {
    render(
      <CelebrationScreen weeklyEarnings={1247.5} baguetteProgress={1} />
    );
    const matches = screen.getAllByText("$1,247.50");
    expect(matches.length).toBeGreaterThan(0);
  });

  it("renders the celebration heading", () => {
    render(
      <CelebrationScreen weeklyEarnings={1000} baguetteProgress={0.8} />
    );
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toBeDefined();
  });
});
