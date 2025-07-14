// app/admin/[adminSlug]/properties/page.tsx
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  BuildingOfficeIcon,
  PlusCircleIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  MapPinIcon,
  TagIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  ClockIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

// --- Type Definitions ---
export type PropertyListing = {
  id: string;
  title: string;
  address: string;
  city: string;
  price: number;
  status: 'Available' | 'Under Offer' | 'Sold' | 'Draft';
  type: 'Apartment' | 'House' | 'Commercial' | 'Land';
  bedrooms?: number;
  bathrooms?: number;
  areaSqFt?: number;
  imageUrl?: string;
  agentId: string;
  agentName: string;
  createdAt: string;
  updatedAt: string;
};

// --- Sample Data Generation ---
const generateSampleProperties = (): PropertyListing[] => [
  {
    id: 'PROP001',
    title: 'Modern Apartment in Kilimani',
    address: '123 Kilimani Rd',
    city: 'Nairobi',
    price: 15000000,
    status: 'Available',
    type: 'Apartment',
    bedrooms: 3,
    bathrooms: 2,
    areaSqFt: 1400,
    imageUrl: 'https://images.unsplash.com/photo-1580582932707-52c5ee385c57?auto=format&fit=crop&q=80&w=2670&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    agentId: 'AGT001',
    agentName: 'John Doe',
    createdAt: new Date('2024-05-01T10:00:00Z').toISOString(),
    updatedAt: new Date('2024-05-10T11:00:00Z').toISOString(),
  },
  {
    id: 'PROP002',
    title: 'Spacious Family House, Karen',
    address: '456 Acacia Drive',
    city: 'Nairobi',
    price: 45000000,
    status: 'Available',
    type: 'House',
    bedrooms: 5,
    bathrooms: 4,
    areaSqFt: 3500,
    imageUrl: 'https://images.unsplash.com/photo-1576941089067-2fd3d73754c7?auto=format&fit=crop&q=80&w=2670&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    agentId: 'AGT002',
    agentName: 'Jane Smith',
    createdAt: new Date('2024-06-15T09:30:00Z').toISOString(),
    updatedAt: new Date('2024-06-20T10:15:00Z').toISOString(),
  },
  {
    id: 'PROP003',
    title: 'Commercial Office Space, CBD',
    address: '789 Business Ave',
    city: 'Nairobi',
    price: 80000000,
    status: 'Under Offer',
    type: 'Commercial',
    areaSqFt: 5000,
    imageUrl: 'https://images.unsplash.com/photo-1563814466205-d14a09804e3d?auto=format&fit=crop&q=80&w=2670&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    agentId: 'AGT001',
    agentName: 'John Doe',
    createdAt: new Date('2024-04-10T14:00:00Z').toISOString(),
    updatedAt: new Date('2024-07-01T16:00:00Z').toISOString(),
  },
  {
    id: 'PROP004',
    title: 'Prime Land in Ruiru',
    address: 'Ruiru Bypass',
    city: 'Nairobi', // or Ruiru town
    price: 20000000,
    status: 'Sold',
    type: 'Land',
    imageUrl: 'https://images.unsplash.com/photo-1621998595111-e633d7b42c67?auto=format&fit=crop&q=80&w=2670&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    agentId: 'AGT003',
    agentName: 'Emily White',
    createdAt: new Date('2023-11-20T11:00:00Z').toISOString(),
    updatedAt: new Date('2024-01-10T09:00:00Z').toISOString(),
  },
  {
    id: 'PROP005',
    title: 'Studio Apartment, Westlands',
    address: 'Westlands Road',
    city: 'Nairobi',
    price: 8000000,
    status: 'Available',
    type: 'Apartment',
    bedrooms: 0,
    bathrooms: 1,
    areaSqFt: 500,
    imageUrl: 'https://images.unsplash.com/photo-1522050212007-009f7a77d54e?auto=format&fit=crop&q=80&w=2670&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    agentId: 'AGT002',
    agentName: 'Jane Smith',
    createdAt: new Date('2024-07-01T08:00:00Z').toISOString(),
    updatedAt: new Date('2024-07-01T08:00:00Z').toISOString(),
  },
];

interface PropertiesPageProps {
  params: {
    adminSlug: string;
  };
}

