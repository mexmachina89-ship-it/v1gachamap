import { NextRequest, NextResponse } from "next/server";
import { mockRanking } from "@/lib/mockData";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const period = searchParams.get("period") || "weekly";

  try {
    const { prisma } = await import("@/lib/prisma");
    const since = new Date();
    if (period === "daily") since.setDate(since.getDate() - 1);
    else if (period === "weekly") since.setDate(since.getDate() - 7);
    else since.setMonth(since.getMonth() - 1);

    const searches = await prisma.search.findMany({
      where: { updatedAt: { gte: since } },
      orderBy: { count: "desc" },
      take: 10,
    });

    if (searches.length > 0) {
      const ranking = searches.map((s: { query: string; count: number }, i: number) => ({
        rank: i + 1,
        query: s.query,
        count: s.count,
        trend: "stable" as const,
      }));
      return NextResponse.json({ ranking });
    }
  } catch {
    // DB not configured — use mock data
  }

  return NextResponse.json({ ranking: mockRanking });
}
