import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export function reorderPositions(
  ids: string[]
): { id: string; shelf_position: number }[] {
  return ids.map((id, index) => ({
    id,
    shelf_position: index + 1,
  }));
}

export async function PUT(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { orderedIds }: { orderedIds: string[] } = await request.json();
  const updates = reorderPositions(orderedIds);

  for (const update of updates) {
    await supabase
      .from("recommendations")
      .update({ shelf_position: update.shelf_position })
      .eq("id", update.id)
      .eq("user_id", user.id);
  }

  return NextResponse.json({ success: true });
}
