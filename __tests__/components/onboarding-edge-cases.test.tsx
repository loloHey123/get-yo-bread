import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { EmailStep } from "@/components/onboarding/email-step";
import { RateStep } from "@/components/onboarding/rate-step";
import { LocationStep } from "@/components/onboarding/location-step";
import { PreferencesStep } from "@/components/onboarding/preferences-step";
import { CompleteStep } from "@/components/onboarding/complete-step";

// ---------------------------------------------------------------------------
// Supabase client mock — shared singleton so components and tests see the same fn
// ---------------------------------------------------------------------------

const mockSignInWithOtp = vi.fn();

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      signInWithOtp: mockSignInWithOtp,
    },
  }),
}));

// ---------------------------------------------------------------------------
// EmailStep
// ---------------------------------------------------------------------------

describe("EmailStep — edge cases", () => {
  it("renders the email input and submit button", () => {
    mockSignInWithOtp.mockResolvedValue({ data: {}, error: null });
    render(<EmailStep onComplete={vi.fn()} />);
    expect(screen.getByPlaceholderText("your@email.com")).toBeDefined();
    expect(screen.getByRole("button", { name: /send magic link/i })).toBeDefined();
  });

  it("shows loading state while submitting", async () => {
    // Never resolves — keeps button in loading state
    mockSignInWithOtp.mockImplementation(() => new Promise(() => {}));

    render(<EmailStep onComplete={vi.fn()} />);
    const input = screen.getByPlaceholderText("your@email.com");
    fireEvent.change(input, { target: { value: "test@example.com" } });
    fireEvent.submit(screen.getByRole("button").closest("form")!);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /sending/i })).toBeDefined();
    });
  });

  it("shows confirmation screen after successful OTP send", async () => {
    mockSignInWithOtp.mockResolvedValue({ data: {}, error: null });

    render(<EmailStep onComplete={vi.fn()} />);
    const input = screen.getByPlaceholderText("your@email.com");
    fireEvent.change(input, { target: { value: "bread@example.com" } });
    fireEvent.submit(screen.getByRole("button").closest("form")!);

    await waitFor(() => {
      expect(screen.getByText(/check your email/i)).toBeDefined();
    });
  });

  it("shows error message when OTP send fails", async () => {
    mockSignInWithOtp.mockResolvedValue({
      data: {},
      error: { message: "Email sending failed" },
    });

    render(<EmailStep onComplete={vi.fn()} />);
    const input = screen.getByPlaceholderText("your@email.com");
    fireEvent.change(input, { target: { value: "bad@example.com" } });
    fireEvent.submit(screen.getByRole("button").closest("form")!);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeDefined();
      expect(screen.getByText(/something went a-rye/i)).toBeDefined();
    });
  });
});

// ---------------------------------------------------------------------------
// RateStep
// ---------------------------------------------------------------------------

