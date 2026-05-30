"use client";

import Image from "next/image";
import { ExternalLink, Tag, Layers, Calendar, Factory, Package } from "lucide-react";
import type { GachaWebResult } from "@/lib/webScraper";
import WishlistButton from "./WishlistButton";
import CollectionButton from "./CollectionButton";

const sourceConfig: Record<
  string,
  { label: string; color: string; icon: string; badgeColor: string }
> = {
  "gacha-island": {
    label: "ガチャアイランド",
    color: "border-emerald-400 bg-emerald-50",
    icon: "🏝️",
    badgeColor: "bg-emerald-500",
  },
  gashadoko: {
    label: "ガシャどこ",
    color: "border-blue-400 bg-blue-50",
    icon: "📍",
    badgeColor: "bg-blue-500",
  },
  gashapon: {
    label: "バンダイ公式",
    color: "border-red-400 bg-red-50",
    icon: "🔴",
    badgeColor: "bg-red-500",
  },
};

export default function WebResultCard({ result }: { result: GachaWebResult }) {
  const config = sourceConfig[result.source] || {
    label: result.source,
    color: "border-gray-300 bg-white",
    icon: "🌐",
    badgeColor: "bg-gray-500",
  };

  return (
    <div
      className={`rounded-2xl border-2 ${config.color} overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 flex flex-col`}
    >
      {/* 画像 */}
      {result.imageUrl && (
        <div className="relative h-44 bg-gray-100 flex-shrink-0">
          <Image
            src={result.imageUrl}
            alt={result.name}
            fill
            className="object-contain p-2"
            unoptimized
          />
          {/* ソースバッジ */}
          <span
            className={`absolute top-2 left-2 ${config.badgeColor} text-white text-xs font-black px-2 py-0.5 rounded-full shadow`}
          >
            {config.icon} {config.label}
          </span>
        </div>
      )}

      <div className="p-4 flex flex-col flex-1">
        {/* 画像なし時のバッジ */}
        {!result.imageUrl && (
          <span
            className={`inline-block ${config.badgeColor} text-white text-xs font-black px-2 py-0.5 rounded-full mb-2 self-start`}
          >
            {config.icon} {config.label}
          </span>
        )}

        {/* 商品名 */}
        <h3 className="font-black text-gray-800 text-sm leading-snug mb-3 line-clamp-2">
          {result.name}
        </h3>

        {/* ガチャ情報タグ */}
        <div className="flex flex-wrap gap-1 mb-3">
          {result.price && (
            <span className="flex items-center gap-0.5 px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">
              <Tag size={10} />
              {result.price}
            </span>
          )}
          {result.totalTypes && (
            <span className="flex items-center gap-0.5 px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">
              <Layers size={10} />
              {result.totalTypes}
            </span>
          )}
          {result.maker && (
            <span className="flex items-center gap-0.5 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
              <Factory size={10} />
              {result.maker}
            </span>
          )}
          {result.releaseDate && (
            <span className="flex items-center gap-0.5 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
              <Calendar size={10} />
              {result.releaseDate}
            </span>
          )}
        </div>

        {/* 説明文（gashadoko等） */}
        {result.description && !result.price && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-3">{result.description}</p>
        )}

        {/* アクションボタン */}
        <div className="mt-auto space-y-2">
          <div className="flex gap-1.5">
            <WishlistButton item={result} size="sm" />
            <CollectionButton item={result} size="sm" />
          </div>
          <a
            href={result.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center justify-center gap-1 w-full py-2 rounded-xl text-xs font-bold text-white ${config.badgeColor} hover:opacity-90 transition-opacity`}
          >
            <ExternalLink size={12} />
            詳細を見る
          </a>
        </div>
      </div>
    </div>
  );
}
