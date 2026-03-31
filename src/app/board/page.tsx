"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Nav } from "@/components/nav";
import { formatEarnings } from "@/lib/earnings";

interface Stats {
  totalEarnings: number;
  totalHours: number;
  totalTreats: number;
  totalTried: number;
  topBread: string | null;
}

function getBreadTitle(hours: number): { title: string; emoji: string } {
  if (hours >= 1000) return { title: "Master Baker", emoji: "👨‍🍳" };
  if (hours >= 500) return { title: "Golden Crust", emoji: "🥐" };
  if (hours >= 100) return { title: "Rising Starter", emoji: "🍞" };
  return { title: "Fresh Dough", emoji: "🫓" };
}

export default function BoardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadStats() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: entries } = await supabase
        .from("time_entries")
        .select("earnings, clock_in, clock_out")
        .eq("user_id", user.id)
        .not("clock_out", "is", null);

      const { data: recs } = await supabase
        .from("recommendations")
        .select("*, item:curated_items(name)")
        .eq("user_id", user.id)
        .order("shelf_position", { ascending: true });

      const totalEarnings = (entries || []).reduce(
        (sum, e) => sum + (e.earnings || 0),
        0
      );

      const totalHours = (entries || []).reduce((sum, e) => {
        if (!e.clock_out) return sum;
        const ms =
          new Date(e.clock_out).getTime() - new Date(e.clock_in).getTime();
        return sum + ms / (1000 * 60 * 60);
      }, 0);

      const triedRecs = (recs || []).filter((r) => r.tried);
      const topRec = recs?.[0];

      setStats({
        totalEarnings,
        totalHours: Math.round(totalHours * 10) / 10,
        totalTreats: (recs || []).length,
        totalTried: triedRecs.length,
        topBread: topRec?.item?.name || null,
      });
      setLoading(false);
    }

    loadStats();
  }, [supabase]);

  if (loading || !stats) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-xl" style={{ color: "#F4A460" }}>Counting your dough...</p>
      </main>
    );
  }

  const { title, emoji } = getBreadTitle(stats.totalHours);

  return (
    <main className="min-h-screen p-6 pb-24">
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold" style={{ color: "#8B4513" }}>Bread Board</h1>
        </div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="rounded-2xl p-6 text-center border-2"
          style={{ background: "linear-gradient(135deg, rgba(244, 164, 96, 0.2), rgba(255, 215, 0, 0.2))", borderColor: "rgba(244, 164, 96, 0.3)" }}
        >
          <span className="text-5xl">{emoji}</span>
          <h2 className="text-2xl font-bold mt-2" style={{ color: "#8B4513" }}>{title}</h2>
          <p className="text-sm" style={{ color: "rgba(62, 39, 35, 0.6)" }}>{stats.totalHours} hours</p>
        </motion.div>

        <div className="grid grid-cols-2 gap-4">
          <StatCard label="Total Earned" value={formatEarnings(stats.totalEarnings)} delay={0.1} />
          <StatCard label="Hours Worked" value={`${stats.totalHours}h`} delay={0.2} />
          <StatCard label="Treats Unlocked" value={String(stats.totalTreats)} delay={0.3} />
          <StatCard label="Treats Tried" value={String(stats.totalTried)} delay={0.4} />
        </div>

        {stats.topBread && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-2xl p-4 border-2 text-center"
            style={{ backgroundColor: "#FFF8DC", borderColor: "rgba(244, 164, 96, 0.2)" }}
          >
            <p className="text-xs uppercase" style={{ color: "rgba(62, 39, 35, 0.5)" }}>
              Top Ranked Bread
            </p>
            <p className="text-lg font-bold mt-1" style={{ color: "#8B4513" }}>
              {stats.topBread}
            </p>
          </motion.div>
        )}
      </div>
      <Nav />
    </main>
  );
}

function StatCard({
  label,
  value,
  delay,
}: {
  label: string;
  value: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="rounded-xl p-4 border-2 text-center"
      style={{ backgroundColor: "#FFF8DC", borderColor: "rgba(244, 164, 96, 0.2)" }}
    >
      <p className="text-xs uppercase" style={{ color: "rgba(62, 39, 35, 0.5)" }}>{label}</p>
      <p className="text-xl font-bold mt-1" style={{ color: "#8B4513" }}>{value}</p>
    </motion.div>
  );
}
