// MemoizedMap.js
"use client";

import React, { memo, useEffect } from "react";
import { useMap, useMapEvents } from "react-leaflet";
import dynamic from "next/dynamic";


const MapContainer: any = dynamic(() => import("react-leaflet").then((m) => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((m) => m.TileLayer), { ssr: false });
const Marker = dynamic<any>(() => import("react-leaflet").then((m) => m.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((m) => m.Popup), { ssr: false });
const Circle = dynamic<any>(() => import("react-leaflet").then((m) => m.Circle), { ssr: false });

// Child component to update map view
const MapUpdater = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

// Child component to handle map events
const MapEventsHandler = ({ onMapClick, onDragEnd }) => {
  useMapEvents({
    click: onMapClick,
    moveend: (e) => onDragEnd(e.target.getCenter()),
  });
  return null;
};

const MapComponent = ({
  mapCenter,
  zoom,
  selectedLocation,
  radius,
  address,
  handleMapClick,
  handleMarkerDragEnd,
  handleMapDragEnd,
}) => {
  return (
    <MapContainer center={[mapCenter.lat, mapCenter.lng]} zoom={zoom} style={{ height: "100%", width: "100%" }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' />
      <MapUpdater center={mapCenter} zoom={zoom} />
      <MapEventsHandler onMapClick={handleMapClick} onDragEnd={handleMapDragEnd} />
      {selectedLocation && (
        <>
          <Marker position={[selectedLocation.lat, selectedLocation.lng]} draggable={true} eventHandlers={{ dragend: handleMarkerDragEnd }}>
            <Popup>{address}</Popup>
          </Marker>
          <Circle center={[selectedLocation.lat, selectedLocation.lng]} radius={radius} fillOpacity={0.1} />
        </>
      )}
    </MapContainer>
  );
};

// Memoize the component to prevent re-renders
export default memo(MapComponent);