"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ClockInScreen } from "@/components/clock/clock-in-screen";
import { ClockOutScreen } from "@/components/clock/clock-out-screen";
import { Nav } from "@/components/nav";
import {
  calculateWeeklyEarnings,
  getBaguetteProgress,
  getWeekStart,
} from "@/lib/earnings";
import type { User, TimeEntry } from "@/lib/types";

function DashboardContent() {
  const searchParams = useSearchParams();
  const clockState = searchParams.get("state") || "clocked_out";
  const isFriday = searchParams.get("friday") === "true";

  const [user, setUser] = useState<User | null>(null);
  const [weekEntries, setWeekEntries] = useState<TimeEntry[]>([]);
  const [latestEntry, setLatestEntry] = useState<TimeEntry | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (!authUser) return;

      const { data: userData } = await supabase
        .from("users")
        .select("*")
        .eq("id", authUser.id)
        .single();

      const weekStart = getWeekStart(new Date()).toISOString();

      const { data: entries } = await supabase
        .from("time_entries")
        .select("*")
        .eq("user_id", authUser.id)
        .gte("clock_in", weekStart)
        .order("clock_in", { ascending: false });

      setUser(userData);
      setWeekEntries(entries || []);
      setLatestEntry(entries?.[0] || null);
      setLoading(false);
    }

    loadData();
  }, [supabase]);

  if (loading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-xl" style={{ color: "#F4A460" }}>Loading your dough...</p>
      </main>
    );
  }

  const weeklyEarnings = calculateWeeklyEarnings(
    weekEntries.filter((e) => e.earnings != null)
  );
  const baguetteProgress = getBaguetteProgress(
    weeklyEarnings,
    user.hourly_rate,
    user.expected_hours_per_week
  );

  // Friday celebration will be handled by Task 7
  if (isFriday) {
    // Placeholder — Task 7 will add CelebrationScreen import
    return null;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 pb-24">
      <div className="w-full max-w-md">
        {clockState === "clocked_in" && latestEntry && (
          <ClockInScreen
            clockInTime={new Date(latestEntry.clock_in)}
            hourlyRate={user.hourly_rate}
            weeklyEarnings={weeklyEarnings}
            baguetteProgress={baguetteProgress}
          />
        )}

        {clockState === "clocked_out" && latestEntry && (
          <ClockOutScreen
            sessionEarnings={latestEntry.earnings || 0}
            sessionDuration={formatDuration(
              latestEntry.clock_in,
              latestEntry.clock_out
            )}
            weeklyEarnings={weeklyEarnings}
            baguetteProgress={baguetteProgress}
          />
        )}

        {clockState === "clocked_out" && !latestEntry && (
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold" style={{ color: "#8B4513" }}>
              Ready to rise and grind?
            </h1>
            <p style={{ color: "rgba(62, 39, 35, 0.6)" }}>Tap your bread to clock in.</p>
          </div>
        )}
      </div>
      <Nav />
    </main>
  );
}

function formatDuration(
  clockIn: string,
  clockOut: string | null
): string {
  if (!clockOut) return "";
  const ms = new Date(clockOut).getTime() - new Date(clockIn).getTime();
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  if (hours === 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-xl" style={{ color: "#F4A460" }}>Loading your dough...</p>
      </main>
    }>
      <DashboardContent />
    </Suspense>
  );
}
