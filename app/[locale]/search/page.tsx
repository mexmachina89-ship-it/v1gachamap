"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Search, Filter, Loader2 } from "lucide-react";
import SocialPostCard from "@/components/SocialPostCard";
import WebResultCard from "@/components/WebResultCard";
import type { SocialPost } from "@/lib/apify";
import type { GachaWebResult } from "@/lib/webScraper";

type FilterType = "all" | "web" | "twitter" | "instagram";

function SearchContent() {
  const t = useTranslations("search");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const [inputValue, setInputValue] = useState(query);
  const [filter, setFilter] = useState<FilterType>("all");
  const [social, setSocial] = useState<SocialPost[]>([]);
  const [web, setWeb] = useState<GachaWebResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) return;
    setInputValue(query);
    const fetchResults = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(query)}&filter=${filter}`
        );
        const data = await res.json();
        setSocial(data.social || []);
        setWeb(data.web || []);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [query, filter]);

  const handleSearch = () => {
    if (!inputValue.trim()) return;
    router.push(`/${locale}/search?q=${encodeURIComponent(inputValue.trim())}`);
  };

  const filterTabs: { key: FilterType; label: string }[] = [
    { key: "all", label: t("filterAll") },
    { key: "web", label: t("filterWeb") },
    { key: "twitter", label: t("filterX") },
    { key: "instagram", label: t("filterInstagram") },
  ];

  const filteredSocial =
    filter === "all" ? social : social.filter((p) => p.platform === filter);

  const showWeb = filter === "all" || filter === "web";
  const totalCount = (showWeb ? web.length : 0) + filteredSocial.length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* 検索バー */}
      <div className="flex gap-2 mb-8">
        <div className="flex-1 relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder={
              locale === "ja" ? "ガチャを検索..." : "Search gacha..."
            }
            className="w-full pl-12 pr-4 py-3 rounded-full border-2 border-pink-300 focus:outline-none focus:border-pink-500 text-base font-medium"
          />
        </div>
        <button
          onClick={handleSearch}
          className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold rounded-full hover:opacity-90 transition-opacity"
        >
          {locale === "ja" ? "検索" : "Search"}
        </button>
      </div>

      {query && (
        <h1 className="text-2xl font-black text-gray-800 mb-6">
          「{query}」{locale === "ja" ? " の検索結果" : " Search Results"}
          {!loading && (
            <span className="ml-3 text-base font-medium text-gray-500">
              {totalCount} {t("results")}
            </span>
          )}
        </h1>
      )}

      {/* フィルタータブ */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <Filter size={18} className="text-gray-400 mt-2 flex-shrink-0" />
        {filterTabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
              filter === key
                ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-md"
                : "bg-white border-2 border-gray-200 text-gray-600 hover:border-pink-300"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 size={48} className="text-pink-500 animate-spin" />
          <p className="text-gray-500 font-medium">{t("loading")}</p>
        </div>
      ) : (
        <>
          {/* ── Web情報（ガチャアイランド・ガシャどこ・バンダイ公式） ── */}
          {showWeb && web.length > 0 && (
            <section className="mb-10">
              <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                🌐{" "}
                {locale === "ja"
                  ? "ガチャ情報サイト"
                  : "Gacha Info Sites"}
                <span className="text-sm font-medium text-gray-400">
                  ({web.length})
                </span>
                {/* ソース内訳バッジ */}
                <span className="ml-2 flex gap-1">
                  {["gacha-island", "gashadoko", "gashapon"].map((src) => {
                    const count = web.filter((w) => w.source === src).length;
                    if (!count) return null;
                    const icons: Record<string, string> = {
                      "gacha-island": "🏝️",
                      gashadoko: "📍",
                      gashapon: "🔴",
                    };
                    return (
                      <span
                        key={src}
                        className="text-xs bg-gray-100 text-gray-500 rounded-full px-2 py-0.5"
                      >
                        {icons[src]} {count}
                      </span>
                    );
                  })}
                </span>
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {web.map((result) => (
                  <WebResultCard key={result.id} result={result} />
                ))}
              </div>
            </section>
          )}

          {/* ── SNS投稿 ── */}
          {filteredSocial.length > 0 && (
            <section className="mb-10">
              <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                📱 {locale === "ja" ? "SNS投稿" : "Social Posts"}
                <span className="text-sm font-medium text-gray-400">
                  ({filteredSocial.length})
                </span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSocial.map((post) => (
                  <SocialPostCard key={post.id} post={post} />
                ))}
              </div>
            </section>
          )}

          {/* 結果なし */}
          {!loading && query && totalCount === 0 && (
            <div className="text-center py-20">
              <p className="text-6xl mb-4">🎰</p>
              <p className="text-xl font-bold text-gray-600">{t("noResults")}</p>
              <p className="text-gray-400 mt-2">
                {locale === "ja"
                  ? "別のキーワードで試してみてください"
                  : "Try a different keyword"}
              </p>
            </div>
          )}

          {!query && (
            <div className="text-center py-20">
              <p className="text-6xl mb-4">🔍</p>
              <p className="text-xl font-bold text-gray-600">
                {locale === "ja"
                  ? "キーワードを入力して検索してください"
                  : "Enter a keyword to search"}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <Loader2 size={48} className="text-pink-500 animate-spin" />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
