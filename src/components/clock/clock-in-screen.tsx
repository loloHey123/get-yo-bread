"use client";

import { motion } from "framer-motion";
import { DoughRising } from "./dough-rising";
import { BaguetteProgress } from "@/components/baguette-progress";
import { getRandomPun } from "@/lib/bread-puns";

interface ClockInScreenProps {
  clockInTime: Date;
  hourlyRate: number;
  weeklyEarnings: number;
  baguetteProgress: number;
}

export function ClockInScreen({
  clockInTime,
  hourlyRate,
  weeklyEarnings,
  baguetteProgress,
}: ClockInScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 text-center"
    >
      <div>
        <h1 className="text-3xl font-bold" style={{ color: "#8B4513" }}>
          {getRandomPun("clock_in")}
        </h1>
        <p className="mt-2" style={{ color: "rgba(62, 39, 35, 0.6)" }}>
          Clocked in at{" "}
          {clockInTime.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>

      <DoughRising clockInTime={clockInTime} hourlyRate={hourlyRate} />

      <BaguetteProgress
        progress={baguetteProgress}
        weeklyEarnings={weeklyEarnings}
      />
    </motion.div>
  );
}
