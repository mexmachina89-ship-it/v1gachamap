"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Search, TrendingUp, MapPin, Star, Map, Package, Heart, ArrowRight } from "lucide-react";
import CapsuleIcon from "@/components/CapsuleIcon";
import HeroCapsulesBg from "@/components/HeroCapsulesBg";

const trendingKeywords = [
  "ちいかわ", "ポケモン", "すみっコぐらし", "サンリオ",
  "ワンピース", "呪術廻戦", "ハローキティ", "マリオ",
];

interface RankingItem {
  rank: number;
  query: string;
  count: number;
  trend: "up" | "down" | "new" | "stable";
  trendPct: number;
}

export default function HomePage() {
  const t = useTranslations("home");
  const locale = useLocale();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [rankingLoading, setRankingLoading] = useState(true);

  useEffect(() => {
    fetch("/api/ranking?period=weekly")
      .then((r) => r.json())
      .then((d) => setRanking(d.ranking?.slice(0, 6) || []))
      .catch(() => {})
      .finally(() => setRankingLoading(false));
  }, []);

  const handleSearch = (q?: string) => {
    const searchQuery = q || query;
    if (!searchQuery.trim()) return;
    router.push(`/${locale}/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const features = [
    {
      icon: <Search size={28} className="text-pink-500" />,
      bg: "from-pink-50 to-rose-50",
      border: "border-pink-200",
      title: locale === "ja" ? "マルチ検索" : "Multi Search",
      desc: locale === "ja"
        ? "ガチャアイランド・ガシャどこ・バンダイ公式を一括検索"
        : "Search Gacha Island, Gashadoko & Bandai at once",
    },
    {
      icon: <Map size={28} className="text-purple-500" />,
      bg: "from-purple-50 to-violet-50",
      border: "border-purple-200",
      title: locale === "ja" ? "マップ検索" : "Map Search",
      desc: locale === "ja"
        ? "近くのガチャ設置店をSNS情報とあわせてマップで確認"
        : "Find nearby gacha stores with SNS intel on a map",
    },
    {
      icon: <Heart size={28} className="text-red-400" />,
      bg: "from-red-50 to-pink-50",
      border: "border-red-200",
      title: locale === "ja" ? "ウィッシュリスト" : "Wishlist",
      desc: locale === "ja"
        ? "欲しいガチャを保存してコレクション進捗を管理"
        : "Save wanted gachas and track your collection progress",
    },
    {
      icon: <Package size={28} className="text-indigo-500" />,
      bg: "from-indigo-50 to-blue-50",
      border: "border-indigo-200",
      title: locale === "ja" ? "コレクション管理" : "Collection",
      desc: locale === "ja"
        ? "所持している種類を記録してコンプリートを目指そう"
        : "Track owned types and aim for a complete collection",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden py-24 px-4 bg-gradient-to-br from-pink-600 via-purple-600 to-indigo-600">
        {/* Inline SVG capsules — guaranteed to render gradients/shine correctly */}
        <HeroCapsulesBg />
        {/* Subtle overlay for text legibility */}
        <div className="absolute inset-0 bg-black/20" />

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white/90 text-sm font-bold px-4 py-1.5 rounded-full mb-6 border border-white/30">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            {locale === "ja" ? "日本最大級のガチャ情報サービス" : "Japan's largest gacha info service"}
          </div>

          <div className="flex justify-center mb-4">
            <CapsuleIcon size={88} className="drop-shadow-2xl" />
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white drop-shadow-lg mb-4 leading-tight">
            {t("title")}
          </h1>
          <p className="text-xl md:text-2xl text-white/90 font-semibold mb-10 drop-shadow">
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
                className="w-full pl-12 pr-4 py-4 rounded-2xl text-gray-800 font-medium shadow-2xl border-4 border-white/60 focus:outline-none focus:border-white text-base md:text-lg bg-white/95 backdrop-blur-sm"
              />
            </div>
            <button
              onClick={() => handleSearch()}
              className="px-6 md:px-8 py-4 bg-yellow-400 hover:bg-yellow-300 text-yellow-900 font-black rounded-2xl shadow-2xl transition-all hover:scale-105 active:scale-95 border-4 border-yellow-500/50 whitespace-nowrap"
            >
              {t("searchButton")}
            </button>
          </div>

          {/* Trending keywords */}
          <div className="mt-6">
            <p className="text-white/70 text-xs mb-3 font-semibold uppercase tracking-wider">{t("trending")}</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {trendingKeywords.map((kw) => (
                <button
                  key={kw}
                  onClick={() => handleSearch(kw)}
                  className="px-4 py-1.5 bg-white/15 hover:bg-white/30 text-white rounded-full text-sm font-bold transition-all hover:scale-105 border border-white/25 backdrop-blur-sm"
                >
                  {kw}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="bg-white border-b border-gray-100 py-5 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex justify-center gap-8 md:gap-20">
          {[
            { icon: "capsule", label: locale === "ja" ? "ガチャ情報" : "Gacha Items", value: "10,000+", color: "text-pink-600" },
            { icon: "🏪", label: locale === "ja" ? "設置店舗" : "Stores", value: "5,000+", color: "text-purple-600" },
            { icon: "👥", label: locale === "ja" ? "ユーザー" : "Users", value: "50,000+", color: "text-indigo-600" },
          ].map((stat) => (
            <div key={stat.label} className="text-center group">
              <div className="flex justify-center mb-0.5 group-hover:scale-110 transition-transform">
                {stat.icon === "capsule" ? <CapsuleIcon size={32} /> : <span className="text-2xl">{stat.icon}</span>}
              </div>
              <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-gray-400 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12 space-y-16">

        {/* ── Feature cards ── */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <Star className="text-yellow-400 fill-yellow-400" size={24} />
            <h2 className="text-2xl font-black text-gray-800">
              {locale === "ja" ? "GachaMapでできること" : "What you can do"}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f, i) => (
              <div
                key={i}
                className={`p-5 rounded-2xl border-2 ${f.border} bg-gradient-to-br ${f.bg} hover:shadow-md transition-all hover:-translate-y-0.5`}
              >
                <div className="mb-3">{f.icon}</div>
                <h3 className="font-black text-gray-800 mb-1.5">{f.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Ranking preview ── */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="text-pink-500" size={24} />
              <h2 className="text-2xl font-black text-gray-800">
                {locale === "ja" ? "急上昇ランキング" : "Trending Rankings"}
              </h2>
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full font-medium">
                {locale === "ja" ? "週間" : "Weekly"}
              </span>
            </div>
            <a
              href={`/${locale}/ranking`}
              className="flex items-center gap-1 text-sm font-bold text-pink-500 hover:text-pink-600 transition-colors group"
            >
              {locale === "ja" ? "もっと見る" : "See more"}
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>

          {rankingLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : ranking.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-2xl">
              <p className="text-4xl mb-2">🎰</p>
              <p className="text-gray-400 font-medium text-sm">
                {locale === "ja" ? "まだランキングデータがありません" : "No ranking data yet"}
              </p>
              <p className="text-gray-300 text-xs mt-1">
                {locale === "ja" ? "検索するとランキングに反映されます" : "Rankings appear after searches"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {ranking.map((item) => (
                <button
                  key={item.rank}
                  onClick={() => handleSearch(item.query)}
                  className="flex items-center gap-4 p-4 bg-white rounded-2xl border-2 border-gray-100 hover:border-pink-200 hover:shadow-md transition-all text-left group"
                >
                  <span className={`text-2xl font-black w-10 text-center flex-shrink-0 ${
                    item.rank === 1 ? "text-yellow-500" :
                    item.rank === 2 ? "text-gray-400" :
                    item.rank === 3 ? "text-orange-400" : "text-gray-300"
                  }`}>
                    {item.rank === 1 ? "🥇" : item.rank === 2 ? "🥈" : item.rank === 3 ? "🥉" : `#${item.rank}`}
                  </span>
                  <span className="flex-1 font-bold text-gray-800 group-hover:text-pink-600 transition-colors truncate">
                    {item.query}
                  </span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-sm text-gray-400 font-medium">
                      {item.count.toLocaleString()}{locale === "ja" ? "回" : ""}
                    </span>
                    <span className={`text-base font-bold ${
                      item.trend === "up" ? "text-emerald-500" :
                      item.trend === "down" ? "text-red-400" :
                      item.trend === "new" ? "text-blue-500" : "text-gray-300"
                    }`}>
                      {item.trend === "up" ? "↑" : item.trend === "down" ? "↓" : item.trend === "new" ? "✦" : "→"}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* ── Map CTA ── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-pink-600 to-rose-500 rounded-3xl p-8 md:p-12 text-white text-center shadow-xl">
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

          <div className="relative">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-4 backdrop-blur-sm">
              <MapPin size={32} className="text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-black mb-3">{t("nearbyStores")}</h2>
            <p className="text-white/80 mb-8 text-lg max-w-md mx-auto">
              {locale === "ja"
                ? "Google Mapsと連携して近くのガチャ設置店を探そう。SNS情報でリアルタイムに更新。"
                : "Find gacha stores near you with Google Maps. Updated with real-time SNS data."}
            </p>
            <a
              href={`/${locale}/map`}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-purple-700 font-black rounded-2xl text-lg hover:bg-yellow-50 transition-all hover:scale-105 active:scale-95 shadow-lg"
            >
              {locale === "ja" ? "マップで探す" : "Open Map"} 🗺️
              <ArrowRight size={18} />
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
