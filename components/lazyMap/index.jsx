import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import react-leaflet components (only on the client side)
const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(m => m.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(m => m.Popup), { ssr: false });
const useMap = dynamic(() => import('react-leaflet').then(m => m.useMap), { ssr: false });

import "leaflet/dist/leaflet.css";

const DEFAULT_LOCATION = { lat: 0, lng: 0 }; // Provide a safe fallback

const ResizeHandler = () => {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
  }, [map]);
  return null;
};

const LazyMap = ({ location = DEFAULT_LOCATION, locationName = 'Selected Location' }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <p>Loading map...</p>; // Prevent SSR issues

  return (
    <div className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] overflow-hidden">
      <MapContainer center={[location.lat, location.lng]} zoom={13} className="w-full h-full rounded-lg">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <ResizeHandler />
        {location?.lat && location?.lng && (
          <Marker position={[location.lat, location.lng]}>
            <Popup>{locationName}</Popup>
          </Marker>
        )}
      </MapContainer>

      {/* <MapContainer
        center={[location.lat, location.lng]}
        zoom={13}
        className="w-full h-full rounded-lg"
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {location?.lat && location?.lng && (
          <Marker position={[location.lat, location.lng]}>
            <Popup>{locationName}</Popup>
          </Marker>
        )} */}
      {/* </MapContainer> */}
    </div>
  );
};

export default LazyMap;
