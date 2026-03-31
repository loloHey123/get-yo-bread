"use client";

import { useState } from "react";

interface RateStepProps {
  onComplete: (hourlyRate: number, expectedHours: number) => void;
}

export function RateStep({ onComplete }: RateStepProps) {
  const [hourlyRate, setHourlyRate] = useState("");
  const [expectedHours, setExpectedHours] = useState("40");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onComplete(parseFloat(hourlyRate), parseFloat(expectedHours));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-crust">How much dough do you make?</h2>
        <p className="text-chocolate/70">This is just for you. We never share it.</p>
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-chocolate/70 mb-1">
            Hourly rate ($)
          </label>
          <input
            type="number"
            value={hourlyRate}
            onChange={(e) => setHourlyRate(e.target.value)}
            placeholder="50.00"
            min="0.01"
            step="0.01"
            required
            className="w-full px-4 py-3 rounded-xl border-2 border-golden/30 bg-cream focus:border-golden focus:outline-none text-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-chocolate/70 mb-1">
            Expected hours per week
          </label>
          <input
            type="number"
            value={expectedHours}
            onChange={(e) => setExpectedHours(e.target.value)}
            placeholder="40"
            min="1"
            max="168"
            required
            className="w-full px-4 py-3 rounded-xl border-2 border-golden/30 bg-cream focus:border-golden focus:outline-none text-lg"
          />
        </div>
      </div>
      <button
        type="submit"
        className="w-full py-3 rounded-xl bg-crust text-cream font-bold text-lg hover:bg-crust/90 transition-colors"
      >
        Next
      </button>
    </form>
  );
}
