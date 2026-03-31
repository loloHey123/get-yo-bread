"use client";

import { motion } from "framer-motion";
import type { CuratedItem, Bakery } from "@/lib/types";
import Image from "next/image";

interface RecommendationCardProps {
  item: CuratedItem;
  bakeries: Bakery[];
}

export function RecommendationCard({
  item,
  bakeries,
}: RecommendationCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 1.5, type: "spring", duration: 0.8 }}
      className="rounded-2xl p-6 border-2 shadow-lg space-y-4"
      style={{ backgroundColor: "#FFF8DC", borderColor: "rgba(244, 164, 96, 0.3)" }}
    >
      <p className="text-sm font-medium text-center" style={{ color: "#F4A460" }}>
        This week's treat
      </p>

      <div className="flex flex-col items-center space-y-3">
        <div className="w-24 h-24 rounded-xl flex items-center justify-center overflow-hidden" style={{ backgroundColor: "rgba(245, 222, 179, 0.5)" }}>
          <Image
            src={item.image_url || "/placeholder-bread.svg"}
            alt={item.name}
            width={80}
            height={80}
          />
        </div>
        <h3 className="text-2xl font-bold" style={{ color: "#8B4513" }}>{item.name}</h3>
        <p className="text-center text-sm" style={{ color: "rgba(62, 39, 35, 0.7)" }}>
          {item.description}
        </p>
      </div>

      {bakeries.length > 0 && (
        <div className="space-y-2 pt-2">
          <p className="text-xs font-medium uppercase" style={{ color: "rgba(62, 39, 35, 0.5)" }}>
            Bakeries near you
          </p>
          {bakeries.map((bakery) => (
            <div
              key={bakery.name}
              className="flex justify-between items-center py-2 border-b last:border-0"
              style={{ borderColor: "rgba(244, 164, 96, 0.1)" }}
            >
              <div>
                <p className="text-sm font-medium" style={{ color: "#3E2723" }}>
                  {bakery.name}
                </p>
                <p className="text-xs" style={{ color: "rgba(62, 39, 35, 0.5)" }}>{bakery.address}</p>
              </div>
              <div className="text-right">
                <p className="text-xs" style={{ color: "#F4A460" }}>{bakery.distance}</p>
                {bakery.rating && (
                  <p className="text-xs" style={{ color: "rgba(62, 39, 35, 0.5)" }}>
                    {bakery.rating} ★
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
