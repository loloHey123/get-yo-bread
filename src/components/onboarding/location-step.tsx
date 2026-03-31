"use client";

import { useState } from "react";

interface LocationStepProps {
  onComplete: (location: string) => void;
}

export function LocationStep({ onComplete }: LocationStepProps) {
  const [location, setLocation] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onComplete(location);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-crust">Where do you loaf around?</h2>
        <p className="text-chocolate/70">
          We&apos;ll use this to find bakeries near you for your Friday treat.
        </p>
      </div>
      <input
        type="text"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        placeholder="Zip code or address"
        required
        className="w-full px-4 py-3 rounded-xl border-2 border-golden/30 bg-cream focus:border-golden focus:outline-none text-lg"
      />
      <button
        type="submit"
        className="w-full py-3 rounded-xl bg-crust text-cream font-bold text-lg hover:bg-crust/90 transition-colors"
      >
        Next
      </button>
    </form>
  );
}
