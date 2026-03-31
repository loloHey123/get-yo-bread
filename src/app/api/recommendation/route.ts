import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { CuratedItem } from "@/lib/types";
import { MockBakeryProvider } from "@/lib/bakery/mock-provider";

export interface RecommendationContext {
  items: CuratedItem[];
  prefs: string[];
  allergies: string[];
  pastItemIds: string[];
}

export function pickRecommendation(
  context: RecommendationContext
): CuratedItem | null {
  const { items, prefs, allergies, pastItemIds } = context;

  const safeItems = items.filter(
    (item) =>
      !pastItemIds.includes(item.id) &&
      !item.allergens.some((a) => allergies.includes(a))
  );

  if (safeItems.length === 0) return null;

  const prefMatches = safeItems.filter((item) =>
    item.tags.some((tag) => prefs.includes(tag))
  );

  const pool = prefMatches.length > 0 ? prefMatches : safeItems;
  return pool[Math.floor(Math.random() * pool.length)];
}

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: prefs } = await supabase
    .from("preferences")
    .select("*")
    .eq("user_id", authUser.id)
    .single();

  const { data: items } = await supabase
    .from("curated_items")
    .select("*")
    .eq("active", true);

  const { data: pastRecs } = await supabase
    .from("recommendations")
    .select("item_id")
    .eq("user_id", authUser.id);

  const pastItemIds = (pastRecs || []).map((r) => r.item_id);

  const picked = pickRecommendation({
    items: items || [],
    prefs: prefs?.bakery_prefs || [],
    allergies: prefs?.allergies || [],
    pastItemIds,
  });

  if (!picked) {
    return NextResponse.json(
      { error: "No recommendations available" },
      { status: 404 }
    );
  }

  const today = new Date().toISOString().split("T")[0];
  const { data: rec } = await supabase.from("recommendations").insert({
    user_id: authUser.id,
    item_id: picked.id,
    week_of: today,
  }).select().single();

  const { data: user } = await supabase
    .from("users")
    .select("location")
    .eq("id", authUser.id)
    .single();

  const bakeryProvider = new MockBakeryProvider();
  const bakeries = await bakeryProvider.findNearby(user?.location || "", 3);

  return NextResponse.json({
    item: picked,
    bakeries,
    id: rec?.id,
  });
}
