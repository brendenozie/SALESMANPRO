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
  PhotoIcon,
  XMarkIcon,
  HomeModernIcon, // More suitable for vehicles
  TruckIcon, // For vehicles
  BookOpenIcon, // For books
  CurrencyDollarIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useParams } from "next/navigation";



// Assuming these components are correctly implemented and styled with Tailwind
import AddToProductMarketModal from "@/components/AddToProductMarketModal";
// If you have a dedicated delete modal component, uncomment and use it
// import { VehicleDeleteConfirmModal } from './VehicleDeleteConfirmModal';

import { IStoreCategory, ILocation, MarketListingForm } from '@/types/typings';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

interface VehicleManagementPageProps {
  params: {
    slug: string;
  };
}

export default function VehicleManagementPage() {
  const { slug: companyId  } = useParams();

  const [vehicles, setVehicles] = useState<MarketListingForm[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [categories, setCategories] = useState<IStoreCategory[] | undefined>();
  const [locations, setLocations] = useState<ILocation[] | undefined>();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<MarketListingForm | null>(null);
  const [showAddToMarketProductModal, setShowAddToMarketProductModal] = useState(false);

  // --- Data Fetching for Categories ---
  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}/admin/get-store-categories?companyId=${companyId}`, 
        { headers: { 'Content-Type': 'application/json', 'Credentials': 'include' } });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to fetch categories.");
      }
      const resJson = await res.json();
      console.log("[VehicleManagementPage] Fetched categories:", resJson);
      const data = resJson.results || resJson.data.results; // Handle both cases

      if (!data) {
        throw new Error('Invalid response structure for categories');
      }

      const storeCategories = data.map((sc: any) => ({
        id: sc.id,
        companyId: sc.companyId,
        categoryId: sc.categoryId,
        displayName: sc.displayName,
        icon: sc.icon || sc.category?.icon, // Handle potential undefined category
        sortOrder: sc.sortOrder,
        visible: sc.visible,
        items: Array.isArray(sc.items)
          ? sc.items.map((sub: any) => ({
              id: sub.id, name: sub.name, slug: sub.slug, sortOrder: sub.sortOrder, visible: sub.visible,
            }))
          : Array.isArray(sc.category?.subcategories) // Handle potential undefined category
            ? sc.category.subcategories.map((sub: any) => ({
                id: sub._id?.$oid || sub.id, name: sub.name, slug: sub.slug, sortOrder: sub.sortOrder, visible: sub.visible,
              }))
            : [],
        allBrands: sc.allBrands || [],
        category: {
          id: sc.category?.id, name: sc.category?.name, slug: sc.category?.slug, // Optional chaining for safety
          description: sc.category?.description, longDescription: sc.category?.longDescription,
          seoTitle: sc.category?.seoTitle, seoDescription: sc.category?.seoDescription,
          metaKeywords: sc.category?.metaKeywords, sortOrder: sc.category?.sortOrder,
          visible: sc.category?.visible, isFeatured: sc.category?.isFeatured,
          showInHomepage: sc.category?.showInHomepage, attributes: sc.category?.attributes,
          subcategories: Array.isArray(sc.category?.subcategories)
            ? sc.category.subcategories.map((sub: any) => ({
                id: sub._id?.$oid || sub.id, name: sub.name, slug: sub.slug, sortOrder: sub.sortOrder, visible: sub.visible,
              }))
            : [],
          icon: sc.category?.icon, image: sc.category?.image,
        },
      }));
      setCategories(storeCategories);
    } catch (err: any) {
      setError(err.message || "Network error fetching categories.");
    } finally {
      setIsLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // --- Data Fetching for Locations ---
  const fetchLocations = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/admin/locations`, { headers: { 'Content-Type': 'application/json', 'Credentials': 'include' } });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      console.log("[VehicleManagementPage] Fetched locations:", data);
      setLocations(data.data.data || []);
    } catch (err: any) {
      // setError(`Failed to fetch locations: ${err.message}`); // Only set error if needed for UI
    }
  }, []);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  // --- Data Fetching for Vehicles (Market Listings) ---
  const fetchVehicles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiUrl}/admin/my-market-place?companyId=${companyId}`, { headers: { 'Content-Type': 'application/json', 'Credentials': 'include' } });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
      }
      const json = await response.json();
      console.log("[VehicleManagementPage] Fetched marketplace products:", json);
      const marketListings = json.data.results as MarketListingForm[];
      setVehicles(marketListings);
    } catch (err: any) {
      console.error("[VehicleManagementPage] Failed to fetch marketplace products:", err);
      setError(err.message || "Failed to load vehicles.");
    } finally {
      setIsLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  // --- CRUD Operations ---
  const handleSaveVehicle = useCallback((vehicleToSave: MarketListingForm) => {
    setVehicles(prevVehicles => {
      const existingIndex = prevVehicles.findIndex(p => p.id === vehicleToSave.id);
      if (existingIndex > -1) {
        const updatedVehicles = [...prevVehicles];
        updatedVehicles[existingIndex] = vehicleToSave;
        return updatedVehicles;
      } else {
        return [vehicleToSave, ...prevVehicles];
      }
    });
    setShowAddToMarketProductModal(false);
    setSelectedVehicle(null);
    fetchVehicles(); // Re-fetch for backend consistency
  }, [fetchVehicles]);

  const handleDeleteVehicle = useCallback(async (vehicleId: string) => {
    try {
      // Uncomment and use your actual API call for deletion
      // const response = await fetch(`${apiUrl}/admin/my-market-place/${vehicleId}`, {
      //   method: 'DELETE',
      // });
      // if (!response.ok) {
      //   const errorData = await response.json();
      //   throw new Error(errorData.message || 'Failed to delete vehicle.');
      // }
      setVehicles(prevVehicles => prevVehicles.filter(p => p.id !== vehicleId));
      setIsDeleteModalOpen(false);
      setSelectedVehicle(null);
    } catch (err: any) {
      setError(err.message || 'Error deleting vehicle.');
    }
  }, []);

  // --- Modal Handlers ---
  const handleAddClick = () => {
    setSelectedVehicle(null);
    setShowAddToMarketProductModal(true);
  };

  const handleEditClick = (vehicle: MarketListingForm) => {
    setSelectedVehicle(vehicle);
    setShowAddToMarketProductModal(true);
  };

  const handleDeleteConfirmClick = (vehicle: MarketListingForm) => {
    setSelectedVehicle(vehicle);
    setIsDeleteModalOpen(true);
  };

  const handleCloseModals = () => {
    setShowAddToMarketProductModal(false);
    setIsDeleteModalOpen(false);
    setSelectedVehicle(null);
    setError(null);
  };

  // --- Filtering and Memoization ---
  const filteredVehicles = useMemo(() => {
    return vehicles.filter(prop => {
      const matchesSearch = prop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (prop.locationName?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
        (prop.contactName?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
        (prop.category?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

      const matchesStatus = filterStatus === 'All' || prop.status === filterStatus;
      const matchesType = filterType === 'All' || prop.type === filterType;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [vehicles, searchTerm, filterStatus, filterType]);

  const uniqueStatuses = useMemo(() => Array.from(new Set(vehicles.map(p => p.status))).filter(Boolean) as string[], [vehicles]);
  const uniqueTypes = useMemo(() => Array.from(new Set(vehicles.map(p => p.type))).filter(Boolean) as string[], [vehicles]);

  // --- Utility Functions for Display ---
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(price);
  };

  const getStatusBadgeClass = (status: MarketListingForm['status']) => {
    switch (status) {
      case 'Available': return 'bg-green-100 text-green-800 ring-green-600/20';
      case 'Under_Offer': return 'bg-yellow-100 text-yellow-800 ring-yellow-600/20';
      case 'Sold': return 'bg-red-100 text-red-800 ring-red-600/20';
      case 'Draft': return 'bg-gray-100 text-gray-800 ring-gray-600/20';
      default: return 'bg-gray-100 text-gray-800 ring-gray-600/20';
    }
  };

  const getProductTypeIcon = (productTypeId: MarketListingForm['category']) => {
    switch (productTypeId) {
      case 'vehicle': return <HomeModernIcon className="h-4 w-4 mr-1 text-indigo-500" />;
      case 'vehicle': return <TruckIcon className="h-4 w-4 mr-1 text-emerald-500" />;
      case 'book': return <BookOpenIcon className="h-4 w-4 mr-1 text-rose-500" />;
      default: return <TagIcon className="h-4 w-4 mr-1 text-gray-400" />;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen font-sans text-gray-800">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
        <div className="flex flex-col">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight flex items-center">
            <BuildingOfficeIcon className="h-10 w-10 text-indigo-600 mr-4 drop-shadow-md" />
            Vehicle Listings
            <span className="ml-4 text-teal-600 text-xl sm:text-2xl transform rotate-6 animate-pulse-slight">🏠</span>
          </h1>
          <p className="text-lg text-gray-600 mt-3 max-w-2xl">
            Effortlessly manage your diverse vehicle portfolio, add new listings, and update details.
          </p>
        </div>
        <button
          onClick={handleAddClick}
          className="inline-flex items-center px-7 py-3.5 border border-transparent text-lg font-semibold rounded-full shadow-lg text-white bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 focus:outline-none focus:ring-3 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 group"
        >
          <PlusCircleIcon className="-ml-1 mr-3 h-7 w-7 group-hover:rotate-90 transition-transform duration-300" aria-hidden="true" />
          Add New Listing
        </button>
      </div>

      {/* Loading and Error Indicators */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-12 bg-white rounded-2xl shadow-xl border border-blue-200 animate-fade-in-up">
          <svg className="animate-spin h-10 w-10 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-xl font-medium text-blue-700">Loading your marketplace listings...</p>
          <p className="text-md text-gray-500 mt-2">Patience, valuable assets are on their way!</p>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-400 text-red-800 px-8 py-5 rounded-2xl relative shadow-lg flex items-center justify-between animate-fade-in-down">
          <div className="flex items-center">
            <XMarkIcon className="h-7 w-7 text-red-600 mr-3" />
            <div>
              <strong className="font-bold text-lg">Oops! Error!</strong>
              <span className="block sm:inline ml-2 text-md">{error}</span>
            </div>
          </div>
          <button onClick={() => setError(null)} className="text-red-600 hover:text-red-900 focus:outline-none p-2 rounded-full hover:bg-red-100 transition-colors duration-200">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
      )}

      {/* Search and Filters Section */}
      {!isLoading && !error && (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-7 animate-slide-in-up">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-7">
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

          {/* Vehicles List/Table */}
          <div className="overflow-x-auto rounded-xl shadow-inner border border-gray-100 bg-gray-50 p-1">
            {filteredVehicles.length === 0 ? (
              <div className="text-center text-gray-500 py-20 bg-white rounded-xl shadow-md border border-gray-200">
                <BuildingOfficeIcon className="mx-auto h-16 w-16 text-gray-300 mb-4 animate-bounce-slight" />
                <h3 className="mt-3 text-2xl font-semibold text-gray-900">No listings found</h3>
                <p className="mt-2 text-md text-gray-600">
                  It looks a bit empty here! Try adjusting your search filters or click "Add New Listing" to get started.
                </p>
                <button
                  onClick={handleAddClick}
                  className="mt-6 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-md text-white bg-indigo-500 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 transition-transform transform hover:scale-105"
                >
                  <PlusCircleIcon className="-ml-1 mr-2 h-5 w-5" />
                  Add First Listing
                </button>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-100 to-gray-200">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">
                      Listing
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">
                      Details
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">
                      Price
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">
                      Agent
                    </th>
                    <th scope="col" className="relative px-6 py-4">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredVehicles.map((vehicle) => (
                    <tr key={vehicle.id} className="hover:bg-blue-50 transition-colors duration-200 ease-in-out">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <div className="flex items-center">
                          {vehicle.images && vehicle.images.length > 0 ? (
                            <div className="flex-shrink-0 h-16 w-16 mr-4 rounded-lg overflow-hidden shadow-md border border-gray-200">
                              <img className="h-full w-full object-cover" src={vehicle.images[0]} alt={vehicle.name} />
                            </div>
                          ) : (
                            <div className="flex-shrink-0 h-16 w-16 mr-4 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 shadow-inner">
                              <PhotoIcon className="h-8 w-8" />
                            </div>
                          )}
                          <div>
                            <div className="text-lg font-semibold text-gray-800 leading-snug">{vehicle.name}</div>
                            <div className="text-xs text-gray-500 flex items-center mt-1">
                              <MapPinIcon className="h-3.5 w-3.5 mr-1.5 text-gray-400" /> {vehicle.locationName}, 
                              {/* {vehicle.selectedLocationDetails?.city || 'N/A'} */}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <div className="space-y-1">
                          <div className="flex items-center text-gray-700 font-medium">
                            {getProductTypeIcon(vehicle.category)} {vehicle.type}
                          </div>
                          {vehicle.category === 'vehicle' && (
                            <>
                              <div className="flex items-center text-gray-500">
                                <HomeModernIcon className="h-4 w-4 mr-1 text-gray-400" /> {vehicle.bedrooms?.length ? `${vehicle.bedrooms.length} Beds` : 'N/A Beds'}
                              </div>
                              <div className="flex items-center text-gray-500">
                                <HomeModernIcon className="h-4 w-4 mr-1 text-gray-400" /> {vehicle.bathrooms ?? 'N/A'} Baths
                              </div>
                              <div className="flex items-center text-gray-500">
                                <HomeModernIcon className="h-4 w-4 mr-1 text-gray-400" /> {vehicle.area ?? 'N/A'} SqFt
                              </div>
                            </>
                          )}
                          {vehicle.category === 'vehicle' && (
                            <>
                              <div className="flex items-center text-gray-500">
                                <TruckIcon className="h-4 w-4 mr-1 text-gray-400" /> Make: {vehicle.make ?? 'N/A'}
                              </div>
                              <div className="flex items-center text-gray-500">
                                <TruckIcon className="h-4 w-4 mr-1 text-gray-400" /> Model: {vehicle.model ?? 'N/A'}
                              </div>
                              <div className="flex items-center text-gray-500">
                                <TruckIcon className="h-4 w-4 mr-1 text-gray-400" /> Mileage: {vehicle.mileage ?? 'N/A'}
                              </div>
                            </>
                          )}
                          {vehicle.category === 'book' && (
                            <>
                              <div className="flex items-center text-gray-500">
                                <BookOpenIcon className="h-4 w-4 mr-1 text-gray-400" /> Author: {vehicle.author ?? 'N/A'}
                              </div>
                              <div className="flex items-center text-gray-500">
                                <BookOpenIcon className="h-4 w-4 mr-1 text-gray-400" /> Publisher: {vehicle.publisher ?? 'N/A'}
                              </div>
                              <div className="flex items-center text-gray-500">
                                <BookOpenIcon className="h-4 w-4 mr-1 text-gray-400" /> ISBN: {vehicle.isbn ?? 'N/A'}
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xl font-extrabold text-teal-700">
                          {formatPrice(vehicle.finalPrice ?? 0)}
                        </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3.5 py-1.5 inline-flex text-xs leading-5 font-bold rounded-full shadow-sm ring-1 ring-inset ${getStatusBadgeClass(vehicle.status)}`}>
                          {vehicle.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {vehicle.contactName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          {/* <Link
                            href={`/admin/${params.slug}/vehicles/${vehicle.id}`}
                            className="text-indigo-600 hover:text-indigo-800 p-2.5 rounded-full hover:bg-indigo-50 transition-all duration-200 transform hover:scale-110"
                            title="View Details"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </Link> */}
                          <button
                            onClick={() => handleEditClick(vehicle)}
                            className="text-blue-600 hover:text-blue-800 p-2.5 rounded-full hover:bg-blue-50 transition-all duration-200 transform hover:scale-110"
                            title="Edit"
                          >
                            <PencilSquareIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteConfirmClick(vehicle)}
                            className="text-red-600 hover:text-red-800 p-2.5 rounded-full hover:bg-red-50 transition-all duration-200 transform hover:scale-110"
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

      {/* Add To Market Product Modal */}
      {showAddToMarketProductModal && (
        <AddToProductMarketModal
          showRequestProductModal={showAddToMarketProductModal}
          setShowRequestProductModal={setShowAddToMarketProductModal}
          categories={categories ?? []}
          companyId={companyId?.toString() || ''}
          locations={locations ?? []}
          marketListItem={selectedVehicle}
          // onSave={handleSaveVehicle}
        />
      )}

      {/* Vehicle Delete Confirmation Modal (Improved inline styling) */}
      {isDeleteModalOpen && selectedVehicle && (
        // You can replace this with your dedicated VehicleDeleteConfirmModal component if it's styled nicely
        // <VehicleDeleteConfirmModal
        //   isOpen={isDeleteModalOpen}
        //   onClose={handleCloseModals}
        //   onConfirmDelete={handleDeleteVehicle}
        //   vehicle={selectedVehicle}
        // />
        <div className="fixed inset-0 bg-gray-900 bg-opacity-70 overflow-y-auto h-full w-full z-50 flex justify-center items-center p-4 animate-fade-in">
          <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md mx-auto transform transition-all duration-300 ease-out scale-95 opacity-0 animate-scale-in-modal">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Confirm Deletion</h3>
              <button onClick={handleCloseModals} className="text-gray-400 hover:text-gray-600 transition-colors">
                <XMarkIcon className="h-7 w-7" />
              </button>
            </div>
            <p className="text-lg text-gray-700 mb-8 leading-relaxed">
              Are you absolutely sure you want to permanently delete <span className="font-semibold text-red-600">"{selectedVehicle.name}"</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleCloseModals}
                className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteVehicle(selectedVehicle.id)}
                className="px-6 py-3 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200"
              >
                Delete Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}