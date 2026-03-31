import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BaguetteProgress } from "@/components/baguette-progress";

describe("BaguetteProgress", () => {
  it("renders with 0 progress", () => {
    render(<BaguetteProgress progress={0} weeklyEarnings={0} />);
    expect(screen.getByText("$0.00")).toBeDefined();
  });

  it("renders with partial progress", () => {
    render(<BaguetteProgress progress={0.5} weeklyEarnings={1000} />);
    expect(screen.getByText("$1,000.00")).toBeDefined();
  });

  it("renders with full progress", () => {
    render(<BaguetteProgress progress={1} weeklyEarnings={2000} />);
    expect(screen.getByText("$2,000.00")).toBeDefined();
  });

  it("handles overtime (progress > 1)", () => {
    render(<BaguetteProgress progress={1.5} weeklyEarnings={3000} />);
    expect(screen.getByText("$3,000.00")).toBeDefined();
  });
});
