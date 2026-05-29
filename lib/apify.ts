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
}

export async function searchTwitter(query: string): Promise<SocialPost[]> {
  if (!process.env.APIFY_API_TOKEN) return [];
  try {
    const run = await client.actor("apidojo/tweet-scraper").call({
      searchTerms: [query + " ガチャ OR capsule toy"],
      maxItems: 20,
      lang: "ja",
    });
    const { items } = await client.dataset(run.defaultDatasetId).listItems();
    return items.map((item: any) => ({
      id: item.id || String(Math.random()),
      platform: "twitter" as const,
      text: item.full_text || item.text || "",
      imageUrl: item.media?.[0]?.media_url_https,
      url: `https://twitter.com/i/web/status/${item.id}`,
      author: item.user?.screen_name || "unknown",
      likes: item.favorite_count || 0,
      createdAt: item.created_at || new Date().toISOString(),
    }));
  } catch {
    return [];
  }
}

export async function searchInstagram(query: string): Promise<SocialPost[]> {
  if (!process.env.APIFY_API_TOKEN) return [];
  try {
    const run = await client.actor("apify/instagram-hashtag-scraper").call({
      hashtags: [query.replace(/\s/g, ""), "ガチャガチャ", "カプセルトイ"],
      resultsLimit: 20,
    });
    const { items } = await client.dataset(run.defaultDatasetId).listItems();
    return items.map((item: any) => ({
      id: item.id || String(Math.random()),
      platform: "instagram" as const,
      text: item.caption || "",
      imageUrl: item.displayUrl,
      url: item.url || `https://instagram.com/p/${item.shortCode}`,
      author: item.ownerUsername || "unknown",
      likes: item.likesCount || 0,
      createdAt: item.timestamp || new Date().toISOString(),
    }));
  } catch {
    return [];
  }
}

export async function searchTikTok(query: string): Promise<SocialPost[]> {
  if (!process.env.APIFY_API_TOKEN) return [];
  try {
    const run = await client.actor("clockworks/free-tiktok-scraper").call({
      searchQueries: [query + " ガチャ"],
      maxItems: 20,
    });
    const { items } = await client.dataset(run.defaultDatasetId).listItems();
    return items.map((item: any) => ({
      id: item.id || String(Math.random()),
      platform: "tiktok" as const,
      text: item.text || item.desc || "",
      imageUrl: item.covers?.[0],
      url: item.webVideoUrl || `https://tiktok.com/@${item.authorMeta?.name}/video/${item.id}`,
      author: item.authorMeta?.name || "unknown",
      likes: item.diggCount || 0,
      createdAt: item.createTime ? new Date(item.createTime * 1000).toISOString() : new Date().toISOString(),
    }));
  } catch {
    return [];
  }
}

export async function searchAllSocial(query: string): Promise<SocialPost[]> {
  const [twitter, instagram, tiktok] = await Promise.all([
    searchTwitter(query),
    searchInstagram(query),
    searchTikTok(query),
  ]);
  return [...twitter, ...instagram, ...tiktok].sort((a, b) => b.likes - a.likes);
}
