import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { calculateSessionEarnings } from "@/lib/earnings";
import type { User, Bread, TimeEntry } from "@/lib/types";

export interface TapContext {
  bread: Bread | null;
  user: User | null;
  openEntry: TimeEntry | null;
}

export type TapAction =
  | "onboarding"
  | "reauth"
  | "clock_in"
  | "clock_out"
  | "friday_clock_out"
  | "not_found";

export interface TapResult {
  action: TapAction;
  data?: Record<string, unknown>;
}

export function determineTapAction(
  context: TapContext,
  now: Date = new Date()
): TapResult {
  const { bread, user, openEntry } = context;

  if (!bread) {
    return { action: "not_found" };
  }

  if (!bread.user_id) {
    return { action: "onboarding", data: { breadId: bread.id } };
  }

  if (!user) {
    return { action: "reauth", data: { breadId: bread.id } };
  }

  if (!openEntry) {
    return { action: "clock_in" };
  }

  const isFriday = now.getDay() === 5;
  if (isFriday) {
    return { action: "friday_clock_out", data: { entryId: openEntry.id } };
  }

  return { action: "clock_out", data: { entryId: openEntry.id } };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ breadId: string }> }
) {
  const { breadId } = await params;
  const supabase = await createClient();

  // Look up bread by NFC UID
  const { data: bread } = await supabase
    .from("breads")
    .select("*")
    .eq("nfc_uid", breadId)
    .single();

  if (!bread) {
    // First time this NFC UID is seen — create the bread record and go to onboarding
    const { error } = await supabase
      .from("breads")
      .insert({ nfc_uid: breadId })
      .select()
      .single();

    if (error) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.redirect(
      new URL(`/onboarding/${breadId}`, request.url)
    );
  }

  if (!bread.user_id) {
    return NextResponse.redirect(
      new URL(`/onboarding/${breadId}`, request.url)
    );
  }

  // Check auth
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return NextResponse.redirect(
      new URL(`/onboarding/${breadId}?reauth=true`, request.url)
    );
  }

  // Get user profile
  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("id", authUser.id)
    .single();

  // Check for open time entry
  const { data: openEntry } = await supabase
    .from("time_entries")
    .select("*")
    .eq("user_id", authUser.id)
    .is("clock_out", null)
    .single();

  const tapResult = determineTapAction(
    { bread, user, openEntry },
    new Date()
  );

  if (tapResult.action === "clock_in") {
    await supabase.from("time_entries").insert({
      user_id: authUser.id,
      clock_in: new Date().toISOString(),
    });

    return NextResponse.redirect(
      new URL(`/dashboard?state=clocked_in`, request.url)
    );
  }

  if (
    tapResult.action === "clock_out" ||
    tapResult.action === "friday_clock_out"
  ) {
    const clockOut = new Date();
    const earnings = calculateSessionEarnings(
      new Date(openEntry!.clock_in),
      clockOut,
      user!.hourly_rate
    );

    await supabase
      .from("time_entries")
      .update({
        clock_out: clockOut.toISOString(),
        earnings,
      })
      .eq("id", openEntry!.id);

    const isFriday = tapResult.action === "friday_clock_out";
    return NextResponse.redirect(
      new URL(
        `/dashboard?state=clocked_out${isFriday ? "&friday=true" : ""}`,
        request.url
      )
    );
  }

  return NextResponse.redirect(new URL("/", request.url));
}
