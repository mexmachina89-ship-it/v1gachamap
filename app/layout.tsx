import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

export const metadata: Metadata = {
  title: "GachaMap - ガチャガチャ検索",
  description: "欲しいガチャが見つかる！カプセルトイ検索アプリ / Find capsule toys near you",
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
