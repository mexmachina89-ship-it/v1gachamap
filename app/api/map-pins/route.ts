export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getCachedResults } from "@/lib/cache";
import type { SocialPost } from "@/lib/apify";

export interface MapPin {
  id: string;
  lat: number;
  lng: number;
  storeName: string;
  address: string;
  posts: SocialPost[];
}

// 投稿テキストから店舗チェーン名を抽出（シンプルに）
const STORE_CHAINS = [
  "イオンモール",
  "イオン",
  "ゲオ",
  "トイザらス",
  "ヨドバシ",
  "ドンキホーテ",
  "ドンキ",
  "アピタ",
  "ローソン",
  "ファミリーマート",
  "ファミマ",
  "セブンイレブン",
  "コンビニ",
  "ガチャポン会館",
  "ガシャポンバンダイオフィシャルショップ",
];

function extractChains(text: string): string[] {
  return STORE_CHAINS.filter((chain) => text.includes(chain));
}

// Google Places Text Search（サーバーサイド REST API）
async function placesTextSearch(
  query: string,
  apiKey: string
): Promise<{ name: string; address: string; lat: number; lng: number; placeId: string }[]> {
  try {
    const encoded = encodeURIComponent(query);
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encoded}&key=${apiKey}&language=ja&region=JP`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.status !== "OK" || !data.results) return [];
    return data.results.slice(0, 3).map((r: any) => ({
      name: r.name,
      address: r.formatted_address || "",
      lat: r.geometry.location.lat,
      lng: r.geometry.location.lng,
      placeId: r.place_id,
    }));
  } catch {
    return [];
  }
}

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q") || "";
  if (!query) return NextResponse.json({ pins: [] });

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  if (!apiKey) return NextResponse.json({ pins: [], error: "no_maps_key" });

  // キャッシュからSNS投稿を取得（Apify呼び出しなし）
  let posts: SocialPost[] = [];
  try {
    const cached = await getCachedResults(query, "all");
    if (cached && cached.length > 0) {
      posts = cached;
    } else {
      const [tw, ig, tt] = await Promise.all([
        getCachedResults(query, "twitter"),
        getCachedResults(query, "instagram"),
        getCachedResults(query, "tiktok"),
      ]);
      posts = [...(tw || []), ...(ig || []), ...(tt || [])];
    }
  } catch {}

  // キャッシュがなければクエリだけでガチャ店舗を検索
  let chainsToSearch: string[];
  const chainPostMap = new Map<string, SocialPost[]>();

  if (posts.length === 0) {
    // SNSキャッシュなし → 定番チェーンで検索
    chainsToSearch = ["イオン", "ゲオ", "トイザらス", "ヨドバシ", "ドンキ"];
  } else {
    // SNS投稿からチェーン名を抽出
    for (const post of posts) {
      const chains = extractChains(post.text);
      for (const chain of chains) {
        if (!chainPostMap.has(chain)) chainPostMap.set(chain, []);
        chainPostMap.get(chain)!.push(post);
      }
    }

    if (chainPostMap.size === 0) {
      // 投稿に店舗名なし → 定番チェーンで検索
      chainsToSearch = ["イオン", "ゲオ", "トイザらス", "ヨドバシ", "ドンキ"];
    } else {
      chainsToSearch = [...chainPostMap.keys()];
    }
  }

  // 各チェーンに対してGoogle Places検索（最大5チェーン）
  const pins: MapPin[] = [];
  const seen = new Set<string>(); // placeId重複排除

  await Promise.all(
    chainsToSearch.slice(0, 5).map(async (chain) => {
      const searchQuery = `${chain} ${query} ガチャ カプセルトイ`;
      const places = await placesTextSearch(searchQuery, apiKey);
      for (const place of places) {
        if (seen.has(place.placeId)) continue;
        seen.add(place.placeId);
        pins.push({
          id: `sns-${place.placeId}`,
          lat: place.lat,
          lng: place.lng,
          storeName: place.name,
          address: place.address,
          posts: (chainPostMap.get(chain) || []).slice(0, 3),
        });
      }
    })
  );

  return NextResponse.json({
    pins,
    source: posts.length > 0 ? "sns_cache" : "default_search",
    postCount: posts.length,
  });
}
