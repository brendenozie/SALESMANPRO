// app/admin/[slug]/properties/page.tsx
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
  PhotoIcon,
  // BedIcon, // Assuming these icons are available from @heroicons/react/24/outline
  // BathtubIcon,
  // PencilSquareIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import {  PropertyListing } from './PropertyFormModal'; // PropertyFormModal Adjust import path
// import { PropertyDeleteConfirmModal } from './PropertyDeleteConfirmModal'; // Adjust import path

import AddToProductMarketModal from "@/components/AddToProductMarketModal";
import { StoreCategory, Location } from '@/types/typings';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// --- Sample Data Generation (kept for simulation) ---
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

interface PropertyManagementPageProps {
  params: {
    slug: string;
  };
}

export default function PropertyManagementPage({ params }: PropertyManagementPageProps) {

  // const { slug } = params;

  const companyId = params.slug;

  const [properties, setProperties] = useState<PropertyListing[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [categories, setCategories] = useState<StoreCategory[] | undefined >();
  const [locations, setLocations] = useState<Location[] | undefined >();

  // Modals state
  // const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<PropertyListing | null>(null);
  
  const [showAddToMarketProductModal, setShowAddToMarketProductModal] = useState(false);


  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}/admin/get-store-categories?companyId=${companyId}`, { cache: 'no-store' });
      
        if (res.ok) {
              
          const resJson = await res.json();
          // Ensure the response has the expected structure
          if (!resJson || !resJson.results) {
            throw new Error('Invalid response structure');
          }
    
          const data = resJson.results || resJson.data; // Handle both cases
          
          let storeCategories = data.map((sc: any) => ({
            id: sc.id,
            companyId: sc.companyId,
            categoryId: sc.categoryId,
            displayName: sc.displayName,
            icon: sc.icon || sc.category.icon,
            sortOrder: sc.sortOrder,
            visible: sc.visible,
            items: Array.isArray(sc.items)
              ? sc.items.map((sub: any) => ({
                  id: sub.id,
                  name: sub.name,
                  slug: sub.slug,
                  sortOrder: sub.sortOrder,
                  visible: sub.visible,
                }))
              : Array.isArray(sc.category.subcategories)
                ? sc.category.subcategories.map((sub: any) => ({
                    id: sub._id?.$oid || sub.id,
                    name: sub.name,
                    slug: sub.slug,
                    sortOrder: sub.sortOrder,
                    visible: sub.visible,
                  }))
                : [],
            allBrands: sc.allBrands || [],
            category: {
              id: sc.category.id,
              name: sc.category.name,
              slug: sc.category.slug,
              description: sc.category.description,
              longDescription: sc.category.longDescription,
              seoTitle: sc.category.seoTitle,
              seoDescription: sc.category.seoDescription,
              metaKeywords: sc.category.metaKeywords,
              sortOrder: sc.category.sortOrder,
              visible: sc.category.visible,
              isFeatured: sc.category.isFeatured,
              showInHomepage: sc.category.showInHomepage,
              attributes: sc.category.attributes,
              subcategories: Array.isArray(sc.category.subcategories)
                ? sc.category.subcategories.map((sub: any) => ({
                    id: sub._id?.$oid || sub.id,
                    name: sub.name,
                    slug: sub.slug,
                    sortOrder: sub.sortOrder,
                    visible: sub.visible,
                  }))
                : [],
              icon: sc.category.icon,
              image: sc.category.image,
            },
          }));
          
          console.log('Fetched store categories:', storeCategories);
          setCategories(storeCategories);
          
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Failed to fetch categories.");
        // setCategories(initialCategories); // Fallback to initial data
      }
    } catch (err: any) {
      setError(err.message || "Network error fetching categories.");
      // setCategories(initialCategories); // Fallback to initial data
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl, companyId,]);

  useEffect(() => {
    // Fetch categories on mount if initial data is empty or if we need to ensure freshness
    // if (initialCategories.length === 0) {
      fetchCategories();
    // }
  }, []);

  // --- Data Fetching ---
    const fetchLocations = useCallback(async () => {
      // setLoading(true);
      // setError(null);
      try {
        const response = await fetch('/api/admin/locations'); // Correct API endpoint for global locations
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setLocations(data.data || []); // Assuming API returns { data: [...] }
        
        console.log('Fetched store categories:', data.data);

      } catch (err: any) {
        // setError(`Failed to fetch locations: ${err.message}`);
      } finally {
        // setLoading(false);
      }
    }, []);
  
    useEffect(() => {
      fetchLocations();
    }, [fetchLocations]);
  
  
  const fetchProperties = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 700));
      const data = generateSampleProperties();
      setProperties(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (err: any) {
      console.error("Error fetching properties:", err);
      setError(err.message || "Failed to load properties.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  // --- CRUD Operations (Simulated) ---
  const handleSaveProperty = useCallback((propertyToSave: PropertyListing) => {
    setProperties(prevProperties => {
      const existingIndex = prevProperties.findIndex(p => p.id === propertyToSave.id);
      if (existingIndex > -1) {
        // Update existing property
        const updatedProperties = [...prevProperties];
        updatedProperties[existingIndex] = propertyToSave;
        return updatedProperties;
      } else {
        // Add new property
        return [propertyToSave, ...prevProperties];
      }
    });
    setShowAddToMarketProductModal(false); // Close modal after save
    setSelectedProperty(null); // Clear selected property
  }, []);

  const handleDeleteProperty = useCallback((propertyId: string) => {
    setProperties(prevProperties => prevProperties.filter(p => p.id !== propertyId));
    setIsDeleteModalOpen(false); // Close modal after delete
    setSelectedProperty(null); // Clear selected property
  }, []);

  // --- Modal Handlers ---
  const handleAddClick = () => {
    setSelectedProperty(null); // Ensure no property is selected for a new form
    setShowAddToMarketProductModal(true);
  };

  const handleEditClick = (property: PropertyListing) => {
    setSelectedProperty(property);
    setShowAddToMarketProductModal(true);
  };

  const handleDeleteConfirmClick = (property: PropertyListing) => {
    setSelectedProperty(property);
    setIsDeleteModalOpen(true);
  };

  const handleCloseModals = () => {
    setShowAddToMarketProductModal(false);
    setIsDeleteModalOpen(false);
    setSelectedProperty(null); // Always clear selected property on close
    setError(null); // Clear any modal-specific errors
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

  const getStatusBadgeClass = (status: PropertyListing['status']) => {
    switch (status) {
      case 'Available': return 'bg-green-100 text-green-800';
      case 'Under Offer': return 'bg-yellow-100 text-yellow-800';
      case 'Sold': return 'bg-red-100 text-red-800';
      case 'Draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen font-inter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight flex items-center">
            <BuildingOfficeIcon className="h-9 w-9 text-indigo-600 mr-3" />
            Manage Properties
            <span className="ml-3 text-teal-600 text-base sm:text-xl transform rotate-6">🏠</span>
          </h1>
          <p className="text-md text-gray-600 mt-2 max-w-2xl">
            Oversee all your real estate listings, add new ones, and update existing properties with a seamless, intuitive interface.
          </p>
        </div>
        <button
          onClick={handleAddClick}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 group"
        >
          <PlusCircleIcon className="-ml-1 mr-3 h-6 w-6 group-hover:rotate-90 transition-transform" aria-hidden="true" />
          Add New Property
        </button>
      </div>

      {/* Loading and Error Indicators */}
      {isLoading && (
        <div className="flex items-center justify-center py-8 text-blue-700 font-medium text-lg bg-white rounded-xl shadow-md border border-blue-200">
          <svg className="animate-spin -ml-1 mr-3 h-7 w-7 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading properties...
        </div>
      )}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-xl relative shadow-md flex items-center justify-between animate-fade-in">
          <div>
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline ml-2">{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-800 focus:outline-none p-1 rounded-full hover:bg-red-200 transition-colors">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
      )}

      {/* Search and Filters */}
      {!isLoading && !error && (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 animate-slide-up">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-6">
            <div className="relative col-span-full md:col-span-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search properties by title, address, agent..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500
                                focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm shadow-sm"
              />
            </div>
            <div>
              <label htmlFor="filterStatus" className="sr-only">Filter by Status</label>
              <select
                id="filterStatus"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as PropertyListing['status'] | 'All')}
                className="block w-full py-2.5 px-3 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="All">All Statuses</option>
                {uniqueStatuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="filterType" className="sr-only">Filter by Type</label>
              <select
                id="filterType"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as PropertyListing['type'] | 'All')}
                className="block w-full py-2.5 px-3 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="All">All Types</option>
                {uniqueTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Properties List/Table */}
          <div className="overflow-x-auto rounded-lg shadow-inner border border-gray-100">
            {filteredProperties.length === 0 ? (
              <div className="text-center text-gray-500 py-12 bg-gray-50 rounded-lg">
                <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-300" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">No properties found</h3>
                <p className="mt-1 text-sm text-gray-500">Adjust your filters or add a new property.</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Property
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Details
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Price
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Agent
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProperties.map((property) => (
                    <tr key={property.id} className="hover:bg-blue-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <div className="flex items-center">
                          {property.imageUrl ? (
                            <div className="flex-shrink-0 h-12 w-12 mr-4 rounded-md overflow-hidden shadow-sm border border-gray-200">
                              <img className="h-full w-full object-cover" src={property.imageUrl} alt={property.title} />
                            </div>
                          ) : (
                            <div className="flex-shrink-0 h-12 w-12 mr-4 bg-gray-200 rounded-md flex items-center justify-center text-gray-500">
                              <PhotoIcon className="h-6 w-6" />
                            </div>
                          )}
                          <div>
                            <div className="text-base font-semibold text-gray-800">{property.title}</div>
                            <div className="text-xs text-gray-500 flex items-center mt-1">
                              <MapPinIcon className="h-3 w-3 mr-1 text-gray-400" /> {property.address}, {property.city}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <div className="space-y-1">
                          <div className="flex items-center">
                            <TagIcon className="h-4 w-4 mr-1 text-gray-400" /> {property.type}
                          </div>
                          {(property.type === 'Apartment' || property.type === 'House') && (
                            <>
                              <div className="flex items-center">
                                <PencilSquareIcon className="h-4 w-4 mr-1 text-gray-400" /> {property.bedrooms ?? 'N/A'} Beds
                              </div>
                              {/* BedIcon */}
                              <div className="flex items-center">
                                <PencilSquareIcon className="h-4 w-4 mr-1 text-gray-400" /> {property.bathrooms ?? 'N/A'} Baths 
                              </div>
                              {/* BathtubIcon */}
                              <div className="flex items-center">
                                <PencilSquareIcon className="h-4 w-4 mr-1 text-gray-400" /> {property.areaSqFt ?? 'N/A'} SqFt
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-lg font-bold text-teal-700">
                        {formatPrice(property.price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full shadow-sm ${getStatusBadgeClass(property.status)}`}>
                          {property.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {property.agentName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-3">
                          <Link href={`#`} className="text-indigo-600 hover:text-indigo-800 p-2 rounded-full hover:bg-indigo-50 transition-colors" title="View Details">
                            <EyeIcon className="h-5 w-5" />
                            {/* /admin/${params.slug}/properties/${property.id} */}
                          </Link>
                          <button onClick={() => handleEditClick(property)} className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50 transition-colors" title="Edit">
                            <PencilSquareIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteConfirmClick(property)}
                            className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50 transition-colors"
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
      )}

      {/* Property Form Modal */}
      {/* <PropertyFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseModals}
        onSave={handleSaveProperty}
        property={selectedProperty}
      /> */}

      {showAddToMarketProductModal && (
        <AddToProductMarketModal
          showRequestProductModal={showAddToMarketProductModal}
          setShowRequestProductModal={setShowAddToMarketProductModal}
          categories={categories ?? []}
          product={null}
          companyId={companyId}
          // Assuming marketListItem is not strictly needed when adding from admin inventory
          // or if it shares structure with ProductForm, you might pass selectedProduct to it.
          // marketListItem={null} 
        />
      )}

      {/* Property Delete Confirmation Modal */}
      {/* {isDeleteModalOpen && selectedProperty && (
        <PropertyDeleteConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={handleCloseModals}
          onConfirmDelete={handleDeleteProperty}
          property={selectedProperty}
        />
      )} */}
    </div>
  );
}
