"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import type { Recommendation, CuratedItem } from "@/lib/types";

interface BreadCardProps {
  recommendation: Recommendation & { item: CuratedItem };
  onMarkTried: (id: string) => void;
  isDragging?: boolean;
}

export function BreadCard({
  recommendation,
  onMarkTried,
  isDragging,
}: BreadCardProps) {
  const { item } = recommendation;
  const isTried = recommendation.tried;

  return (
    <motion.div
      layout
      className="flex items-center gap-4 p-4 rounded-xl border-2 transition-colors"
      style={{
        borderColor: isDragging ? "#FFD700" : isTried ? "rgba(244, 164, 96, 0.3)" : "rgba(244, 164, 96, 0.1)",
        backgroundColor: isDragging ? "#FFF8DC" : isTried ? "#FFF8DC" : "rgba(255, 248, 220, 0.5)",
        opacity: isTried ? 1 : 0.7,
        transform: isDragging ? "scale(1.05)" : undefined,
        boxShadow: isDragging ? "0 10px 25px -5px rgba(0,0,0,0.1)" : undefined,
      }}
    >
      <div className="w-14 h-14 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden" style={{ backgroundColor: "rgba(245, 222, 179, 0.5)" }}>
        <Image
          src={item.image_url || "/placeholder-bread.svg"}
          alt={item.name}
          width={48}
          height={48}
        />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-bold truncate" style={{ color: "#8B4513" }}>{item.name}</h3>
        <p className="text-xs truncate" style={{ color: "rgba(62, 39, 35, 0.5)" }}>{item.description}</p>
        <p className="text-xs mt-1" style={{ color: "#F4A460" }}>
          {recommendation.week_of}
        </p>
      </div>

      <div className="flex-shrink-0">
        {!isTried ? (
          <button
            onClick={() => onMarkTried(recommendation.id)}
            className="px-3 py-1.5 text-xs font-medium rounded-full transition-colors"
            style={{ backgroundColor: "rgba(244, 164, 96, 0.2)", color: "#8B4513" }}
          >
            Tried it!
          </button>
        ) : (
          <span className="text-sm">✓</span>
        )}
      </div>
    </motion.div>
  );
}
