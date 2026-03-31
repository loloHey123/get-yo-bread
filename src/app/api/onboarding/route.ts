import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export interface OnboardingData {
  breadId: string;
  hourlyRate: number;
  expectedHoursPerWeek: number;
  location: string;
  bakeryPrefs: string[];
  allergies: string[];
}

export function validateOnboardingData(
  data: OnboardingData
): { valid: true } | { valid: false; error: string } {
  if (!data.breadId || typeof data.breadId !== "string") {
    return { valid: false, error: "Bread ID is required" };
  }
  if (
    typeof data.hourlyRate !== "number" ||
    Number.isNaN(data.hourlyRate) ||
    data.hourlyRate <= 0
  ) {
    return { valid: false, error: "Hourly rate must be positive" };
  }
  if (
    typeof data.expectedHoursPerWeek !== "number" ||
    Number.isNaN(data.expectedHoursPerWeek) ||
    data.expectedHoursPerWeek <= 0 ||
    data.expectedHoursPerWeek > 168
  ) {
    return {
      valid: false,
      error: "Expected hours must be between 1 and 168 per week",
    };
  }
  return { valid: true };
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const body: OnboardingData = await request.json();

  const validation = validateOnboardingData(body);
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { error: userError } = await supabase.from("users").insert({
    id: authUser.id,
    email: authUser.email,
    hourly_rate: body.hourlyRate,
    expected_hours_per_week: body.expectedHoursPerWeek,
    location: body.location,
  });

  if (userError) {
    return NextResponse.json({ error: userError.message }, { status: 500 });
  }

  await supabase.from("preferences").insert({
    user_id: authUser.id,
    bakery_prefs: body.bakeryPrefs,
    allergies: body.allergies,
  });

  await supabase
    .from("breads")
    .update({ user_id: authUser.id, linked_at: new Date().toISOString() })
    .eq("nfc_uid", body.breadId);

  return NextResponse.json({ success: true });
}
