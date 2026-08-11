// src/app/admin/[slug]/properties-locations/PropertyLocationsClient.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { HomeIcon, PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';

interface Location {
  id: string;
  name: string;
  description?: string;
  parentLocation?: string;
  latitude?: number;
  longitude?: number;
  propertyCount: number;
}

interface PropertyLocationsClientProps {
  companyId: string;
  slug: string;
}

export default function PropertyLocationsClient({ companyId, slug }: PropertyLocationsClientProps) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Data Fetching ---
  const fetchLocations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiBaseUrl}/admin/${companyId}/locations`, {
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch locations');
      }
      
      const data = await response.json();
      setLocations(data.data || data);
    } catch (err: any) {
      // Fallback to mock data if API is not yet active during development
      setLocations([
        { id: 'loc-001', name: 'Karen', description: 'Upscale residential area', propertyCount: 55, latitude: -1.31, longitude: 36.68 },
        { id: 'loc-002', name: 'Kilimani', description: 'Vibrant urban center', propertyCount: 120, latitude: -1.29, longitude: 36.79 },
        { id: 'loc-003', name: 'Westlands', description: 'Major commercial and residential hub', propertyCount: 90, latitude: -1.26, longitude: 36.80 },
        { id: 'loc-004', name: 'Runda', description: 'Exclusive residential area with large homes', propertyCount: 40, latitude: -1.22, longitude: 36.83 },
        { id: 'loc-005', name: 'Syokimau', description: 'Growing residential area along Mombasa Road', propertyCount: 70, latitude: -1.37, longitude: 36.93 },
        { id: 'loc-006', name: 'CBD', description: 'Central Business District', propertyCount: 30, latitude: -1.28, longitude: 36.82 },
      ]);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  // --- Handlers for CRUD operations (placeholders) ---
  const handleAddLocation = () => {
    console.log('Navigate to add new location form');
  };

  const handleEditLocation = (locationId: string) => {
    console.log(`Edit location with ID: ${locationId}`);
  };

  const handleDeleteLocation = (locationId: string) => {
    setLocations(prev => prev.filter(loc => loc.id !== locationId));
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-600 font-sans">Loading locations...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans">
      <div className="flex items-center space-x-2 text-gray-600 mb-4">
        <HomeIcon className="h-5 w-5" />
        <span>Admin Dashboard</span>
        <span>/</span>
        <span>Real Estate</span>
        <span>/</span>
        <span className="font-semibold text-gray-900">Locations</span>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Property Locations</h1>
          <button
            onClick={handleAddLocation}
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300 shadow-sm"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add New Location
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-700 rounded-md text-sm">
            Note: Showing local/fallback data due to network status: {error}
          </div>
        )}

        {locations.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            No locations found. Click "Add New Location" to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Properties
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {locations.map((location) => (
                  <tr key={location.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {location.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {location.description || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {location.propertyCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditLocation(location.id)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3 p-1 rounded hover:bg-indigo-50 transition-colors"
                        title="Edit Location"
                      >
                        <PencilIcon className="h-5 w-5 inline" />
                      </button>
                      <button
                        onClick={() => handleDeleteLocation(location.id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                        title="Delete Location"
                      >
                        <TrashIcon className="h-5 w-5 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}