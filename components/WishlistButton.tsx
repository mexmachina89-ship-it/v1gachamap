"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Heart, Loader2 } from "lucide-react";
import AuthModal from "./AuthModal";
import type { GachaWebResult } from "@/lib/webScraper";

interface WishlistButtonProps {
  item: GachaWebResult;
  size?: "sm" | "md";
}

export default function WishlistButton({ item, size = "sm" }: WishlistButtonProps) {
  const { data: session } = useSession();
  const [wished, setWished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  // マイページ用: 追加済みか確認（初回ロード）
  useEffect(() => {
    if (!session) return;
    fetch("/api/wishlist")
      .then((r) => r.json())
      .then((data) => {
        const found = data.items?.some((w: any) => w.itemUrl === item.url);
        setWished(!!found);
      })
      .catch(() => {});
  }, [session, item.url]);

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session) {
      setShowAuth(true);
      return;
    }

    setLoading(true);
    try {
      if (wished) {
        // 削除: まずIDを取得
        const res = await fetch("/api/wishlist");
        const data = await res.json();
        const target = data.items?.find((w: any) => w.itemUrl === item.url);
        if (target) {
          await fetch(`/api/wishlist?id=${target.id}`, { method: "DELETE" });
          setWished(false);
        }
      } else {
        await fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            itemName: item.name,
            itemUrl: item.url,
            imageUrl: item.imageUrl,
            price: item.price,
            source: item.source,
          }),
        });
        setWished(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const iconSize = size === "sm" ? 14 : 18;
  const btnClass =
    size === "sm"
      ? "p-1.5 rounded-full transition-all"
      : "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold transition-all";

  return (
    <>
      <button
        onClick={toggle}
        disabled={loading}
        title={wished ? "ウィッシュリストから削除" : "ウィッシュリストに追加"}
        className={`${btnClass} ${
          wished
            ? "bg-pink-100 text-pink-500 hover:bg-pink-200"
            : "bg-white/80 text-gray-400 hover:text-pink-400 hover:bg-pink-50 border border-gray-200"
        }`}
      >
        {loading ? (
          <Loader2 size={iconSize} className="animate-spin" />
        ) : (
          <Heart size={iconSize} fill={wished ? "currentColor" : "none"} />
        )}
        {size === "md" && <span>{wished ? "リスト済み" : "ほしい"}</span>}
      </button>

      {showAuth && (
        <AuthModal featureName="ウィッシュリスト" onClose={() => setShowAuth(false)} />
      )}
    </>
  );
}
