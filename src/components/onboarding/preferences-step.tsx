"use client";

import { useState } from "react";

interface PreferencesStepProps {
  onComplete: (prefs: string[], allergies: string[]) => void;
}

const BAKERY_OPTIONS = [
  "Croissants", "Cookies", "Cakes", "Bread", "Pastries",
  "Donuts", "Bagels", "Muffins", "Scones", "Pies",
];

const ALLERGY_OPTIONS = [
  "Gluten", "Dairy", "Nuts", "Eggs", "Soy", "Sesame",
];

export function PreferencesStep({ onComplete }: PreferencesStepProps) {
  const [selectedPrefs, setSelectedPrefs] = useState<string[]>([]);
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [customAllergy, setCustomAllergy] = useState("");

  function togglePref(pref: string) {
    setSelectedPrefs((prev) =>
      prev.includes(pref) ? prev.filter((p) => p !== pref) : [...prev, pref]
    );
  }

  function toggleAllergy(allergy: string) {
    setSelectedAllergies((prev) =>
      prev.includes(allergy)
        ? prev.filter((a) => a !== allergy)
        : [...prev, allergy]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const allergies = customAllergy
      ? [...selectedAllergies, ...customAllergy.split(",").map((a) => a.trim())]
      : selectedAllergies;
    onComplete(
      selectedPrefs.map((p) => p.toLowerCase()),
      allergies.map((a) => a.toLowerCase())
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-crust">What&apos;s your taste?</h2>
        <p className="text-chocolate/70">Pick your favorites. We&apos;ll match your Friday treats.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-chocolate/70 mb-2">
          I love... (pick as many as you want)
        </label>
        <div className="flex flex-wrap gap-2">
          {BAKERY_OPTIONS.map((pref) => (
            <button
              key={pref}
              type="button"
              onClick={() => togglePref(pref)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedPrefs.includes(pref)
                  ? "bg-crust text-cream"
                  : "bg-cream border-2 border-golden/30 text-chocolate"
              }`}
            >
              {pref}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-chocolate/70 mb-2">
          Allergies (so we don&apos;t recommend anything harmful)
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {ALLERGY_OPTIONS.map((allergy) => (
            <button
              key={allergy}
              type="button"
              onClick={() => toggleAllergy(allergy)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedAllergies.includes(allergy)
                  ? "bg-jam text-cream"
                  : "bg-cream border-2 border-golden/30 text-chocolate"
              }`}
            >
              {allergy}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={customAllergy}
          onChange={(e) => setCustomAllergy(e.target.value)}
          placeholder="Other allergies (comma separated)"
          className="w-full px-4 py-3 rounded-xl border-2 border-golden/30 bg-cream focus:border-golden focus:outline-none"
        />
      </div>

      <button
        type="submit"
        className="w-full py-3 rounded-xl bg-crust text-cream font-bold text-lg hover:bg-crust/90 transition-colors"
      >
        Let&apos;s get this bread!
      </button>
    </form>
  );
}
