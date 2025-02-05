import React, { useReducer, useEffect, lazy, Suspense, useCallback, useState } from 'react';
import { MapPinIcon, XMarkIcon, PencilIcon, TrashIcon, StarIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import debounce from 'lodash.debounce';

const MapContainer = lazy(() => import('react-leaflet').then(module => ({ default: module.MapContainer })));
const TileLayer = lazy(() => import('react-leaflet').then(module => ({ default: module.TileLayer })));
const Marker = lazy(() => import('react-leaflet').then(module => ({ default: module.Marker })));
const Popup = lazy(() => import('react-leaflet').then(module => ({ default: module.Popup })));

const initialState = {
  isAddressBookOpen: false,
  addresses: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('addresses')) || [] : [],
  mapLocation: null,
  loadingLocation: false,
  searchSuggestions: [],
  defaultAddressId: typeof window !== 'undefined' ? localStorage.getItem('defaultAddressId') || null : "",
};


function reducer(state, action) {
  switch (action.type) {
    case 'TOGGLE_ADDRESS_BOOK':
      return { ...state, isAddressBookOpen: !state.isAddressBookOpen };
    case 'SET_ADDRESSES':
      localStorage.setItem('addresses', JSON.stringify(action.payload));
      return { ...state, addresses: action.payload };
    case 'SET_MAP_LOCATION':
      return { ...state, mapLocation: action.payload };
    case 'SET_LOADING_LOCATION':
      return { ...state, loadingLocation: action.payload };
    case 'SET_SUGGESTIONS':
      return { ...state, searchSuggestions: action.payload };
    case 'SET_DEFAULT_ADDRESS':
      localStorage.setItem('defaultAddressId', action.payload);
      return { ...state, defaultAddressId: action.payload };
    default:
      return state;
  }
}

