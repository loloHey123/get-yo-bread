import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface SharePageProps {
  params: Promise<{ recommendationId: string }>;
}

export async function generateMetadata({
  params,
}: SharePageProps): Promise<Metadata> {
  const { recommendationId } = await params;
  const supabase = await createClient();

  const { data: rec } = await supabase
    .from("recommendations")
    .select("*, item:curated_items(*)")
    .eq("id", recommendationId)
    .single();

  if (!rec?.item) {
    return { title: "Get Yo Bread" };
  }

  return {
    title: `${rec.item.name} — Get Yo Bread`,
    description: `This week's Friday treat: ${rec.item.name}. ${rec.item.description}`,
    openGraph: {
      title: `${rec.item.name} — Get Yo Bread`,
      description: `I earned my bread this week! This Friday's treat: ${rec.item.name}`,
      images: [rec.item.image_url || "/placeholder-bread.svg"],
    },
  };
}

export default async function SharePage({ params }: SharePageProps) {
  const { recommendationId } = await params;
  const supabase = await createClient();

  const { data: rec } = await supabase
    .from("recommendations")
    .select("*, item:curated_items(*)")
    .eq("id", recommendationId)
    .single();

  if (!rec?.item) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <p style={{ color: "rgba(62, 39, 35, 0.6)" }}>Something went a-rye. Recommendation not found.</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6" style={{ background: "linear-gradient(to bottom, #FFFAF0, #FFF8DC)" }}>
      <div className="w-full max-w-md text-center space-y-8">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: "#8B4513" }}>Get Yo Bread</h1>
          <p className="mt-1" style={{ color: "#F4A460" }}>Friday Treat</p>
        </div>

        <div className="rounded-2xl p-8 border-2 shadow-lg space-y-4" style={{ backgroundColor: "#FFFAF0", borderColor: "rgba(244, 164, 96, 0.3)" }}>
          <div className="w-24 h-24 mx-auto rounded-xl flex items-center justify-center overflow-hidden" style={{ backgroundColor: "rgba(245, 222, 179, 0.5)" }}>
            <Image
              src={rec.item.image_url || "/placeholder-bread.svg"}
              alt={rec.item.name}
              width={80}
              height={80}
            />
          </div>
          <h2 className="text-2xl font-bold" style={{ color: "#8B4513" }}>{rec.item.name}</h2>
          <p style={{ color: "rgba(62, 39, 35, 0.7)" }}>{rec.item.description}</p>
        </div>

        <div className="space-y-2">
          <p className="text-lg font-medium" style={{ color: "#8B4513" }}>
            Let&apos;s celebrate Friday together! 🍞
          </p>
          <p className="text-sm" style={{ color: "rgba(62, 39, 35, 0.5)" }}>
            Want your own Friday bread recommendations?
          </p>
          <Link
            href="/"
            className="inline-block mt-2 px-6 py-3 rounded-xl font-bold transition-colors"
            style={{ backgroundColor: "#8B4513", color: "#FFF8DC" }}
          >
            Get Yo Bread
          </Link>
        </div>
      </div>
    </main>
  );
}
