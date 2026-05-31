import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL
  || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    template: "%s | GachaMap",
    default: "GachaMap - ガチャガチャ・カプセルトイ検索",
  },
  description:
    "欲しいガチャが見つかる！ガチャガチャ・カプセルトイの最新情報を検索。設置店舗をマップで確認、SNS投稿でリアルタイム情報もチェック。",
  keywords: [
    "ガチャガチャ", "カプセルトイ", "ガチャポン", "ガシャポン",
    "設置店舗", "ガチャ検索", "ガチャマップ", "capsule toy",
  ],
  authors: [{ name: "GachaMap" }],
  creator: "GachaMap",
  openGraph: {
    type: "website",
    locale: "ja_JP",
    alternateLocale: "en_US",
    url: BASE_URL,
    siteName: "GachaMap",
    title: "GachaMap - ガチャガチャ・カプセルトイ検索",
    description:
      "欲しいガチャが見つかる！カプセルトイの最新情報検索・設置店舗マップ・SNS投稿まとめ",
    images: [
      {
        url: "/hero-bg.jpg",
        width: 1200,
        height: 630,
        alt: "GachaMap - ガチャガチャ検索",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GachaMap - ガチャガチャ・カプセルトイ検索",
    description: "欲しいガチャが見つかる！カプセルトイの最新情報・設置店舗マップ",
    images: ["/hero-bg.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  // ↓ Google Search Console の「HTMLタグ」の content= の値をここに貼り付ける
  verification: {
    google: "Z5ph92pTjl1Qsf6UlZdJDGglyLCsjWEWQKmDytmMjgs",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ec4899",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className={geist.variable}>
      <body className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
        {children}
      </body>
    </html>
  );
}
