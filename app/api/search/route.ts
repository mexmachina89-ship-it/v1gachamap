import { NextRequest, NextResponse } from "next/server";
import { searchAllSocial } from "@/lib/apify";
import { scrapeAllWeb } from "@/lib/webScraper";
import { mockSocialPosts } from "@/lib/mockData";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || "";
  const filter = searchParams.get("filter") || "all";

  if (!query) {
    return NextResponse.json({ items: [], social: [], web: [] });
  }

  // ── Web検索（ガチャアイランド・ガシャどこ・バンダイ公式） ──
  const webResultsPromise = scrapeAllWeb(query);

  // ── SNS検索 ──
  let socialPromise: Promise<typeof mockSocialPosts>;
  if (process.env.APIFY_API_TOKEN) {
    socialPromise = searchAllSocial(query);
  } else {
    const filtered = mockSocialPosts.filter((p) =>
      p.text.toLowerCase().includes(query.toLowerCase())
    );
    socialPromise = Promise.resolve(filtered.length > 0 ? filtered : mockSocialPosts);
  }

  const [webResults, socialPosts] = await Promise.all([webResultsPromise, socialPromise]);

  // SNSフィルター適用
  const filteredSocial =
    filter === "all" || filter === "web"
      ? socialPosts
      : socialPosts.filter((p) => p.platform === filter);

  // Webフィルター（"web" タブのみ全件、それ以外も表示）
  const filteredWeb = filter === "twitter" || filter === "instagram" ? [] : webResults;

  // 検索履歴をDBに記録（fire-and-forget）
  try {
    const { prisma } = await import("@/lib/prisma");
    const existing = await prisma.search.findFirst({ where: { query } });
    if (existing) {
      await prisma.search.update({
        where: { id: existing.id },
        data: { count: { increment: 1 } },
      });
    } else {
      await prisma.search.create({ data: { query } });
    }
  } catch {
    // DB未設定の場合はスキップ
  }

  return NextResponse.json({
    items: [],          // GachaItem（将来用）
    social: filteredSocial,
    web: filteredWeb,
  });
}
