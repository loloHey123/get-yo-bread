"use client";

import { motion } from "framer-motion";
import { BaguetteProgress } from "@/components/baguette-progress";
import { getRandomPun } from "@/lib/bread-puns";
import { formatEarnings } from "@/lib/earnings";

interface ClockOutScreenProps {
  sessionEarnings: number;
  sessionDuration: string;
  weeklyEarnings: number;
  baguetteProgress: number;
}

export function ClockOutScreen({
  sessionEarnings,
  sessionDuration,
  weeklyEarnings,
  baguetteProgress,
}: ClockOutScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 text-center"
    >
      <div>
        <h1 className="text-3xl font-bold" style={{ color: "#8B4513" }}>
          {getRandomPun("clock_out")}
        </h1>
      </div>

      <div className="rounded-2xl p-6 border-2" style={{ backgroundColor: "#FFF8DC", borderColor: "rgba(244, 164, 96, 0.2)" }}>
        <p className="text-sm" style={{ color: "rgba(62, 39, 35, 0.6)" }}>Today&apos;s session</p>
        <p className="text-4xl font-bold mt-1" style={{ color: "#8B4513" }}>
          {formatEarnings(sessionEarnings)}
        </p>
        <p className="text-sm mt-1" style={{ color: "rgba(62, 39, 35, 0.5)" }}>{sessionDuration}</p>
      </div>

      <BaguetteProgress
        progress={baguetteProgress}
        weeklyEarnings={weeklyEarnings}
      />
    </motion.div>
  );
}
