"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { BreadShelf } from "@/components/bread-shelf";
import { Nav } from "@/components/nav";
import { getRandomPun } from "@/lib/bread-puns";
import type { Recommendation, CuratedItem } from "@/lib/types";

type RecWithItem = Recommendation & { item: CuratedItem };

export default function ShelfPage() {
  const [recommendations, setRecommendations] = useState<RecWithItem[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadShelf() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("recommendations")
        .select("*, item:curated_items(*)")
        .eq("user_id", user.id)
        .order("shelf_position", { ascending: true, nullsFirst: false });

      setRecommendations((data as RecWithItem[]) || []);
      setLoading(false);
    }

    loadShelf();
  }, [supabase]);

  async function handleReorder(orderedIds: string[]) {
    await fetch("/api/shelf", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds }),
    });
  }

  async function handleMarkTried(id: string) {
    await fetch(`/api/shelf/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tried: true }),
    });

    setRecommendations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, tried: true } : r))
    );
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-xl" style={{ color: "#F4A460" }}>Loading your shelf...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6 pb-24">
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold" style={{ color: "#8B4513" }}>Bread Shelf</h1>
          <p className="mt-1" style={{ color: "rgba(62, 39, 35, 0.6)" }}>
            Drag to rank your favorites. Top shelf = top tier.
          </p>
        </div>

        {recommendations.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-6xl mb-4">🗄️</p>
            <p style={{ color: "rgba(62, 39, 35, 0.6)" }}>
              {getRandomPun("empty_shelf")}
            </p>
          </div>
        ) : (
          <BreadShelf
            recommendations={recommendations}
            onReorder={handleReorder}
            onMarkTried={handleMarkTried}
          />
        )}
      </div>
      <Nav />
    </main>
  );
}
