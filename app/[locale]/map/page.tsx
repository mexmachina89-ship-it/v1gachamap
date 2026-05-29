"use client";

import { useState, useCallback, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from "@react-google-maps/api";
import { Search, MapPin, Navigation, Loader2, Store } from "lucide-react";
import { mockStores } from "@/lib/mockData";

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

function MapContent() {
  const t = useTranslations("map");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedStore, setSelectedStore] = useState<StoreLocation | null>(null);
  const [stores, setStores] = useState<StoreLocation[]>(mockStores);
  const [center, setCenter] = useState(defaultCenter);
  const mapRef = useRef<google.maps.Map | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: ["places"],
  });

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

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
  }, [searchQuery, center]);

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
        <p className="text-gray-500 mb-4">
          {locale === "ja"
            ? ".env.local に NEXT_PUBLIC_GOOGLE_MAPS_API_KEY を設定してください"
            : "Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in .env.local"}
        </p>
        <div className="bg-gray-100 rounded-xl p-4 text-left font-mono text-sm">
          NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
        </div>

        {/* Mock store list */}
        <div className="mt-10 text-left">
          <h3 className="text-lg font-bold mb-4 text-gray-700">
            {locale === "ja" ? "📍 サンプル設置店" : "📍 Sample Stores"}
          </h3>
          <div className="space-y-3">
            {mockStores.map((store) => (
              <div key={store.id} className="bg-white rounded-xl border-2 border-pink-100 p-4">
                <div className="flex items-start gap-3">
                  <Store size={20} className="text-pink-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-gray-800">{store.name}</p>
                    <p className="text-sm text-gray-500">{store.address}</p>
                    {store.machines && (
                      <p className="text-xs text-pink-500 font-semibold mt-1">
                        🎰 {locale === "ja" ? `約${store.machines}台設置` : `~${store.machines} machines`}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Search bar */}
      <div className="bg-white border-b-2 border-pink-100 p-4">
        <div className="max-w-7xl mx-auto flex gap-2">
          <div className="flex-1 relative">
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
            className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold rounded-full text-sm hover:opacity-90"
          >
            {t("searchArea")}
          </button>
          <button
            onClick={searchNearby}
            className="p-2 bg-white border-2 border-pink-200 rounded-full hover:border-pink-400 transition-colors"
            title={locale === "ja" ? "現在地" : "My Location"}
          >
            <Navigation size={18} className="text-pink-500" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Map */}
        <div className="flex-1">
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
            {stores.map((store) => (
              <Marker
                key={store.id}
                position={{ lat: store.lat, lng: store.lng }}
                onClick={() => setSelectedStore(store)}
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
            {selectedStore && (
              <InfoWindow
                position={{ lat: selectedStore.lat, lng: selectedStore.lng }}
                onCloseClick={() => setSelectedStore(null)}
              >
                <div className="p-2 max-w-xs">
                  <p className="font-bold text-gray-800">{selectedStore.name}</p>
                  <p className="text-sm text-gray-500 mt-1">{selectedStore.address}</p>
                  {selectedStore.machines && (
                    <p className="text-xs text-pink-500 font-semibold mt-1">
                      🎰 約{selectedStore.machines}台
                    </p>
                  )}
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${selectedStore.lat},${selectedStore.lng}`}
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
        </div>

        {/* Store list sidebar */}
        <div className="w-72 hidden lg:flex flex-col bg-white border-l-2 border-pink-100 overflow-y-auto">
          <div className="p-4 border-b border-pink-100">
            <h2 className="font-black text-gray-700 flex items-center gap-2">
              <MapPin size={18} className="text-pink-500" />
              {t("storeList")} ({stores.length})
            </h2>
          </div>
          {stores.length === 0 ? (
            <div className="p-6 text-center text-gray-400 text-sm">{t("noStores")}</div>
          ) : (
            <div className="p-3 space-y-2">
              {stores.map((store) => (
                <button
                  key={store.id}
                  onClick={() => {
                    setSelectedStore(store);
                    setCenter({ lat: store.lat, lng: store.lng });
                    mapRef.current?.panTo({ lat: store.lat, lng: store.lng });
                  }}
                  className={`w-full text-left p-3 rounded-xl border-2 transition-all hover:border-pink-300 ${
                    selectedStore?.id === store.id ? "border-pink-400 bg-pink-50" : "border-gray-100"
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
          )}
        </div>
      </div>
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
