import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";

const MapUpdater = ({ location }) => {
  const map = useMap();

  useEffect(() => {
    // Center the map on the new location
    map.setView([location.latitude, location.longitude], 13);
    // Delay to allow the container to fully render
    setTimeout(() => map.invalidateSize(), 300); // Increased delay
  }, [location, map]);

  return null;
};

const ResizeHandler = () => {
  const map = useMap();

  useEffect(() => {
    const handleResize = () => {
      map.invalidateSize();
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [map]);

  return null;
};

const LazyMap = ({ location, locationName }) => {
  return (
    <div className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] overflow-hidden">
      <MapContainer
        center={[location.latitude, location.longitude]}
        zoom={13}
        className="w-full h-full rounded-lg"
        whenCreated={(map) => setTimeout(() => map.invalidateSize(), 300)} // Increased delay here too
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={[location.latitude, location.longitude]}>
          <Popup>{locationName}</Popup>
        </Marker>
        <MapUpdater location={location} />
        <ResizeHandler />
      </MapContainer>
    </div>
  );
};

export default LazyMap;
