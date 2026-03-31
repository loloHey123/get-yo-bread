import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { RecommendationCard } from "@/components/friday/recommendation-card";
import { ShareButton } from "@/components/friday/share-button";
import { Confetti } from "@/components/friday/confetti";
import { CelebrationScreen } from "@/components/friday/celebration-screen";
import type { CuratedItem, Bakery } from "@/lib/types";

// ---------------------------------------------------------------------------
// Mock next/image to avoid URL resolution errors in jsdom
// ---------------------------------------------------------------------------
vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) =>
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />,
}));

// ---------------------------------------------------------------------------
// Shared test fixtures
// ---------------------------------------------------------------------------

const baseItem: CuratedItem = {
  id: "item-1",
  name: "Croissant",
  description: "Buttery and flaky",
  image_url: null,
  tags: ["pastry"],
  allergens: ["gluten", "dairy"],
  seasonal: false,
  active: true,
};

const bakeries: Bakery[] = [
  { name: "La Boulangerie", address: "12 Rue du Pain", distance: "0.2 mi", rating: 4.8 },
  { name: "Bread & Butter", address: "45 Loaf Lane", distance: "0.5 mi" },
];

// ---------------------------------------------------------------------------
// RecommendationCard
// ---------------------------------------------------------------------------

describe("RecommendationCard — edge cases", () => {
  it("renders item name and description", () => {
    render(<RecommendationCard item={baseItem} bakeries={bakeries} />);
    expect(screen.getByText("Croissant")).toBeDefined();
    expect(screen.getByText("Buttery and flaky")).toBeDefined();
  });

  it("renders bakery list when bakeries provided", () => {
    render(<RecommendationCard item={baseItem} bakeries={bakeries} />);
    expect(screen.getByText("La Boulangerie")).toBeDefined();
    expect(screen.getByText("Bread & Butter")).toBeDefined();
  });

  it("does not render bakery section with empty bakeries array", () => {
    render(<RecommendationCard item={baseItem} bakeries={[]} />);
    expect(screen.queryByText("Bakeries near you")).toBeNull();
  });

  it("renders fallback image when image_url is null", () => {
    render(<RecommendationCard item={{ ...baseItem, image_url: null }} bakeries={[]} />);
    const img = screen.getByRole("img");
    expect(img).toBeDefined();
    // Next.js Image renders with an src containing the placeholder path
    expect(img.getAttribute("src")).toContain("placeholder-bread");
  });

  it("renders with a provided image_url", () => {
    const item = { ...baseItem, image_url: "https://example.com/croissant.jpg" };
    render(<RecommendationCard item={item} bakeries={[]} />);
    const img = screen.getByRole("img");
    expect(img).toBeDefined();
  });

  it("handles very long item name without crashing", () => {
    const longName = "A".repeat(200);
    render(<RecommendationCard item={{ ...baseItem, name: longName }} bakeries={[]} />);
    expect(screen.getByText(longName)).toBeDefined();
  });

  it("handles very long item description without crashing", () => {
    const longDesc = "This is a very long description. ".repeat(30);
    const { container } = render(
      <RecommendationCard item={{ ...baseItem, description: longDesc }} bakeries={[]} />
    );
    // Framer-motion may not render text immediately; check the container contains part of the text
    expect(container.textContent).toContain("This is a very long description.");
  });

  it("shows bakery rating when provided", () => {
    render(<RecommendationCard item={baseItem} bakeries={bakeries} />);
    expect(screen.getByText("4.8 ★")).toBeDefined();
  });

  it("does not crash when bakery rating is undefined", () => {
    const bakeryNoRating: Bakery = {
      name: "Unnamed Bakery",
      address: "Somewhere",
      distance: "1 mi",
    };
    render(<RecommendationCard item={baseItem} bakeries={[bakeryNoRating]} />);
    expect(screen.getByText("Unnamed Bakery")).toBeDefined();
  });

  it("shows 'This week's treat' label", () => {
    render(<RecommendationCard item={baseItem} bakeries={[]} />);
    expect(screen.getByText("This week's treat")).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// ShareButton
// ---------------------------------------------------------------------------

describe("ShareButton — edge cases", () => {
  const item: CuratedItem = {
    id: "item-1",
    name: "Chocolate Babka",
    description: "Rich",
    image_url: null,
    tags: [],
    allergens: [],
    seasonal: false,
    active: true,
  };

  beforeEach(() => {
    // Reset navigator mocks
    Object.defineProperty(window, "location", {
      value: { origin: "https://getyobread.app" },
      writable: true,
    });
  });

  it("renders 'Share the treat!' button", () => {
    render(<ShareButton item={item} recommendationId="rec-123" />);
    expect(screen.getByText(/share the treat/i)).toBeDefined();
  });

  it("falls back to clipboard copy when navigator.share is not available", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "share", { value: undefined, writable: true, configurable: true });
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      writable: true,
      configurable: true,
    });

    render(<ShareButton item={item} recommendationId="rec-abc" />);
    const button = screen.getByRole("button");
    fireEvent.click(button);

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledOnce();
    });
  });

  it("shows 'Link copied!' after clipboard copy", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "share", { value: undefined, writable: true, configurable: true });
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      writable: true,
      configurable: true,
    });

    render(<ShareButton item={item} recommendationId="rec-abc" />);
    const button = screen.getByRole("button");
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText("Link copied!")).toBeDefined();
    });
  });

  it("does not crash when both navigator.share and navigator.clipboard are unavailable", async () => {
    Object.defineProperty(navigator, "share", { value: undefined, writable: true, configurable: true });
    Object.defineProperty(navigator, "clipboard", { value: undefined, writable: true, configurable: true });

    render(<ShareButton item={item} recommendationId="rec-no-clipboard" />);
    const button = screen.getByRole("button");
    // Should not throw
    expect(() => fireEvent.click(button)).not.toThrow();
  });

  it("uses navigator.share when available", async () => {
    const shareMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "share", { value: shareMock, writable: true, configurable: true });

    render(<ShareButton item={item} recommendationId="rec-share" />);
    const button = screen.getByRole("button");
    fireEvent.click(button);

    await waitFor(() => {
      expect(shareMock).toHaveBeenCalledOnce();
    });
  });

  it("includes item name in share text", async () => {
    const shareMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "share", { value: shareMock, writable: true, configurable: true });

    render(<ShareButton item={item} recommendationId="rec-share" />);
    fireEvent.click(screen.getByRole("button"));

    await waitFor(() => {
      const call = shareMock.mock.calls[0][0];
      expect(call.text).toContain("Chocolate Babka");
    });
  });
});

