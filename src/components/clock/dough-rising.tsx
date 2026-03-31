"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { calculateLiveEarnings, formatEarnings } from "@/lib/earnings";

interface DoughRisingProps {
  clockInTime: Date;
  hourlyRate: number;
}

export function DoughRising({ clockInTime, hourlyRate }: DoughRisingProps) {
  const [earnings, setEarnings] = useState(
    calculateLiveEarnings(clockInTime, hourlyRate)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setEarnings(calculateLiveEarnings(clockInTime, hourlyRate));
    }, 1000);
    return () => clearInterval(interval);
  }, [clockInTime, hourlyRate]);

  const hoursWorked =
    (Date.now() - clockInTime.getTime()) / (1000 * 60 * 60);
  const scale = Math.min(1 + hoursWorked * 0.1, 2);

  return (
    <div className="flex flex-col items-center space-y-6">
      <div
        data-testid="dough-container"
        className="relative w-48 h-48 flex items-center justify-center"
      >
        <motion.div
          className="rounded-full shadow-lg"
          animate={{
            scale: [scale, scale * 1.02, scale],
            borderRadius: ["50%", "48%", "50%"],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            width: 120,
            height: 100,
            background:
              "radial-gradient(ellipse at 40% 40%, #F5DEB3, #DEB887)",
          }}
        />
      </div>
      <div className="text-center">
        <p
          data-testid="live-earnings"
          className="text-4xl font-bold tabular-nums"
          style={{ color: "#8B4513" }}
        >
          {formatEarnings(earnings)}
        </p>
        <p className="text-sm mt-1" style={{ color: "rgba(62, 39, 35, 0.5)" }}>and rising...</p>
      </div>
    </div>
  );
}
