import { NextRequest, NextResponse } from "next/server";
import { searchAllSocial } from "@/lib/apify";
import { mockGachaItems, mockSocialPosts } from "@/lib/mockData";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || "";
  const filter = searchParams.get("filter") || "all";

  if (!query) {
    return NextResponse.json({ items: [], social: [] });
  }

  // Filter mock gacha items by query
  const filteredItems = mockGachaItems.filter((item) => {
    const q = query.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      (item.nameEn?.toLowerCase().includes(q)) ||
      item.tags.some((t) => t.toLowerCase().includes(q)) ||
      item.series.toLowerCase().includes(q)
    );
  });

  // Get social posts — use real Apify if token exists, otherwise mock
  let socialPosts = mockSocialPosts;
  if (process.env.APIFY_API_TOKEN) {
    socialPosts = await searchAllSocial(query);
  } else {
    socialPosts = mockSocialPosts.filter((p) =>
      p.text.toLowerCase().includes(query.toLowerCase())
    );
    if (socialPosts.length === 0) socialPosts = mockSocialPosts;
  }

  // Apply platform filter
  const filtered =
    filter === "all"
      ? socialPosts
      : socialPosts.filter((p) => p.platform === filter);

  // Track search in DB (fire-and-forget, non-blocking)
  try {
    const { prisma } = await import("@/lib/prisma");
    const existing = await prisma.search.findFirst({ where: { query } });
    if (existing) {
      await prisma.search.update({ where: { id: existing.id }, data: { count: { increment: 1 } } });
    } else {
      await prisma.search.create({ data: { query } });
    }
  } catch {
    // DB not configured — skip tracking
  }

  return NextResponse.json({ items: filteredItems, social: filtered });
}
