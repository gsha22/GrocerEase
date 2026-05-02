"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";

// Fix default marker icons (Leaflet + webpack/turbopack issue)
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

type Store = {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  categories: string[];
  distanceMiles: number | null;
};

export default function StoreMap({
  stores,
  center,
}: {
  stores: Store[];
  center: [number, number];
}) {
  return (
    <MapContainer
      center={center}
      zoom={12}
      scrollWheelZoom={true}
      className="h-full w-full rounded-2xl z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {stores.map((store) => (
        <Marker
          key={store.id}
          position={[store.lat, store.lng]}
          icon={defaultIcon}
        >
          <Popup>
            <div className="font-sans">
              <div className="font-semibold text-[14px]">{store.name}</div>
              <div className="text-[12px] text-gray-500 mt-1">
                {store.address}
              </div>
              {store.distanceMiles !== null && (
                <div className="text-[12px] text-green-600 font-medium mt-1">
                  📍 {store.distanceMiles} mi away
                </div>
              )}
              <Link
                href={`/stores/${store.id}`}
                className="inline-block mt-2 text-[12px] font-semibold text-white bg-green-700 px-3 py-1 rounded-md hover:bg-green-800 transition-colors"
                style={{ color: "#ffffff" }}
              >
                View store →
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
