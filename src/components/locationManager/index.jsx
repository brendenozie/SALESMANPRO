"use client";

import React, { useState, useEffect, useRef, lazy } from "react";
import {
  CircleStackIcon,
  XMarkIcon,
  MapPinIcon
} from "@heroicons/react/24/outline";
import usePlacesAutocomplete, { getGeocode, getLatLng } from "use-places-autocomplete";
import { useStateContext } from "../../contexts/ContextProvider";


const MapContainer = lazy(() => import('react-leaflet').then(module => ({ default: module.MapContainer })));
const TileLayer = lazy(() => import('react-leaflet').then(module => ({ default: module.TileLayer })));
const Marker = lazy(() => import('react-leaflet').then(module => ({ default: module.Marker })));
const Popup = lazy(() => import('react-leaflet').then(module => ({ default: module.Popup })));

const LocationModal = () => {
  const { isOpen, setIsOpen, onClose, onUpdate } = useStateContext();
  const [location, setLocation] = useState(null);
  const [locationName, setLocationName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [manualLocation, setManualLocation] = useState("");
  const [recentLocations, setRecentLocations] = useState([]);
  const [weather, setWeather] = useState(null);
  const inputRef = useRef(null);
  
  useEffect(() => {
    if (window && typeof window !== "undefined") {
      const savedLocations = JSON.parse(localStorage.getItem("recentLocations")) || [];
      setRecentLocations(savedLocations);
      const lastLocation = localStorage.getItem("lastLocation");
      if (lastLocation) {
        setLocationName(lastLocation);
      }
    }
  }, []);

  const { ready, value, setValue, suggestions, clearSuggestions } = usePlacesAutocomplete({ debounce: 300 });

  const detectLocation = () => {
    setIsLoading(true);
    setError(null);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
          await fetchLocationName(latitude, longitude);
          fetchWeather(latitude, longitude);
          setIsLoading(false);
        },
        () => {
          setError("Location access denied. Please enter manually.");
          setIsLoading(false);
        },
        { enableHighAccuracy: true }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
      setIsLoading(false);
    }
  };

  const fetchLocationName = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
      );
      const data = await response.json();
      const name = data.city || data.locality || "Unknown location";
      setLocationName(name);
      saveRecentLocation(name);
    } catch (error) {
      setError("Failed to fetch location name. Enter manually.");
    }
  };

  const fetchWeather = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=YOUR_API_KEY`
      );
      const data = await response.json();
      setWeather(`${data.main.temp}°C, ${data.weather[0].description}`);
    } catch (error) {
      setWeather("Weather data unavailable");
    }
  };

  const saveRecentLocation = (name) => {
    const updatedLocations = [...new Set([name, ...recentLocations])].slice(0, 5);
    setRecentLocations(updatedLocations);
    localStorage.setItem("recentLocations", JSON.stringify(updatedLocations));
    localStorage.setItem("lastLocation", name);
  };

  return (
    isOpen && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md relative">
          <button className="absolute top-3 right-3 text-gray-600 dark:text-gray-200" onClick={() => setIsOpen(false)}>
            <XMarkIcon className="w-6 h-6" />
          </button>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Update Your Location</h2>
          <div className="flex flex-col gap-4">
            <button 
              className="w-full bg-blue-600 text-white py-2 rounded flex items-center justify-center gap-2 transition-all hover:bg-blue-700 disabled:opacity-50"
              onClick={detectLocation}
              disabled={isLoading}
            >
              {isLoading ? <CircleStackIcon className="w-6 h-6 animate-spin" /> : <MapPinIcon className="w-6 h-6" />} Detect Location
            </button>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <input 
              type="text" 
              ref={inputRef}
              className="border p-2 rounded w-full focus:ring focus:ring-blue-300"
              placeholder="Enter location manually or search"
              value={value} 
              onChange={(e) => setValue(e.target.value)}
            />
            <button 
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
              onClick={() => handleSelect(value)}
            >
              Submit
            </button>
            {recentLocations.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">Recent Locations</h3>
                <ul className="border rounded p-2 space-y-1">
                  {recentLocations.map((loc, index) => (
                    <li 
                      key={index} 
                      className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded flex justify-between items-center transition-all"
                      onClick={() => handleSelect(loc)}
                    >
                      {loc}
                      <MapPinIcon className="w-6 h-6 text-blue-500" />
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {location && (
              <MapContainer center={[location.latitude, location.longitude]} zoom={13} className="h-40 w-full">
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[location.latitude, location.longitude]}>
                  <Popup>{locationName} {weather && ` - ${weather}`}</Popup>
                </Marker>
              </MapContainer>
            )}
          </div>
        </div>
      </div>
    )
  );
};

export default LocationModal;