export default function PropertiesPage({ params }: PropertiesPageProps) {
  const { adminSlug } = params;
  const [properties, setProperties] = useState<PropertyListing[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<PropertyListing | null>(null);

  // In a real app, you'd define your API URL (e.g., process.env.NEXT_PUBLIC_API_URL)
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

  const fetchProperties = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Simulate API call
      // const res = await fetch(`${apiUrl}/properties?adminSlug=${adminSlug}`);
      // if (!res.ok) throw new Error('Failed to fetch properties');
      // const data: PropertyListing[] = await res.json();
      // setProperties(data);

      // Using sample data directly
      const data = generateSampleProperties();
      setProperties(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (err: any) {
      console.error("Error fetching properties:", err);
      setError(err.message || "Failed to load properties.");
    } finally {
      setIsLoading(false);
    }
  }, [adminSlug]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const handleDeleteClick = (property: PropertyListing) => {
    setPropertyToDelete(property);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (propertyToDelete) {
      setIsLoading(true);
      try {
        // Simulate API call for deletion
        // const res = await fetch(`${apiUrl}/properties/${propertyToDelete.id}`, { method: 'DELETE' });
        // if (!res.ok) throw new Error('Failed to delete property');
        setProperties(prev => prev.filter(p => p.id !== propertyToDelete.id));
        setShowDeleteModal(false);
        setPropertyToDelete(null);
        // Optionally show a success toast/notification
      } catch (err: any) {
        setError(err.message || "Failed to delete property.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const filteredProperties = useMemo(() => {
    return properties.filter(prop => {
      const matchesSearch = prop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            prop.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            prop.agentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            prop.city.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'All' || prop.status === filterStatus;
      const matchesType = filterType === 'All' || prop.type === filterType;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [properties, searchTerm, filterStatus, filterType]);

  const uniqueStatuses = useMemo(() => Array.from(new Set(properties.map(p => p.status))), [properties]);
  const uniqueTypes = useMemo(() => Array.from(new Set(properties.map(p => p.type))), [properties]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Manage Properties
            <span className="ml-2 text-teal-600 text-base sm:text-xl">🏠</span>
          </h1>
          <p className="text-md text-gray-600 mt-1">
            Oversee all your real estate listings, add new ones, and update existing properties.
          </p>
        </div>
        <Link
          href={`/admin/${adminSlug}/properties/add-new`}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
          <PlusCircleIcon className="-ml-1 mr-3 h-5 w-5" aria-hidden="true" />
          Add New Property
        </Link>
      </div>

      {/* Loading and Error Indicators */}
      {isLoading && (
        <div className="flex items-center justify-center py-4 text-blue-700 font-medium text-lg">
          <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading properties...
        </div>
      )}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-xl relative shadow-md mb-6 flex items-center justify-between">
          <div>
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline ml-2">{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-800 focus:outline-none">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
          <div className="relative col-span-full md:col-span-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search properties by title, address, agent..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500
                         focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="All">All Statuses</option>
              {uniqueStatuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="All">All Types</option>
              {uniqueTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          {/* Add more filters here, e.g., by agent, city, price range */}
        </div>

        {/* Properties Table */}
        <div className="overflow-x-auto">
          {filteredProperties.length === 0 && !isLoading && !error ? (
            <p className="text-center text-gray-500 py-8">No properties found matching your criteria.</p>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Agent
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProperties.map((property) => (
                  <tr key={property.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <div className="flex items-center">
                        {property.imageUrl && (
                          <div className="flex-shrink-0 h-10 w-10 mr-3">
                            <img className="h-10 w-10 rounded-md object-cover" src={property.imageUrl} alt={property.title} />
                          </div>
                        )}
                        <span>{property.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {property.address}, {property.city}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatPrice(property.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${property.status === 'Available' ? 'bg-green-100 text-green-800' : ''}
                        ${property.status === 'Under Offer' ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${property.status === 'Sold' ? 'bg-red-100 text-red-800' : ''}
                        ${property.status === 'Draft' ? 'bg-gray-100 text-gray-800' : ''}
                      `}>
                        {property.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {property.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {property.agentName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Link href={`/admin/${adminSlug}/properties/${property.id}`} className="text-indigo-600 hover:text-indigo-900" title="View Details">
                          <EyeIcon className="h-5 w-5" />
                        </Link>
                        <Link href={`/admin/${adminSlug}/properties/${property.id}/edit`} className="text-blue-600 hover:text-blue-900" title="Edit">
                          <PencilSquareIcon className="h-5 w-5" />
                        </Link>
                        <button
                          onClick={() => handleDeleteClick(property)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && propertyToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm transform transition-all duration-300 scale-100 opacity-100">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Deletion</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete property "{propertyToDelete.title}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}