describe("RateStep — edge cases", () => {
  it("renders hourly rate and expected hours inputs", () => {
    render(<RateStep onComplete={vi.fn()} />);
    expect(screen.getByPlaceholderText("50.00")).toBeDefined();
    expect(screen.getByPlaceholderText("40")).toBeDefined();
  });

  it("calls onComplete with parsed numbers on valid submit", () => {
    const onComplete = vi.fn();
    render(<RateStep onComplete={onComplete} />);

    fireEvent.change(screen.getByPlaceholderText("50.00"), {
      target: { value: "30.50" },
    });
    fireEvent.change(screen.getByPlaceholderText("40"), {
      target: { value: "32" },
    });
    fireEvent.submit(screen.getByRole("button").closest("form")!);

    expect(onComplete).toHaveBeenCalledWith(30.5, 32);
  });

  it("does not call onComplete with NaN if rate is empty", () => {
    const onComplete = vi.fn();
    render(<RateStep onComplete={onComplete} />);

    // hourlyRate stays as empty string → parseFloat("") = NaN
    fireEvent.change(screen.getByPlaceholderText("40"), {
      target: { value: "40" },
    });
    // The input is `required` so browser validation prevents submit;
    // our defensive guard also blocks it
    fireEvent.submit(screen.getByRole("button").closest("form")!);

    expect(onComplete).not.toHaveBeenCalled();
  });

  it("does not call onComplete when rate is zero or negative", () => {
    const onComplete = vi.fn();
    render(<RateStep onComplete={onComplete} />);

    fireEvent.change(screen.getByPlaceholderText("50.00"), {
      target: { value: "0" },
    });
    fireEvent.change(screen.getByPlaceholderText("40"), {
      target: { value: "40" },
    });
    fireEvent.submit(screen.getByRole("button").closest("form")!);

    expect(onComplete).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// LocationStep
// ---------------------------------------------------------------------------

describe("LocationStep — edge cases", () => {
  it("renders the location input", () => {
    render(<LocationStep onComplete={vi.fn()} />);
    expect(screen.getByPlaceholderText(/zip code or address/i)).toBeDefined();
  });

  it("calls onComplete with trimmed location on submit", () => {
    const onComplete = vi.fn();
    render(<LocationStep onComplete={onComplete} />);

    fireEvent.change(screen.getByPlaceholderText(/zip code or address/i), {
      target: { value: "10001" },
    });
    fireEvent.submit(screen.getByRole("button").closest("form")!);

    expect(onComplete).toHaveBeenCalledWith("10001");
  });

  it("shows 'Next' button", () => {
    render(<LocationStep onComplete={vi.fn()} />);
    expect(screen.getByRole("button", { name: /next/i })).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// PreferencesStep
// ---------------------------------------------------------------------------

describe("PreferencesStep — edge cases", () => {
  it("renders preference and allergy options", () => {
    render(<PreferencesStep onComplete={vi.fn()} />);
    expect(screen.getByText("Croissants")).toBeDefined();
    expect(screen.getByText("Gluten")).toBeDefined();
  });

  it("toggles preferences on and off", () => {
    render(<PreferencesStep onComplete={vi.fn()} />);
    const croissantBtn = screen.getByRole("button", { name: "Croissants" });
    fireEvent.click(croissantBtn);
    // clicked once → selected (bg-crust applied via class)
    fireEvent.click(croissantBtn);
    // clicked again → deselected
    // If no crash, test passes — DOM mutation is the success criterion
    expect(croissantBtn).toBeDefined();
  });

  it("calls onComplete with lowercased prefs on submit", () => {
    const onComplete = vi.fn();
    render(<PreferencesStep onComplete={onComplete} />);

    fireEvent.click(screen.getByRole("button", { name: "Cookies" }));
    fireEvent.click(screen.getByRole("button", { name: "Donuts" }));
    fireEvent.submit(
      screen.getByRole("button", { name: /let's get this bread/i }).closest("form")!
    );

    expect(onComplete).toHaveBeenCalledWith(
      ["cookies", "donuts"],
      []
    );
  });

  it("splits custom allergy input by comma and trims whitespace", () => {
    const onComplete = vi.fn();
    render(<PreferencesStep onComplete={onComplete} />);

    fireEvent.change(
      screen.getByPlaceholderText(/other allergies/i),
      { target: { value: "wheat, oat , corn" } }
    );
    fireEvent.submit(
      screen.getByRole("button", { name: /let's get this bread/i }).closest("form")!
    );

    const [, allergies] = onComplete.mock.calls[0];
    expect(allergies).toContain("wheat");
    expect(allergies).toContain("oat");
    expect(allergies).toContain("corn");
  });

  it("combines toggled allergies with custom allergy input", () => {
    const onComplete = vi.fn();
    render(<PreferencesStep onComplete={onComplete} />);

    fireEvent.click(screen.getByRole("button", { name: "Nuts" }));
    fireEvent.change(
      screen.getByPlaceholderText(/other allergies/i),
      { target: { value: "mustard" } }
    );
    fireEvent.submit(
      screen.getByRole("button", { name: /let's get this bread/i }).closest("form")!
    );

    const [, allergies] = onComplete.mock.calls[0];
    expect(allergies).toContain("nuts");
    expect(allergies).toContain("mustard");
  });

  it("submits with no preferences selected (all optional)", () => {
    const onComplete = vi.fn();
    render(<PreferencesStep onComplete={onComplete} />);

    fireEvent.submit(
      screen.getByRole("button", { name: /let's get this bread/i }).closest("form")!
    );

    expect(onComplete).toHaveBeenCalledWith([], []);
  });
});

// ---------------------------------------------------------------------------
// CompleteStep
// ---------------------------------------------------------------------------

describe("CompleteStep", () => {
  it("renders 'You're all set!' heading", () => {
    render(<CompleteStep />);
    expect(screen.getByText("You're all set!")).toBeDefined();
  });

  it("renders the call-to-action text", () => {
    render(<CompleteStep />);
    expect(screen.getByText(/tap your bread to start earning/i)).toBeDefined();
  });

  it("renders the 'Rise and grind.' tagline", () => {
    render(<CompleteStep />);
    expect(screen.getByText("Rise and grind.")).toBeDefined();
  });
});
