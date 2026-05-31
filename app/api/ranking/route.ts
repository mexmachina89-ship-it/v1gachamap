import { NextRequest, NextResponse } from "next/server";
import { mockRanking } from "@/lib/mockData";

export const dynamic = "force-dynamic";

type Period = "daily" | "weekly" | "monthly";

function getPeriodRange(period: Period): { current: Date; prev: Date } {
  const now = new Date();
  const current = new Date(now);
  const prev = new Date(now);

  if (period === "daily") {
    current.setDate(current.getDate() - 1);
    prev.setDate(prev.getDate() - 2);
  } else if (period === "weekly") {
    current.setDate(current.getDate() - 7);
    prev.setDate(prev.getDate() - 14);
  } else {
    current.setMonth(current.getMonth() - 1);
    prev.setMonth(prev.getMonth() - 2);
  }

  return { current, prev };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const period = (searchParams.get("period") || "weekly") as Period;

  try {
    const { prisma } = await import("@/lib/prisma");
    const now = new Date();
    const { current, prev } = getPeriodRange(period);

    // 現期間のログを集計（query ごとのcount）
    const currentLogs = await prisma.searchLog.groupBy({
      by: ["query"],
      where: { createdAt: { gte: current } },
      _count: { query: true },
      orderBy: { _count: { query: "desc" } },
      take: 20,
    });

    if (currentLogs.length === 0) {
      // ログがまだなければ累積Search.countで代替
      const searches = await prisma.search.findMany({
        orderBy: { count: "desc" },
        take: 10,
      });
      if (searches.length > 0) {
        const ranking = searches.map((s, i) => ({
          rank: i + 1,
          query: s.query,
          count: s.count,
          trend: "stable" as const,
          trendPct: 0,
        }));
        return NextResponse.json({ ranking, source: "cumulative" });
      }
      return NextResponse.json({ ranking: mockRanking, source: "mock" });
    }

    // 前期間のログを集計（トレンド計算用）
    const prevLogs = await prisma.searchLog.groupBy({
      by: ["query"],
      where: { createdAt: { gte: prev, lt: current } },
      _count: { query: true },
    });
    const prevMap = new Map(prevLogs.map((l) => [l.query, l._count.query]));

    // ランキング生成（上位10件）
    const ranking = currentLogs.slice(0, 10).map((item, i) => {
      const currentCount = item._count.query;
      const prevCount = prevMap.get(item.query) ?? 0;

      let trend: "up" | "down" | "new" | "stable" = "stable";
      let trendPct = 0;

      if (prevCount === 0) {
        trend = currentCount > 0 ? "new" : "stable";
      } else {
        trendPct = Math.round(((currentCount - prevCount) / prevCount) * 100);
        if (trendPct >= 10) trend = "up";
        else if (trendPct <= -10) trend = "down";
        else trend = "stable";
      }

      return {
        rank: i + 1,
        query: item.query,
        count: currentCount,
        trend,
        trendPct,
      };
    });

    return NextResponse.json(
      { ranking, source: "searchlog" },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" } }
    );
  } catch (e) {
    console.error("ranking error:", e);
    return NextResponse.json({ ranking: mockRanking, source: "mock" });
  }
}