const ShippingAddress = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [newAddress, setNewAddress] = useState('');
  const [editingId, setEditingId] = useState(null);

  const autoDetectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      return toast.error('Geolocation not supported.');
    }
    dispatch({ type: 'SET_LOADING_LOCATION', payload: true });
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        dispatch({ type: 'SET_MAP_LOCATION', payload: { lat: coords.latitude, lng: coords.longitude } });
        dispatch({ type: 'SET_LOADING_LOCATION', payload: false });
        toast.success('Location detected!');
      },
      () => {
        toast.error('Permission denied.');
        dispatch({ type: 'SET_LOADING_LOCATION', payload: false });
      }
    );
  }, []);

  const searchAddress = debounce(async (query) => {
    try {
      const { data } = await axios.get(`https://nominatim.openstreetmap.org/search`, {
        params: { q: query, format: 'json' },
      });
      dispatch({ type: 'SET_SUGGESTIONS', payload: data });
    } catch {
      toast.error('Failed to fetch suggestions.');
    }
  }, 500);

  const handleMapClick = async (e) => {
    const { lat, lng } = e.latlng;
    dispatch({ type: 'SET_MAP_LOCATION', payload: { lat, lng } });
    try {
      const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
        params: { lat, lon: lng, format: 'json' },
      });
      toast.success(`Location set: ${response.data.display_name}`);
    } catch {
      toast.error('Reverse geocoding failed.');
    }
  };

  const handleAddAddress = () => {
    if (!newAddress.trim()) {
      return toast.error('Address cannot be empty.');
    }
    const updatedAddresses = [...state.addresses, { id: Date.now(), address: newAddress }];
    dispatch({ type: 'SET_ADDRESSES', payload: updatedAddresses });
    setNewAddress('');
    toast.success('Address added!');
  };

  const handleEditAddress = (id, newAddress) => {
    const updatedAddresses = state.addresses.map(addr => addr.id === id ? { ...addr, address: newAddress } : addr);
    dispatch({ type: 'SET_ADDRESSES', payload: updatedAddresses });
    setEditingId(null);
    toast.success('Address updated!');
  };

  const handleDeleteAddress = (id) => {
    const updatedAddresses = state.addresses.filter(addr => addr.id !== id);
    dispatch({ type: 'SET_ADDRESSES', payload: updatedAddresses });
    toast.success('Address deleted!');
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(state.addresses);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    dispatch({ type: 'SET_ADDRESSES', payload: items });
  };

  return (
    <div className="p-4 space-y-4">
      <button
        className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg shadow-md"
        onClick={() => dispatch({ type: 'TOGGLE_ADDRESS_BOOK' })}
      >
        Manage Addresses
      </button>

      <button
        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md flex items-center gap-2"
        onClick={autoDetectLocation}
        disabled={state.loadingLocation}
      >
        <MapPinIcon className="w-5 h-5" />
        {state.loadingLocation ? 'Detecting...' : 'Auto-Detect Location'}
      </button>

      <input
        type="text"
        className="border p-2 rounded w-full"
        placeholder="Search for an address..."
        onChange={(e) => searchAddress(e.target.value)}
      />

      <ul className="bg-white shadow rounded-lg max-h-40 overflow-y-auto">
        {state.searchSuggestions.map((suggestion, index) => (
          <li
            key={index}
            className="p-2 hover:bg-gray-100 cursor-pointer"
            onClick={() => {
              dispatch({ type: 'SET_MAP_LOCATION', payload: { lat: suggestion.lat, lng: suggestion.lon } });
              toast.success(`Selected: ${suggestion.display_name}`);
            }}
          >
            {suggestion.display_name}
          </li>
        ))}
      </ul>

      {state.mapLocation && (
        <Suspense fallback={<div className="h-40 bg-gray-200 rounded-lg animate-pulse" />}>
          <MapContainer center={[state.mapLocation.lat, state.mapLocation.lng]} zoom={13} className="h-40 rounded-lg" onClick={handleMapClick}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={[state.mapLocation.lat, state.mapLocation.lng]} draggable />
          </MapContainer>
        </Suspense>
      )}

      <AnimatePresence>
        {state.isAddressBookOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex justify-center items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => dispatch({ type: 'TOGGLE_ADDRESS_BOOK' })}
          >
            <motion.div
              className="bg-white w-96 p-6 rounded-2xl shadow-2xl overflow-y-auto max-h-[80vh]"
              initial={{ y: '-100%' }}
              animate={{ y: 0 }}
              exit={{ y: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Address Book</h2>
                <XMarkIcon
                  className="w-6 h-6 text-gray-500 hover:text-red-500 cursor-pointer"
                  onClick={() => dispatch({ type: 'TOGGLE_ADDRESS_BOOK' })}
                />
              </div>

              <input
                type="text"
                className="border p-2 rounded w-full mb-4"
                placeholder="Add new address..."
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddAddress()}
              />

              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="addresses">
                  {(provided) => (
                    <ul {...provided.droppableProps} ref={provided.innerRef}>
                      {state.addresses.map((addr, index) => (
                        <Draggable key={addr.id} draggableId={addr.id.toString()} index={index}>
                          {(provided) => (
                            <li
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="flex items-center justify-between bg-gray-100 p-2 rounded mb-2 shadow-sm"
                            >
                              {editingId === addr.id ? (
                                <input
                                  type="text"
                                  className="border p-1 rounded w-full mr-2"
                                  value={addr.address}
                                  onChange={(e) => handleEditAddress(addr.id, e.target.value)}
                                />
                              ) : (
                                <span>{addr.address}</span>
                              )}

                              <div className="flex gap-2">
                                <PencilIcon
                                  className="w-5 h-5 text-blue-500 cursor-pointer"
                                  onClick={() => setEditingId(addr.id)}
                                />
                                <TrashIcon
                                  className="w-5 h-5 text-red-500 cursor-pointer"
                                  onClick={() => handleDeleteAddress(addr.id)}
                                />
                                <StarIcon
                                  className={`w-5 h-5 cursor-pointer ${state.defaultAddressId === addr.id ? 'text-yellow-400' : 'text-gray-400'}`}
                                  onClick={() => dispatch({ type: 'SET_DEFAULT_ADDRESS', payload: addr.id })}
                                />
                              </div>
                            </li>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </ul>
                  )}
                </Droppable>
              </DragDropContext>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ShippingAddress;
