'use client';

import React, { useState, useMemo, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import axios from "axios";
import debounce from "lodash.debounce";
import { 
  MapPinIcon, 
  XMarkIcon, 
  MagnifyingGlassIcon,
  BookmarkSquareIcon,
  ViewfinderCircleIcon,
  UserIcon,
  PhoneIcon
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";

const MapContainer: any = dynamic(() => import("react-leaflet").then((m) => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((m) => m.TileLayer), { ssr: false });
const Marker = dynamic<any>(() => import("react-leaflet").then((m) => m.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((m) => m.Popup), { ssr: false });
const Circle = dynamic<any>(() => import("react-leaflet").then((m) => m.Circle), { ssr: false });

const API_BASE = "https://nominatim.openstreetmap.org";

export interface SavedAddress {
  id?: string;
  address: string;
  lat: number;
  lng: number;
  contactName?: string;
  contactPhone?: string;
}

const LocationPicker: React.FC<{ onAddressSave: (location: SavedAddress) => void }> = ({ onAddressSave }) => {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: -1.286389, lng: 36.817223 }); // Default Nairobi
  const [loading, setLoading] = useState(false);
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [zoom, setZoom] = useState(13);
  const [address, setAddress] = useState("");
  
  // New Contact Info State
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  const [feedback, setFeedback] = useState<{ type: 'error' | 'success', message: string } | null>(null);

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
    setZoom(16);
    fetchAddress(lat, lng);
  };

  const showFeedback = (type: 'error' | 'success', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleSaveAddress = async () => {
    if (!userId || !selectedLocation) {
        showFeedback('error', 'Missing location or user session.');
        return;
    }
    try {
      const payload = { 
        userId, 
        latitude: selectedLocation.lat, 
        longitude: selectedLocation.lng, 
        address, 
        description: address,
        contactName,
        contactPhone
      };
      // Save endpoint for your database
      const response = await axios.post(`/api/shop/setLocation`, payload);
      
      showFeedback('success', 'Location saved successfully!');
      
      // Pass the fully constructed object back up to the parent accordion
      onAddressSave({
        id: response.data.body?.id || Math.random().toString(), // fallback if API doesn't return ID immediately
        address,
        lat: selectedLocation.lat,
        lng: selectedLocation.lng,
        contactName,
        contactPhone
      });

    } catch (err) {
      console.error("Error saving address:", err);
      showFeedback('error', 'Failed to save address.');
    }
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      showFeedback('error', 'Geolocation is not supported by your browser.');
      return;
    }
    setFetchingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setSelectedLocation({ lat: latitude, lng: longitude });
        setMapCenter({ lat: latitude, lng: longitude });
        setZoom(16);
        fetchAddress(latitude, longitude);
        setFetchingLocation(false);
      },
      () => {
        setFetchingLocation(false);
        showFeedback('error', 'Unable to retrieve your location.');
      }
    );
  };

  // Fixed MapUpdater
  const MapUpdater = dynamic(
    () => import("react-leaflet").then((m) => ({
      default: function () {
        const { useMap } = m;
        const map = useMap();
        useEffect(() => {
          map.setView(mapCenter, zoom);
        }, [map]); // Rely entirely on mapCenter/zoom state changes
        return null;
      },
    })), { ssr: false }
  );

  // Fix dragging by isolating marker drag event instead of map panning
  const handleMarkerDragEnd = (event: any) => {
    const position = event.target.getLatLng();
    setSelectedLocation({ lat: position.lat, lng: position.lng });
    setMapCenter({ lat: position.lat, lng: position.lng });
    debouncedFetchAddress(position.lat, position.lng);
  };

  const isInitialized = useRef(false);
  useEffect(() => {
    isInitialized.current = true;
    return () => { isInitialized.current = false; };
  }, []);

  if (!isInitialized) return null;

  return (
    <div className="w-full bg-white dark:bg-gray-900 shadow-xl dark:shadow-black/60 rounded-3xl border border-gray-100 dark:border-gray-800 p-5 sm:p-8">
      
      {/* Search Bar */}
      <div className="relative z-[1000] mb-6">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 ml-1">
          Search Address
        </label>
        <div className="relative flex items-center bg-gray-50 dark:bg-gray-800 rounded-2xl px-4 py-3 border border-transparent focus-within:border-indigo-500/50 focus-within:bg-white dark:focus-within:bg-gray-900 transition-all shadow-sm">
          {loading ? (
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <MagnifyingGlassIcon className="text-gray-400 mr-3 w-5 h-5" />
          )}
          <input
            type="text"
            placeholder="Enter street, building, or area..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full bg-transparent outline-none text-gray-800 dark:text-gray-100 placeholder-gray-400 text-base"
          />
          {searchTerm && (
            <button 
              onClick={() => { setSearchTerm(""); setSuggestions([]); }} 
              className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors ml-2"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Suggestions Dropdown */}
        <AnimatePresence>
          {suggestions.length > 0 && (
            <motion.ul 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-100 rounded-2xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto"
            >
              {suggestions.map((s, idx) => (
                <li 
                  key={idx} 
                  onClick={() => handleSuggestionSelect(s)} 
                  className="px-5 py-3.5 cursor-pointer text-sm text-gray-700 hover:bg-indigo-50 border-b border-gray-50 last:border-0 flex items-start gap-3"
                >
                  <MapPinIcon className="w-5 h-5 flex-shrink-0 mt-0.5 opacity-60" />
                  <span>{s.display_name}</span>
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>

      {/* Map */}
      <div className="relative h-[300px] w-full rounded-2xl overflow-hidden border border-gray-200 z-0 mb-6">
        <MapContainer center={[mapCenter.lat, mapCenter.lng]} zoom={zoom} zoomControl={false} style={{ height: "100%", width: "100%", zIndex: 1 }} onClick={handleMapClick}>
          <TileLayer 
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            attribution='&copy; OSM'
          />
          <MapUpdater />
          {selectedLocation && (
            <>
              <Marker position={[selectedLocation.lat, selectedLocation.lng]} draggable eventHandlers={{ dragend: handleMarkerDragEnd }}>
                <Popup className="rounded-lg shadow-lg">
                  <div className="font-medium p-1 text-sm">{address}</div>
                </Popup>
              </Marker>
              <Circle 
                center={[selectedLocation.lat, selectedLocation.lng]} 
                radius={250} 
                pathOptions={{ fillColor: '#6366f1', color: '#4f46e5', weight: 1 }}
                fillOpacity={0.15} 
              />
            </>
          )}
        </MapContainer>
        
        <button 
          onClick={handleUseMyLocation} 
          disabled={fetchingLocation}
          className="absolute bottom-4 right-4 z-[400] bg-white p-3 rounded-full shadow-lg border border-gray-100 text-gray-700 hover:text-indigo-600 transition-all disabled:opacity-70"
          title="Use current location"
        >
          <ViewfinderCircleIcon className={`w-6 h-6 ${fetchingLocation ? 'animate-pulse text-indigo-500' : ''}`} />
        </button>
      </div>

      {/* Contact Info Form */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
            <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="E.g. Jane Doe"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                />
            </div>
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <div className="relative">
                <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input 
                    type="tel" 
                    placeholder="E.g. +254 700 000000"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                />
            </div>
        </div>
      </div>

      {/* Action */}
      <button 
        onClick={handleSaveAddress} 
        disabled={!selectedLocation || !contactName || !contactPhone}
        className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 px-4 rounded-xl font-medium shadow-md transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <BookmarkSquareIcon className="w-5 h-5" />
        Save & Use This Location
      </button>

      {/* Toast Feedback */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`mt-4 p-4 rounded-xl text-sm font-medium flex items-center justify-center
              ${feedback.type === 'error' 
                ? 'bg-red-50 text-red-600 border border-red-100' 
                : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}
          >
            {feedback.message}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default LocationPicker;