// ---------------------------------------------------------------------------
// Confetti
// ---------------------------------------------------------------------------

describe("Confetti — SSR and rendering", () => {
  it("renders without crashing in jsdom", () => {
    // jsdom has no real window.innerHeight but this should not throw
    expect(() => render(<Confetti />)).not.toThrow();
  });

  it("renders a fixed-position overlay container", () => {
    const { container } = render(<Confetti />);
    const overlay = container.querySelector(".fixed");
    expect(overlay).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// CelebrationScreen — API error/loading states
// ---------------------------------------------------------------------------

describe("CelebrationScreen — API states", () => {
  beforeEach(() => {
    Object.defineProperty(navigator, "vibrate", {
      value: vi.fn(),
      writable: true,
      configurable: true,
    });
  });

  it("shows loading indicator while recommendation is fetching", () => {
    // fetch never resolves during this test
    global.fetch = vi.fn(() => new Promise(() => {})) as unknown as typeof fetch;

    render(<CelebrationScreen weeklyEarnings={1000} baguetteProgress={0.8} />);
    expect(screen.getByText(/finding your treat/i)).toBeDefined();
  });

  it("shows error message when recommendation API returns non-ok", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({ ok: false, status: 500 })
    ) as unknown as typeof fetch;

    render(<CelebrationScreen weeklyEarnings={1000} baguetteProgress={0.8} />);

    await waitFor(() => {
      expect(screen.getByText(/could not load your treat/i)).toBeDefined();
    });
  });

  it("shows error message when recommendation API throws a network error", async () => {
    global.fetch = vi.fn(() => Promise.reject(new Error("Network error"))) as unknown as typeof fetch;

    render(<CelebrationScreen weeklyEarnings={1000} baguetteProgress={0.8} />);

    await waitFor(() => {
      expect(screen.getByText(/could not load your treat/i)).toBeDefined();
    });
  });

  it("renders recommendation card on successful API response", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            id: "rec-1",
            item: {
              id: "item-1",
              name: "Kouign-Amann",
              description: "Caramelized pastry",
              image_url: null,
              tags: [],
              allergens: [],
              seasonal: false,
              active: true,
            },
            bakeries: [],
          }),
      })
    ) as unknown as typeof fetch;

    await act(async () => {
      render(<CelebrationScreen weeklyEarnings={1200} baguetteProgress={1} />);
    });

    await waitFor(
      () => {
        expect(screen.getByText("Kouign-Amann")).toBeDefined();
      },
      { timeout: 3000 }
    );
  });

  it("renders weekly earnings", () => {
    global.fetch = vi.fn(() => new Promise(() => {})) as unknown as typeof fetch;
    render(<CelebrationScreen weeklyEarnings={850} baguetteProgress={0.5} />);
    // $850.00 appears in the header AND the baguette progress bar; use getAllByText
    const matches = screen.getAllByText("$850.00");
    expect(matches.length).toBeGreaterThan(0);
  });
});
