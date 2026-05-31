import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  images: {
    // 画像フォーマット最適化（WebP/AVIF自動変換）
    formats: ["image/avif", "image/webp"],
    // レスポンシブ対応のサイズプリセット
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "pbs.twimg.com" },
      { protocol: "https", hostname: "*.cdninstagram.com" },
      { protocol: "https", hostname: "*.tiktokcdn.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      // ガチャサイトの画像
      { protocol: "https", hostname: "gacha-island.jp" },
      { protocol: "https", hostname: "gashadoko.jp" },
      { protocol: "https", hostname: "gashapon.jp" },
      { protocol: "https", hostname: "*.gashapon.jp" },
    ],
  },

  // セキュリティ＆パフォーマンスヘッダー
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
      {
        // 静的アセットは長期キャッシュ
        source: "/(.*)\\.(ico|svg|png|jpg|jpeg|webp|avif|woff2)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },

  // 本番ビルドのコンソールログを削減
  compiler: {
    removeConsole: process.env.NODE_ENV === "production"
      ? { exclude: ["error"] }
      : false,
  },
};

export default withNextIntl(nextConfig);
