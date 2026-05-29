"use client";

import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { MapPin, ExternalLink } from "lucide-react";

interface GachaCardProps {
  item: {
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
  };
}

const sourceColors: Record<string, string> = {
  web: "bg-blue-100 text-blue-700",
  twitter: "bg-sky-100 text-sky-700",
  instagram: "bg-pink-100 text-pink-700",
  tiktok: "bg-gray-100 text-gray-700",
};

const sourceLabels: Record<string, string> = {
  web: "Web",
  twitter: "X",
  instagram: "Instagram",
  tiktok: "TikTok",
};

export default function GachaCard({ item }: GachaCardProps) {
  const locale = useLocale();
  const t = useTranslations("search");

  const displayName = locale === "en" && item.nameEn ? item.nameEn : item.name;

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 border-pink-100 overflow-hidden group">
      {/* Image */}
      <div className="relative h-48 bg-gradient-to-br from-pink-50 to-purple-50">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={displayName}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-6xl">🎰</div>
        )}
        {item.sourceType && (
          <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-bold ${sourceColors[item.sourceType] || "bg-gray-100 text-gray-700"}`}>
            {sourceLabels[item.sourceType] || item.sourceType}
          </span>
        )}
        {item.price && (
          <span className="absolute bottom-2 left-2 px-3 py-1 bg-yellow-400 text-yellow-900 rounded-full text-sm font-black shadow">
            ¥{item.price}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-gray-800 text-sm leading-tight mb-1 line-clamp-2">
          {displayName}
        </h3>
        {item.series && (
          <p className="text-xs text-purple-600 font-semibold mb-2">{item.series}</p>
        )}
        {item.description && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-3">{item.description}</p>
        )}

        <div className="flex flex-wrap gap-1 mb-3">
          {item.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="px-2 py-0.5 bg-pink-50 text-pink-600 rounded-full text-xs font-medium">
              #{tag}
            </span>
          ))}
        </div>

        <div className="flex gap-2">
          <Link
            href={`/${locale}/map?q=${encodeURIComponent(item.name)}`}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full text-xs font-bold hover:opacity-90 transition-opacity"
          >
            <MapPin size={12} />
            {t("findStores")}
          </Link>
          <Link
            href={`/${locale}/search?q=${encodeURIComponent(item.name)}`}
            className="flex items-center justify-center gap-1 px-3 py-2 border-2 border-gray-200 text-gray-600 rounded-full text-xs font-bold hover:border-pink-300 hover:text-pink-600 transition-colors"
          >
            <ExternalLink size={12} />
            {t("viewDetails")}
          </Link>
        </div>
      </div>
    </div>
  );
}
