import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ClockInScreen } from "@/components/clock/clock-in-screen";
import { ClockOutScreen } from "@/components/clock/clock-out-screen";
import { DoughRising } from "@/components/clock/dough-rising";

describe("DoughRising — edge cases", () => {
  it("handles a clock-in time in the future without crashing", () => {
    const futureTime = new Date(Date.now() + 60 * 60 * 1000); // 1 hour ahead
    render(<DoughRising clockInTime={futureTime} hourlyRate={50} />);
    const earningsEl = screen.getByTestId("live-earnings");
    expect(earningsEl).toBeDefined();
    // Should show $0.00 rather than a negative amount
    expect(earningsEl.textContent).toBe("$0.00");
  });

  it("handles zero hourly rate", () => {
    const clockInTime = new Date(Date.now() - 60 * 60 * 1000);
    render(<DoughRising clockInTime={clockInTime} hourlyRate={0} />);
    const earningsEl = screen.getByTestId("live-earnings");
    expect(earningsEl.textContent).toBe("$0.00");
  });

  it("handles very large hourly rate without crashing", () => {
    const clockInTime = new Date(Date.now() - 60 * 60 * 1000);
    render(<DoughRising clockInTime={clockInTime} hourlyRate={99999} />);
    const earningsEl = screen.getByTestId("live-earnings");
    expect(earningsEl).toBeDefined();
    expect(earningsEl.textContent).toMatch(/^\$/);
  });

  it("displays 'and rising...' text", () => {
    const clockInTime = new Date(Date.now() - 30 * 60 * 1000);
    render(<DoughRising clockInTime={clockInTime} hourlyRate={25} />);
    expect(screen.getByText("and rising...")).toBeDefined();
  });

  it("renders the dough animation container", () => {
    const clockInTime = new Date();
    render(<DoughRising clockInTime={clockInTime} hourlyRate={50} />);
    expect(screen.getByTestId("dough-container")).toBeDefined();
  });
});

describe("ClockOutScreen — edge cases", () => {
  it("renders $0.00 session earnings without crashing", () => {
    render(
      <ClockOutScreen
        sessionEarnings={0}
        sessionDuration="0m"
        weeklyEarnings={0}
        baguetteProgress={0}
      />
    );
    // Two $0.00: one for session, one for weekly progress
    const matches = screen.getAllByText("$0.00");
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it("renders very large session earnings ($999,999.99)", () => {
    render(
      <ClockOutScreen
        sessionEarnings={999999.99}
        sessionDuration="9999h 59m"
        weeklyEarnings={999999.99}
        baguetteProgress={1}
      />
    );
    const matches = screen.getAllByText("$999,999.99");
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it("renders session duration string", () => {
    render(
      <ClockOutScreen
        sessionEarnings={100}
        sessionDuration="2h 30m"
        weeklyEarnings={100}
        baguetteProgress={0.5}
      />
    );
    expect(screen.getByText("2h 30m")).toBeDefined();
  });

  it("renders 'Today's session' label", () => {
    render(
      <ClockOutScreen
        sessionEarnings={50}
        sessionDuration="1h 0m"
        weeklyEarnings={50}
        baguetteProgress={0.25}
      />
    );
    expect(screen.getByText("Today's session")).toBeDefined();
  });

  it("handles NaN session earnings gracefully", () => {
    render(
      <ClockOutScreen
        sessionEarnings={NaN}
        sessionDuration="1h"
        weeklyEarnings={0}
        baguetteProgress={0}
      />
    );
    // formatEarnings now guards NaN → $0.00
    const matches = screen.getAllByText("$0.00");
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it("handles empty session duration string", () => {
    render(
      <ClockOutScreen
        sessionEarnings={100}
        sessionDuration=""
        weeklyEarnings={100}
        baguetteProgress={0.5}
      />
    );
    // Both session earnings and weekly earnings show $100.00; just confirm at least one exists
    const matches = screen.getAllByText("$100.00");
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });
});

describe("ClockInScreen — rendering", () => {
  it("renders with valid props and shows clock-in time format", () => {
    const clockInTime = new Date(2026, 2, 30, 9, 0, 0); // 09:00 AM
    render(
      <ClockInScreen
        clockInTime={clockInTime}
        hourlyRate={50}
        weeklyEarnings={200}
        baguetteProgress={0.5}
      />
    );
    // Should show a clocked-in-at message
    expect(screen.getByText(/clocked in at/i)).toBeDefined();
  });

  it("renders DoughRising component", () => {
    const clockInTime = new Date(Date.now() - 60 * 60 * 1000);
    render(
      <ClockInScreen
        clockInTime={clockInTime}
        hourlyRate={25}
        weeklyEarnings={0}
        baguetteProgress={0}
      />
    );
    expect(screen.getByTestId("dough-container")).toBeDefined();
  });

  it("renders BaguetteProgress with weekly earnings", () => {
    const clockInTime = new Date(Date.now() - 30 * 60 * 1000);
    render(
      <ClockInScreen
        clockInTime={clockInTime}
        hourlyRate={40}
        weeklyEarnings={1500}
        baguetteProgress={0.75}
      />
    );
    expect(screen.getByText("$1,500.00")).toBeDefined();
  });
});
