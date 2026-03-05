"use client";

import React, { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

type Coords = {
  lat: number;
  lng: number;
};

type LiveTacticalMapProps = {
  progress: number;
  startCoords: Coords;
  destination: Coords;
};

// Dynamic imports for Next.js SSR safety
const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false }
);

const Marker = dynamic(
  () => import("react-leaflet").then((m) => m.Marker),
  { ssr: false }
);

const Circle = dynamic(
  () => import("react-leaflet").then((m) => m.Circle),
  { ssr: false }
);

// Keeps map camera locked on truck
const MapRecenter = ({ coords }: { coords: [number, number] }) => {
  const map = useMap();

  useEffect(() => {
    map.setView(coords, map.getZoom(), { animate: true });
  }, [coords, map]);

  return null;
};

export default function LiveTacticalMap({
  progress,
  startCoords,
  destination,
}: LiveTacticalMapProps) {
  const [L, setL] = useState<any>(null);

  useEffect(() => {
    import("leaflet").then((leaflet) => setL(leaflet));
  }, []);

  // Interpolated truck position
  const currentPos: [number, number] = useMemo(() => {
    const lat =
      startCoords.lat + (destination.lat - startCoords.lat) * (progress / 100);

    const lng =
      startCoords.lng + (destination.lng - startCoords.lng) * (progress / 100);

    return [lat, lng];
  }, [progress, startCoords, destination]);

  if (!L) return <div className="h-full w-full bg-slate-950 animate-pulse" />;

  const truckIcon = L.divIcon({
    className: "custom-icon",
    html: `<div class="bg-cyan-500 p-2 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.8)] border-2 border-white rotate-90">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="white" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.806H14.25M16.5 18.75h-2.25m0-11.25v11.25m0-11.25h-4.875c-.621 0-1.125.504-1.125 1.125V18" />
            </svg>
          </div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });

  return (
    <div className="h-full w-full relative">
      <MapContainer
        center={currentPos}
        zoom={15}
        zoomControl={false}
        className="h-full w-full"
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />

        <MapRecenter coords={currentPos} />

        {/* Destination */}
        <Circle
          center={[destination.lat, destination.lng]}
          radius={150}
          pathOptions={{
            color: "#06b6d4",
            weight: 1,
            fillOpacity: 0.1,
          }}
        />

        <Marker position={[destination.lat, destination.lng]} />

        {/* Moving Truck */}
        <Marker position={currentPos} icon={truckIcon} />
      </MapContainer>

      {/* HUD Overlay */}
      <div className="absolute top-4 left-4 z-[1000] pointer-events-none">
        <div className="bg-black/60 backdrop-blur-md border border-white/10 p-3 rounded-xl">
          <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">
            Telemetry
          </p>

          <p className="font-mono text-[10px] text-white">
            {currentPos[0].toFixed(4)}, {currentPos[1].toFixed(4)}
          </p>
        </div>
      </div>
    </div>
  );
}