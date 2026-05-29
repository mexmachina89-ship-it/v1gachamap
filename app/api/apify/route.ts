import { NextRequest, NextResponse } from "next/server";
import { searchAllSocial, searchTwitter, searchInstagram, searchTikTok } from "@/lib/apify";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || "";
  const platform = searchParams.get("platform") || "all";

  if (!query) return NextResponse.json({ posts: [] });

  if (!process.env.APIFY_API_TOKEN) {
    return NextResponse.json({ error: "APIFY_API_TOKEN not configured", posts: [] }, { status: 503 });
  }

  let posts;
  if (platform === "twitter") posts = await searchTwitter(query);
  else if (platform === "instagram") posts = await searchInstagram(query);
  else if (platform === "tiktok") posts = await searchTikTok(query);
  else posts = await searchAllSocial(query);

  return NextResponse.json({ posts });
}
