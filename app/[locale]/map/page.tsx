"use client";

import { useState, useCallback, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from "@react-google-maps/api";
import {
  Search, MapPin, Navigation, Loader2, Store,
  MessageCircle, Heart, ExternalLink, Layers, RefreshCw, BookOpen,
} from "lucide-react";
import { mockStores } from "@/lib/mockData";
import type { MapPin as SnsMapPin, PinType } from "@/app/api/map-pins/route";
import type { SocialPost } from "@/lib/apify";

const mapContainerStyle = { width: "100%", height: "100%" };
const defaultCenter = { lat: 35.6762, lng: 139.6503 };

interface StoreLocation {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  machines?: number;
}

type SelectedPin =
  | { type: "google"; store: StoreLocation }
  | { type: "smart"; pin: SnsMapPin };

// ピンタイプ別アイコン設定
const PIN_CONFIG: Record<PinType, { emoji: string; fill: string; label: string; border: string; bg: string }> = {
  sns:          { emoji: "📱", fill: "#f97316", label: "SNS投稿",       border: "border-orange-400", bg: "bg-orange-50" },
  "web-article":{ emoji: "📍", fill: "#10b981", label: "ガシャどこ記事", border: "border-emerald-400", bg: "bg-emerald-50" },
  official:     { emoji: "🏪", fill: "#8b5cf6", label: "バンダイ公式",   border: "border-violet-400", bg: "bg-violet-50" },
};

function makeMarkerIcon(emoji: string, fill: string, size: google.maps.Size) {
  return {
    url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44">
        <circle cx="22" cy="22" r="20" fill="${fill}" stroke="white" stroke-width="3"/>
        <text x="22" y="29" text-anchor="middle" font-size="20">${emoji}</text>
      </svg>`
    ),
    scaledSize: size,
  };
}

function MapContent() {
  const t = useTranslations("map");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedPin, setSelectedPin] = useState<SelectedPin | null>(null);
  const [stores, setStores] = useState<StoreLocation[]>(mockStores);
  const [smartPins, setSmartPins] = useState<SnsMapPin[]>([]);
  const [center, setCenter] = useState(defaultCenter);
  const [showGoogle, setShowGoogle] = useState(true);
  const [showSmart, setShowSmart] = useState(true);
  const [smartLoading, setSmartLoading] = useState(false);
  const [smartNote, setSmartNote] = useState<string | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: ["places"],
  });

  const onMapLoad = useCallback((map: google.maps.Map) => { mapRef.current = map; }, []);

  const fetchSmartPins = useCallback(async (query: string) => {
    if (!query.trim()) return;
    setSmartLoading(true);
    setSmartNote(null);
    try {
      const res = await fetch(`/api/map-pins?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setSmartPins(data.pins || []);
      if (!data.pins?.length) {
        setSmartNote(locale === "ja" ? "スマートピンが見つかりませんでした" : "No smart pins found");
      }
    } catch {
      setSmartPins([]);
    } finally {
      setSmartLoading(false);
    }
  }, [locale]);

  const searchStores = useCallback(() => {
    if (!searchQuery.trim() || !mapRef.current) return;

    const service = new google.maps.places.PlacesService(mapRef.current);
    service.textSearch(
      {
        query: `${searchQuery} ガチャガチャ カプセルトイ`,
        location: new google.maps.LatLng(center.lat, center.lng),
        radius: 5000,
      },
      (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          const found: StoreLocation[] = results.slice(0, 20).map((place, i) => ({
            id: place.place_id || String(i),
            name: place.name || "Unknown",
            address: place.formatted_address || "",
            lat: place.geometry?.location?.lat() || 0,
            lng: place.geometry?.location?.lng() || 0,
          }));
          setStores(found);
          if (found.length > 0) setCenter({ lat: found[0].lat, lng: found[0].lng });
        }
      }
    );

    fetchSmartPins(searchQuery);
  }, [searchQuery, center, fetchSmartPins]);

  const searchNearby = useCallback(() => {
    navigator.geolocation?.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      setCenter({ lat: latitude, lng: longitude });
      mapRef.current?.panTo({ lat: latitude, lng: longitude });
    });
  }, []);

  if (!isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <Loader2 size={48} className="text-pink-500 animate-spin" />
        <p className="text-gray-500">{locale === "ja" ? "マップを読み込み中..." : "Loading map..."}</p>
      </div>
    );
  }

  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <MapPin size={64} className="mx-auto text-pink-400 mb-4" />
        <h2 className="text-2xl font-black text-gray-700 mb-3">Google Maps API キーが必要です</h2>
        <div className="mt-10 text-left space-y-3">
          {mockStores.map((store) => (
            <div key={store.id} className="bg-white rounded-xl border-2 border-pink-100 p-4 flex items-start gap-3">
              <Store size={20} className="text-pink-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-bold text-gray-800">{store.name}</p>
                <p className="text-sm text-gray-500">{store.address}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ピンタイプ別集計
  const pinCountByType = {
    sns: smartPins.filter((p) => p.type === "sns").length,
    "web-article": smartPins.filter((p) => p.type === "web-article").length,
    official: smartPins.filter((p) => p.type === "official").length,
  };
  const totalSmartPins = smartPins.length;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* 検索バー */}
      <div className="bg-white border-b-2 border-pink-100 p-3">
        <div className="max-w-7xl mx-auto flex gap-2 flex-wrap">
          <div className="flex-1 relative min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchStores()}
              placeholder={locale === "ja" ? "ガチャ名や店舗名を入力..." : "Search gacha or store name..."}
              className="w-full pl-10 pr-4 py-2 rounded-full border-2 border-pink-200 focus:outline-none focus:border-pink-400 text-sm font-medium"
            />
          </div>
          <button
            onClick={searchStores}
            className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold rounded-full text-sm hover:opacity-90 flex items-center gap-1"
          >
            <Search size={14} /> {t("searchArea")}
          </button>
          <button
            onClick={searchNearby}
            className="p-2 bg-white border-2 border-pink-200 rounded-full hover:border-pink-400 transition-colors"
            title={locale === "ja" ? "現在地" : "My Location"}
          >
            <Navigation size={18} className="text-pink-500" />
          </button>

          {/* レイヤー切り替え */}
          <div className="flex items-center gap-2 ml-auto">
            <Layers size={16} className="text-gray-400" />
            <button
              onClick={() => setShowGoogle((v) => !v)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all ${
                showGoogle ? "bg-pink-100 border-pink-400 text-pink-700" : "bg-white border-gray-200 text-gray-400"
              }`}
            >
              🎰 Google
              <span className="bg-pink-500 text-white rounded-full px-1.5 text-xs">{stores.length}</span>
            </button>
            <button
              onClick={() => setShowSmart((v) => !v)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all ${
                showSmart ? "bg-purple-100 border-purple-400 text-purple-700" : "bg-white border-gray-200 text-gray-400"
              }`}
            >
              {smartLoading ? <RefreshCw size={10} className="animate-spin" /> : "✨"}
              スマートピン
              <span className="bg-purple-500 text-white rounded-full px-1.5 text-xs">{totalSmartPins}</span>
            </button>
          </div>
        </div>
        {smartNote && (
          <div className="max-w-7xl mx-auto mt-2">
            <p className="text-xs text-purple-500 bg-purple-50 rounded-lg px-3 py-1.5 inline-block">💡 {smartNote}</p>
          </div>
        )}
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* マップ本体 */}
        <div className="flex-1 relative">
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={13}
            onLoad={onMapLoad}
            options={{ styles: [{ featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] }] }}
          >
            {/* Googleピン（ピンク🎰） */}
            {showGoogle && stores.map((store) => (
              <Marker
                key={store.id}
                position={{ lat: store.lat, lng: store.lng }}
                onClick={() => setSelectedPin({ type: "google", store })}
                icon={{
                  url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(
                    `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
                      <circle cx="20" cy="20" r="18" fill="#ec4899" stroke="white" stroke-width="3"/>
                      <text x="20" y="26" text-anchor="middle" font-size="18">🎰</text>
                    </svg>`
                  ),
                  scaledSize: new google.maps.Size(40, 40),
                }}
              />
            ))}

            {/* スマートピン（SNS📱・記事📍・公式🏪） */}
            {showSmart && smartPins.map((pin) => {
              const cfg = PIN_CONFIG[pin.type] || PIN_CONFIG.sns;
              return (
                <Marker
                  key={pin.id}
                  position={{ lat: pin.lat, lng: pin.lng }}
                  onClick={() => setSelectedPin({ type: "smart", pin })}
                  icon={makeMarkerIcon(cfg.emoji, cfg.fill, new google.maps.Size(44, 44))}
                />
              );
            })}

            {/* Google InfoWindow */}
            {selectedPin?.type === "google" && (
              <InfoWindow
                position={{ lat: selectedPin.store.lat, lng: selectedPin.store.lng }}
                onCloseClick={() => setSelectedPin(null)}
              >
                <div className="p-2 max-w-xs">
                  <p className="font-bold text-gray-800">🎰 {selectedPin.store.name}</p>
                  <p className="text-sm text-gray-500 mt-1">{selectedPin.store.address}</p>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${selectedPin.store.lat},${selectedPin.store.lng}`}
                    target="_blank" rel="noopener noreferrer"
                    className="mt-2 block text-xs text-blue-500 hover:underline"
                  >{t("directions")} →</a>
                </div>
              </InfoWindow>
            )}

            {/* スマートピン InfoWindow */}
            {selectedPin?.type === "smart" && (
              <InfoWindow
                position={{ lat: selectedPin.pin.lat, lng: selectedPin.pin.lng }}
                onCloseClick={() => setSelectedPin(null)}
              >
                <SmartPinInfoWindow pin={selectedPin.pin} directionsLabel={t("directions")} />
              </InfoWindow>
            )}
          </GoogleMap>

          {/* 凡例 */}
          <div className="absolute bottom-4 left-4 bg-white rounded-xl shadow-lg border-2 border-gray-100 p-3 text-xs space-y-1.5">
            <p className="font-black text-gray-600 text-xs mb-2">{locale === "ja" ? "凡例" : "Legend"}</p>
            <div className="flex items-center gap-2"><span>🎰</span><span className="text-gray-600">Google検索 ({stores.length})</span></div>
            <div className="flex items-center gap-2"><span>📱</span><span className="text-gray-600">SNS情報 ({pinCountByType.sns})</span></div>
            <div className="flex items-center gap-2"><span>📍</span><span className="text-gray-600">ガシャどこ記事 ({pinCountByType["web-article"]})</span></div>
            <div className="flex items-center gap-2"><span>🏪</span><span className="text-gray-600">バンダイ公式 ({pinCountByType.official})</span></div>
          </div>
        </div>

        {/* サイドバー */}
        <div className="w-72 hidden lg:flex flex-col bg-white border-l-2 border-pink-100 overflow-hidden">
          <div className="p-4 border-b border-pink-100 flex-shrink-0">
            <h2 className="font-black text-gray-700 flex items-center gap-2 text-sm">
              <MapPin size={16} className="text-pink-500" />
              {t("storeList")} ({stores.length + (showSmart ? totalSmartPins : 0)})
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {/* スマートピン一覧 */}
            {showSmart && smartPins.length > 0 && (
              <div className="p-3">
                <p className="text-xs font-black text-purple-500 mb-2">✨ スマートピン ({totalSmartPins})</p>
                <div className="space-y-2">
                  {smartPins.map((pin) => {
                    const cfg = PIN_CONFIG[pin.type] || PIN_CONFIG.sns;
                    return (
                      <button
                        key={pin.id}
                        onClick={() => {
                          setSelectedPin({ type: "smart", pin });
                          setCenter({ lat: pin.lat, lng: pin.lng });
                          mapRef.current?.panTo({ lat: pin.lat, lng: pin.lng });
                          mapRef.current?.setZoom(15);
                        }}
                        className={`w-full text-left p-3 rounded-xl border-2 transition-all hover:shadow-sm ${
                          selectedPin?.type === "smart" && selectedPin.pin.id === pin.id
                            ? `${cfg.border} ${cfg.bg}`
                            : "border-gray-100 hover:border-gray-200"
                        }`}
                      >
                        <p className="font-bold text-gray-800 text-sm flex items-center gap-1">
                          {cfg.emoji} {pin.storeName}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{pin.address}</p>
                        <p className={`text-xs font-semibold mt-0.5 ${
                          pin.type === "sns" ? "text-orange-500" :
                          pin.type === "web-article" ? "text-emerald-600" : "text-violet-600"
                        }`}>
                          {cfg.label}
                          {pin.type === "sns" && pin.posts && pin.posts.length > 0 && ` · ${pin.posts.length}件`}
                          {pin.type === "web-article" && pin.articleTitle && ` · ${pin.articleTitle.slice(0, 20)}…`}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Googleピン一覧 */}
            {showGoogle && stores.length > 0 && (
              <div className="p-3">
                {smartPins.length > 0 && (
                  <p className="text-xs font-black text-pink-500 mb-2">🎰 Google検索 ({stores.length})</p>
                )}
                <div className="space-y-2">
                  {stores.map((store) => (
                    <button
                      key={store.id}
                      onClick={() => {
                        setSelectedPin({ type: "google", store });
                        setCenter({ lat: store.lat, lng: store.lng });
                        mapRef.current?.panTo({ lat: store.lat, lng: store.lng });
                      }}
                      className={`w-full text-left p-3 rounded-xl border-2 transition-all hover:border-pink-300 ${
                        selectedPin?.type === "google" && selectedPin.store.id === store.id
                          ? "border-pink-400 bg-pink-50" : "border-gray-100"
                      }`}
                    >
                      <p className="font-bold text-gray-800 text-sm">{store.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{store.address}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {stores.length === 0 && smartPins.length === 0 && (
              <div className="p-6 text-center text-gray-400 text-sm">{t("noStores")}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// スマートピン InfoWindow コンテンツ
function SmartPinInfoWindow({ pin, directionsLabel }: { pin: SnsMapPin; directionsLabel: string }) {
  const cfg = PIN_CONFIG[pin.type] || PIN_CONFIG.sns;
  return (
    <div className="max-w-xs">
      <p className="font-bold text-gray-800 flex items-center gap-1 mb-1">
        {cfg.emoji} {pin.storeName}
      </p>
      {pin.address && <p className="text-xs text-gray-500 mb-2">{pin.address}</p>}

      {/* SNS投稿プレビュー */}
      {pin.type === "sns" && pin.posts && pin.posts.length > 0 && (
        <div className="space-y-2 mb-2 max-h-40 overflow-y-auto">
          <p className="text-xs font-bold text-orange-500">📱 SNS投稿 ({pin.posts.length}件)</p>
          {pin.posts.map((post) => (
            <SnsPostMini key={post.id} post={post} />
          ))}
        </div>
      )}

      {/* ガシャどこ記事リンク */}
      {pin.type === "web-article" && pin.articleUrl && (
        <div className="mb-2 bg-emerald-50 rounded-lg p-2">
          <p className="text-xs font-bold text-emerald-600 flex items-center gap-1 mb-1">
            <BookOpen size={10} /> ガシャどこ情報
          </p>
          <p className="text-xs text-gray-600 line-clamp-2 mb-1">{pin.articleTitle}</p>
          <a
            href={pin.articleUrl}
            target="_blank" rel="noopener noreferrer"
            className="text-xs text-emerald-600 hover:underline flex items-center gap-0.5"
          >
            <ExternalLink size={9} /> 記事を読む
          </a>
        </div>
      )}

      {/* バンダイ公式 */}
      {pin.type === "official" && (
        <div className="mb-2">
          <p className="text-xs font-bold text-violet-600">🏪 {pin.officialChain}</p>
        </div>
      )}

      <a
        href={`https://www.google.com/maps/dir/?api=1&destination=${pin.lat},${pin.lng}`}
        target="_blank" rel="noopener noreferrer"
        className="block text-xs text-blue-500 hover:underline"
      >
        {directionsLabel} →
      </a>
    </div>
  );
}

function SnsPostMini({ post }: { post: SocialPost }) {
  const icons: Record<string, string> = { twitter: "𝕏", instagram: "📸", tiktok: "🎵" };
  return (
    <div className="border border-gray-100 rounded-lg p-2 bg-gray-50">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-bold text-gray-500">{icons[post.platform] || "🌐"} @{post.author}</span>
        <span className="text-xs text-pink-500 flex items-center gap-0.5">
          <Heart size={9} fill="currentColor" />{post.likes.toLocaleString()}
        </span>
      </div>
      <p className="text-xs text-gray-700 line-clamp-2">{post.text}</p>
      <a href={post.url} target="_blank" rel="noopener noreferrer"
        className="text-xs text-blue-500 hover:underline flex items-center gap-0.5 mt-1">
        <ExternalLink size={9} /> 投稿を見る
      </a>
    </div>
  );
}

export default function MapPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-96"><Loader2 size={48} className="text-pink-500 animate-spin" /></div>}>
      <MapContent />
    </Suspense>
  );
}
