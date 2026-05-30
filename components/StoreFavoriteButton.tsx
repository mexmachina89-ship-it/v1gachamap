"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Star, Loader2 } from "lucide-react";
import AuthModal from "./AuthModal";

interface StoreFavoriteButtonProps {
  storeName: string;
  address?: string;
  lat?: number;
  lng?: number;
  placeId?: string;
  pinType?: string;
  size?: "sm" | "md";
}

export default function StoreFavoriteButton({
  storeName, address, lat, lng, placeId, pinType, size = "sm",
}: StoreFavoriteButtonProps) {
  const { data: session } = useSession();
  const [starred, setStarred] = useState(false);
  const [itemId, setItemId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    if (!session) return;
    fetch("/api/store-favorites")
      .then((r) => r.json())
      .then((data) => {
        const found = data.items?.find(
          (f: any) => f.storeName === storeName && f.address === (address ?? "")
        );
        if (found) { setStarred(true); setItemId(found.id); }
        else { setStarred(false); setItemId(null); }
      })
      .catch(() => {});
  }, [session, storeName, address]);

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session) { setShowAuth(true); return; }

    setLoading(true);
    try {
      if (starred && itemId) {
        await fetch(`/api/store-favorites?id=${itemId}`, { method: "DELETE" });
        setStarred(false);
        setItemId(null);
      } else {
        const res = await fetch("/api/store-favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ storeName, address, lat, lng, placeId, pinType }),
        });
        const data = await res.json();
        setStarred(true);
        setItemId(data.item?.id ?? null);
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
        title={starred ? "お気に入りから削除" : "お気に入りに追加"}
        className={`${btnClass} ${
          starred
            ? "bg-yellow-100 text-yellow-500 hover:bg-yellow-200"
            : "bg-white/80 text-gray-400 hover:text-yellow-400 hover:bg-yellow-50 border border-gray-200"
        }`}
      >
        {loading ? (
          <Loader2 size={iconSize} className="animate-spin" />
        ) : (
          <Star size={iconSize} fill={starred ? "currentColor" : "none"} />
        )}
        {size === "md" && <span>{starred ? "お気に入り済み" : "お気に入り"}</span>}
      </button>

      {showAuth && (
        <AuthModal featureName="お気に入り店舗" onClose={() => setShowAuth(false)} />
      )}
    </>
  );
}
