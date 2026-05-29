import { prisma } from "./prisma";
import type { SocialPost } from "./apify";

const CACHE_TTL_HOURS = 24; // キャッシュ有効期限（時間）

/**
 * キャッシュから検索結果を取得
 * 有効期限内のデータがあれば返す、なければnullを返す
 */
export async function getCachedResults(
  query: string,
  platform: string
): Promise<SocialPost[] | null> {
  try {
    const cache = await prisma.socialPostCache.findUnique({
      where: { query_platform: { query: query.toLowerCase(), platform } },
    });

    if (!cache) return null;

    // 有効期限チェック
    if (new Date() > cache.expiresAt) {
      // 期限切れのキャッシュを削除
      await prisma.socialPostCache.delete({
        where: { id: cache.id },
      });
      return null;
    }

    console.log(`✅ Cache hit: "${query}" [${platform}] (expires: ${cache.expiresAt.toLocaleString("ja-JP")})`);
    return cache.results as unknown as SocialPost[];
  } catch {
    return null;
  }
}

/**
 * 検索結果をキャッシュに保存
 */
export async function setCachedResults(
  query: string,
  platform: string,
  results: SocialPost[]
): Promise<void> {
  try {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + CACHE_TTL_HOURS);

    await prisma.socialPostCache.upsert({
      where: { query_platform: { query: query.toLowerCase(), platform } },
      update: {
        results: results as any,
        expiresAt,
        createdAt: new Date(),
      },
      create: {
        query: query.toLowerCase(),
        platform,
        results: results as any,
        expiresAt,
      },
    });

    console.log(`💾 Cache saved: "${query}" [${platform}] → ${results.length}件 (TTL: ${CACHE_TTL_HOURS}h)`);
  } catch (e) {
    console.error("Cache save error:", e);
  }
}

/**
 * 期限切れキャッシュを一括削除（定期メンテナンス用）
 */
export async function cleanExpiredCache(): Promise<number> {
  try {
    const result = await prisma.socialPostCache.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
    return result.count;
  } catch {
    return 0;
  }
}

/**
 * キャッシュ統計を取得
 */
export async function getCacheStats() {
  try {
    const total = await prisma.socialPostCache.count();
    const expired = await prisma.socialPostCache.count({
      where: { expiresAt: { lt: new Date() } },
    });
    return { total, expired, active: total - expired };
  } catch {
    return { total: 0, expired: 0, active: 0 };
  }
}
