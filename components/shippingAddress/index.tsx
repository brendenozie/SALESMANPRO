import React, { useState, useCallback, useEffect, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import axios from "axios";
import debounce from "lodash.debounce";
import { MapPinIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useSession } from "next-auth/react";

const MapContainer: any = dynamic(() => import("react-leaflet").then((m) => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((m) => m.TileLayer), { ssr: false });
const Marker = dynamic<any>(() => import("react-leaflet").then((m) => m.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((m) => m.Popup), { ssr: false });
const Circle = dynamic<any>(() => import("react-leaflet").then((m) => m.Circle), { ssr: false });

const API_BASE = "https://nominatim.openstreetmap.org";
const API_ENDPOINT = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3000/api";

const LocationPicker: React.FC<{ onAddressSelect: (address: string, coords: { lat: number; lng: number }) => void }> = ({ onAddressSelect }) => {
  const { data: session, status } = useSession();
  const userId = session?.user?.id;

  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: 51.505, lng: -0.09 });
  const [loading, setLoading] = useState(false);
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [zoom, setZoom] = useState(6);
  const [address, setAddress] = useState("");
  const [radius, setRadius] = useState(500);
  const [savedAddress, setSavedAddress] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchSuggestions = async (query: string) => {
    if (!query) return setSuggestions([]);
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_BASE}/search`, {
        params: { q: query, format: "json", addressdetails: 1, limit: 5 },
      });
      setSuggestions(data);
    } catch (err) {
      console.error("Error fetching suggestions:", err);
    } finally {
      setLoading(false);
    }
  };

  const debouncedFetchSuggestions = useMemo(() => debounce(fetchSuggestions, 300), []);
  useEffect(() => () => debouncedFetchSuggestions.cancel(), [debouncedFetchSuggestions]);

  const fetchAddress = async (lat: number, lng: number) => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_BASE}/reverse`, {
        params: { format: "json", lat, lon: lng },
      });
      const display = data.display_name || "Unknown Location";
      setAddress(display);
      setSearchTerm(display);
      onAddressSelect(display, { lat, lng });
    } catch (err) {
      console.error("Error fetching address:", err);
    } finally {
      setLoading(false);
    }
  };

  const debouncedFetchAddress = useMemo(() => debounce(fetchAddress, 500), []);
  useEffect(() => () => debouncedFetchAddress.cancel(), [debouncedFetchAddress]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    debouncedFetchSuggestions(e.target.value);
  };

  const handleMapClick = (e: any) => {
    const { lat, lng } = e.latlng;
    setSelectedLocation({ lat, lng });
    setMapCenter({ lat, lng });
    fetchAddress(lat, lng);
  };

  const handleSuggestionSelect = (suggestion: any) => {
    const lat = parseFloat(suggestion.lat);
    const lng = parseFloat(suggestion.lon);
    setSelectedLocation({ lat, lng });
    setMapCenter({ lat, lng });
    setSearchTerm(suggestion.display_name);
    setSuggestions([]);
    onAddressSelect(suggestion.display_name, { lat, lng });
  };

  const handleSaveAddress = async () => {
    if (!userId || !selectedLocation) return;
    try {
      const payload = { userId, latitude: selectedLocation.lat, longitude: selectedLocation.lng, address, description:address };
      const response = await axios.post(`${API_ENDPOINT}/shop/setLocation`, payload);
      console.log("Save address response:", response.data);
      setSavedAddress(response.data.body || payload);
    } catch (err) {
      console.error("Error saving address:", err);
      setError("Failed to save address.");
    }
  };

  const handleDeleteAddress = async () => {
    if (!userId) return;
    try {
      await axios.delete(`${API_ENDPOINT}/shop/deleteLocation`, { params: { userId } });
      setSavedAddress(null);
      setSelectedLocation(null);
      setAddress("");
    } catch (err) {
      console.error("Error deleting address:", err);
      setError("Failed to delete address.");
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
      () => setFetchingLocation(false)
    );
  };

  const fetchSavedAddress = async () => {
    if (!userId) return;
    try {
      const { data } = await axios.get(`${API_ENDPOINT}/shop/getLocation`, { params: { userId } });
      console.log("Fetch saved address response:", data);
      if (data.body && data.body.address) {
        const addr = data.body;
        setSavedAddress(addr);
        setMapCenter({ lat: addr.latitude, lng: addr.longitude });
        setSelectedLocation({ lat: addr.latitude, lng: addr.longitude });
        setZoom(15);
        fetchAddress(addr.latitude, addr.longitude);
      } else {
        handleUseMyLocation();
      }
    } catch (err) {
      console.error("Error fetching saved address:", err);
      handleUseMyLocation();
    }
  };

  useEffect(() => {
    if (status === "authenticated") fetchSavedAddress();
  }, [status]);

  const MapUpdater = dynamic(
    () => import("react-leaflet").then((m) => ({
      default: function ({ }) {
        const { useMap } = m;
        const map = useMap();
        useEffect(() => {
          map.setView(mapCenter, zoom);
        }, [mapCenter, zoom, map]);
        return null;
      },
    })),
    { ssr: false }
  );

  const MapDragHandler = dynamic(
    () => import("react-leaflet").then((m) => ({
      default: function () {
        const { useMapEvents } = m;
        useMapEvents({
          move: (e: any) => {
            const center = e.target.getCenter();
            setMapCenter({ lat: center.lat, lng: center.lng });
          },
          moveend: (e: any) => {
            const center = e.target.getCenter();
            setSelectedLocation({ lat: center.lat, lng: center.lng });
            debouncedFetchAddress(center.lat, center.lng);
          },
        });
        return null;
      },
    })),
    { ssr: false }
  );

  const handleMarkerDragEnd = (event: any) => {
    const position = event.target.getLatLng();
    setSelectedLocation(position);
    setMapCenter(position);
    debouncedFetchAddress(position.lat, position.lng);
  };

  const isInitialized = useRef(false);
  useEffect(() => {
    isInitialized.current = true;
    return () => {
      isInitialized.current = false;
    };
  }, []);
  if (!isInitialized) return null;

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
            {suggestions.map((s, idx) => (
              <li key={idx} onClick={() => handleSuggestionSelect(s)} className="p-2 cursor-pointer hover:bg-gray-100">
                {s.display_name}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-4 h-96 w-full rounded-lg overflow-hidden">
        <MapContainer center={[mapCenter.lat, mapCenter.lng]} zoom={zoom} style={{ height: "100%", width: "100%" }} onClick={handleMapClick}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapUpdater {...({} as any)} />
          <MapDragHandler />
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

      {error && <p className="text-red-500 mt-2">{error}</p>}
      <button onClick={handleUseMyLocation} className="w-full bg-blue-500 text-white py-2 rounded-md mt-4 hover:bg-blue-600">
        {fetchingLocation ? "Fetching location..." : "Use My Location"}
      </button>
      <button onClick={handleSaveAddress} className="w-full bg-yellow-500 text-white py-2 rounded-md mt-4 hover:bg-yellow-600">
        Save Address
      </button>
      {savedAddress && (
        <button onClick={handleDeleteAddress} className="w-full bg-red-500 text-white py-2 rounded-md mt-2 hover:bg-red-600">
          Delete Saved Address
        </button>
      )}
    </div>
  );
};

export default LocationPicker;
