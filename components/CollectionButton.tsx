"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Package, Loader2 } from "lucide-react";
import AuthModal from "./AuthModal";
import type { GachaWebResult } from "@/lib/webScraper";

interface CollectionButtonProps {
  item: GachaWebResult;
  size?: "sm" | "md";
}

export default function CollectionButton({ item, size = "sm" }: CollectionButtonProps) {
  const { data: session } = useSession();
  const [collected, setCollected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    if (!session) return;
    fetch("/api/collection")
      .then((r) => r.json())
      .then((data) => {
        const found = data.items?.some((c: any) => c.itemUrl === item.url);
        setCollected(!!found);
      })
      .catch(() => {});
  }, [session, item.url]);

  // totalTypesを文字列からパース（"全6種" → 6）
  const parseTotalTypes = (s?: string): number | undefined => {
    if (!s) return undefined;
    const m = s.match(/(\d+)/);
    return m ? parseInt(m[1]) : undefined;
  };

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!session) { setShowAuth(true); return; }
    setLoading(true);
    try {
      if (collected) {
        const res = await fetch("/api/collection");
        const data = await res.json();
        const target = data.items?.find((c: any) => c.itemUrl === item.url);
        if (target) {
          await fetch(`/api/collection?id=${target.id}`, { method: "DELETE" });
          setCollected(false);
        }
      } else {
        await fetch("/api/collection", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            itemName: item.name,
            itemUrl: item.url,
            imageUrl: item.imageUrl,
            source: item.source,
            totalTypes: parseTotalTypes(item.totalTypes),
            ownedTypes: 1,
          }),
        });
        setCollected(true);
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
        title={collected ? "コレクションから削除" : "コレクションに追加"}
        className={`${btnClass} ${
          collected
            ? "bg-purple-100 text-purple-500 hover:bg-purple-200"
            : "bg-white/80 text-gray-400 hover:text-purple-400 hover:bg-purple-50 border border-gray-200"
        }`}
      >
        {loading ? (
          <Loader2 size={iconSize} className="animate-spin" />
        ) : (
          <Package size={iconSize} />
        )}
        {size === "md" && <span>{collected ? "コレクション済み" : "コレクション"}</span>}
      </button>

      {showAuth && (
        <AuthModal featureName="マイコレクション" onClose={() => setShowAuth(false)} />
      )}
    </>
  );
}
