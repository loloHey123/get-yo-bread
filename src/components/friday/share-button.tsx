"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { CuratedItem } from "@/lib/types";

interface ShareButtonProps {
  item: CuratedItem;
  recommendationId: string;
}

export function ShareButton({ item, recommendationId }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/share/${recommendationId}`
    : "";
  const shareText = `I earned my bread this week! This Friday's treat: ${item.name}. Let's celebrate Friday together! 🍞`;

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Get Yo Bread — Friday Treat",
          text: shareText,
          url: shareUrl,
        });
      } catch {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }

    if ("vibrate" in navigator) {
      navigator.vibrate(50);
    }
  }

  return (
    <motion.button
      onClick={handleShare}
      whileTap={{ scale: 0.95 }}
      className="w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-colors"
      style={{ backgroundColor: "#8B4513", color: "#FFF8DC" }}
    >
      {copied ? "Link copied!" : "Share the treat! 🎉"}
    </motion.button>
  );
}
