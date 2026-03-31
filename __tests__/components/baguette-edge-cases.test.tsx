import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BaguetteProgress } from "@/components/baguette-progress";

describe("BaguetteProgress — edge cases", () => {
  it("handles NaN progress without crashing", () => {
    render(<BaguetteProgress progress={NaN} weeklyEarnings={500} />);
    // Should not throw and should show earnings
    expect(screen.getByText("$500.00")).toBeDefined();
    // No overtime message should appear
    expect(screen.queryByText(/overtime/i)).toBeNull();
  });

  it("handles Infinity progress without crashing", () => {
    render(<BaguetteProgress progress={Infinity} weeklyEarnings={100} />);
    expect(screen.getByText("$100.00")).toBeDefined();
  });

  it("handles negative progress without crashing", () => {
    render(<BaguetteProgress progress={-5} weeklyEarnings={0} />);
    expect(screen.getByText("$0.00")).toBeDefined();
    // Negative should not trigger overtime
    expect(screen.queryByText(/overtime/i)).toBeNull();
  });

  it("handles NaN weeklyEarnings by showing $0.00", () => {
    render(<BaguetteProgress progress={0.5} weeklyEarnings={NaN} />);
    expect(screen.getByText("$0.00")).toBeDefined();
  });

  it("handles Infinity weeklyEarnings by showing $0.00", () => {
    render(<BaguetteProgress progress={0.5} weeklyEarnings={Infinity} />);
    expect(screen.getByText("$0.00")).toBeDefined();
  });

  it("shows overtime message when progress > 1", () => {
    render(<BaguetteProgress progress={1.2} weeklyEarnings={2400} />);
    expect(screen.getByText(/overtime/i)).toBeDefined();
  });

  it("does not show overtime message when progress equals 1", () => {
    render(<BaguetteProgress progress={1} weeklyEarnings={2000} />);
    expect(screen.queryByText(/overtime/i)).toBeNull();
  });

  it("renders zero earnings as $0.00", () => {
    render(<BaguetteProgress progress={0} weeklyEarnings={0} />);
    expect(screen.getByText("$0.00")).toBeDefined();
  });

  it("renders very large earnings correctly", () => {
    render(<BaguetteProgress progress={0.9} weeklyEarnings={999999.99} />);
    expect(screen.getByText("$999,999.99")).toBeDefined();
  });

  it('renders "This week" label', () => {
    render(<BaguetteProgress progress={0.5} weeklyEarnings={1000} />);
    expect(screen.getByText("This week")).toBeDefined();
  });
});
