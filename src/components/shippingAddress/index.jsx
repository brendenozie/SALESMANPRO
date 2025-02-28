import React, { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import axios from 'axios';
import debounce from 'lodash.debounce';

// Dynamically import react-leaflet components
const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(m => m.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(m => m.Popup), { ssr: false });

// Map Click Handler
const MapClickHandler = dynamic(() =>
  import('react-leaflet').then(m => ({
    default: function ({ onMapClick }) {
      const { useMapEvents } = m;
      useMapEvents({
        click: (e) => onMapClick(e),
      });
      return null;
    },
  })), { ssr: false }
);

const LocationPicker = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 51.505, lng: -0.09 });
  const [loading, setLoading] = useState(false);

  // Fetch suggestions
  const fetchSuggestions = async (query) => {
    if (!query) {
      setSuggestions([]);
      return;
    }
    try {
      setLoading(true);
      const { data } = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: { q: query, format: 'json', addressdetails: 1, limit: 5 },
      });
      setSuggestions(data);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Debounced API call
  const debouncedFetchSuggestions = useCallback(debounce(fetchSuggestions, 300), []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => debouncedFetchSuggestions.cancel();
  }, [debouncedFetchSuggestions]);

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedFetchSuggestions(value);
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

  // Handle map click
  const handleMapClick = (e) => {
    const { lat, lng } = e.latlng;
    setSelectedLocation({ lat, lng });
    setMapCenter({ lat, lng });
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      {/* Search Input */}
      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Search for a location..."
          value={searchTerm}
          onChange={handleSearchChange}
          style={{
            width: '100%',
            padding: '0.5rem',
            border: '1px solid #ccc',
            borderRadius: '4px',
          }}
        />
        {loading && <div>Loading suggestions...</div>}
        {suggestions.length > 0 && (
          <ul
            role="listbox"
            style={{
              listStyle: 'none',
              padding: 0,
              margin: '0.5rem 0',
              border: '1px solid #ccc',
              borderRadius: '4px',
              background: '#fff',
              maxHeight: '150px',
              overflowY: 'auto',
            }}
          >
            {suggestions.map((s, index) => (
              <li
                key={index}
                role="option"
                onClick={() => handleSuggestionSelect(s)}
                style={{
                  padding: '0.5rem',
                  cursor: 'pointer',
                  borderBottom: '1px solid #eee',
                }}
              >
                {s.display_name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Map Container */}
      <div style={{ height: '400px', width: '100%' }}>
        <MapContainer center={[mapCenter.lat, mapCenter.lng]} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapClickHandler onMapClick={handleMapClick} />
          {selectedLocation && (
            <Marker position={[selectedLocation.lat, selectedLocation.lng]}>
              <Popup>
                {searchTerm || `Lat: ${selectedLocation.lat.toFixed(4)}, Lng: ${selectedLocation.lng.toFixed(4)}`}
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
    </div>
  );
};

export default dynamic(() => Promise.resolve(LocationPicker), { ssr: false });
