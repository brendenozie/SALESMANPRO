import React, { useRef, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";

const MapUpdater = ({ location }) => {
  const map = useMap();

  useEffect(() => {
  map.setView([location.latitude, location.longitude], 13);
  setTimeout(() => {
    if (map) {
      map.invalidateSize();
    }
  }, 100); // Reduce delay for better responsiveness
}, [location, map]);

7
  // useEffect(() => {
  //   map.setView([location.latitude, location.longitude], 13);
  //   setTimeout(() => {
  //     map.invalidateSize(); // Ensures full tile rendering
  //   }, 500);
  // }, [location, map]);

  return null;
};

const LazyMap = ({ location, locationName }) => {
  const mapRef = useRef(null);

  return (
    <div className="w-full h-[300px] sm:h-[400px] md:h-[500px]"> {/* Ensure container has a defined height */}
      <MapContainer
        center={[location.latitude, location.longitude]}
        zoom={13}
        className="w-full h-full rounded-lg"
        whenCreated={(map) => {
          mapRef.current = map;
          setTimeout(() => map.invalidateSize(), 500); // Fixes rendering issue
        }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={[location.latitude, location.longitude]}>
          <Popup>{locationName}</Popup>
        </Marker>
        <MapUpdater location={location} />
      </MapContainer>
    </div>
  );
};

export default LazyMap;
