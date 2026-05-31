import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [userCount, searchCount, scrapeCache] = await Promise.all([
      prisma.user.count(),
      prisma.searchLog.count(),
      prisma.webScrapeCache.findMany({ select: { results: true } }),
    ]);

    // WebScrapeCache の results は JSON 配列なので合計件数を算出
    const gachaCount = scrapeCache.reduce((sum, row) => {
      const arr = Array.isArray(row.results) ? row.results : [];
      return sum + arr.length;
    }, 0);

    return NextResponse.json({ userCount, searchCount, gachaCount });
  } catch {
    return NextResponse.json({ userCount: 0, searchCount: 0, gachaCount: 0 });
  }
}
