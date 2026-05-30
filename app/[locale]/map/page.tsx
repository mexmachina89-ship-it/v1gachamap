"use client";

import { useState, useCallback, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from "@react-google-maps/api";
import {
  Search,
  MapPin,
  Navigation,
  Loader2,
  Store,
  MessageCircle,
  Heart,
  ExternalLink,
  Layers,
  RefreshCw,
} from "lucide-react";
import { mockStores } from "@/lib/mockData";
import type { MapPin as SnsMapPin } from "@/app/api/map-pins/route";
import type { SocialPost } from "@/lib/apify";

const mapContainerStyle = { width: "100%", height: "100%" };
const defaultCenter = { lat: 35.6762, lng: 139.6503 }; // Tokyo

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
  | { type: "sns"; pin: SnsMapPin };

// SNSピン用カスタムアイコン（オレンジ）
function snsMarkerIcon(size: google.maps.Size) {
  return {
    url:
      "data:image/svg+xml;charset=UTF-8," +
      encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44">
          <circle cx="22" cy="22" r="20" fill="#f97316" stroke="white" stroke-width="3"/>
          <text x="22" y="29" text-anchor="middle" font-size="20">📱</text>
        </svg>`
      ),
    scaledSize: size,
  };
}

// Googleピン用アイコン（ピンク）
function googleMarkerIcon(size: google.maps.Size) {
  return {
    url:
      "data:image/svg+xml;charset=UTF-8," +
      encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="18" fill="#ec4899" stroke="white" stroke-width="3"/>
          <text x="20" y="26" text-anchor="middle" font-size="18">🎰</text>
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
  const [snsPins, setSnsPins] = useState<SnsMapPin[]>([]);
  const [center, setCenter] = useState(defaultCenter);
  const [showGoogle, setShowGoogle] = useState(true);
  const [showSns, setShowSns] = useState(true);
  const [snsLoading, setSnsLoading] = useState(false);
  const [snsNote, setSnsNote] = useState<string | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: ["places"],
  });

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  // SNS投稿から抽出した店舗ピンを取得
  const fetchSnsPins = useCallback(async (query: string) => {
    if (!query.trim()) return;
    setSnsLoading(true);
    setSnsNote(null);
    try {
      const res = await fetch(`/api/map-pins?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setSnsPins(data.pins || []);
      if (data.note === "no_cached_posts") {
        setSnsNote(locale === "ja" ? "SNS検索後にピンが表示されます" : "Search SNS first to show pins");
      } else if (data.note === "no_stores_extracted") {
        setSnsNote(locale === "ja" ? "投稿から店舗情報を抽出できませんでした" : "No store info found in posts");
      }
    } catch {
      setSnsPins([]);
    } finally {
      setSnsLoading(false);
    }
  }, [locale]);

  // Google Places検索
  const searchStores = useCallback(() => {
    if (!searchQuery.trim() || !mapRef.current) return;

    const service = new google.maps.places.PlacesService(mapRef.current);
    const request: google.maps.places.TextSearchRequest = {
      query: `${searchQuery} ガチャガチャ カプセルトイ`,
      location: new google.maps.LatLng(center.lat, center.lng),
      radius: 5000,
    };

    service.textSearch(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        const found: StoreLocation[] = results.slice(0, 20).map((place, i) => ({
          id: place.place_id || String(i),
          name: place.name || "Unknown",
          address: place.formatted_address || "",
          lat: place.geometry?.location?.lat() || 0,
          lng: place.geometry?.location?.lng() || 0,
        }));
        setStores(found);
        if (found.length > 0) {
          setCenter({ lat: found[0].lat, lng: found[0].lng });
        }
      }
    });

    // SNSピンも同時更新
    fetchSnsPins(searchQuery);
  }, [searchQuery, center, fetchSnsPins]);

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
        <h2 className="text-2xl font-black text-gray-700 mb-3">
          {locale === "ja" ? "Google Maps API キーが必要です" : "Google Maps API Key Required"}
        </h2>
        <div className="mt-10 text-left">
          <div className="space-y-3">
            {mockStores.map((store) => (
              <div key={store.id} className="bg-white rounded-xl border-2 border-pink-100 p-4">
                <div className="flex items-start gap-3">
                  <Store size={20} className="text-pink-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-gray-800">{store.name}</p>
                    <p className="text-sm text-gray-500">{store.address}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const totalPinCount =
    (showGoogle ? stores.length : 0) + (showSns ? snsPins.length : 0);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Search bar */}
      <div className="bg-white border-b-2 border-pink-100 p-3">
        <div className="max-w-7xl mx-auto flex gap-2 flex-wrap">
          <div className="flex-1 relative min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchStores()}
              placeholder={
                locale === "ja" ? "ガチャ名や店舗名を入力..." : "Search gacha or store name..."
              }
              className="w-full pl-10 pr-4 py-2 rounded-full border-2 border-pink-200 focus:outline-none focus:border-pink-400 text-sm font-medium"
            />
          </div>
          <button
            onClick={searchStores}
            className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold rounded-full text-sm hover:opacity-90 flex items-center gap-1"
          >
            <Search size={14} />
            {t("searchArea")}
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
                showGoogle
                  ? "bg-pink-100 border-pink-400 text-pink-700"
                  : "bg-white border-gray-200 text-gray-400"
              }`}
            >
              🎰 {locale === "ja" ? "Google検索" : "Google"}
              <span className="bg-pink-500 text-white rounded-full px-1.5 text-xs">{stores.length}</span>
            </button>
            <button
              onClick={() => setShowSns((v) => !v)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all ${
                showSns
                  ? "bg-orange-100 border-orange-400 text-orange-700"
                  : "bg-white border-gray-200 text-gray-400"
              }`}
            >
              {snsLoading ? (
                <RefreshCw size={10} className="animate-spin" />
              ) : (
                "📱"
              )}{" "}
              {locale === "ja" ? "SNS投稿" : "SNS"}
              <span className="bg-orange-500 text-white rounded-full px-1.5 text-xs">{snsPins.length}</span>
            </button>
          </div>
        </div>

        {/* SNSメモ */}
        {snsNote && (
          <div className="max-w-7xl mx-auto mt-2">
            <p className="text-xs text-orange-500 bg-orange-50 rounded-lg px-3 py-1.5 inline-block">
              💡 {snsNote}
            </p>
          </div>
        )}
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Map */}
        <div className="flex-1 relative">
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={13}
            onLoad={onMapLoad}
            options={{
              styles: [
                { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
              ],
            }}
          >
            {/* Googleピン（ピンク🎰） */}
            {showGoogle &&
              stores.map((store) => (
                <Marker
                  key={store.id}
                  position={{ lat: store.lat, lng: store.lng }}
                  onClick={() => setSelectedPin({ type: "google", store })}
                  icon={googleMarkerIcon(new google.maps.Size(40, 40))}
                />
              ))}

            {/* SNSピン（オレンジ📱） */}
            {showSns &&
              snsPins.map((pin) => (
                <Marker
                  key={pin.id}
                  position={{ lat: pin.lat, lng: pin.lng }}
                  onClick={() => setSelectedPin({ type: "sns", pin })}
                  icon={snsMarkerIcon(new google.maps.Size(44, 44))}
                />
              ))}

            {/* Googleピン InfoWindow */}
            {selectedPin?.type === "google" && (
              <InfoWindow
                position={{ lat: selectedPin.store.lat, lng: selectedPin.store.lng }}
                onCloseClick={() => setSelectedPin(null)}
              >
                <div className="p-2 max-w-xs">
                  <p className="font-bold text-gray-800 flex items-center gap-1">
                    🎰 {selectedPin.store.name}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">{selectedPin.store.address}</p>
                  {selectedPin.store.machines && (
                    <p className="text-xs text-pink-500 font-semibold mt-1">
                      約{selectedPin.store.machines}台設置
                    </p>
                  )}
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${selectedPin.store.lat},${selectedPin.store.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 block text-xs text-blue-500 hover:underline"
                  >
                    {t("directions")} →
                  </a>
                </div>
              </InfoWindow>
            )}

            {/* SNSピン InfoWindow */}
            {selectedPin?.type === "sns" && (
              <InfoWindow
                position={{ lat: selectedPin.pin.lat, lng: selectedPin.pin.lng }}
                onCloseClick={() => setSelectedPin(null)}
              >
                <div className="max-w-xs">
                  <p className="font-bold text-gray-800 flex items-center gap-1 mb-2">
                    📱 {selectedPin.pin.storeName}
                  </p>
                  <p className="text-xs text-orange-500 font-semibold mb-2">
                    SNS投稿より {selectedPin.pin.posts.length}件の情報
                  </p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedPin.pin.posts.map((post) => (
                      <SnsPostMini key={post.id} post={post} />
                    ))}
                  </div>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${selectedPin.pin.lat},${selectedPin.pin.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 block text-xs text-blue-500 hover:underline"
                  >
                    {t("directions")} →
                  </a>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>

          {/* 凡例 */}
          <div className="absolute bottom-4 left-4 bg-white rounded-xl shadow-lg border-2 border-gray-100 p-3 text-xs space-y-1.5">
            <p className="font-black text-gray-600 text-xs mb-2">
              {locale === "ja" ? "凡例" : "Legend"}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-base">🎰</span>
              <span className="text-gray-600">Google検索 ({stores.length})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base">📱</span>
              <span className="text-gray-600">SNS投稿 ({snsPins.length})</span>
            </div>
            <div className="pt-1 border-t border-gray-100 text-gray-400">
              {locale === "ja" ? `計 ${totalPinCount}件` : `Total ${totalPinCount}`}
            </div>
          </div>
        </div>

        {/* Store list sidebar */}
        <div className="w-72 hidden lg:flex flex-col bg-white border-l-2 border-pink-100 overflow-hidden">
          <div className="p-4 border-b border-pink-100 flex-shrink-0">
            <h2 className="font-black text-gray-700 flex items-center gap-2 text-sm">
              <MapPin size={16} className="text-pink-500" />
              {t("storeList")} ({totalPinCount})
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {/* SNSから抽出した店舗 */}
            {showSns && snsPins.length > 0 && (
              <div className="p-3">
                <p className="text-xs font-black text-orange-500 mb-2 flex items-center gap-1">
                  📱 SNS投稿から抽出 ({snsPins.length})
                </p>
                <div className="space-y-2">
                  {snsPins.map((pin) => (
                    <button
                      key={pin.id}
                      onClick={() => {
                        setSelectedPin({ type: "sns", pin });
                        setCenter({ lat: pin.lat, lng: pin.lng });
                        mapRef.current?.panTo({ lat: pin.lat, lng: pin.lng });
                        mapRef.current?.setZoom(15);
                      }}
                      className={`w-full text-left p-3 rounded-xl border-2 transition-all hover:border-orange-300 ${
                        selectedPin?.type === "sns" && selectedPin.pin.id === pin.id
                          ? "border-orange-400 bg-orange-50"
                          : "border-orange-100 bg-orange-50/50"
                      }`}
                    >
                      <p className="font-bold text-gray-800 text-sm flex items-center gap-1">
                        📱 {pin.storeName}
                      </p>
                      <p className="text-xs text-orange-500 mt-0.5">
                        <MessageCircle size={10} className="inline mr-1" />
                        {pin.posts.length}件の投稿
                      </p>
                      {pin.posts[0] && (
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                          {pin.posts[0].text}
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Googleから取得した店舗 */}
            {showGoogle && stores.length > 0 && (
              <div className="p-3">
                {snsPins.length > 0 && (
                  <p className="text-xs font-black text-pink-500 mb-2 flex items-center gap-1">
                    🎰 Google検索 ({stores.length})
                  </p>
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
                          ? "border-pink-400 bg-pink-50"
                          : "border-gray-100"
                      }`}
                    >
                      <p className="font-bold text-gray-800 text-sm">{store.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{store.address}</p>
                      {store.machines && (
                        <p className="text-xs text-pink-500 font-medium mt-1">🎰 約{store.machines}台</p>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {totalPinCount === 0 && (
              <div className="p-6 text-center text-gray-400 text-sm">{t("noStores")}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// SNS投稿ミニカード（InfoWindow内）
function SnsPostMini({ post }: { post: SocialPost }) {
  const platformIcon: Record<string, string> = {
    twitter: "𝕏",
    instagram: "📸",
    tiktok: "🎵",
  };
  return (
    <div className="border border-gray-100 rounded-lg p-2 bg-gray-50">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-bold text-gray-500">
          {platformIcon[post.platform] || "🌐"} @{post.author}
        </span>
        <span className="text-xs text-pink-500 flex items-center gap-0.5">
          <Heart size={9} fill="currentColor" />
          {post.likes.toLocaleString()}
        </span>
      </div>
      <p className="text-xs text-gray-700 line-clamp-2">{post.text}</p>
      <a
        href={post.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-blue-500 hover:underline flex items-center gap-0.5 mt-1"
      >
        <ExternalLink size={9} />
        投稿を見る
      </a>
    </div>
  );
}

export default function MapPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-96">
          <Loader2 size={48} className="text-pink-500 animate-spin" />
        </div>
      }
    >
      <MapContent />
    </Suspense>
  );
}
