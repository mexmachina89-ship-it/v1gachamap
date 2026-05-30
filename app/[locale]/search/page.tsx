"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Search, Filter, Loader2 } from "lucide-react";
import GachaCard from "@/components/GachaCard";
import SocialPostCard from "@/components/SocialPostCard";
import type { SocialPost } from "@/lib/apify";

type FilterType = "all" | "web" | "twitter" | "instagram";

interface GachaItem {
  id: string;
  name: string;
  nameEn?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  price?: number | null;
  series?: string | null;
  maker?: string | null;
  tags: string[];
  sourceType?: string | null;
}

function SearchContent() {
  const t = useTranslations("search");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const [inputValue, setInputValue] = useState(query);
  const [filter, setFilter] = useState<FilterType>("all");
  const [items, setItems] = useState<GachaItem[]>([]);
  const [social, setSocial] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) return;
    setInputValue(query);
    const fetchResults = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&filter=${filter}`);
        const data = await res.json();
        setItems(data.items || []);
        setSocial(data.social || []);
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

  const filteredSocial = filter === "all" ? social : social.filter((p) => p.platform === filter);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Search bar */}
      <div className="flex gap-2 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder={locale === "ja" ? "ガチャを検索..." : "Search gacha..."}
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
          「{query}」 {locale === "ja" ? "の検索結果" : "Search Results"}
          {!loading && (
            <span className="ml-3 text-base font-medium text-gray-500">
              {items.length + filteredSocial.length} {t("results")}
            </span>
          )}
        </h1>
      )}

      {/* Filter tabs */}
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
          {/* Gacha items */}
          {(filter === "all" || filter === "web") && items.length > 0 && (
            <section className="mb-10">
              <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                🎰 {locale === "ja" ? "ガチャ情報" : "Gacha Items"}
                <span className="text-sm font-medium text-gray-400">({items.length})</span>
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {items.map((item) => (
                  <GachaCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          )}

          {/* Social posts */}
          {filteredSocial.length > 0 && (
            <section className="mb-10">
              <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                📱 {locale === "ja" ? "SNS投稿" : "Social Posts"}
                <span className="text-sm font-medium text-gray-400">({filteredSocial.length})</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSocial.map((post) => (
                  <SocialPostCard key={post.id} post={post} />
                ))}
              </div>
            </section>
          )}

          {!loading && query && items.length === 0 && filteredSocial.length === 0 && (
            <div className="text-center py-20">
              <p className="text-6xl mb-4">🎰</p>
              <p className="text-xl font-bold text-gray-600">{t("noResults")}</p>
              <p className="text-gray-400 mt-2">
                {locale === "ja" ? "別のキーワードで試してみてください" : "Try a different keyword"}
              </p>
            </div>
          )}

          {!query && (
            <div className="text-center py-20">
              <p className="text-6xl mb-4">🔍</p>
              <p className="text-xl font-bold text-gray-600">
                {locale === "ja" ? "キーワードを入力して検索してください" : "Enter a keyword to search"}
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
    <Suspense fallback={<div className="flex items-center justify-center py-20"><Loader2 size={48} className="text-pink-500 animate-spin" /></div>}>
      <SearchContent />
    </Suspense>
  );
}
