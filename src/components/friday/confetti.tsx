"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface Particle {
  id: number;
  x: number;
  color: string;
  delay: number;
  size: number;
  rotate: number;
  duration: number;
}

const COLORS = ["#F4A460", "#FFD700", "#8B4513", "#FFF8DC", "#DEB887", "#C62828"];

function createParticles(): Particle[] {
  return Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    delay: Math.random() * 0.5,
    size: Math.random() * 8 + 4,
    rotate: Math.random() * 720 - 360,
    duration: 2 + Math.random() * 2,
  }));
}

export function Confetti() {
  const [particles] = useState<Particle[]>(createParticles);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-sm"
          style={{
            left: `${p.x}%`,
            top: -20,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
          }}
          initial={{ y: -20, opacity: 1, rotate: 0 }}
          animate={{
            y: typeof window !== "undefined" ? window.innerHeight + 20 : 800,
            opacity: [1, 1, 0],
            rotate: p.rotate,
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: "easeIn",
          }}
        />
      ))}
    </div>
  );
}
