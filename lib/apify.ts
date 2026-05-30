import { ApifyClient } from "apify-client";

const client = new ApifyClient({
  token: process.env.APIFY_API_TOKEN,
});

export interface SocialPost {
  id: string;
  platform: "twitter" | "instagram" | "tiktok";
  text: string;
  imageUrl?: string;
  url: string;
  author: string;
  likes: number;
  createdAt: string;
  relevanceScore?: number;
  extractedInfo?: ExtractedGachaInfo;
}

// ガチャ情報の抽出結果
export interface ExtractedGachaInfo {
  price?: string;        // 例: "300円"
  series?: string;       // 例: "すみっコぐらし"
  totalTypes?: string;   // 例: "全6種"
  stores?: string[];     // 例: ["イオン", "ゲオ"]
  isNew?: boolean;       // 新作かどうか
  isLimited?: boolean;   // 限定かどうか
}

// ガチャ関連キーワード（関連度フィルタリング用）
const GACHA_KEYWORDS = [
  "ガチャ", "ガチャガチャ", "カプセルトイ", "ガチャポン",
  "コンプリート", "全種", "当たった", "排出", "新作",
  "限定", "ガチャ活", "戦利品", "開封", "capsule", "gacha",
  "カプセル", "ガシャポン", "全８種", "全６種", "全4種",
];

// プラットフォーム別の最適化クエリを生成
function buildTwitterQuery(query: string): string {
  return `${query} (ガチャ OR カプセルトイ OR ガチャガチャ OR ガチャポン) lang:ja`;
}

function buildInstagramHashtags(query: string): string[] {
  const base = query.replace(/\s/g, "");
  return [
    base,
    `${base}ガチャ`,
    `${base}カプセルトイ`,
    "ガチャガチャ",
    "カプセルトイ",
    "ガチャ戦利品",
    "ガチャ活",
    "新作ガチャ",
    "ガチャポン",
  ];
}

function buildTikTokQuery(query: string): string {
  return `${query} ガチャ カプセルトイ`;
}

// 関連度スコアを計算（0〜100）
function calcRelevanceScore(text: string): number {
  if (!text) return 0;
  const lowerText = text.toLowerCase();
  let score = 0;

  for (const keyword of GACHA_KEYWORDS) {
    if (lowerText.includes(keyword.toLowerCase())) {
      score += keyword.length > 3 ? 20 : 10;
    }
  }

  // ボーナス：価格情報あり
  if (/\d{2,4}円/.test(text)) score += 15;
  // ボーナス：種類数あり
  if (/全\d+種/.test(text)) score += 15;
  // ボーナス：店舗名あり
  if (/イオン|ゲオ|アピタ|トイザらス|ドンキ|ヨドバシ|コンビニ|ローソン|ファミマ/.test(text)) score += 10;

  return Math.min(score, 100);
}

// 投稿からガチャ情報を自動抽出
function extractGachaInfo(text: string): ExtractedGachaInfo {
  const info: ExtractedGachaInfo = {};

  // 価格抽出（例: 300円、500円）
  const priceMatch = text.match(/(\d{2,4})円/);
  if (priceMatch) info.price = `${priceMatch[1]}円`;

  // 種類数抽出（例: 全6種、全８種）
  const typesMatch = text.match(/全(\d+)種/);
  if (typesMatch) info.totalTypes = `全${typesMatch[1]}種`;

  // 設置店舗抽出
  const storeKeywords = ["イオン", "ゲオ", "アピタ", "トイザらス", "ドンキ", "ヨドバシ", "ローソン", "ファミマ", "セブン"];
  info.stores = storeKeywords.filter(store => text.includes(store));

  // 新作・限定フラグ
  info.isNew = /新作|新発売|登場|リリース/.test(text);
  info.isLimited = /限定|期間限定|数量限定/.test(text);

  return info;
}

// ガチャ関連投稿かどうかフィルタリング（スコア15以上を採用）
function filterGachaRelevant(posts: SocialPost[]): SocialPost[] {
  return posts
    .map(post => ({
      ...post,
      relevanceScore: calcRelevanceScore(post.text),
      extractedInfo: extractGachaInfo(post.text),
    }))
    .filter(post => post.relevanceScore! >= 15)
    .sort((a, b) => {
      // 関連度スコア × いいね数で総合ランキング
      const scoreA = (a.relevanceScore! * 0.6) + (Math.log1p(a.likes) * 10 * 0.4);
      const scoreB = (b.relevanceScore! * 0.6) + (Math.log1p(b.likes) * 10 * 0.4);
      return scoreB - scoreA;
    });
}

