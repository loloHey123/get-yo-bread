"use client";

import { motion } from "framer-motion";
import { formatEarnings } from "@/lib/earnings";

interface BaguetteProgressProps {
  progress: number;
  weeklyEarnings: number;
}

export function BaguetteProgress({
  progress,
  weeklyEarnings,
}: BaguetteProgressProps) {
  const safeProgress = isFinite(progress) && !isNaN(progress) ? progress : 0;
  const widthPercent = Math.min(safeProgress * 100, 150);
  const isOvertime = safeProgress > 1;

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium" style={{ color: "rgba(62, 39, 35, 0.6)" }}>
          This week
        </span>
        <span className="text-lg font-bold" style={{ color: "#8B4513" }}>
          {formatEarnings(weeklyEarnings)}
        </span>
      </div>
      <div className="relative h-16 rounded-2xl overflow-hidden border-2" style={{ backgroundColor: "#FFF8DC", borderColor: "rgba(244, 164, 96, 0.2)" }}>
        <motion.div
          className="absolute inset-y-0 left-0 flex items-center"
          initial={{ width: "5%" }}
          animate={{ width: `${Math.max(widthPercent, 5)}%` }}
          transition={{ type: "spring", duration: 0.8, bounce: 0.3 }}
        >
          <div
            className="h-10 w-full mx-2 rounded-full"
            style={{
              background: isOvertime
                ? "linear-gradient(to right, #F4A460, #FFD700, #F4A460)"
                : "linear-gradient(to right, #8B4513, #F4A460)",
              borderRadius: "9999px",
              boxShadow: "inset 0 -2px 4px rgba(0,0,0,0.1)",
            }}
          />
        </motion.div>
      </div>
      {isOvertime && (
        <p className="text-sm font-medium text-center" style={{ color: "#FFD700" }}>
          Overtime! That baguette is getting long!
        </p>
      )}
    </div>
  );
}
