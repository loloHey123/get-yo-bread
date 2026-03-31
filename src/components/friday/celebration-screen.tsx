"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Confetti } from "./confetti";
import { RecommendationCard } from "./recommendation-card";
import { ShareButton } from "./share-button";
import { BaguetteProgress } from "@/components/baguette-progress";
import { getRandomPun } from "@/lib/bread-puns";
import { formatEarnings } from "@/lib/earnings";
import type { CuratedItem, Bakery } from "@/lib/types";

interface CelebrationScreenProps {
  weeklyEarnings: number;
  baguetteProgress: number;
}

export function CelebrationScreen({
  weeklyEarnings,
  baguetteProgress,
}: CelebrationScreenProps) {
  const [recommendation, setRecommendation] = useState<{
    item: CuratedItem;
    bakeries: Bakery[];
    id?: string;
  } | null>(null);
  const [recLoading, setRecLoading] = useState(true);
  const [recError, setRecError] = useState(false);

  useEffect(() => {
    if ("vibrate" in navigator) {
      navigator.vibrate([100, 50, 100, 50, 200]);
    }

    async function loadRecommendation() {
      try {
        const response = await fetch("/api/recommendation");
        if (response.ok) {
          const data = await response.json();
          setRecommendation(data);
        } else {
          setRecError(true);
        }
      } catch {
        setRecError(true);
      } finally {
        setRecLoading(false);
      }
    }

    loadRecommendation();
  }, []);

  return (
    <div className="space-y-8">
      <Confetti />

      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.6 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold" style={{ color: "#8B4513" }}>
          {getRandomPun("friday")}
        </h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-2xl p-8 border-2 shadow-lg text-center"
        style={{ backgroundColor: "#FFF8DC", borderColor: "rgba(255, 215, 0, 0.5)" }}
      >
        <p className="text-sm" style={{ color: "rgba(62, 39, 35, 0.6)" }}>This week you made</p>
        <p className="text-5xl font-bold mt-2" style={{ color: "#8B4513" }}>
          {formatEarnings(weeklyEarnings)}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <BaguetteProgress
          progress={baguetteProgress}
          weeklyEarnings={weeklyEarnings}
        />
      </motion.div>

      {recLoading && (
        <p className="text-center text-sm" style={{ color: "rgba(62, 39, 35, 0.5)" }}>
          Finding your treat...
        </p>
      )}

      {!recLoading && recError && (
        <p className="text-center text-sm" style={{ color: "rgba(62, 39, 35, 0.5)" }}>
          Could not load your treat right now. Check back soon!
        </p>
      )}

      {recommendation && (
        <>
          <RecommendationCard
            item={recommendation.item}
            bakeries={recommendation.bakeries}
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
          >
            <ShareButton
              item={recommendation.item}
              recommendationId={recommendation.id || ""}
            />
          </motion.div>
        </>
      )}
    </div>
  );
}
