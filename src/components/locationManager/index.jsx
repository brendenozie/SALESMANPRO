"use client";

import React, { useState, useEffect, useRef, lazy, Suspense } from "react";
import { MapPinIcon, XMarkIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import usePlacesAutocomplete, { getGeocode, getLatLng } from "use-places-autocomplete";
import { useStateContext } from "../../contexts/ContextProvider";

// Lazy loading the entire map component instead of individual elements
const LazyMap = lazy(() => import("../lazyMap")); 

const LocationModal = () => {
  const { isOpen, onClose, onUpdate } = useStateContext();
  const [location, setLocation] = useState(null);
  const [locationName, setLocationName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { ready, value, setValue, suggestions, clearSuggestions } = usePlacesAutocomplete({ debounce: 300 });
  const [mapKey, setMapKey] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setMapKey((prevKey) => prevKey + 1); // Forces re-render when modal opens
    }
  }, [isOpen]);


  useEffect(() => {
    const lastLocation = localStorage.getItem("lastLocation");
    if (lastLocation) setLocationName(lastLocation);
  }, []);

  const detectLocation = () => {
    setIsLoading(true);
    setError(null);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
          await fetchLocationName(latitude, longitude);
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
      localStorage.setItem("lastLocation", name);
    } catch {
      setError("Failed to fetch location name. Please try again.");
    }
  };

  const handleSelectSuggestion = async (description) => {
    setValue(description, false);
    clearSuggestions();
    try {
      const results = await getGeocode({ address: description });
      const { lat, lng } = getLatLng(results[0]);
      setLocation({ latitude: lat, longitude: lng });
      setLocationName(description);
    } catch {
      setError("Failed to get location coordinates.");
    }
  };

  return (
    isOpen && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-full max-w-lg relative">
          <button className="absolute top-3 right-3 text-gray-600 dark:text-gray-200" onClick={onClose}>
            <XMarkIcon className="w-6 h-6" />
          </button>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Set Your Location</h2>
          <div className="space-y-4">
            <button
              onClick={detectLocation}
              disabled={isLoading}
              className="w-full flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg"
            >
              {isLoading ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : <MapPinIcon className="w-5 h-5" />}
              Detect Location
            </button>
            {error && <p className="text-red-500 text-sm">{error}</p>}

            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Enter location manually"
              className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-300"
            />
            {suggestions.status === "OK" && (
              <ul className="bg-white border rounded-lg shadow-md mt-1">
                {suggestions.data.map((suggestion) => (
                  <li
                    key={suggestion.place_id}
                    onClick={() => handleSelectSuggestion(suggestion.description)}
                    className="cursor-pointer px-3 py-2 hover:bg-gray-100"
                  >
                    {suggestion.description}
                  </li>
                ))}
              </ul>
            )}

            {/* {location && (
              <Suspense fallback={<p>Loading map...</p>}>
                <LazyMap location={location} locationName={locationName} />
              </Suspense>
            )} */}
            {location && (
              <Suspense fallback={<p>Loading map...</p>}>
                <LazyMap key={mapKey} location={location} locationName={locationName} />
              </Suspense>
            )}


            <button
              onClick={() => onUpdate(locationName)}
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
            >
              Confirm Location
            </button>
          </div>
        </div>
      </div>
    )
  );
};

export default LocationModal;
