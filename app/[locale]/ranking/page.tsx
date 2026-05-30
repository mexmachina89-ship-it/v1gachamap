"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  TrendingUp, TrendingDown, Minus, Loader2,
  Search, Sparkles, Flame, BarChart2,
} from "lucide-react";

type Period = "daily" | "weekly" | "monthly";

interface RankingItem {
  rank: number;
  query: string;
  count: number;
  trend: "up" | "down" | "new" | "stable";
  trendPct: number;
}

// 上位3位のスタイル
const TOP_STYLES: Record<number, {
  bg: string; border: string; badge: string;
  rankColor: string; barColor: string; glow: string;
}> = {
  1: {
    bg: "bg-gradient-to-r from-yellow-50 to-amber-50",
    border: "border-yellow-300",
    badge: "🥇",
    rankColor: "text-yellow-500",
    barColor: "bg-yellow-400",
    glow: "shadow-yellow-100",
  },
  2: {
    bg: "bg-gradient-to-r from-gray-50 to-slate-50",
    border: "border-gray-300",
    badge: "🥈",
    rankColor: "text-gray-400",
    barColor: "bg-gray-400",
    glow: "shadow-gray-100",
  },
  3: {
    bg: "bg-gradient-to-r from-orange-50 to-amber-50",
    border: "border-orange-300",
    badge: "🥉",
    rankColor: "text-orange-400",
    barColor: "bg-orange-400",
    glow: "shadow-orange-100",
  },
};

const TREND_CONFIG = {
  up:     { icon: TrendingUp,   color: "text-emerald-500", bg: "bg-emerald-50",  label: "上昇" },
  down:   { icon: TrendingDown, color: "text-red-400",     bg: "bg-red-50",      label: "下降" },
  new:    { icon: Sparkles,     color: "text-blue-500",    bg: "bg-blue-50",     label: "NEW" },
  stable: { icon: Minus,        color: "text-gray-300",    bg: "bg-gray-50",     label: "-" },
};

export default function RankingPage() {
  const t = useTranslations("ranking");
  const locale = useLocale();
  const router = useRouter();
  const [period, setPeriod] = useState<Period>("weekly");
  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<string>("");

  useEffect(() => {
    const fetchRanking = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/ranking?period=${period}`);
        const data = await res.json();
        setRanking(data.ranking || []);
        setSource(data.source || "");
      } finally {
        setLoading(false);
      }
    };
    fetchRanking();
  }, [period]);

  const periods: { key: Period; label: string; icon: string }[] = [
    { key: "daily",   label: t("daily"),   icon: "☀️" },
    { key: "weekly",  label: t("weekly"),  icon: "📅" },
    { key: "monthly", label: t("monthly"), icon: "📆" },
  ];

  // バーグラフの最大値
  const maxCount = ranking[0]?.count || 1;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">

      {/* ヘッダー */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl shadow-lg mb-4">
          <Flame size={32} className="text-white" />
        </div>
        <h1 className="text-4xl font-black text-gray-800 mb-2">
          🏆 {t("title")}
        </h1>
        <p className="text-gray-500 text-sm">{t("subtitle")}</p>
      </div>

      {/* 期間タブ */}
      <div className="flex gap-2 justify-center mb-8 bg-gray-100 p-1.5 rounded-2xl">
        {periods.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setPeriod(key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              period === key
                ? "bg-white text-pink-600 shadow-md"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <span>{icon}</span>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 size={48} className="text-pink-500 animate-spin" />
          <p className="text-gray-400 font-medium">
            {locale === "ja" ? "集計中..." : "Calculating..."}
          </p>
        </div>
      ) : ranking.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-6xl mb-4">🔍</p>
          <p className="text-xl font-bold text-gray-500 mb-2">
            {locale === "ja" ? "まだ検索データがありません" : "No search data yet"}
          </p>
          <p className="text-sm text-gray-400">
            {locale === "ja" ? "検索するとランキングに反映されます" : "Rankings appear after searches"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {ranking.map((item, idx) => {
            const topStyle = TOP_STYLES[item.rank];
            const trendCfg = TREND_CONFIG[item.trend] || TREND_CONFIG.stable;
            const TrendIcon = trendCfg.icon;
            const barPct = Math.max(8, (item.count / maxCount) * 100);
            const isTop3 = item.rank <= 3;

            return (
              <button
                key={item.rank}
                onClick={() => router.push(`/${locale}/search?q=${encodeURIComponent(item.query)}`)}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg group ${
                  isTop3
                    ? `${topStyle.bg} ${topStyle.border} shadow-md ${topStyle.glow}`
                    : "bg-white border-gray-100 hover:border-pink-200"
                }`}
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="flex items-center gap-3">
                  {/* 順位バッジ */}
                  <div className="w-10 text-center flex-shrink-0">
                    {isTop3 ? (
                      <span className="text-2xl leading-none">{topStyle.badge}</span>
                    ) : (
                      <span className="text-lg font-black text-gray-300">
                        #{item.rank}
                      </span>
                    )}
                  </div>

                  {/* メイン情報 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-base font-black text-gray-800 group-hover:text-pink-600 transition-colors truncate">
                        🎰 {item.query}
                      </span>
                      {/* NEWバッジ */}
                      {item.trend === "new" && (
                        <span className="flex-shrink-0 px-1.5 py-0.5 bg-blue-500 text-white text-xs font-black rounded-full">
                          NEW
                        </span>
                      )}
                    </div>

                    {/* バーグラフ */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            isTop3 ? topStyle.barColor : "bg-pink-400"
                          }`}
                          style={{ width: `${barPct}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* 検索数 */}
                  <div className="text-right flex-shrink-0 mr-1">
                    <div className="flex items-center gap-1 justify-end">
                      <BarChart2 size={12} className="text-gray-300" />
                      <span className="text-base font-black text-gray-700">
                        {item.count.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400">{t("searches")}</div>
                  </div>

                  {/* トレンド */}
                  <div className={`flex-shrink-0 flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl ${trendCfg.bg}`}>
                    <TrendIcon size={16} className={trendCfg.color} />
                    {item.trend !== "stable" && item.trend !== "new" && item.trendPct !== 0 && (
                      <span className={`text-xs font-bold ${trendCfg.color}`}>
                        {item.trendPct > 0 ? "+" : ""}{item.trendPct}%
                      </span>
                    )}
                    {item.trend === "new" && (
                      <span className="text-xs font-bold text-blue-500">NEW</span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}

          {/* フッター */}
          <div className="pt-4 text-center">
            <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
              <Search size={11} />
              {locale === "ja"
                ? "クリックするとそのキーワードで検索できます"
                : "Click to search with that keyword"}
            </p>
            {source === "mock" && (
              <p className="text-xs text-gray-300 mt-1">
                ※ サンプルデータを表示中
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