export async function searchTwitter(query: string): Promise<SocialPost[]> {
  if (!process.env.APIFY_API_TOKEN) return [];

  // キャッシュ確認
  const { getCachedResults, setCachedResults } = await import("./cache");
  const cached = await getCachedResults(query, "twitter");
  if (cached) return cached;

  try {
    const optimizedQuery = buildTwitterQuery(query);
    const run = await client.actor("apidojo/tweet-scraper").call({
      searchTerms: [optimizedQuery],
      maxItems: 30,
      lang: "ja",
    });
    const { items } = await client.dataset(run.defaultDatasetId).listItems();
    const posts = items.map((item: any) => ({
      id: item.id || String(Math.random()),
      platform: "twitter" as const,
      text: item.full_text || item.text || "",
      imageUrl: item.media?.[0]?.media_url_https,
      url: `https://twitter.com/i/web/status/${item.id}`,
      author: item.user?.screen_name || "unknown",
      likes: item.favorite_count || 0,
      createdAt: item.created_at || new Date().toISOString(),
    }));
    const filtered = filterGachaRelevant(posts);
    await setCachedResults(query, "twitter", filtered); // キャッシュ保存
    return filtered;
  } catch {
    return [];
  }
}

export async function searchInstagram(query: string): Promise<SocialPost[]> {
  if (!process.env.APIFY_API_TOKEN) return [];

  const { getCachedResults, setCachedResults } = await import("./cache");
  const cached = await getCachedResults(query, "instagram");
  if (cached) return cached;

  try {
    const hashtags = buildInstagramHashtags(query);
    const run = await client.actor("apify/instagram-hashtag-scraper").call({
      hashtags,
      resultsLimit: 30,
    });
    const { items } = await client.dataset(run.defaultDatasetId).listItems();
    const posts = items.map((item: any) => ({
      id: item.id || String(Math.random()),
      platform: "instagram" as const,
      text: item.caption || "",
      imageUrl: item.displayUrl,
      url: item.url || `https://instagram.com/p/${item.shortCode}`,
      author: item.ownerUsername || "unknown",
      likes: item.likesCount || 0,
      createdAt: item.timestamp || new Date().toISOString(),
    }));
    const filtered = filterGachaRelevant(posts);
    await setCachedResults(query, "instagram", filtered);
    return filtered;
  } catch {
    return [];
  }
}

export async function searchTikTok(query: string): Promise<SocialPost[]> {
  if (!process.env.APIFY_API_TOKEN) return [];

  const { getCachedResults, setCachedResults } = await import("./cache");
  const cached = await getCachedResults(query, "tiktok");
  if (cached) return cached;

  try {
    const optimizedQuery = buildTikTokQuery(query);
    const run = await client.actor("clockworks/free-tiktok-scraper").call({
      searchQueries: [optimizedQuery],
      maxItems: 30,
    });
    const { items } = await client.dataset(run.defaultDatasetId).listItems();
    const posts = items.map((item: any) => ({
      id: item.id || String(Math.random()),
      platform: "tiktok" as const,
      text: item.text || item.desc || "",
      imageUrl: item.covers?.[0],
      url: item.webVideoUrl || `https://tiktok.com/@${item.authorMeta?.name}/video/${item.id}`,
      author: item.authorMeta?.name || "unknown",
      likes: item.diggCount || 0,
      createdAt: item.createTime ? new Date(item.createTime * 1000).toISOString() : new Date().toISOString(),
    }));
    const filtered = filterGachaRelevant(posts);
    await setCachedResults(query, "tiktok", filtered);
    return filtered;
  } catch {
    return [];
  }
}

export async function searchAllSocial(query: string): Promise<SocialPost[]> {
  // allプラットフォームのキャッシュを先に確認
  const { getCachedResults, setCachedResults } = await import("./cache");
  const cached = await getCachedResults(query, "all");
  if (cached) return cached;

  // TikTokはガチャ投稿が極端に少ないため除外（速度改善）
  const [twitter, instagram] = await Promise.all([
    searchTwitter(query),
    searchInstagram(query),
  ]);
  const combined = filterGachaRelevant([...twitter, ...instagram]);
  await setCachedResults(query, "all", combined);
  return combined;
}
