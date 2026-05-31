import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { searchAllSocial } from "@/lib/apify";
import type { SocialPost } from "@/lib/apify";

export const dynamic = "force-dynamic";

// ホームページ用の固定クエリ（#ガチャ系）
const FEATURED_QUERIES = ["ガチャ", "カプセルトイ"];

export async function GET() {
  try {
    // ① まず既存キャッシュを全て集める（高速）
    const now = new Date();
    const cached = await prisma.socialPostCache.findMany({
      where: { expiresAt: { gt: now } },
    });

    let posts: SocialPost[] = [];

    for (const row of cached) {
      const items = Array.isArray(row.results) ? (row.results as unknown as SocialPost[]) : [];
      posts.push(...items);
    }

    // ② キャッシュが少ない場合は「ガチャ」で新規取得（非同期で最大15秒待つ）
    if (posts.length < 6) {
      try {
        const fresh = await Promise.race([
          searchAllSocial(FEATURED_QUERIES[0]),
          new Promise<SocialPost[]>((_, reject) =>
            setTimeout(() => reject(new Error("timeout")), 15000)
          ),
        ]);
        posts.push(...fresh);
      } catch {
        // タイムアウトや失敗は無視してキャッシュ分だけ返す
      }
    }

    // ③ 重複除去（同じURLの投稿を1件にまとめる）
    const seen = new Set<string>();
    const unique = posts.filter((p) => {
      const key = p.url || p.id;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // ④ いいね数の多い順にソートして上位6件を返す
    unique.sort((a, b) => (b.likes || 0) - (a.likes || 0));

    return NextResponse.json(
      { posts: unique.slice(0, 6) },
      { headers: { "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600" } }
    );
  } catch (e) {
    console.error("[featured-posts]", e);
    return NextResponse.json({ posts: [] });
  }
}
