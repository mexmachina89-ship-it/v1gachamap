import * as cheerio from "cheerio";
import { prisma } from "./prisma";

export interface GachaWebResult {
  id: string;
  name: string;
  imageUrl?: string;
  url: string;
  price?: string;
  totalTypes?: string;
  maker?: string;
  releaseDate?: string;
  source: "gacha-island" | "gashadoko" | "gashapon";
  description?: string;
}

const WEB_CACHE_TTL_HOURS = 6;

// ─── キャッシュ ───────────────────────────────────────────

async function getCached(query: string, source: string): Promise<GachaWebResult[] | null> {
  try {
    const cache = await prisma.webScrapeCache.findUnique({
      where: { query_source: { query: query.toLowerCase(), source } },
    });
    if (!cache) return null;
    if (new Date() > cache.expiresAt) {
      await prisma.webScrapeCache.delete({ where: { id: cache.id } });
      return null;
    }
    console.log(`✅ WebCache hit: "${query}" [${source}]`);
    return cache.results as unknown as GachaWebResult[];
  } catch {
    return null;
  }
}

async function setCache(query: string, source: string, results: GachaWebResult[]) {
  try {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + WEB_CACHE_TTL_HOURS);
    await prisma.webScrapeCache.upsert({
      where: { query_source: { query: query.toLowerCase(), source } },
      update: { results: results as any, expiresAt, createdAt: new Date() },
      create: { query: query.toLowerCase(), source, results: results as any, expiresAt },
    });
    console.log(`💾 WebCache saved: "${query}" [${source}] → ${results.length}件`);
  } catch (e) {
    console.error("WebCache save error:", e);
  }
}

// ─── ① gacha-island.jp ────────────────────────────────────

export async function scrapeGachaIsland(query: string): Promise<GachaWebResult[]> {
  const cached = await getCached(query, "gacha-island");
  if (cached) return cached;

  try {
    const url = `https://gacha-island.jp/?s=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; GachaMapBot/1.0)" },
      next: { revalidate: 0 },
    });
    if (!res.ok) return [];
    const html = await res.text();
    const $ = cheerio.load(html);

    const results: GachaWebResult[] = [];

    // 商品カード: <a href="https://gacha-island.jp/[ID]/"> 内に h3・img・価格テキスト
    $('a[href*="gacha-island.jp/"]').each((_, el) => {
      const $el = $(el);
      const href = $el.attr("href") || "";

      // 商品詳細ページのみ（/ID/ パターン）
      if (!/gacha-island\.jp\/\d+\/$/.test(href)) return;

      const name = $el.find("h3").first().text().trim();
      if (!name) return;

      const imageUrl = $el.find("img").first().attr("src") || "";
      // 高解像度版に変換（-257x300 → 削除）
      const cleanImage = imageUrl.replace(/-\d+x\d+(\.\w+)$/, "$1");

      // 価格・種類テキスト（"400円 / 全4種" 形式）
      const priceText = $el
        .find("p, div")
        .filter((_, p) => /円/.test($(p).text()))
        .first()
        .text()
        .trim();

      const priceMatch = priceText.match(/(\d+)円/);
      const typesMatch = priceText.match(/全(\d+)種/);
      const makerEl = $el.find("p, div").filter((_, p) =>
        /メーカー/.test($(p).text())
      );
      const maker = makerEl.text().replace("メーカー:", "").replace("メーカー：", "").trim();

      const releasePEl = $el.find("p, div").filter((_, p) =>
        /発売/.test($(p).text())
      );
      const releaseDate = releasePEl.text().replace(/発売[：:日]?\s*/, "").trim();

      results.push({
        id: `gi-${href.replace(/[^a-z0-9]/gi, "")}`,
        name,
        imageUrl: cleanImage || undefined,
        url: href,
        price: priceMatch ? `${priceMatch[1]}円` : undefined,
        totalTypes: typesMatch ? `全${typesMatch[1]}種` : undefined,
        maker: maker || undefined,
        releaseDate: releaseDate || undefined,
        source: "gacha-island",
      });
    });

    const unique = dedup(results).slice(0, 20);
    await setCache(query, "gacha-island", unique);
    return unique;
  } catch (e) {
    console.error("gacha-island scrape error:", e);
    return [];
  }
}

// ─── ② gashadoko.jp ────────────────────────────────────────

export async function scrapeGashadoko(query: string): Promise<GachaWebResult[]> {
  const cached = await getCached(query, "gashadoko");
  if (cached) return cached;

  try {
    const url = `https://gashadoko.jp/?s=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; GachaMapBot/1.0)" },
      next: { revalidate: 0 },
    });
    if (!res.ok) return [];
    const html = await res.text();
    const $ = cheerio.load(html);

    const results: GachaWebResult[] = [];

    // article タグ内の記事カード
    $("article").each((_, el) => {
      const $el = $(el);
      const $link = $el.find("a[href]").first();
      const href = $link.attr("href") || "";
      if (!href.startsWith("https://gashadoko.jp")) return;

      const name =
        $el.find("h2, h3").first().text().trim() ||
        $link.attr("title") ||
        "";
      if (!name) return;

      // 遅延ロード画像対応（data-src / src）
      const $img = $el.find("img").first();
      const imageUrl =
        $img.attr("data-src") || $img.attr("src") || "";
      const cleanImage = imageUrl.startsWith("data:") ? "" : imageUrl;

      const description = $el.find("p").first().text().trim().slice(0, 100);

      results.push({
        id: `gd-${href.replace(/[^a-z0-9]/gi, "")}`,
        name,
        imageUrl: cleanImage || undefined,
        url: href,
        source: "gashadoko",
        description: description || undefined,
      });
    });

    const unique = dedup(results).slice(0, 15);
    await setCache(query, "gashadoko", unique);
    return unique;
  } catch (e) {
    console.error("gashadoko scrape error:", e);
    return [];
  }
}

