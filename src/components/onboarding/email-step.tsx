"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface EmailStepProps {
  onComplete: () => void;
}

export function EmailStep({ onComplete }: EmailStepProps) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.href,
      },
    });

    setLoading(false);
    if (!error) {
      setSent(true);
    }
  }

  if (sent) {
    return (
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-crust">Check your email!</h2>
        <p className="text-chocolate/70">
          We sent a magic link to <strong>{email}</strong>.
          Click it to continue setting up your bread.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-crust">Welcome to Get Yo Bread!</h2>
        <p className="text-chocolate/70">Enter your email to get started.</p>
      </div>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        required
        className="w-full px-4 py-3 rounded-xl border-2 border-golden/30 bg-cream focus:border-golden focus:outline-none text-lg"
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-xl bg-crust text-cream font-bold text-lg hover:bg-crust/90 disabled:opacity-50 transition-colors"
      >
        {loading ? "Sending..." : "Send Magic Link"}
      </button>
    </form>
  );
}
