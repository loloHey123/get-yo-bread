import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { calculateSessionEarnings } from "@/lib/earnings";

export const dynamic = "force-dynamic";

interface TapPageProps {
  params: Promise<{ breadId: string }>;
}

export default async function TapPage({ params }: TapPageProps) {
  const { breadId } = await params;
  const supabase = await createClient();

  // Look up bread by NFC UID
  const { data: bread } = await supabase
    .from("breads")
    .select("*")
    .eq("nfc_uid", breadId)
    .single();

  if (!bread) {
    // First time this NFC UID is seen — create the bread record
    await supabase
      .from("breads")
      .insert({ nfc_uid: breadId })
      .select()
      .single();

    redirect(`/onboarding/${breadId}`);
  }

  if (!bread.user_id) {
    redirect(`/onboarding/${breadId}`);
  }

  // Check auth
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    redirect(`/onboarding/${breadId}?reauth=true`);
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

  if (!openEntry) {
    // Clock in
    await supabase.from("time_entries").insert({
      user_id: authUser.id,
      clock_in: new Date().toISOString(),
    });

    redirect("/dashboard?state=clocked_in");
  }

  // Clock out
  const clockOut = new Date();
  const earnings = calculateSessionEarnings(
    new Date(openEntry.clock_in),
    clockOut,
    user?.hourly_rate ?? 0
  );

  await supabase
    .from("time_entries")
    .update({
      clock_out: clockOut.toISOString(),
      earnings,
    })
    .eq("id", openEntry.id);

  const isFriday = clockOut.getDay() === 5;
  redirect(`/dashboard?state=clocked_out${isFriday ? "&friday=true" : ""}`);
}
