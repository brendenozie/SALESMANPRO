'use client';

import React, { useState, useCallback, useEffect, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import axios from "axios";
import debounce from "lodash.debounce";
import { 
  MapPinIcon, 
  XMarkIcon, 
  MagnifyingGlassIcon,
  BookmarkSquareIcon,
  TrashIcon,
  ViewfinderCircleIcon
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
// Make sure to import leaflet CSS in your global styles or layout: 
// import 'leaflet/dist/leaflet.css';

const MapContainer: any = dynamic(() => import("react-leaflet").then((m) => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((m) => m.TileLayer), { ssr: false });
const Marker = dynamic<any>(() => import("react-leaflet").then((m) => m.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((m) => m.Popup), { ssr: false });
const Circle = dynamic<any>(() => import("react-leaflet").then((m) => m.Circle), { ssr: false });

const API_BASE = "https://nominatim.openstreetmap.org";
// const API_ENDPOINT = process.env.NEXT_PUBLIC_API_URL || "/api";

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
  
  // Status feedback
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

  const showFeedback = (type: 'error' | 'success', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleSaveAddress = async () => {
    if (!userId || !selectedLocation) return;
    try {
      const payload = {
        userId,
        name: "Delivery Address",
        latitude: selectedLocation.lat,
        longitude: selectedLocation.lng,
        address: address || searchTerm || "Selected Location",
        description: address || searchTerm,
      };
      const response = await axios.post(`/api/shop/setLocation`, payload);
      setSavedAddress(response.data.data || response.data.body || payload);
      showFeedback('success', 'Location saved successfully!');
    } catch (err) {
      console.error("Error saving address:", err);
      showFeedback('error', 'Failed to save address.');
    }
  };

  const handleDeleteAddress = async () => {
    if (!userId) return;
    try {
      await axios.delete(`/api/shop/deleteLocation`, { params: { userId } });
      setSavedAddress(null);
      setSelectedLocation(null);
      setAddress("");
      setSearchTerm("");
      showFeedback('success', 'Location deleted.');
    } catch (err) {
      console.error("Error deleting address:", err);
      showFeedback('error', 'Failed to delete address.');
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

  const fetchSavedAddress = async () => {
    if (!userId) return;
    try {
      const { data } = await axios.get(`/api/shop/getLocation`, { params: { userId }, headers: { "Credentials": "include" } });
      const addr = data.data || data.body;
      if (addr && addr.address) {
        setSavedAddress(addr);
        if (addr.latitude && addr.longitude) {
          setMapCenter({ lat: addr.latitude, lng: addr.longitude });
          setSelectedLocation({ lat: addr.latitude, lng: addr.longitude });
          setZoom(15);
        }
        setAddress(addr.address);
        setSearchTerm(addr.address);
      } else {
        handleUseMyLocation();
      }
    } catch (err) {
      handleUseMyLocation();
    }
  };

  useEffect(() => {
    if (status === "authenticated") fetchSavedAddress();
  }, [status]);

  // Dynamic Map Handlers
 // 1. Fixed MapUpdater: Removed flyTo animation to prevent event looping
  const MapUpdater = dynamic(
    () => import("react-leaflet").then((m) => ({
      default: function ({ }) {
        const { useMap } = m;
        const map = useMap();
        useEffect(() => {
          // Use setView instead of flyTo to prevent animation conflicts
          map.setView(mapCenter, zoom);
        }, [mapCenter, zoom, map]);
        return null;
      },
    })), { ssr: false }
  );

  // 2. Fixed MapDragHandler: Removed the 'move' event entirely
  const MapDragHandler = dynamic(
    () => import("react-leaflet").then((m) => ({
      default: function () {
        const { useMapEvents } = m;
        useMapEvents({
          // Only trigger state updates when the user FINISHES dragging
          moveend: (e: any) => {
            const center = e.target.getCenter();
            setSelectedLocation({ lat: center.lat, lng: center.lng });
            debouncedFetchAddress(center.lat, center.lng);
          },
        });
        return null;
      },
    })), { ssr: false }
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
    return () => { isInitialized.current = false; };
  }, []);

  if (!isInitialized) return null;

  return (
    <div className="w-full max-w-2xl mx-auto bg-white dark:bg-gray-900 shadow-xl dark:shadow-2xl dark:shadow-black/60 rounded-[2rem] border border-gray-100 dark:border-gray-800 p-5 sm:p-8 transition-colors">
      
      {/* Header & Search */}
      <div className="relative z-50 mb-6">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 ml-1">
          Find your location
        </label>
        <div className="relative flex items-center bg-gray-50 dark:bg-gray-800 rounded-2xl px-4 py-3 border border-transparent focus-within:border-indigo-500/50 focus-within:bg-white dark:focus-within:bg-gray-900 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all shadow-sm">
          {loading ? (
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <MagnifyingGlassIcon className="text-gray-400 dark:text-gray-500 mr-3 w-5 h-5" />
          )}
          <input
            type="text"
            placeholder="Search for an address or place..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full bg-transparent outline-none text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-base"
          />
          {searchTerm && (
            <button 
              onClick={() => { setSearchTerm(""); setSuggestions([]); }} 
              className="p-1 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ml-2"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Animated Suggestions Dropdown */}
        <AnimatePresence>
          {suggestions.length > 0 && (
            <motion.ul 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-2xl overflow-hidden z-[9999] max-h-60 overflow-y-auto custom-scrollbar"
            >
              {suggestions.map((s, idx) => (
                <li 
                  key={idx} 
                  onClick={() => handleSuggestionSelect(s)} 
                  className="px-5 py-3.5 cursor-pointer text-sm text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400 border-b border-gray-50 dark:border-gray-700/50 last:border-0 transition-colors flex items-start gap-3"
                >
                  <MapPinIcon className="w-5 h-5 flex-shrink-0 mt-0.5 opacity-60" />
                  <span>{s.display_name}</span>
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>

      {/* Map Container */}
      <div className="relative h-[350px] sm:h-[400px] w-full rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700/60 shadow-inner z-0">
        <MapContainer center={[mapCenter.lat, mapCenter.lng]} zoom={zoom} zoomControl={false} style={{ height: "100%", width: "100%", zIndex: 1 }} onClick={handleMapClick}>
          <TileLayer 
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          />
          <MapUpdater {...({} as any)} />
          <MapDragHandler />
          {selectedLocation && (
            <>
              <Marker position={[selectedLocation.lat, selectedLocation.lng]} draggable eventHandlers={{ dragend: handleMarkerDragEnd }}>
                <Popup className="rounded-lg shadow-lg">
                  <div className="font-medium p-1 text-sm">{address}</div>
                </Popup>
              </Marker>
              <Circle 
                center={[selectedLocation.lat, selectedLocation.lng]} 
                radius={radius} 
                pathOptions={{ fillColor: '#6366f1', color: '#4f46e5', weight: 1 }}
                fillOpacity={0.15} 
              />
            </>
          )}
        </MapContainer>
        
        {/* Floating Locator Button inside Map */}
        <button 
          onClick={handleUseMyLocation} 
          disabled={fetchingLocation}
          className="absolute bottom-4 right-4 z-[400] bg-white dark:bg-gray-800 p-3 rounded-full shadow-lg border border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:scale-105 active:scale-95 transition-all disabled:opacity-70"
          aria-label="Use my location"
        >
          <ViewfinderCircleIcon className={`w-6 h-6 ${fetchingLocation ? 'animate-pulse text-indigo-500' : ''}`} />
        </button>
      </div>

      {/* Action Controls */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <button 
          onClick={handleSaveAddress} 
          disabled={!selectedLocation}
          className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 px-4 rounded-xl font-medium shadow-md shadow-indigo-600/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <BookmarkSquareIcon className="w-5 h-5" />
          Save Address
        </button>
        
        {savedAddress && (
          <button 
            onClick={handleDeleteAddress} 
            className="flex-1 flex items-center justify-center gap-2 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 py-3.5 px-4 rounded-xl font-medium transition-all active:scale-[0.98]"
          >
            <TrashIcon className="w-5 h-5" />
            Remove Saved
          </button>
        )}
      </div>

      {/* Toast Feedback */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`mt-4 p-4 rounded-xl text-sm font-medium flex items-center justify-center
              ${feedback.type === 'error' 
                ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30' 
                : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30'}`}
          >
            {feedback.message}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default LocationPicker;
// import React, { useState, useCallback, useEffect, useMemo, useRef } from "react";
// import dynamic from "next/dynamic";
// import axios from "axios";
// import debounce from "lodash.debounce";
// import { MapPinIcon, XMarkIcon } from "@heroicons/react/24/outline";
// import { useSession } from "next-auth/react";

// const MapContainer: any = dynamic(() => import("react-leaflet").then((m) => m.MapContainer), { ssr: false });
// const TileLayer = dynamic(() => import("react-leaflet").then((m) => m.TileLayer), { ssr: false });
// const Marker = dynamic<any>(() => import("react-leaflet").then((m) => m.Marker), { ssr: false });
// const Popup = dynamic(() => import("react-leaflet").then((m) => m.Popup), { ssr: false });
// const Circle = dynamic<any>(() => import("react-leaflet").then((m) => m.Circle), { ssr: false });

// const API_BASE = "https://nominatim.openstreetmap.org";
// const API_ENDPOINT = process.env.NEXT_PUBLIC_API_URL || "/api";

// const LocationPicker: React.FC<{ onAddressSelect: (address: string, coords: { lat: number; lng: number }) => void }> = ({ onAddressSelect }) => {
//   const { data: session, status } = useSession();
//   const userId = session?.user?.id;

//   const [searchTerm, setSearchTerm] = useState("");
//   const [suggestions, setSuggestions] = useState<any[]>([]);
//   const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
//   const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: 51.505, lng: -0.09 });
//   const [loading, setLoading] = useState(false);
//   const [fetchingLocation, setFetchingLocation] = useState(false);
//   const [zoom, setZoom] = useState(6);
//   const [address, setAddress] = useState("");
//   const [radius, setRadius] = useState(500);
//   const [savedAddress, setSavedAddress] = useState<any>(null);
//   const [error, setError] = useState<string | null>(null);

//   const fetchSuggestions = async (query: string) => {
//     if (!query) return setSuggestions([]);
//     try {
//       setLoading(true);
//       const { data } = await axios.get(`${API_BASE}/search`, {
//         params: { q: query, format: "json", addressdetails: 1, limit: 5 },
//       });
//       setSuggestions(data);
//     } catch (err) {
//       console.error("Error fetching suggestions:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const debouncedFetchSuggestions = useMemo(() => debounce(fetchSuggestions, 300), []);
//   useEffect(() => () => debouncedFetchSuggestions.cancel(), [debouncedFetchSuggestions]);

//   const fetchAddress = async (lat: number, lng: number) => {
//     try {
//       setLoading(true);
//       const { data } = await axios.get(`${API_BASE}/reverse`, {
//         params: { format: "json", lat, lon: lng },
//       });
//       const display = data.display_name || "Unknown Location";
//       setAddress(display);
//       setSearchTerm(display);
//       onAddressSelect(display, { lat, lng });
//     } catch (err) {
//       console.error("Error fetching address:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const debouncedFetchAddress = useMemo(() => debounce(fetchAddress, 500), []);
//   useEffect(() => () => debouncedFetchAddress.cancel(), [debouncedFetchAddress]);

//   const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setSearchTerm(e.target.value);
//     debouncedFetchSuggestions(e.target.value);
//   };

//   const handleMapClick = (e: any) => {
//     const { lat, lng } = e.latlng;
//     setSelectedLocation({ lat, lng });
//     setMapCenter({ lat, lng });
//     fetchAddress(lat, lng);
//   };

//   const handleSuggestionSelect = (suggestion: any) => {
//     const lat = parseFloat(suggestion.lat);
//     const lng = parseFloat(suggestion.lon);
//     setSelectedLocation({ lat, lng });
//     setMapCenter({ lat, lng });
//     setSearchTerm(suggestion.display_name);
//     setSuggestions([]);
//     onAddressSelect(suggestion.display_name, { lat, lng });
//   };

//   const handleSaveAddress = async () => {
//     if (!userId || !selectedLocation) return;
//     try {
//       const payload = { userId, latitude: selectedLocation.lat, longitude: selectedLocation.lng, address, description:address };
//       const response = await axios.post(`${API_ENDPOINT}/shop/setLocation`, payload);
//       console.log("Save address response:", response.data);
//       setSavedAddress(response.data.body || payload);
//     } catch (err) {
//       console.error("Error saving address:", err);
//       setError("Failed to save address.");
//     }
//   };

//   const handleDeleteAddress = async () => {
//     if (!userId) return;
//     try {
//       await axios.delete(`${API_ENDPOINT}/shop/deleteLocation`, { params: { userId } });
//       setSavedAddress(null);
//       setSelectedLocation(null);
//       setAddress("");
//     } catch (err) {
//       console.error("Error deleting address:", err);
//       setError("Failed to delete address.");
//     }
//   };

//   const handleUseMyLocation = () => {
//     if (!navigator.geolocation) return alert("Geolocation is not supported by your browser.");
//     setFetchingLocation(true);
//     navigator.geolocation.getCurrentPosition(
//       (position) => {
//         const { latitude, longitude } = position.coords;
//         setSelectedLocation({ lat: latitude, lng: longitude });
//         setMapCenter({ lat: latitude, lng: longitude });
//         setZoom(15);
//         fetchAddress(latitude, longitude);
//         setFetchingLocation(false);
//       },
//       () => setFetchingLocation(false)
//     );
//   };

//   const fetchSavedAddress = async () => {
//     if (!userId) return;
//     try {
//       const { data } = await axios.get(`${API_ENDPOINT}/shop/getLocation`, { params: { userId } });
//       console.log("Fetch saved address response:", data);
//       if (data.body && data.body.address) {
//         const addr = data.body;
//         setSavedAddress(addr);
//         setMapCenter({ lat: addr.latitude, lng: addr.longitude });
//         setSelectedLocation({ lat: addr.latitude, lng: addr.longitude });
//         setZoom(15);
//         fetchAddress(addr.latitude, addr.longitude);
//       } else {
//         handleUseMyLocation();
//       }
//     } catch (err) {
//       console.error("Error fetching saved address:", err);
//       handleUseMyLocation();
//     }
//   };

//   useEffect(() => {
//     if (status === "authenticated") fetchSavedAddress();
//   }, [status]);

//   const MapUpdater = dynamic(
//     () => import("react-leaflet").then((m) => ({
//       default: function ({ }) {
//         const { useMap } = m;
//         const map = useMap();
//         useEffect(() => {
//           map.setView(mapCenter, zoom);
//         }, [mapCenter, zoom, map]);
//         return null;
//       },
//     })),
//     { ssr: false }
//   );

//   const MapDragHandler = dynamic(
//     () => import("react-leaflet").then((m) => ({
//       default: function () {
//         const { useMapEvents } = m;
//         useMapEvents({
//           move: (e: any) => {
//             const center = e.target.getCenter();
//             setMapCenter({ lat: center.lat, lng: center.lng });
//           },
//           moveend: (e: any) => {
//             const center = e.target.getCenter();
//             setSelectedLocation({ lat: center.lat, lng: center.lng });
//             debouncedFetchAddress(center.lat, center.lng);
//           },
//         });
//         return null;
//       },
//     })),
//     { ssr: false }
//   );

//   const handleMarkerDragEnd = (event: any) => {
//     const position = event.target.getLatLng();
//     setSelectedLocation(position);
//     setMapCenter(position);
//     debouncedFetchAddress(position.lat, position.lng);
//   };

//   const isInitialized = useRef(false);
//   useEffect(() => {
//     isInitialized.current = true;
//     return () => {
//       isInitialized.current = false;
//     };
//   }, []);
//   if (!isInitialized) return null;

//   return (
//     <div className="max-w-lg mx-auto p-4 bg-white shadow-md rounded-lg">
//       <div className="relative mb-4">
//         <div className="flex items-center border rounded-md px-3 py-2 bg-gray-100">
//           <MapPinIcon className="text-gray-500 mr-2 w-6 h-6" />
//           <input
//             type="text"
//             placeholder="Search for a location..."
//             value={searchTerm}
//             onChange={handleSearchChange}
//             className="w-full bg-transparent outline-none text-gray-800"
//           />
//           {searchTerm && (
//             <button onClick={() => setSearchTerm("")} className="text-gray-500 hover:text-gray-700">
//               <XMarkIcon className="w-5 h-5" />
//             </button>
//           )}
//         </div>
//         {loading && <p className="text-sm text-gray-500 mt-2">Searching...</p>}
//         {suggestions.length > 0 && (
//           <ul className="relative bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto w-full z-10">
//             {suggestions.map((s, idx) => (
//               <li key={idx} onClick={() => handleSuggestionSelect(s)} className="p-2 cursor-pointer hover:bg-gray-100">
//                 {s.display_name}
//               </li>
//             ))}
//           </ul>
//         )}
//       </div>

//       <div className="mt-4 h-96 w-full rounded-lg overflow-hidden">
//         <MapContainer center={[mapCenter.lat, mapCenter.lng]} zoom={zoom} style={{ height: "100%", width: "100%" }} onClick={handleMapClick}>
//           <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
//           <MapUpdater {...({} as any)} />
//           <MapDragHandler />
//           {selectedLocation && (
//             <>
//               <Marker position={[selectedLocation.lat, selectedLocation.lng]} draggable eventHandlers={{ dragend: handleMarkerDragEnd }}>
//                 <Popup>{address}</Popup>
//               </Marker>
//               <Circle center={[selectedLocation.lat, selectedLocation.lng]} radius={radius} fillOpacity={0.1} />
//             </>
//           )}
//         </MapContainer>
//       </div>

//       {error && <p className="text-red-500 mt-2">{error}</p>}
//       <button onClick={handleUseMyLocation} className="w-full bg-blue-500 text-white py-2 rounded-md mt-4 hover:bg-blue-600">
//         {fetchingLocation ? "Fetching location..." : "Use My Location"}
//       </button>
//       <button onClick={handleSaveAddress} className="w-full bg-yellow-500 text-white py-2 rounded-md mt-4 hover:bg-yellow-600">
//         Save Address
//       </button>
//       {savedAddress && (
//         <button onClick={handleDeleteAddress} className="w-full bg-red-500 text-white py-2 rounded-md mt-2 hover:bg-red-600">
//           Delete Saved Address
//         </button>
//       )}
//     </div>
//   );
// };

// export default LocationPicker;
