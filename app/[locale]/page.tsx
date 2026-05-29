"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Search, TrendingUp, MapPin, Star } from "lucide-react";
import { mockRanking, mockGachaItems } from "@/lib/mockData";
import GachaCard from "@/components/GachaCard";

const trendingKeywords = [
  "ちいかわ", "ポケモン", "すみっコぐらし", "サンリオ",
  "ワンピース", "呪術廻戦", "ハローキティ", "マリオ",
];

export default function HomePage() {
  const t = useTranslations("home");
  const tSearch = useTranslations("search");
  const locale = useLocale();
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearch = (q?: string) => {
    const searchQuery = q || query;
    if (!searchQuery.trim()) return;
    router.push(`/${locale}/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <div className="min-h-screen">
      {/* Hero section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-pink-400 via-purple-400 to-yellow-300 py-20 px-4">
        {/* Decorative bubbles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {["🎰", "✨", "🎪", "🌟", "🎈", "💫", "🎠", "🎡"].map((emoji, i) => (
            <span
              key={i}
              className="absolute text-4xl opacity-20 animate-bounce"
              style={{
                left: `${10 + i * 12}%`,
                top: `${10 + (i % 3) * 30}%`,
                animationDelay: `${i * 0.3}s`,
                animationDuration: `${2 + i * 0.4}s`,
              }}
            >
              {emoji}
            </span>
          ))}
        </div>

        <div className="relative max-w-3xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-black text-white drop-shadow-lg mb-4">
            🎰 {t("title")}
          </h1>
          <p className="text-xl md:text-2xl text-white/90 font-bold mb-10 drop-shadow">
            {t("subtitle")}
          </p>

          {/* Search bar */}
          <div className="flex gap-2 max-w-2xl mx-auto">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder={t("searchPlaceholder")}
                className="w-full pl-12 pr-4 py-4 rounded-full text-gray-800 font-medium shadow-xl border-4 border-white/50 focus:outline-none focus:border-white text-base md:text-lg"
              />
            </div>
            <button
              onClick={() => handleSearch()}
              className="px-6 md:px-8 py-4 bg-yellow-400 hover:bg-yellow-300 text-yellow-900 font-black rounded-full shadow-xl transition-all hover:scale-105 border-4 border-yellow-500 whitespace-nowrap"
            >
              {t("searchButton")}
            </button>
          </div>

          {/* Trending keywords */}
          <div className="mt-6">
            <p className="text-white/80 text-sm mb-3 font-semibold">{t("trending")}:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {trendingKeywords.map((kw) => (
                <button
                  key={kw}
                  onClick={() => handleSearch(kw)}
                  className="px-4 py-1.5 bg-white/20 hover:bg-white/40 text-white rounded-full text-sm font-bold transition-colors border border-white/30 backdrop-blur-sm"
                >
                  {kw}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-white border-b-2 border-pink-100 py-4">
        <div className="max-w-7xl mx-auto px-4 flex justify-center gap-8 md:gap-16">
          {[
            { icon: "🎰", label: locale === "ja" ? "ガチャ情報" : "Gacha Items", value: "10,000+" },
            { icon: "🏪", label: locale === "ja" ? "設置店舗" : "Stores", value: "5,000+" },
            { icon: "👥", label: locale === "ja" ? "ユーザー" : "Users", value: "50,000+" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl">{stat.icon}</div>
              <div className="text-xl font-black text-pink-600">{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12 space-y-16">
        {/* New arrivals */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <Star className="text-yellow-400 fill-yellow-400" size={28} />
            <h2 className="text-2xl font-black text-gray-800">{t("newArrivals")}</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {mockGachaItems.map((item) => (
              <GachaCard key={item.id} item={item} />
            ))}
          </div>
        </section>

        {/* Ranking preview */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="text-pink-500" size={28} />
              <h2 className="text-2xl font-black text-gray-800">
                {locale === "ja" ? "急上昇ランキング" : "Trending Rankings"}
              </h2>
            </div>
            <a href={`/${locale}/ranking`} className="text-sm font-bold text-pink-500 hover:underline">
              {locale === "ja" ? "もっと見る →" : "See more →"}
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {mockRanking.slice(0, 6).map((item) => (
              <button
                key={item.rank}
                onClick={() => handleSearch(item.query)}
                className="flex items-center gap-4 p-4 bg-white rounded-2xl border-2 border-pink-100 hover:border-pink-300 hover:shadow-md transition-all text-left group"
              >
                <span className={`text-2xl font-black w-10 text-center ${
                  item.rank === 1 ? "text-yellow-500" :
                  item.rank === 2 ? "text-gray-400" :
                  item.rank === 3 ? "text-orange-400" : "text-gray-300"
                }`}>
                  {item.rank === 1 ? "🥇" : item.rank === 2 ? "🥈" : item.rank === 3 ? "🥉" : `#${item.rank}`}
                </span>
                <span className="flex-1 font-bold text-gray-800 group-hover:text-pink-600 transition-colors">
                  {item.query}
                </span>
                <span className="text-sm text-gray-400 font-medium">
                  {item.count.toLocaleString()} {tSearch("loading").includes("中") ? "回" : "searches"}
                </span>
                <span className={`text-lg ${item.trend === "up" ? "text-green-500" : item.trend === "down" ? "text-red-400" : "text-gray-300"}`}>
                  {item.trend === "up" ? "↑" : item.trend === "down" ? "↓" : "→"}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Map CTA */}
        <section className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-3xl p-8 md:p-12 text-white text-center">
          <MapPin size={48} className="mx-auto mb-4 opacity-80" />
          <h2 className="text-3xl font-black mb-3">{t("nearbyStores")}</h2>
          <p className="text-white/80 mb-6 text-lg">
            {locale === "ja"
              ? "Google Mapsと連携して近くのガチャ設置店を探そう"
              : "Find gacha stores near you with Google Maps"}
          </p>
          <a
            href={`/${locale}/map`}
            className="inline-block px-8 py-3 bg-white text-purple-600 font-black rounded-full text-lg hover:bg-yellow-100 transition-colors shadow-lg"
          >
            {locale === "ja" ? "マップで探す 🗺️" : "Open Map 🗺️"}
          </a>
        </section>
      </div>
    </div>
  );
}
