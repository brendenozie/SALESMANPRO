import React, { useState, useEffect, useRef } from 'react';

import {
  MapPinIcon,
} from "@heroicons/react/24/outline";


function useDebounce(fn: Function, delay: number) {
  const timeout = useRef<number>();
  return (...args: any[]) => {
    window.clearTimeout(timeout.current);
    timeout.current = window.setTimeout(() => fn(...args), delay);
  };
}

const LocationAccordion = ({ form, handleChange, handleLocationChange } : any) => {

  const [address, setAddress]     = useState('');
  const [loading, setLoading]     = useState(false);
  const [mapCenter, setMapCenter] = useState(form.geoLocation);

  // Simple debounced reverse-geocode
  const fetchAddress = async (lat: number, lng: number) => {
    setLoading(true);
    try {
      // const { data } = await axios.get('/api/reverse', { params: { lat, lon: lng, format: 'json' } });
      // setAddress(data.display_name || '');
      // handleLocationChange({ lat, lng });
    } catch {
      setAddress('Unknown location');
    } finally {
      setLoading(false);
    }
  };
  const debouncedFetch = useDebounce(fetchAddress, 500);

  // Hook up map movements
  const MapMover = () => {
    // const map = useMapEvents({
    //   moveend: e => {
    //     const c = e.target.getCenter();
    //     setMapCenter({ lat: c.lat, lng: c.lng, radius: form.geoLocation.radius });
    //     debouncedFetch(c.lat, c.lng);
    //   },
    // });
    return null;
  };

  // Sync external form radius → local center
  useEffect(() => {
    setMapCenter(form.geoLocation);
  }, [form.geoLocation]);

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-2xl shadow-lg">
      <details open className="group">
        <summary className="flex justify-between items-center p-4 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition">
          <div className="flex items-center space-x-2">
            <MapPinIcon className="h-6 w-6 text-blue-500" />
            <span className="text-lg font-semibold text-gray-800">Set Up Location</span>
          </div>
          <span className="transform transition group-open:rotate-180">▼</span>
        </summary>

        <div className="mt-6 space-y-6">      

          {/* Map + Radius */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <MapPinIcon className="h-5 w-5 mr-2 text-gray-600" />
              Select Location
            </label>
            <div className="relative h-64 rounded-lg overflow-hidden border border-gray-300">
              {/* Leaflet Map */}
              {/* <MapContainer
                center={[mapCenter.lat, mapCenter.lng]}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <MapMover />
              </MapContainer> */}

              {/* Center‑pin & spinner */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-full text-red-500">
                {loading
                  ? <div className="animate-spin h-6 w-6 border-4 border-red-500 border-t-transparent rounded-full"></div>
                  : <MapPinIcon className="h-8 w-8" />}
              </div>
            </div>

            {/* Radius slider */}
            <div className="mt-4">
              <label className="text-sm font-medium text-gray-700">Radius: {form.geoLocation.radius} m</label>
              <input
                type="range"
                min={100}
                max={5000}
                step={100}
                value={form.geoLocation.radius}
                onChange={e => handleLocationChange({ radius: +e.target.value })}
                className="w-full mt-1"
              />
            </div>

            {/* Display address */}
            {address && (
              <p className="mt-2 text-sm text-gray-600">Address: {address}</p>
            )}
          </div>
        </div>
      </details>
    </div>
  );
}


export default LocationAccordion;
