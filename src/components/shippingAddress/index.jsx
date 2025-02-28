import React, { useState, useCallback, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import axios from "axios";
import debounce from "lodash.debounce";
import { ArrowsUpDownIcon, MapPinIcon, XMarkIcon } from "@heroicons/react/24/outline";

// Import leaflet only on the client side
const isClient = typeof window !== "undefined";
const L = isClient ? require("leaflet") : null;

// Dynamic imports for react-leaflet
const MapContainer = dynamic(() => import("react-leaflet").then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(m => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(m => m.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then(m => m.Popup), { ssr: false });
const Circle = dynamic(() => import("react-leaflet").then(m => m.Circle), { ssr: false });

const API_BASE = "https://nominatim.openstreetmap.org";
const API_ENDPOINT = "http://127.0.0.1:3000/api";

const LocationPicker = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 51.505, lng: -0.09 });
  const [loading, setLoading] = useState(false);
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [zoom, setZoom] = useState(6);
  const [radius, setRadius] = useState(500);
  const [address, setAddress] = useState("");
  const [savedAddress, setSavedAddress] = useState(null);
  
  const fetchSuggestions = async (query) => {
    if (!query) return setSuggestions([]);
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_BASE}/search`, {
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
      const { data } = await axios.get(`${API_ENDPOINT}/shop/getLocation?userId=123`, {
        params: { format: "json", lat, lon: lng },
      });
      setAddress(data.display_name || "Unknown Location");
    } catch (error) {
      console.error("Error fetching address:", error);
    }
  };

  const debouncedFetchSuggestions = useMemo(() => debounce(fetchSuggestions, 300), []);
  useEffect(() => () => debouncedFetchSuggestions.cancel(), [debouncedFetchSuggestions]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    debouncedFetchSuggestions(e.target.value);
  };

  const handleMapClick = (e) => {
    const { lat, lng } = e.latlng;
    setSelectedLocation({ lat, lng });
    setMapCenter({ lat, lng });
    fetchAddress(lat, lng);
  };

  const handleSuggestionSelect = (suggestion) => {
    const lat = parseFloat(suggestion.lat);
    const lng = parseFloat(suggestion.lon);
    setSelectedLocation({ lat, lng });
    setMapCenter({ lat, lng });
    setSearchTerm(suggestion.display_name);
    setSuggestions([]);
  };

  const handleMarkerDragEnd = (event) => {
    const position = event.target.getLatLng();
    setSelectedLocation(position);
    setMapCenter(position);
    fetchAddress(position.lat, position.lng);
  };

    const handleSaveAddress = async () => {
    try {
      const payload = { userId: "123", latitude: selectedLocation.lat, longitude: selectedLocation.lng, address };
      await axios.post(`${API_ENDPOINT}/setLocation`, payload);
      setSavedAddress(payload);
    } catch (error) {
      console.error("Error saving address:", error);
    }
  };

  const handleDeleteAddress = async () => {
    try {
      await axios.delete(`${API_ENDPOINT}/deleteLocation?userId=123`);
      setSavedAddress(null);
      setSelectedLocation(null);
      setAddress("");
    } catch (error) {
      console.error("Error deleting address:", error);
    }
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) return alert("Geolocation is not supported by your browser.");
    setFetchingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setSelectedLocation({ lat: latitude, lng: longitude });
        setMapCenter({ lat: latitude, lng: longitude });
        setZoom(15);
        fetchAddress(latitude, longitude);
        setFetchingLocation(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        setFetchingLocation(false);
      }
    );
  };

  useEffect(() => {
    fetchSavedAddress();
  }, []);

  const fetchSavedAddress = async () => {
    try {
      const { data } = await axios.get(`${API_ENDPOINT}/shop/location/get`);
      if (data && data.address) {
        setSavedAddress(data);
        setMapCenter({ lat: data.latitude, lng: data.longitude });
        setSelectedLocation({ lat: data.latitude, lng: data.longitude });
        setAddress(data.address);
      }else{
        handleUseMyLocation();
      }
    } catch (error) {
      console.error("Error fetching saved address:", error);
      handleUseMyLocation();
    }
  };

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
      <div className="relative mb-4">
        <div className="flex items-center border rounded-md px-3 py-2 bg-gray-100">
          <MapPinIcon className="text-gray-500 mr-2 w-6 h-6" />
          <input
            type="text"
            placeholder="Search for a location..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full bg-transparent outline-none text-gray-800"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm("")} className="text-gray-500 hover:text-gray-700">
              <XMarkIcon className="w-5 h-5" />
            </button>
          )}
        </div>
        {loading && <p className="text-sm text-gray-500 mt-2">Searching...</p>}
        {suggestions.length > 0 && (
          <ul className="relative bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto w-full z-10">
            {suggestions.map((s, index) => (
              <li key={index} onClick={() => handleSuggestionSelect(s)} className="p-2 cursor-pointer hover:bg-gray-100">
                {s.display_name}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="mt-4 h-96 w-full rounded-lg overflow-hidden">
        <MapContainer center={[mapCenter.lat, mapCenter.lng]} zoom={zoom} style={{ height: "100%", width: "100%" }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapUpdater onMapClick={handleMapClick}/>
          {selectedLocation && (
            <>
              <Marker position={[selectedLocation.lat, selectedLocation.lng]} draggable eventHandlers={{ dragend: handleMarkerDragEnd }}>
                <Popup>{address}</Popup>
              </Marker>
              <Circle center={[selectedLocation.lat, selectedLocation.lng]} radius={radius} fillOpacity={0.1} />
            </>
          )}
        </MapContainer>
      </div>
      <button onClick={handleUseMyLocation} className="w-full bg-blue-500 text-white py-2 rounded-md mt-4 hover:bg-blue-600">
        {fetchingLocation ? "Fetching location..." : "Use My Location"}
      </button>
      <button onClick={handleSaveAddress} className="w-full bg-yellow-500 text-white py-2 rounded-md mt-4 hover:bg-yellow-600">
        Save Address
      </button>
    </div>
  );
};

export default dynamic(() => Promise.resolve(LocationPicker), { ssr: false });