// ─── ③ gashapon.jp（バンダイ公式） ────────────────────────

export async function scrapeGashapon(query: string): Promise<GachaWebResult[]> {
  const cached = await getCached(query, "gashapon");
  if (cached) return cached;

  try {
    const url = `https://gashapon.jp/products/?keyword=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; GachaMapBot/1.0)" },
      next: { revalidate: 0 },
    });
    if (!res.ok) return [];
    const html = await res.text();
    const $ = cheerio.load(html);

    const results: GachaWebResult[] = [];

    // 商品リンク: <a href="detail.php?jan_code=...">
    $('a[href*="detail.php"]').each((_, el) => {
      const $el = $(el);
      const href = $el.attr("href") || "";
      const fullUrl = href.startsWith("http")
        ? href
        : `https://gashapon.jp/products/${href}`;

      const $img = $el.find("img").first();
      const imageUrl = $img.attr("src") || "";

      // テキストノードから商品名と価格を抽出
      const rawText = $el
        .clone()
        .find("img, em")
        .remove()
        .end()
        .text()
        .replace(/\s+/g, " ")
        .trim();

      const priceMatch = rawText.match(/(\d+)円/);
      const name = rawText.replace(/\d+円/, "").trim();
      if (!name) return;

      const typeTag = $el.find("em").first().text().trim(); // "ガシャポン" etc

      results.push({
        id: `gp-${href.replace(/[^a-z0-9]/gi, "")}`,
        name,
        imageUrl: imageUrl || undefined,
        url: fullUrl,
        price: priceMatch ? `${priceMatch[1]}円` : undefined,
        source: "gashapon",
        description: typeTag || undefined,
      });
    });

    const unique = dedup(results).slice(0, 20);
    await setCache(query, "gashapon", unique);
    return unique;
  } catch (e) {
    console.error("gashapon scrape error:", e);
    return [];
  }
}

// ─── 全サイト並列検索 ─────────────────────────────────────

export async function scrapeAllWeb(query: string): Promise<GachaWebResult[]> {
  const [island, doko, gashapon] = await Promise.all([
    scrapeGachaIsland(query),
    scrapeGashadoko(query),
    scrapeGashapon(query),
  ]);
  return [...island, ...doko, ...gashapon];
}

// ─── ユーティリティ ──────────────────────────────────────

function dedup(results: GachaWebResult[]): GachaWebResult[] {
  const seen = new Set<string>();
  return results.filter((r) => {
    if (seen.has(r.id)) return false;
    seen.add(r.id);
    return true;
  });
}
