"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import Image from "next/image";
import {
  Heart, Star, Package, Loader2, Trash2, ExternalLink,
  Plus, Minus, CheckCircle2, Trophy, MapPin,
} from "lucide-react";

type Tab = "wishlist" | "collection" | "stores";

interface WishItem {
  id: string; itemName: string; itemUrl: string;
  imageUrl?: string; price?: string; source: string; memo?: string;
}
interface CollectionItem {
  id: string; itemName: string; itemUrl: string;
  imageUrl?: string; source: string; totalTypes?: number; ownedTypes: number; memo?: string;
}
interface StoreItem {
  id: string; storeName: string; address?: string;
  lat?: number; lng?: number; pinType?: string; memo?: string;
}

const SOURCE_LABEL: Record<string, { icon: string; label: string }> = {
  "gacha-island": { icon: "🏝️", label: "ガチャアイランド" },
  gashadoko:      { icon: "📍", label: "ガシャどこ" },
  gashapon:       { icon: "🔴", label: "バンダイ公式" },
  unknown:        { icon: "🌐", label: "その他" },
};

export default function MyPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const locale = useLocale();
  const [tab, setTab] = useState<Tab>("wishlist");
  const [wishlist, setWishlist] = useState<WishItem[]>([]);
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [stores, setStores] = useState<StoreItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 未ログインはサインインページへ
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/${locale}/auth/signin`);
    }
  }, [status, router, locale]);

  // データ読み込み
  useEffect(() => {
    if (status !== "authenticated") return;
    setLoading(true);
    Promise.all([
      fetch("/api/wishlist").then((r) => r.json()),
      fetch("/api/collection").then((r) => r.json()),
      fetch("/api/store-favorites").then((r) => r.json()),
    ]).then(([wl, col, sf]) => {
      setWishlist(wl.items || []);
      setCollections(col.items || []);
      setStores(sf.items || []);
    }).finally(() => setLoading(false));
  }, [status]);

  const deleteWish = async (id: string) => {
    await fetch(`/api/wishlist?id=${id}`, { method: "DELETE" });
    setWishlist((p) => p.filter((i) => i.id !== id));
  };

  const deleteCollection = async (id: string) => {
    await fetch(`/api/collection?id=${id}`, { method: "DELETE" });
    setCollections((p) => p.filter((i) => i.id !== id));
  };

  const updateOwned = async (id: string, delta: number) => {
    const item = collections.find((c) => c.id === id);
    if (!item) return;
    const next = Math.max(0, Math.min(item.ownedTypes + delta, item.totalTypes ?? 999));
    await fetch("/api/collection", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ownedTypes: next }),
    });
    setCollections((p) => p.map((c) => c.id === id ? { ...c, ownedTypes: next } : c));
  };

  const deleteStore = async (id: string) => {
    await fetch(`/api/store-favorites?id=${id}`, { method: "DELETE" });
    setStores((p) => p.filter((i) => i.id !== id));
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={48} className="text-pink-500 animate-spin" />
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: React.ReactNode; count: number; color: string }[] = [
    { key: "wishlist",   label: "ウィッシュリスト", icon: <Heart size={16} />,   count: wishlist.length,    color: "pink" },
    { key: "collection", label: "マイコレクション", icon: <Package size={16} />, count: collections.length, color: "purple" },
    { key: "stores",     label: "お気に入り店舗",   icon: <Star size={16} />,    count: stores.length,      color: "yellow" },
  ];

  const colorMap: Record<string, string> = {
    pink:   "from-pink-500 to-rose-400",
    purple: "from-purple-500 to-violet-400",
    yellow: "from-yellow-400 to-amber-400",
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* ヘッダー */}
      <div className="flex items-center gap-4 mb-8">
        {session?.user?.image ? (
          <Image src={session.user.image} alt="" width={56} height={56} className="rounded-2xl" />
        ) : (
          <div className="w-14 h-14 bg-gradient-to-br from-pink-400 to-purple-500 rounded-2xl flex items-center justify-center text-white font-black text-xl">
            {(session?.user?.name || session?.user?.email || "?")[0].toUpperCase()}
          </div>
        )}
        <div>
          <p className="font-black text-xl text-gray-800">{session?.user?.name || "マイページ"}</p>
          <p className="text-sm text-gray-400">{session?.user?.email}</p>
        </div>
      </div>

      {/* タブ */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        {tabs.map(({ key, label, icon, count, color }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex flex-col items-center gap-1 p-3 rounded-2xl border-2 transition-all ${
              tab === key
                ? `bg-gradient-to-br ${colorMap[color]} text-white border-transparent shadow-lg`
                : "bg-white border-gray-100 text-gray-600 hover:border-gray-200"
            }`}
          >
            {icon}
            <span className="text-xs font-bold">{label}</span>
            <span className={`text-lg font-black ${tab === key ? "text-white" : "text-gray-800"}`}>{count}</span>
          </button>
        ))}
      </div>

      {/* ── ウィッシュリスト ── */}
      {tab === "wishlist" && (
        <section>
          {wishlist.length === 0 ? (
            <EmptyState icon={<Heart size={48} className="text-pink-300" />}
              text="ウィッシュリストはまだ空です"
              sub="検索結果の♥ボタンから追加できます" />
          ) : (
            <div className="space-y-3">
              {wishlist.map((item) => {
                const src = SOURCE_LABEL[item.source] || SOURCE_LABEL.unknown;
                return (
                  <div key={item.id} className="flex gap-3 p-4 bg-white rounded-2xl border-2 border-pink-100 hover:border-pink-300 transition-all">
                    {item.imageUrl && (
                      <div className="relative w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
                        <Image src={item.imageUrl} alt="" fill className="object-contain p-1" unoptimized />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-800 text-sm line-clamp-2">{item.itemName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {item.price && (
                          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold">{item.price}</span>
                        )}
                        <span className="text-xs text-gray-400">{src.icon} {src.label}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <a href={item.itemUrl} target="_blank" rel="noopener noreferrer"
                        className="p-1.5 rounded-full text-gray-400 hover:text-pink-500 hover:bg-pink-50 transition-colors">
                        <ExternalLink size={14} />
                      </a>
                      <button onClick={() => deleteWish(item.id)}
                        className="p-1.5 rounded-full text-gray-400 hover:text-red-400 hover:bg-red-50 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* ── マイコレクション ── */}
      {tab === "collection" && (
        <section>
          {collections.length === 0 ? (
            <EmptyState icon={<Package size={48} className="text-purple-300" />}
              text="コレクションはまだ空です"
              sub="検索結果の🎰ボタンから追加できます" />
          ) : (
            <div className="space-y-3">
              {collections.map((item) => {
                const total = item.totalTypes ?? 0;
                const pct = total > 0 ? Math.round((item.ownedTypes / total) * 100) : 0;
                const isComplete = total > 0 && item.ownedTypes >= total;
                const src = SOURCE_LABEL[item.source] || SOURCE_LABEL.unknown;
                return (
                  <div key={item.id} className={`p-4 bg-white rounded-2xl border-2 transition-all ${isComplete ? "border-yellow-300 bg-yellow-50" : "border-purple-100 hover:border-purple-300"}`}>
                    <div className="flex gap-3">
                      {item.imageUrl && (
                        <div className="relative w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
                          <Image src={item.imageUrl} alt="" fill className="object-contain p-1" unoptimized />
                          {isComplete && (
                            <div className="absolute inset-0 bg-yellow-400/20 flex items-center justify-center">
                              <Trophy size={20} className="text-yellow-600" />
                            </div>
                          )}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-bold text-gray-800 text-sm line-clamp-2">{item.itemName}</p>
                          <button onClick={() => deleteCollection(item.id)}
                            className="flex-shrink-0 p-1 rounded-full text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors">
                            <Trash2 size={12} />
                          </button>
                        </div>
                        <span className="text-xs text-gray-400">{src.icon} {src.label}</span>

                        {/* 所持数コントロール */}
                        <div className="flex items-center gap-2 mt-2">
                          <button onClick={() => updateOwned(item.id, -1)}
                            className="w-6 h-6 flex items-center justify-center rounded-full bg-purple-100 text-purple-600 hover:bg-purple-200 transition-colors">
                            <Minus size={12} />
                          </button>
                          <span className="font-black text-purple-700 text-sm min-w-[3rem] text-center">
                            {item.ownedTypes}{total > 0 ? ` / ${total}種` : "種"}
                          </span>
                          <button onClick={() => updateOwned(item.id, 1)}
                            className="w-6 h-6 flex items-center justify-center rounded-full bg-purple-100 text-purple-600 hover:bg-purple-200 transition-colors">
                            <Plus size={12} />
                          </button>
                          {isComplete && (
                            <span className="flex items-center gap-1 text-xs font-black text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded-full">
                              <CheckCircle2 size={10} /> コンプリート！
                            </span>
                          )}
                        </div>

                        {/* プログレスバー */}
                        {total > 0 && (
                          <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${isComplete ? "bg-yellow-400" : "bg-purple-400"}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* ── お気に入り店舗 ── */}
      {tab === "stores" && (
        <section>
          {stores.length === 0 ? (
            <EmptyState icon={<Star size={48} className="text-yellow-300" />}
              text="お気に入り店舗はまだ空です"
              sub="マップのピンから⭐ボタンで追加できます" />
          ) : (
            <div className="space-y-3">
              {stores.map((store) => (
                <div key={store.id} className="flex gap-3 p-4 bg-white rounded-2xl border-2 border-yellow-100 hover:border-yellow-300 transition-all">
                  <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MapPin size={18} className="text-yellow-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800 text-sm">{store.storeName}</p>
                    {store.address && (
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{store.address}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {store.lat && store.lng && (
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${store.lat},${store.lng}`}
                        target="_blank" rel="noopener noreferrer"
                        className="p-1.5 rounded-full text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors">
                        <ExternalLink size={14} />
                      </a>
                    )}
                    <button onClick={() => deleteStore(store.id)}
                      className="p-1.5 rounded-full text-gray-400 hover:text-red-400 hover:bg-red-50 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function EmptyState({ icon, text, sub }: { icon: React.ReactNode; text: string; sub: string }) {
  return (
    <div className="text-center py-16">
      <div className="flex justify-center mb-4">{icon}</div>
      <p className="font-bold text-gray-500 mb-1">{text}</p>
      <p className="text-sm text-gray-400">{sub}</p>
    </div>
  );
}
