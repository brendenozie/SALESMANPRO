'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import {
  MapPinIcon,
  BoltIcon,
  ClockIcon,
  MapIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/solid';

import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// ------------------------------
// Dynamic Leaflet Components
// ------------------------------
const MapContainer = dynamic(
  () => import('react-leaflet').then((m) => m.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((m) => m.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((m) => m.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((m) => m.Popup),
  { ssr: false }
);
const Polyline = dynamic(
  () => import('react-leaflet').then((m) => m.Polyline),
  { ssr: false }
);

// ⚠️ Hooks must be imported normally
import { useMap } from 'react-leaflet';

// ------------------------------
// Leaflet Icon Fix (Next.js)
// ------------------------------
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// ------------------------------
// Custom Icons
// ------------------------------
const driverIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3063/3063822.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

const pickupIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [35, 35],
  iconAnchor: [17, 35],
});

const waypointIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [35, 35],
  iconAnchor: [17, 35],
});

const destinationIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [35, 35],
  iconAnchor: [17, 35],
});

// ------------------------------
// Route Data
// ------------------------------
// const routeCoordinates: [number, number][] = [
//   [-1.286389, 36.817223], // Nairobi CBD
//   [-1.2921, 36.8219],
//   [-1.3032, 36.8245],
//   [-1.315, 36.83], // Driver position
//   [-1.33, 36.85],
//   [-1.35, 36.89], // Embakasi
// ];
// const routeCoordinates: [number, number][] = [
//   [0.0463, 37.6559],   // Meru Town (CBD)
//   [0.0500, 37.6605],   // Near Mwendantu
//   [0.0568, 37.6672],   // Near Meru Level 5 Hospital
//   [0.0635, 37.6730],   // Driver position (example)
//   [0.0720, 37.6825],   // Toward Nkubu Road
//   [0.0825, 37.6950],   // Outskirts toward Nkubu
// ];
const routeCoordinates: [number, number][] = [
  [-0.5370, 37.4500],   // Embu Town (CBD)
  [-0.5355, 37.4525],   // Near Embu Level 5 Hospital
  [-0.5330, 37.4560],   // Near Embu Stadium
  [-0.5300, 37.4605],   // Near University of Embu
  [-0.5265, 37.4680],   // Along Runyenjes Road
  [-0.5220, 37.4755],   // Outskirts toward Runyenjes
];

// ------------------------------
// Auto Recenter Component
// ------------------------------
function RecenterMap({ coords }: { coords: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    map.setView(coords, map.getZoom(), { animate: true });
  }, [coords, map]);

  return null;
}

// ------------------------------
// Main Component
// ------------------------------
export default function LiveTrackingMap({ selectedAsset }: { selectedAsset?: any }) {
  const [driverPos] = useState<[number, number]>(routeCoordinates[3]);

  const [telemetry, setTelemetry] = useState({
    speed: 45,
    eta: '14 mins',
    distance: '8.2 km',
  });

  useEffect(() => {
    // Simulate real-time updates (for demo purposes)
    const interval = setInterval(() => {
      // provide sample fetch real telemetry data and update state
      setTelemetry((prev) => ({
        ...prev,
        speed: prev.speed + (Math.random() * 10 - 5), // Random speed fluctuation
        eta: `${Math.max(1, parseInt(prev.eta) - 1)} mins`, // Decrease ETA
        distance: `${Math.max(0, parseFloat(prev.distance) - 0.5).toFixed(1)} km`, // Decrease distance
      }));

    }, 5000);

    return () => clearInterval(interval);
  }, []);


  
  return (
    <div className="relative rounded-3xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="pointer-events-none absolute top-4 left-4 right-4 z-[1000] flex justify-between">
        <div className="pointer-events-auto flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/90 px-4 py-2 text-white backdrop-blur">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
          <span className="text-xs font-black uppercase tracking-widest">
            Live Signal: TX-44
          </span>
        </div>

        <div className="pointer-events-auto flex gap-4 rounded-2xl border border-slate-200 bg-white/95 px-4 py-2 backdrop-blur">
          <div className="flex items-center gap-2">
            <BoltIcon className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-bold">
              {telemetry.speed} km/h
            </span>
          </div>
          <div className="border-r border-slate-200" />
          <div className="flex items-center gap-2">
            <ClockIcon className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-bold">
              ETA: {telemetry.eta}
            </span>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="h-[530px] w-full">
        <MapContainer
          center={driverPos}
          zoom={13}
          scrollWheelZoom={false}
          className="h-full w-full"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />

          <Polyline
            positions={routeCoordinates}
            color="#6366f1"
            weight={5}
            opacity={0.6}
            dashArray="10 10"
          />

          <Marker position={routeCoordinates[0]} icon={pickupIcon}>
            <Popup>Pickup: Embu Town</Popup>
          </Marker>

          <Marker position={driverPos} icon={driverIcon}>
            <Popup>
              <strong>Driver: Sarah Jenkins</strong>
              <br />
              <span className="text-xs text-slate-500">
                Last updated: Just now
              </span>
            </Popup>
          </Marker>

          <Marker
            position={routeCoordinates.at(-1)!}
            icon={destinationIcon}
          >
            <Popup>Destination: Outskirts toward Runyenjes</Popup>
          </Marker>

          <RecenterMap coords={driverPos} />
        </MapContainer>
      </div>

      {/* Footer */}
      <div className="grid gap-6 border-t border-slate-100 bg-white p-6 md:grid-cols-3">
        <div className="flex gap-4">
          <div className="rounded-xl bg-indigo-100 p-3 text-indigo-600">
            <MapIcon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400">
              Route
            </p>
            <p className="text-sm font-bold">Embu Town → Outskirts toward Runyenjes</p>
            <p className="text-xs text-slate-500">via Embu Level 5 Hospital</p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="rounded-xl bg-emerald-100 p-3 text-emerald-600">
            <MapPinIcon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400">
              Remaining
            </p>
            <p className="text-sm font-bold">{telemetry.distance}</p>
            <p className="text-xs text-slate-500">12% completed</p>
          </div>
        </div>

        <div className="flex items-center justify-end">
          <button className="flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-black">
            Full Manifest <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}