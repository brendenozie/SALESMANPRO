import React, { useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import axios from "axios";
import debounce from "lodash.debounce";
import { ArrowsUpDownIcon, MapPinIcon, XMarkIcon } from "@heroicons/react/24/outline";

import {  Circle, } from "react-leaflet";

// Dynamic imports for react-leaflet
const MapContainer = dynamic(() => import("react-leaflet").then((m) => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((m) => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((m) => m.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((m) => m.Popup), { ssr: false });

const LocationPicker = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 51.505, lng: -0.09 });
  const [loading, setLoading] = useState(false);
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [zoom, setZoom] = useState(6);
  const [radius, setRadius] = useState(500);
  const [autoDetectedCountry, setAutoDetectedCountry] = useState("");
  
  const [address, setAddress] = useState("");

  // Fetch suggestions
  const fetchSuggestions = async (query) => {
    if (!query) {
      setSuggestions([]);
      return;
    }
    try {
      setLoading(true);
      const { data } = await axios.get("https://nominatim.openstreetmap.org/search", {
        params: { q: query, format: "json", addressdetails: 1, limit: 5 },
      });
      setSuggestions(data);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAddress = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await res.json();
      setAddress(data.display_name || "Unknown Location");
    } catch (error) {
      console.error("Error fetching address", error);
    }
  };

  // Debounced API call
  const debouncedFetchSuggestions = useCallback(debounce(fetchSuggestions, 300), []);

  useEffect(() => {
    return () => debouncedFetchSuggestions.cancel();
  }, [debouncedFetchSuggestions]);

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedFetchSuggestions(value);
  };

  const handleMapClick = (e) => {
    const { lat, lng } = e.latlng;
    setSelectedLocation({ lat, lng });
    setMapCenter({ lat, lng });
    fetchAddress(lat, lng);
  };

  // Handle location selection
  const handleSuggestionSelect = (suggestion) => {
    const lat = parseFloat(suggestion.lat);
    const lng = parseFloat(suggestion.lon);
    setSelectedLocation({ lat, lng });
    setMapCenter({ lat, lng });
    setSearchTerm(suggestion.display_name);
    setSuggestions([]);
  };

  // Handle clearing search
  const handleClear = () => {
    setSearchTerm("");
    setSuggestions([]);
  };

  const handleMarkerDragEnd = (event) => {
    const marker = event.target;
    const position = marker.getLatLng();
    setSelectedLocation({ lat: position.lat, lng: position.lng });
    setMapCenter({ lat: position.lat, lng: position.lng });
    fetchAddress(position.lat, position.lng);
  };

  // Handle "Use My Location"
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) return alert("Geolocation is not supported by your browser.");
    
    setFetchingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setSelectedLocation({ lat: latitude, lng: longitude });
        setMapCenter({ lat: latitude, lng: longitude });
        setFetchingLocation(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        setFetchingLocation(false);
      }
    );
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setMapCenter({ lat: latitude, lng: longitude });
          setSelectedLocation({ lat: latitude, lng: longitude });
          setZoom(15);
          fetchAddress(latitude, longitude);
        },
        (error) => {
          console.error("Error retrieving location", error);
          alert("Unable to retrieve your location");
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      alert("Geolocation is not supported by your browser");
    }
  };

  useEffect(() => {
    fetch("https://ipapi.co/json/")
      .then((res) => res.json())
      .then((data) => setAutoDetectedCountry(data.country_name));

    getCurrentLocation(); // Auto-fetch location on mount
  }, []);

  const MapClickHandler = dynamic(
        () => import("react-leaflet").then((m) => ({
          default: function ({ onMapClick }) {
            const { useMapEvents } = m;
            if (!useMapEvents) return null;
            useMapEvents({
              click: (e) => {
                onMapClick(e);
              },
            });
            return null;
          },
        })),
        { ssr: false }
  );

  const MapUpdater = dynamic(
        () => import("react-leaflet").then((m) => ({
          default: function ({ onMapClick }) {
            const { useMap } = m;
            if (!useMap) return null;
            const map = useMap();
            useEffect(() => {
              map.setView(mapCenter, zoom);
            }, [mapCenter, zoom, map]);
            return null;
          },
        })),
        { ssr: false }
  );

  return (
    <div className="max-w-lg mx-auto p-4 bg-white shadow-md rounded-lg">
      {/* Search Input */}
      <div className="relative mb-4">
        <div className="flex items-center border rounded-md px-3 py-2 bg-gray-100">
          <MapPinIcon className="text-gray-500 mr-2 w-8 h-8" size={18} />
          <input
            type="text"
            placeholder={`Search for a location... (Default: ${autoDetectedCountry})`}
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full bg-transparent outline-none text-gray-800"
          />
          {searchTerm && (
            <button onClick={handleClear} className="text-gray-500 hover:text-gray-700">
              <XMarkIcon size={16} />
            </button>
          )}
        </div>

        {loading && <div className="text-sm text-gray-500 mt-2 flex items-center"><ArrowsUpDownIcon size={16} className="animate-spin mr-2 w-8 h-8" /> Searching...</div>}

        {suggestions.length > 0 && (
          <ul className="relative left-0 right-0 mt-2 bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto z-10">
            {suggestions.map((s, index) => (
              <li
                key={index}
                onClick={() => handleSuggestionSelect(s)}
                className="px-3 py-2 flex items-center cursor-pointer hover:bg-gray-100"
              >
                <MapPinIcon className="text-gray-500 mr-2 w-8 h-8" size={16} />
                {s.display_name}
              </li>
            ))}
          </ul>
        )}
      </div>
        
      {/* Map Container */}
      <div className="mt-4 h-96 w-full rounded-lg overflow-hidden">
        <MapContainer
          center={[mapCenter.lat, mapCenter.lng]}
          zoom={zoom}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapUpdater />
          <MapClickHandler onMapClick={handleMapClick} />
          {selectedLocation && (
            <>
              <Marker
                position={[selectedLocation.lat, selectedLocation.lng]}
                draggable={true}
                eventHandlers={{ dragend: handleMarkerDragEnd }}
              >
                <Popup>
                  {address ||
                    `Lat: ${selectedLocation.lat.toFixed(
                      4
                    )}, Lng: ${selectedLocation.lng.toFixed(4)}`}
                </Popup>
              </Marker>
              <Circle
                center={[selectedLocation.lat, selectedLocation.lng]}
                radius={radius}
                fillOpacity={0.1}
              />
            </>
          )}
        </MapContainer>
      </div>    

      {/* Use Current Location */}
      <button
        onClick={handleUseMyLocation}
        className="w-full flex items-center justify-center bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition"
      >
        {fetchingLocation ? <ArrowsUpDownIcon className="animate-spin mr-2 w-8 h-8" size={16} /> : <XMarkIcon className="mr-2 w-8 h-8" size={16} />}
        Use My Location
      </button>
      {selectedLocation && (
        <div className="flex gap-2 mt-2">
          <button 
            onClick={() => console.log(selectedLocation)} 
            className="flex-1 p-2 bg-yellow-500 text-white rounded-md"
          >
            ✅ Save Location as Address
          </button>
        </div>
      )}
    </div>
  );
};

export default dynamic(() => Promise.resolve(LocationPicker), { ssr: false });
