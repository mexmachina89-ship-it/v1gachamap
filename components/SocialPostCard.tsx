"use client";

import Image from "next/image";
import { Heart, ExternalLink, Tag, MapPin, Sparkles } from "lucide-react";
import type { SocialPost } from "@/lib/apify";

const platformConfig: Record<string, { color: string; label: string; icon: string }> = {
  twitter: { color: "border-sky-400 bg-sky-50", label: "X", icon: "𝕏" },
  instagram: { color: "border-pink-400 bg-pink-50", label: "Instagram", icon: "📸" },
  tiktok: { color: "border-gray-400 bg-gray-50", label: "TikTok", icon: "🎵" },
};

export default function SocialPostCard({ post }: { post: SocialPost }) {
  const config = platformConfig[post.platform] || {
    color: "border-gray-300 bg-white",
    label: post.platform,
    icon: "🌐",
  };
  const info = post.extractedInfo;

  return (
    <div className={`rounded-2xl border-2 ${config.color} overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5`}>
      {post.imageUrl && (
        <div className="relative h-40">
          <Image src={post.imageUrl} alt="" fill className="object-cover" />
          {/* 関連度スコアバッジ */}
          {post.relevanceScore !== undefined && post.relevanceScore >= 60 && (
            <span className="absolute top-2 right-2 px-2 py-0.5 bg-yellow-400 text-yellow-900 rounded-full text-xs font-black shadow">
              🔥 HOT
            </span>
          )}
        </div>
      )}
      <div className="p-4">
        {/* プラットフォーム・著者 */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold">{config.icon} {config.label}</span>
          <span className="text-xs text-gray-500">@{post.author}</span>
        </div>

        {/* 投稿テキスト */}
        <p className="text-sm text-gray-700 line-clamp-3 mb-3">{post.text}</p>

        {/* 抽出されたガチャ情報 */}
        {info && (info.price || info.totalTypes || (info.stores && info.stores.length > 0) || info.isNew || info.isLimited) && (
          <div className="bg-white rounded-xl border border-pink-100 p-2 mb-3 space-y-1">
            <p className="text-xs font-bold text-pink-500 mb-1">🎰 ガチャ情報</p>
            <div className="flex flex-wrap gap-1">
              {info.price && (
                <span className="flex items-center gap-0.5 px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">
                  <Tag size={10} />
                  {info.price}
                </span>
              )}
              {info.totalTypes && (
                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">
                  {info.totalTypes}
                </span>
              )}
              {info.isNew && (
                <span className="flex items-center gap-0.5 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                  <Sparkles size={10} />
                  新作
                </span>
              )}
              {info.isLimited && (
                <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-xs font-bold">
                  限定
                </span>
              )}
              {info.stores && info.stores.map(store => (
                <span key={store} className="flex items-center gap-0.5 px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full text-xs font-bold">
                  <MapPin size={10} />
                  {store}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* いいね数・リンク */}
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-sm text-pink-500 font-semibold">
            <Heart size={14} fill="currentColor" />
            {post.likes.toLocaleString()}
          </span>
          <a
            href={post.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-pink-500 transition-colors"
          >
            <ExternalLink size={12} />
            投稿を見る
          </a>
        </div>
      </div>
    </div>
  );
}
