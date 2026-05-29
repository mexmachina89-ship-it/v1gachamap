"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { TrendingUp, TrendingDown, Minus, Loader2 } from "lucide-react";

type Period = "daily" | "weekly" | "monthly";

interface RankingItem {
  rank: number;
  query: string;
  count: number;
  trend: "up" | "down" | "stable";
}

export default function RankingPage() {
  const t = useTranslations("ranking");
  const locale = useLocale();
  const router = useRouter();
  const [period, setPeriod] = useState<Period>("weekly");
  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch_ = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/ranking?period=${period}`);
        const data = await res.json();
        setRanking(data.ranking || []);
      } finally {
        setLoading(false);
      }
    };
    fetch_();
  }, [period]);

  const periods: { key: Period; label: string }[] = [
    { key: "daily", label: t("daily") },
    { key: "weekly", label: t("weekly") },
    { key: "monthly", label: t("monthly") },
  ];

  const rankStyles: Record<number, { bg: string; text: string; badge: string }> = {
    1: { bg: "bg-yellow-50 border-yellow-300", text: "text-yellow-600", badge: "🥇" },
    2: { bg: "bg-gray-50 border-gray-300", text: "text-gray-500", badge: "🥈" },
    3: { bg: "bg-orange-50 border-orange-300", text: "text-orange-500", badge: "🥉" },
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black text-gray-800 mb-2">
          🏆 {t("title")}
        </h1>
        <p className="text-gray-500">{t("subtitle")}</p>
      </div>

      {/* Period tabs */}
      <div className="flex gap-2 justify-center mb-8">
        {periods.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setPeriod(key)}
            className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
              period === key
                ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-md scale-105"
                : "bg-white border-2 border-gray-200 text-gray-600 hover:border-pink-300"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={48} className="text-pink-500 animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {ranking.map((item) => {
            const style = rankStyles[item.rank] || { bg: "bg-white border-gray-100", text: "text-gray-400", badge: "" };
            return (
              <button
                key={item.rank}
                onClick={() => router.push(`/${locale}/search?q=${encodeURIComponent(item.query)}`)}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 ${style.bg} hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 group`}
              >
                {/* Rank */}
                <div className="w-12 text-center flex-shrink-0">
                  {style.badge ? (
                    <span className="text-2xl">{style.badge}</span>
                  ) : (
                    <span className={`text-xl font-black ${style.text}`}>#{item.rank}</span>
                  )}
                </div>

                {/* Query */}
                <div className="flex-1 text-left">
                  <span className="text-lg font-black text-gray-800 group-hover:text-pink-600 transition-colors">
                    {item.query}
                  </span>
                </div>

                {/* Count */}
                <div className="text-right flex-shrink-0">
                  <div className="text-base font-bold text-gray-600">
                    {item.count.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-400">{t("searches")}</div>
                </div>

                {/* Trend */}
                <div className="flex-shrink-0">
                  {item.trend === "up" ? (
                    <TrendingUp size={20} className="text-green-500" />
                  ) : item.trend === "down" ? (
                    <TrendingDown size={20} className="text-red-400" />
                  ) : (
                    <Minus size={20} className="text-gray-300" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
