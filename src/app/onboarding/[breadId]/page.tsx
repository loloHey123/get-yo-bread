"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { EmailStep } from "@/components/onboarding/email-step";
import { RateStep } from "@/components/onboarding/rate-step";
import { LocationStep } from "@/components/onboarding/location-step";
import { PreferencesStep } from "@/components/onboarding/preferences-step";
import { CompleteStep } from "@/components/onboarding/complete-step";

type Step = "email" | "rate" | "location" | "preferences" | "complete";

export default function OnboardingPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const breadId = params.breadId as string;
  const isReauth = searchParams.get("reauth") === "true";
  const supabase = createClient();

  const [step, setStep] = useState<Step>("email");
  const [hourlyRate, setHourlyRate] = useState(0);
  const [expectedHours, setExpectedHours] = useState(40);
  const [location, setLocation] = useState("");

  useEffect(() => {
    supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        if (isReauth) {
          router.push(`/tap/${breadId}`);
        } else {
          setStep("rate");
        }
      }
    });
  }, [supabase, breadId, isReauth, router]);

  async function handleRateComplete(rate: number, hours: number) {
    setHourlyRate(rate);
    setExpectedHours(hours);
    setStep("location");
  }

  async function handleLocationComplete(loc: string) {
    setLocation(loc);
    setStep("preferences");
  }

  async function handlePreferencesComplete(
    prefs: string[],
    allergies: string[]
  ) {
    const response = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        breadId,
        hourlyRate,
        expectedHoursPerWeek: expectedHours,
        location,
        bakeryPrefs: prefs,
        allergies,
      }),
    });

    if (response.ok) {
      setStep("complete");
      setTimeout(() => router.push(`/tap/${breadId}`), 3000);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        {step === "email" && <EmailStep onComplete={() => setStep("rate")} />}
        {step === "rate" && <RateStep onComplete={handleRateComplete} />}
        {step === "location" && (
          <LocationStep onComplete={handleLocationComplete} />
        )}
        {step === "preferences" && (
          <PreferencesStep onComplete={handlePreferencesComplete} />
        )}
        {step === "complete" && <CompleteStep />}
      </div>
    </main>
  );
}
