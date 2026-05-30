export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getCachedResults } from "@/lib/cache";
import { prisma } from "@/lib/prisma";
import * as cheerio from "cheerio";
import type { SocialPost } from "@/lib/apify";
import type { GachaWebResult } from "@/lib/webScraper";

// ─── 型定義 ──────────────────────────────────────────────

export type PinType = "sns" | "web-article" | "official";

export interface MapPin {
  id: string;
  type: PinType;
  lat: number;
  lng: number;
  storeName: string;
  address: string;
  // SNSピン用
  posts?: SocialPost[];
  // Webアーティクルピン用
  articleTitle?: string;
  articleUrl?: string;
  articleSource?: string;
  // 公式店舗ピン用
  officialChain?: string;
}

// ─── 店舗チェーン抽出（SNS投稿から） ────────────────────

const STORE_CHAINS = [
  "イオンモール", "イオン", "ゲオ", "トイザらス", "ヨドバシ",
  "ドンキホーテ", "ドンキ", "アピタ", "ローソン",
  "ファミリーマート", "ファミマ", "セブンイレブン",
  "ガチャポン会館", "ガシャポンバンダイオフィシャルショップ",
];

function extractChains(text: string): string[] {
  return STORE_CHAINS.filter((c) => text.includes(c));
}

// ─── Google Places Text Search ────────────────────────────

async function placesTextSearch(
  query: string,
  apiKey: string
): Promise<{ name: string; address: string; lat: number; lng: number; placeId: string }[]> {
  try {
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${apiKey}&language=ja&region=JP`;
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

// ─── Geocoding API ────────────────────────────────────────

async function geocode(
  address: string,
  apiKey: string
): Promise<{ lat: number; lng: number } | null> {
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address + " 日本")}&key=${apiKey}&language=ja&region=JP`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.status === "OK" && data.results?.[0]) {
      const loc = data.results[0].geometry.location;
      return { lat: loc.lat, lng: loc.lng };
    }
  } catch {}
  return null;
}

// ─── gashadoko記事から店舗情報を抽出 ─────────────────────

interface ArticleStore {
  name: string;
  address?: string;
}

async function scrapeGashadokoArticleStores(url: string): Promise<ArticleStore[]> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; GachaMapBot/1.0)" },
    });
    if (!res.ok) return [];
    const html = await res.text();
    const $ = cheerio.load(html);
    const stores: ArticleStore[] = [];

    // h3タグから店舗名を取得
    $("h2, h3").each((_, el) => {
      const text = $(el).text().trim();
      // 番号付きの店舗名（例: "1・ガシャポンバンダイオフィシャルショップ HEP FIVE店"）
      const nameMatch = text.match(/^\d+[・\.\-\s]*(.+)/);
      const name = nameMatch ? nameMatch[1].trim() : text;
      if (!name || name.length > 60 || name.length < 3) return;
      if (!/ショップ|店|会館|モール|センター|パーク|プラザ|デパート|コーナー/.test(name)) return;

      // 直後のtable or pから所在地を探す
      const $next = $(el).nextAll("table, p, div").first();
      const tableAddr = $next.find("tr").filter((_, tr) =>
        /所在地|住所|場所/.test($(tr).find("td, th").first().text())
      ).find("td").last().text().trim();

      stores.push({ name, address: tableAddr || undefined });
    });

    return stores.slice(0, 10);
  } catch {
    return [];
  }
}

