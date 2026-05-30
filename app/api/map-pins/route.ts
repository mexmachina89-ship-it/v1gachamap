export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getCachedResults } from "@/lib/cache";
import type { SocialPost } from "@/lib/apify";

export interface MapPin {
  id: string;
  lat: number;
  lng: number;
  storeName: string;
  posts: SocialPost[];
}

// SNS投稿テキストから具体的な店舗名を抽出
function extractStoreNames(text: string): string[] {
  const stores: string[] = [];

  // 具体的な店舗名パターン（例: "イオンモール幕張"、"ゲオ渋谷店"）
  const branchPatterns: RegExp[] = [
    /イオンモール[぀-ヿ一-鿿\w]{1,10}/g,
    /イオン[぀-ヿ一-鿿\w]{1,10}店/g,
    /ゲオ[぀-ヿ一-鿿\w]{1,10}店/g,
    /トイザらス[぀-ヿ一-鿿\w]{0,10}店?/g,
    /ヨドバシ[぀-ヿ一-鿿\w]{1,10}/g,
    /ドン・?キホーテ[぀-ヿ一-鿿\w]{0,10}/g,
    /ドンキ[぀-ヿ一-鿿\w]{1,10}/g,
    /アピタ[぀-ヿ一-鿿\w]{1,10}/g,
    /ローソン[぀-ヿ一-鿿\w]{1,10}/g,
    /ファミリーマート[぀-ヿ一-鿿\w]{1,10}/g,
    /ファミマ[぀-ヿ一-鿿\w]{1,10}/g,
    /セブン-?イレブン[぀-ヿ一-鿿\w]{1,10}/g,
  ];

  for (const pattern of branchPatterns) {
    const matches = text.match(pattern);
    if (matches) stores.push(...matches);
  }

  // エリア + 店舗チェーン（例: "渋谷のゲオ"、"新宿イオン"）
  const areaStorePattern =
    /([぀-ヿ一-鿿]{2,6})(の|で|にある|の近くの)?(イオン|ゲオ|ヨドバシ|ドンキ|トイザらス|アピタ|ローソン|ファミマ|セブン)/g;
  let match: RegExpExecArray | null;
  while ((match = areaStorePattern.exec(text)) !== null) {
    stores.push(`${match[1]} ${match[3]}`);
  }

  // 重複排除・最大3件
  return [...new Set(stores)].slice(0, 3);
}

async function geocode(
  storeName: string,
  apiKey: string
): Promise<{ lat: number; lng: number } | null> {
  try {
    const address = encodeURIComponent(`${storeName} 日本`);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${apiKey}&language=ja&region=JP`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    const data = await res.json();
    if (data.status === "OK" && data.results?.[0]) {
      const loc = data.results[0].geometry.location;
      return { lat: loc.lat, lng: loc.lng };
    }
  } catch {}
  return null;
}

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q") || "";
  if (!query) return NextResponse.json({ pins: [] });

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  if (!apiKey) return NextResponse.json({ pins: [], error: "no_maps_key" });

  // SNS投稿をキャッシュから取得（Apify呼び出しなし）
  let posts: SocialPost[] = [];
  try {
    const cached = await getCachedResults(query, "all");
    if (cached) {
      posts = cached;
    } else {
      // allキャッシュがなければ各プラットフォームのキャッシュを結合
      const [tw, ig, tt] = await Promise.all([
        getCachedResults(query, "twitter"),
        getCachedResults(query, "instagram"),
        getCachedResults(query, "tiktok"),
      ]);
      posts = [...(tw || []), ...(ig || []), ...(tt || [])];
    }
  } catch {}

  if (posts.length === 0) {
    return NextResponse.json({ pins: [], note: "no_cached_posts" });
  }

  // 投稿ごとに店舗名を抽出してマップに集約
  const storePostMap = new Map<string, SocialPost[]>();
  for (const post of posts) {
    const storeNames = extractStoreNames(post.text);
    for (const name of storeNames) {
      if (!storePostMap.has(name)) storePostMap.set(name, []);
      storePostMap.get(name)!.push(post);
    }
  }

  if (storePostMap.size === 0) {
    return NextResponse.json({ pins: [], note: "no_stores_extracted" });
  }

  // 最大10店舗を並列ジオコーディング
  const entries = [...storePostMap.entries()].slice(0, 10);
  const pins: MapPin[] = [];

  await Promise.all(
    entries.map(async ([storeName, relatedPosts]) => {
      const coords = await geocode(storeName, apiKey);
      if (coords) {
        pins.push({
          id: `sns-${storeName}`,
          ...coords,
          storeName,
          posts: relatedPosts.slice(0, 3),
        });
      }
    })
  );

  return NextResponse.json({ pins });
}
