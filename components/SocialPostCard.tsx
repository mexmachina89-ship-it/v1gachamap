"use client";

import Image from "next/image";
import { Heart, ExternalLink } from "lucide-react";
import type { SocialPost } from "@/lib/apify";

const platformConfig: Record<string, { color: string; label: string; icon: string }> = {
  twitter: { color: "border-sky-400 bg-sky-50", label: "X", icon: "𝕏" },
  instagram: { color: "border-pink-400 bg-pink-50", label: "Instagram", icon: "📸" },
  tiktok: { color: "border-gray-400 bg-gray-50", label: "TikTok", icon: "🎵" },
};

export default function SocialPostCard({ post }: { post: SocialPost }) {
  const config = platformConfig[post.platform] || { color: "border-gray-300 bg-white", label: post.platform, icon: "🌐" };

  return (
    <div className={`rounded-2xl border-2 ${config.color} overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5`}>
      {post.imageUrl && (
        <div className="relative h-40">
          <Image src={post.imageUrl} alt="" fill className="object-cover" />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold">{config.icon} {config.label}</span>
          <span className="text-xs text-gray-500">@{post.author}</span>
        </div>
        <p className="text-sm text-gray-700 line-clamp-3 mb-3">{post.text}</p>
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
            表示
          </a>
        </div>
      </div>
    </div>
  );
}
