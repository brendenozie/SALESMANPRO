// app/admin/[slug]/properties/PropertyClientPage.tsx
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  PlusCircleIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  BuildingOfficeIcon,
  ArchiveBoxIcon,
  ArrowPathIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import toast, { Toaster } from 'react-hot-toast';

// Assuming you have these external components
import AddToProductMarketModal from "@/components/AddToProductMarketModal";
// We will create a simple inline Delete Modal for this example, or you can import a dedicated one
// import { PropertyDeleteConfirmModal } from './PropertyDeleteConfirmModal';

import { PropertyCard } from './PropertyCard';
import { ILocation, IStoreCategory, MarketListingForm } from '@/types/typings';

// --- Props for the Client Component ---
interface PropertyClientPageProps {
    companyId: string; 
    initialProperties: MarketListingForm[]; 
    initialCategories: IStoreCategory[];
    initialLocations: ILocation[];
    serverLoadError: string | null;
}


export default function PropertyClientPage({ 
    companyId, 
    initialProperties, 
    initialCategories,
    initialLocations,
    serverLoadError,
}: PropertyClientPageProps) {
  
  const [properties, setProperties] = useState<MarketListingForm[]>(initialProperties);
  const [categories, setCategories] = useState<IStoreCategory[]>(initialCategories);
  const [locations, setLocations] = useState<ILocation[]>(initialLocations);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterType, setFilterType] = useState('All');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(serverLoadError); 

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<MarketListingForm | null>(null);
  const [showAddToMarketProductModal, setShowAddToMarketProductModal] = useState(false);

  const apiBaserUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";//process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';;


  // --- Data Refetching (Client-side) ---
  const fetchProperties = useCallback(async (showToast = false) => {
    setIsLoading(true);
    setError(null);
    const toastId = showToast ? toast.loading("Refreshing listings...") : undefined;
    try {
      const response = await fetch(`${apiBaserUrl}/admin/my-market-place?companyId=${encodeURIComponent(companyId)}`, { cache: 'no-store' });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to fetch listings. Status: ${response.status}`);
      }
      const json = await response.json();
      setProperties(json.results as MarketListingForm[]);
      if(showToast) toast.success("Listings refreshed!", { id: toastId });
    } catch (err: any) {
      console.error("[PropertyClientPage] Failed to fetch marketplace products:", err);
      setError(err.message || "Failed to load properties.");
      if(showToast) toast.error(err.message || "Failed to refresh listings.", { id: toastId });
    } finally {
      setIsLoading(false);
    }
  }, [companyId, apiBaserUrl]); 
  
  // NOTE: In a real app, you would also refetch categories/locations here if needed.

  // --- CRUD Handlers ---
  
  // This is passed to AddToProductMarketModal's onSave prop
  const handleSaveProperty = useCallback((propertyToSave: MarketListingForm) => {
    setProperties(prevProperties => {
      const existingIndex = prevProperties.findIndex(p => p.id === propertyToSave.id);
      if (existingIndex > -1) {
        const updatedProperties = [...prevProperties];
        updatedProperties[existingIndex] = propertyToSave;
        return updatedProperties;
      } else {
        return [propertyToSave, ...prevProperties];
      }
    });
    // Closing and cleaning up after the modal's internal save logic is done
    setShowAddToMarketProductModal(false);
    setSelectedProperty(null);
    // Since AddToProductMarketModal might already handle API interaction, we re-fetch to ensure the list is consistent.
    fetchProperties(true); 
  }, [fetchProperties]);

  const confirmDelete = useCallback(async (propertyId: string) => {
    setIsSubmitting(true);
    setError(null);
    setIsDeleteModalOpen(false);
    const deleteToastId = toast.loading(`Deleting listing: ${selectedProperty?.name || '...'}`);
    
    try {
        const response = await fetch(`${apiBaserUrl}/admin/my-market-place/${encodeURIComponent(propertyId)}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to delete listing.');
        }

        setProperties(prevProperties => prevProperties.filter(p => p.id !== propertyId));
        toast.success('Listing deleted successfully!', { id: deleteToastId });

    } catch (err: any) {
        toast.error(err.message || 'Error deleting listing.', { id: deleteToastId });
        setError(err.message || 'Error deleting listing.');
    } finally {
        setSelectedProperty(null);
        setIsSubmitting(false);
    }
  }, [apiBaserUrl, selectedProperty]);


  // --- Modal Handlers ---
  const handleAddClick = () => {
    setSelectedProperty(null);
    setShowAddToMarketProductModal(true);
  };

  const handleEditClick = (property: MarketListingForm) => {
    setSelectedProperty(property);
    setShowAddToMarketProductModal(true);
  };

  const handleDeleteConfirmClick = (property: MarketListingForm) => {
    setSelectedProperty(property);
    setIsDeleteModalOpen(true);
  };

  const handleCloseModals = () => {
    setShowAddToMarketProductModal(false);
    setIsDeleteModalOpen(false);
    setSelectedProperty(null);
  };

  // --- Filtering and Memoization ---
  const filteredProperties = useMemo(() => {
    return properties.length > 0 ? properties.filter(prop => {
      const matchesSearch = prop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (prop.locationName?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
        (prop.contactName?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
        (prop.category?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
        (prop.type?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

      const matchesStatus = filterStatus === 'All' || prop.status === filterStatus;
      const matchesType = filterType === 'All' || prop.type === filterType;

      return matchesSearch && matchesStatus && matchesType;
    }) : [];
  }, [properties, searchTerm, filterStatus, filterType]);

  const uniqueStatuses = useMemo(() => Array.from(new Set(properties.length > 0 ? properties.map(p => p.status) : [])).filter(Boolean) as string[], [properties]);
  const uniqueTypes = useMemo(() => Array.from(new Set(properties.length > 0 ? properties.map(p => p.type) : [])).filter(Boolean) as string[], [properties]);


  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />

      {/* Action Bar */}
      <div className="flex justify-end mb-8">
        <button
          onClick={handleAddClick}
          className="inline-flex items-center px-7 py-3.5 border border-transparent text-lg font-semibold rounded-full shadow-lg text-white bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 focus:outline-none focus:ring-3 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 group"
          disabled={isSubmitting}
        >
          <PlusCircleIcon className="-ml-1 mr-3 h-7 w-7 group-hover:rotate-90 transition-transform duration-300" aria-hidden="true" />
          Add New Listing
        </button>
      </div>

      {/* Loading and Error Indicators */}
      {error && (
        <div className="bg-red-50 border border-red-400 text-red-800 px-8 py-5 rounded-2xl relative shadow-lg flex items-center justify-between mb-8 animate-fade-in-down">
          <div className="flex items-center">
            <XMarkIcon className="h-7 w-7 text-red-600 mr-3" />
            <div>
              <strong className="font-bold text-lg">Oops! Data Error!</strong>
              <span className="block sm:inline ml-2 text-md">{error}</span>
            </div>
          </div>
          <button onClick={() => setError(null)} className="text-red-600 hover:text-red-900 focus:outline-none p-2 rounded-full hover:bg-red-100 transition-colors duration-200">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
      )}

      {isLoading && properties.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 bg-white rounded-2xl shadow-xl border border-blue-200 animate-fade-in-up">
            <svg className="animate-spin h-10 w-10 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-xl font-medium text-blue-700">Loading your marketplace listings...</p>
          </div>
      )}

      {/* Main Content Area: Search, Filters, and Cards */}
      {!isLoading || properties.length > 0 ? (
        <section className="bg-white rounded-2xl shadow-xl border border-gray-200 p-7 space-y-8 animate-slide-in-up">
          
          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Search Bar */}
            <div className="relative col-span-full lg:col-span-2">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name, location, agent, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl leading-6 bg-gray-50 placeholder-gray-500
                           focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base shadow-sm transition-all duration-200"
              />
            </div>
            
            {/* Status Filter */}
            <div>
              <label htmlFor="filterStatus" className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
              <select
                id="filterStatus"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="block w-full py-3 px-4 border border-gray-300 bg-white rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base transition-all duration-200"
              >
                <option value="All">All Statuses</option>
                {uniqueStatuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            
            {/* Type Filter */}
            <div>
              <label htmlFor="filterType" className="block text-sm font-medium text-gray-700 mb-2">Filter by Type</label>
              <select
                id="filterType"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="block w-full py-3 px-4 border border-gray-300 bg-white rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base transition-all duration-200"
              >
                <option value="All">All Types</option>
                {uniqueTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Clear Filters Button */}
          {(searchTerm || filterStatus !== 'All' || filterType !== 'All') && (
            <div className='flex justify-start pt-2'>
              <button
                onClick={() => { setSearchTerm(''); setFilterStatus('All'); setFilterType('All'); }}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-all duration-200 shadow-md"
              >
                <XMarkIcon className="h-4 w-4 mr-2" />
                Clear Filters
              </button>
            </div>
          )}
          
          {/* Property Cards Grid */}
          <div className="mt-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <BuildingOfficeIcon className="h-5 w-5 text-indigo-500 mr-2" />
                Total Listings ({filteredProperties.length})
            </h3>
            
            {filteredProperties.length === 0 ? (
              <div className="text-center text-gray-500 py-20 bg-gray-50 rounded-xl shadow-inner border border-gray-100">
                <ArchiveBoxIcon className="mx-auto h-16 w-16 text-gray-300 mb-4 animate-bounce-slight" />
                <h3 className="mt-3 text-2xl font-semibold text-gray-900">No listings match your filters</h3>
                <p className="mt-2 text-md text-gray-600">
                  Try adjusting your search query or status filters.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProperties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    companyId={companyId}
                    onEdit={handleEditClick} 
                    onDelete={handleDeleteConfirmClick}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      ) : null}

      {/* Add To Market Product Modal */}
      {showAddToMarketProductModal && (
        // <AddToProductMarketModal
        //   showRequestProductModal={showAddToMarketProductModal}
        //   setShowRequestProductModal={setShowAddToMarketProductModal}
        //   categories={categories}
        //   companyId={companyId}
        //   locations={locations}
        //   marketListItem={selectedProperty}
        //   onSave={handleSaveProperty}
        //   // The modal needs to be updated to accept an onSave function that triggers handleSaveProperty logic
        // />
         <AddToProductMarketModal
                  showRequestProductModal={showAddToMarketProductModal}
                  setShowRequestProductModal={setShowAddToMarketProductModal}
                  categories={categories ?? []}
                  companyId={companyId}
                  locations={locations ?? []}
                  marketListItem={selectedProperty}
                  // onSave={handleSaveProperty}
                />
      )}

      {/* Delete Confirmation Modal (Using the original inline approach, but visually improved) */}
      {isDeleteModalOpen && selectedProperty && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-70 overflow-y-auto h-full w-full z-50 flex justify-center items-center p-4 animate-fade-in">
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md mx-auto transform transition-all duration-300 ease-out scale-100 opacity-100 border-t-8 border-red-500">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                <TrashIcon className='h-7 w-7 text-red-500 mr-3' />
                Confirm Deletion
              </h3>
              <button onClick={handleCloseModals} className="text-gray-400 hover:text-gray-600 transition-colors">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <p className="text-lg text-gray-700 mb-8 leading-relaxed">
              Are you absolutely sure you want to permanently delete <span className="font-bold text-red-600">"{selectedProperty.name}"</span>? This action **cannot be undone**.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleCloseModals}
                className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={() => confirmDelete(selectedProperty.id)}
                className="px-6 py-3 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                    <ArrowPathIcon className="animate-spin h-5 w-5 mr-2 text-white" />
                ) : (
                    <TrashIcon className="h-5 w-5 mr-2" />
                )}
                {isSubmitting ? 'Deleting...' : 'Delete Anyway'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}