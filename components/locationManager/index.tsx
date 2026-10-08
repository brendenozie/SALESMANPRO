"use client";

import React, {
  useState,
  useEffect,
  useRef,
  lazy,
  Suspense,
} from "react";
import {
  MapPinIcon,
  XMarkIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
  Suggestion,
} from "use-places-autocomplete";
import { useStateContext } from "@/contexts/ContextProvider";

// -----------------------------------------
// TYPES
// -----------------------------------------

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface UpdateData extends Coordinates {
  locationName: string;
}

interface StateContextType {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (data: UpdateData) => void;
}

// -----------------------------------------
// COMPONENT
// -----------------------------------------

const LocationModal: React.FC = () => {
  const { isOpen, onClose, setOnClose, onUpdate } = useStateContext();

  const [location, setLocation] = useState<Coordinates | null>(null);
  const [locationName, setLocationName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const hasGoogle = typeof window !== "undefined" && Boolean((window as any).google?.maps?.places);
  const {
    ready,
    value,
    setValue,
    suggestions,
    clearSuggestions,
    init,
  } = usePlacesAutocomplete({
    initOnMount: hasGoogle,
    debounce: 300,
  });

  useEffect(() => {
    if (isOpen && hasGoogle && !ready) {
      init();
    }
  }, [isOpen, hasGoogle, ready, init]);

  const [isMapVisible, setIsMapVisible] = useState<boolean>(false);
  const suggestionsRef = useRef<HTMLUListElement | null>(null);

  // Show map when a location is selected
  useEffect(() => {
    if (location) setIsMapVisible(true);
  }, [location]);

  // Load last location from storage
  useEffect(() => {
    const lastLocation = localStorage.getItem("lastLocation");
    if (lastLocation) setLocationName(lastLocation);
  }, []);

  // -----------------------------------------
  // LOCATION DETECTION
  // -----------------------------------------

  const detectLocation = () => {
    setIsLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("Geolocation not supported.");
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
        await fetchLocationName(latitude, longitude);
        setIsLoading(false);
      },
      () => {
        alert("Location access denied. Enter manually.");
        setIsLoading(false);
      },
      { enableHighAccuracy: true }
    );
  };

  // -----------------------------------------
  // FETCH LOCATION (OSM)
  // -----------------------------------------

  const fetchLocationName = async (lat: number, lon: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
      );
      const data = await response.json();
      const name =
        data.address?.village ||
        data.address?.town ||
        data.address?.city ||
        "Unknown location";

      setLocationName(name);
      localStorage.setItem("lastLocation", name);
    } catch {
      setError("Failed to fetch location name.");
    }
  };

  // -----------------------------------------
  // HANDLE SUGGESTION SELECTION
  // -----------------------------------------

  const handleSelectSuggestion = async (description: string) => {
    setValue(description, false);
    clearSuggestions();

    try {
      const results = await getGeocode({ address: description });
      const { lat, lng } = getLatLng(results[0]);
      setLocation({ latitude: lat, longitude: lng });
      setLocationName(description);
    } catch {
      setError("Failed to get coordinates.");
    }
  };

  if (!isOpen) return null;

  // -----------------------------------------
  // UI
  // -----------------------------------------

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-full max-w-lg relative">
        {/* Close button */}
        <button
          className="absolute top-3 right-3 text-gray-600 dark:text-gray-200"
          onClick={() => setOnClose(false)}
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        {/* Title */}
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Set Your Location
        </h2>

        <div className="space-y-4">
          {/* Detect Location */}
          <button
            onClick={detectLocation}
            disabled={isLoading}
            className="w-full flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg"
          >
            {isLoading ? (
              <ArrowPathIcon className="w-5 h-5 animate-spin" />
            ) : (
              <MapPinIcon className="w-5 h-5" />
            )}
            Detect Location
          </button>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          {/* Manual location input */}
          <div className="relative">
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Enter location manually"
              className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-300"
            />

            {/* Suggestions dropdown */}
            {suggestions.status === "OK" && (
              <ul
                ref={suggestionsRef}
                className="absolute w-full bg-white dark:bg-gray-700 border rounded-lg shadow-md mt-1 overflow-y-auto max-h-48 z-50"
              >
                {suggestions.data.map(
                  (suggestion: Suggestion) => (
                    <li
                      key={suggestion.place_id}
                      onClick={() =>
                        handleSelectSuggestion(suggestion.description)
                      }
                      className="cursor-pointer px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      {suggestion.description}
                    </li>
                  )
                )}
              </ul>
            )}
          </div>

          {/* Map preview */}
          {isMapVisible && (
            <div className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] overflow-hidden rounded-lg">
              {/* Map goes here */}
            </div>
          )}

          {/* Confirm Button */}
          <button
            onClick={() =>
              onUpdate({
                latitude: location?.latitude ?? 0,
                longitude: location?.longitude ?? 0,
                locationName,
              })
            }
            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
          >
            Confirm Location
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationModal;
