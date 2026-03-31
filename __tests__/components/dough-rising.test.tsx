import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DoughRising } from "@/components/clock/dough-rising";

describe("DoughRising", () => {
  it("renders with current earnings", () => {
    const clockInTime = new Date(Date.now() - 60 * 60 * 1000);
    render(<DoughRising clockInTime={clockInTime} hourlyRate={50} />);
    const earningsEl = screen.getByTestId("live-earnings");
    expect(earningsEl).toBeDefined();
  });

  it("displays the dough animation container", () => {
    const clockInTime = new Date();
    render(<DoughRising clockInTime={clockInTime} hourlyRate={50} />);
    expect(screen.getByTestId("dough-container")).toBeDefined();
  });
});
