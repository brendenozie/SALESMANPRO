"use client";

import React, { useState, useEffect, useRef, lazy, Suspense } from "react";
import { MapPinIcon, XMarkIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import usePlacesAutocomplete, { getGeocode, getLatLng } from "use-places-autocomplete";
import { useStateContext } from "../../contexts/ContextProvider";

const LazyMap = lazy(() => import("../lazyMap"));

const LocationModal = () => {
  const { isOpen, onClose, onUpdate } = useStateContext();
  const [location, setLocation] = useState(null);
  const [locationName, setLocationName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { ready, value, setValue, suggestions, clearSuggestions } = usePlacesAutocomplete({ debounce: 300 });
  const [isMapVisible, setIsMapVisible] = useState(false);
  const suggestionsRef = useRef(null);

  useEffect(() => {
    if (location) setIsMapVisible(true);
  }, [location]);

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
          alert("Location access denied. Please enter manually.");
          setIsLoading(false);
        },
        { enableHighAccuracy: true }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
      setIsLoading(false);
    }
  };

  const fetchLocationNameV1 = async (lat, lon) => {
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

  const fetchLocationGoogleName = async (lat, lon) => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=YOUR_GOOGLE_MAPS_API_KEY`
    );
    const data = await response.json();

    if (data.status === "OK") {
      const addressComponents = data.results[0].address_components;
      const city = addressComponents.find((comp) => comp.types.includes("locality"))?.long_name;
      const area = addressComponents.find((comp) => comp.types.includes("sublocality"))?.long_name;
      const name = city || area || "Unknown location";

      setLocationName(name);
      localStorage.setItem("lastLocation", name);
    } else {
      setError("Failed to fetch accurate location name.");
    }
  } catch {
    setError("Failed to fetch location name. Please try again.");
  }
};

const fetchLocationName = async (lat, lon) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
    );
    const data = await response.json();
    const name =  data.address.village || data.address.town || data.address.city || "Unknown location";
    setLocationName(name);
    localStorage.setItem("lastLocation", name);
  } catch {
    setError("Failed to fetch location name.");
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
            <div className="relative">
              <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Enter location manually"
                className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-300"
              />
              {suggestions.status === "OK" && (
                <ul
                  ref={suggestionsRef}
                  className="absolute w-full bg-white dark:bg-gray-700 border rounded-lg shadow-md mt-1 overflow-y-auto max-h-48"
                >
                  {suggestions.data.map((suggestion) => (
                    <li
                      key={suggestion.place_id}
                      onClick={() => handleSelectSuggestion(suggestion.description)}
                      className="cursor-pointer px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      {suggestion.description}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {isMapVisible && (
              <div className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] overflow-hidden rounded-lg">
                <Suspense fallback={<p>Loading map...</p>}>
                  <LazyMap location={location} locationName={locationName} />
                </Suspense>
              </div>
            )}
            <button
              onClick={() => onUpdate({ latitude: location?.latitude, longitude: location?.longitude, locationName })}
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