// ─── メインハンドラー ─────────────────────────────────────

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q") || "";
  if (!query) return NextResponse.json({ pins: [] });

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  if (!apiKey) return NextResponse.json({ pins: [], error: "no_maps_key" });

  const pins: MapPin[] = [];
  const seen = new Set<string>();

  const addPin = (pin: MapPin) => {
    if (seen.has(pin.id)) return;
    seen.add(pin.id);
    pins.push(pin);
  };

  // ── 1. SNSキャッシュ → チェーン名でPlaces検索（📱オレンジ） ──
  const snsPromise = (async () => {
    let posts: SocialPost[] = [];
    try {
      const cached = await getCachedResults(query, "all");
      posts = cached || [];
      if (!posts.length) {
        const [tw, ig] = await Promise.all([
          getCachedResults(query, "twitter"),
          getCachedResults(query, "instagram"),
        ]);
        posts = [...(tw || []), ...(ig || [])];
      }
    } catch {}

    const chainPostMap = new Map<string, SocialPost[]>();
    for (const post of posts) {
      for (const chain of extractChains(post.text)) {
        if (!chainPostMap.has(chain)) chainPostMap.set(chain, []);
        chainPostMap.get(chain)!.push(post);
      }
    }

    const chainsToSearch =
      chainPostMap.size > 0
        ? [...chainPostMap.keys()].slice(0, 4)
        : ["イオン", "ゲオ", "トイザらス", "ヨドバシ"];

    await Promise.all(
      chainsToSearch.map(async (chain) => {
        const places = await placesTextSearch(
          `${chain} ${query} ガチャ カプセルトイ`,
          apiKey
        );
        for (const p of places) {
          addPin({
            id: `sns-${p.placeId}`,
            type: "sns",
            lat: p.lat,
            lng: p.lng,
            storeName: p.name,
            address: p.address,
            posts: (chainPostMap.get(chain) || []).slice(0, 3),
          });
        }
      })
    );
  })();

  // ── 2. Webスクレイプキャッシュ（gashadoko記事）→ 店舗抽出（📍緑） ──
  const webPromise = (async () => {
    try {
      const cache = await prisma.webScrapeCache.findUnique({
        where: { query_source: { query: query.toLowerCase(), source: "gashadoko" } },
      });
      if (!cache) return;

      const articles = cache.results as unknown as GachaWebResult[];
      // 記事タイトルから地名を抽出してジオコーディング
      await Promise.all(
        articles.slice(0, 5).map(async (article) => {
          // まず記事内の店舗をスクレイプ
          const stores = await scrapeGashadokoArticleStores(article.url);

          if (stores.length > 0) {
            // 記事内店舗をジオコーディング（最大3店舗）
            await Promise.all(
              stores.slice(0, 3).map(async (store) => {
                const geocodeQuery = store.address
                  ? store.address
                  : `${store.name} ${extractCityFromTitle(article.name)}`;
                const coords = await geocode(geocodeQuery, apiKey);
                if (!coords) return;
                addPin({
                  id: `web-${store.name.replace(/\s/g, "")}-${article.id}`,
                  type: "web-article",
                  lat: coords.lat,
                  lng: coords.lng,
                  storeName: store.name,
                  address: store.address || geocodeQuery,
                  articleTitle: article.name,
                  articleUrl: article.url,
                  articleSource: "gashadoko",
                });
              })
            );
          } else {
            // 店舗抽出できない場合は記事タイトルの地名でジオコーディング
            const city = extractCityFromTitle(article.name);
            if (!city) return;
            const coords = await geocode(`${city} ガチャガチャ カプセルトイ`, apiKey);
            if (!coords) return;
            addPin({
              id: `web-area-${city}-${article.id}`,
              type: "web-article",
              lat: coords.lat,
              lng: coords.lng,
              storeName: `${city}のガチャスポット`,
              address: city,
              articleTitle: article.name,
              articleUrl: article.url,
              articleSource: "gashadoko",
            });
          }
        })
      );
    } catch (e) {
      console.error("web article pins error:", e);
    }
  })();

  // ── 3. バンダイ公式・専門店 → Places検索（🏪紫） ──
  const officialPromise = (async () => {
    const officialChains = [
      "ガシャポンのデパート",
      "ガシャポンバンダイオフィシャルショップ",
      "カプセルステーション",
    ];
    await Promise.all(
      officialChains.slice(0, 2).map(async (chain) => {
        const places = await placesTextSearch(`${chain} 日本`, apiKey);
        for (const p of places) {
          addPin({
            id: `official-${p.placeId}`,
            type: "official",
            lat: p.lat,
            lng: p.lng,
            storeName: p.name,
            address: p.address,
            officialChain: chain,
          });
        }
      })
    );
  })();

  await Promise.all([snsPromise, webPromise, officialPromise]);

  return NextResponse.json({ pins });
}

// タイトルから地名（都市・エリア）を抽出
function extractCityFromTitle(title: string): string {
  const match = title.match(
    /^([一-鿿぀-ヿ]{2,8})(で|の|にある|周辺|エリア|付近)/
  );
  return match ? match[1] : "";
}
