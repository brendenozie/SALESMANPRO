// app/admin/[slug]/offers/OffersClientPage.tsx
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  DocumentTextIcon,
  PlusCircleIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  EyeIcon,
  CheckBadgeIcon,
  ClockIcon,
  BanknotesIcon,
  BuildingOfficeIcon,
  UserIcon,
  XMarkIcon,
  BriefcaseIcon,
  SparklesIcon, 
  TrashIcon,
  CalendarDaysIcon, 
} from '@heroicons/react/24/outline';
import toast, { Toaster } from 'react-hot-toast'; 

// Adjust path for modal imports
import { OfferFormModal } from './OfferFormModal';
import { OfferDetailsModal } from './OfferDetailsModal';


// --- Type Definitions --
export type OfferContract = {
    id: string;
    propertyId: string;
    propertyName: string;
    clientId: string;
    clientName: string;
    agentId: string;
    agentName: string;
    offerAmount: number;
    status: 'Pending' | 'Accepted' | 'Rejected' | 'Closed';
    offerDate: string; // ISO string
    closureDate?: string; // ISO string, optional
    notes?: string;
    contractUrl?: string; // Link to the contract document, optional
    createdAt: string; 
    updatedAt: string; 
};

// New type for properties, clients, and agents lists
export type SelectOption = { id: string; name: string };


// --- Props for the Client Component ---
interface OffersClientPageProps {
    adminSlug: string; 
    initialOffers: OfferContract[]; 
    isInitialLoadSuccessful: boolean;
    serverLoadError: string | null;
    // NEW PROPS FOR FORM DATA
    allProperties: SelectOption[];
    allClients: SelectOption[];
    allAgents: SelectOption[];
}


export default function OffersClientPage({ 
    adminSlug, 
    initialOffers, 
    isInitialLoadSuccessful, 
    serverLoadError,
    allProperties, 
    allClients,    
    allAgents,     
}: OffersClientPageProps) {
  
  const [offers, setOffers] = useState<OfferContract[]>(initialOffers);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(serverLoadError); 

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [offerToDelete, setOfferToDelete] = useState<OfferContract | null>(null);
  const [showCreateEditModal, setShowCreateEditModal] = useState(false);
  const [offerToEdit, setOfferToEdit] = useState<OfferContract | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [offerToView, setOfferToView] = useState<OfferContract | null>(null);

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";//process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';;

  // --- Data Fetching/Refetching (Client-side) ---
  const fetchOffers = useCallback(async (showToast = false) => {
    setIsLoading(true);
    setError(null);
    const toastId = showToast ? toast.loading("Refreshing offers...") : undefined;
    try {
      const res = await fetch(`${apiBaseUrl}/admin/offers?companyId=${encodeURIComponent(adminSlug)}`, { cache: 'no-store' });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to fetch offers.');
      }
      const data = (await res.json()).results; 
      setOffers(data.sort((a: OfferContract, b: OfferContract) => new Date(b.offerDate).getTime() - new Date(a.offerDate).getTime()));
      if(showToast) toast.success("Offers refreshed!", { id: toastId });
    } catch (err: any) {
      console.error("Error fetching offers:", err);
      setError(err.message || "Failed to load offers.");
      if(showToast) toast.error(err.message || "Failed to refresh offers.", { id: toastId });
    } finally {
      setIsLoading(false);
    }
  }, [adminSlug, apiBaseUrl]); 


  // --- CRUD Handlers ---

  const handleCreateNewOffer = () => {
    setOfferToEdit(null); 
    setShowCreateEditModal(true);
  };

  const handleEditClick = (offer: OfferContract) => {
    setOfferToEdit(offer);
    setShowCreateEditModal(true);
  };

  const handleViewDetailsClick = (offer: OfferContract) => {
    setOfferToView(offer);
    setShowDetailsModal(true);
  };

  const handleDeleteClick = (offer: OfferContract) => {
    setOfferToDelete(offer);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!offerToDelete) return;

    setIsLoading(true);
    setError(null);
    setShowDeleteModal(false); 
    const deleteToastId = toast.loading(`Deleting offer for ${offerToDelete.propertyName}...`);

    try {
      const res = await fetch(`${apiBaseUrl}/admin/offers/${encodeURIComponent(offerToDelete.id)}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to delete offer.');
      }
      
      toast.success('Offer deleted successfully.', { id: deleteToastId });
      setOfferToDelete(null);
      await fetchOffers(); 
    } catch (err: any) {
      toast.error(err.message || "Failed to delete offer.", { id: deleteToastId });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = async (formData: Partial<OfferContract>) => {
    setIsLoading(true);
    setError(null);
    const toastId = toast.loading(offerToEdit ? 'Updating offer...' : 'Creating offer...');

    try {
      let res;
      if (offerToEdit) {
        res = await fetch(`${apiBaseUrl}/admin/offers/${encodeURIComponent(offerToEdit.id)}`, {
          method: 'PATCH', 
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      } else {
        res = await fetch(`${apiBaseUrl}/admin/offers`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, companyId: adminSlug }), 
        });
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Failed to ${offerToEdit ? 'update' : 'create'} offer.`);
      }

      toast.success(offerToEdit ? 'Offer updated successfully!' : 'Offer created successfully!', { id: toastId });
      setShowCreateEditModal(false);
      setOfferToEdit(null); 
      await fetchOffers(); 
    } catch (err: any) {
      toast.error(err.message || `Failed to ${offerToEdit ? 'update' : 'create'} offer.`, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  const updateOfferStatus = async (offerId: string, newStatus: OfferContract['status']) => {
    setIsLoading(true);
    setError(null);
    const toastId = toast.loading(`Marking as ${newStatus}...`);

    try {
      const payload: Partial<OfferContract> = { status: newStatus };
      if (newStatus === 'Closed' || newStatus === 'Accepted') {
        payload.closureDate = new Date().toISOString(); 
      }
      
      const res = await fetch(`${apiBaseUrl}/admin/offers/${encodeURIComponent(offerId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Failed to update offer status.`);
      }
      
      toast.success(`Offer successfully marked as ${newStatus}!`, { id: toastId });
      await fetchOffers(); 
    } catch (err: any) {
      toast.error(err.message || `Failed to update status to ${newStatus}.`, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };


  // --- Filtering Logic (Client-side) ---
  const filteredOffers = useMemo(() => {
    return offers.length > 0 ? offers.filter(offer => {
      const matchesSearch = offer.propertyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.agentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (offer.notes?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
      const matchesStatus = filterStatus === 'All' || offer.status === filterStatus;
      return matchesSearch && matchesStatus;
    }) : [];
  }, [offers, searchTerm, filterStatus]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getStatusBadgeClass = (status: OfferContract['status']) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800 ring-yellow-600/20';
      case 'Accepted': return 'bg-green-100 text-green-800 ring-green-600/20';
      case 'Rejected': return 'bg-red-100 text-red-800 ring-red-600/20';
      case 'Closed': return 'bg-purple-100 text-purple-800 ring-purple-600/20';
      default: return 'bg-gray-100 text-gray-800 ring-gray-600/20';
    }
  };

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />

      {/* Create New Offer Button (Interactive) */}
      <div className="flex justify-end mb-6">
        <button
          onClick={handleCreateNewOffer}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 transform hover:scale-105"
          disabled={isLoading}
        >
          <PlusCircleIcon className="-ml-1 mr-3 h-5 w-5" aria-hidden="true" />
          Create New Offer
        </button>
      </div>

      {/* Loading and Error Indicators */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-12 bg-white rounded-2xl shadow-xl border border-blue-200 animate-fade-in-up">
          <svg className="animate-spin h-10 w-10 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-xl font-medium text-blue-700">Loading/Processing request...</p>
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

      {/* Search and Filters */}
      {!isLoading && (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-7 animate-slide-in-up">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-7">
            <div className="relative col-span-full md:col-span-2">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by property, client, agent, or notes..."
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
                {['Pending', 'Accepted', 'Rejected', 'Closed'].map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Offers Table */}
          <div className="overflow-x-auto rounded-xl shadow-inner border border-gray-100 bg-gray-50 p-1">
            {filteredOffers.length === 0 ? (
              <div className="text-center text-gray-500 py-20 bg-white rounded-xl shadow-md border border-gray-200">
                <DocumentTextIcon className="mx-auto h-16 w-16 text-gray-300 mb-4 animate-bounce-slight" />
                <h3 className="mt-3 text-2xl font-semibold text-gray-900">No offers found</h3>
                <p className="mt-2 text-md text-gray-600">
                  Adjust your search filters or create a new offer.
                </p>
                <SparklesIcon className="mx-auto h-12 w-12 text-yellow-400 mt-6 animate-pulse" />
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-100 to-gray-200">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">Property</th>
                    <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">Client</th>
                    <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">Agent</th>
                    <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">Offer Amount</th>
                    <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">Offer Date</th>
                    <th scope="col" className="relative px-6 py-4"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOffers.map((offer) => (
                    <tr key={offer.id} className="hover:bg-indigo-50 transition-colors duration-200 ease-in-out">
                      <td className="px-6 py-4 whitespace-nowrap text-md font-medium text-gray-900">
                        <div className="flex items-center gap-2">
                          <BuildingOfficeIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />
                          <span className="truncate max-w-[150px]">{offer.propertyName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <UserIcon className="h-5 w-5 text-gray-500 flex-shrink-0" /> {offer.clientName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <BriefcaseIcon className="h-5 w-5 text-gray-500 flex-shrink-0" /> {offer.agentName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="font-semibold">{formatPrice(offer.offerAmount)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3.5 py-1.5 inline-flex text-xs leading-5 font-bold rounded-full shadow-sm ring-1 ring-inset ${getStatusBadgeClass(offer.status)}`}>
                          {offer.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <CalendarDaysIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          {new Date(offer.offerDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleViewDetailsClick(offer)} 
                            className="text-indigo-600 hover:text-indigo-800 p-2.5 rounded-full hover:bg-indigo-50 transition-all duration-200 transform hover:scale-110"
                            title="View Details"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleEditClick(offer)}
                            className="text-blue-600 hover:text-blue-800 p-2.5 rounded-full hover:bg-blue-50 transition-all duration-200 transform hover:scale-110"
                            title="Edit Offer"
                          >
                            <PencilSquareIcon className="h-5 w-5" />
                          </button>
                          {offer.status === 'Pending' && (
                            <>
                              <button
                                onClick={() => updateOfferStatus(offer.id, 'Accepted')}
                                className="text-green-600 hover:text-green-800 p-2.5 rounded-full hover:bg-green-50 transition-all duration-200 transform hover:scale-110"
                                title="Mark as Accepted"
                                disabled={isLoading}
                              >
                                <CheckBadgeIcon className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => updateOfferStatus(offer.id, 'Rejected')}
                                className="text-red-600 hover:text-red-800 p-2.5 rounded-full hover:bg-red-50 transition-all duration-200 transform hover:scale-110"
                                title="Mark as Rejected"
                                disabled={isLoading}
                              >
                                <XMarkIcon className="h-5 w-5" />
                              </button>
                            </>
                          )}
                          {(offer.status === 'Accepted' || offer.status === 'Pending') && (
                            <button
                              onClick={() => updateOfferStatus(offer.id, 'Closed')}
                              className="text-purple-600 hover:text-purple-800 p-2.5 rounded-full hover:bg-purple-50 transition-all duration-200 transform hover:scale-110"
                              title="Mark as Closed"
                              disabled={isLoading}
                            >
                              <ClockIcon className="h-5 w-5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteClick(offer)}
                            className="text-gray-600 hover:text-gray-800 p-2.5 rounded-full hover:bg-gray-50 transition-all duration-200 transform hover:scale-110"
                            title="Delete Offer"
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

      {/* Delete Confirmation Modal (Unchanged logic, kept here for context) */}
      {showDeleteModal && offerToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md transform transition-all duration-300 scale-100 opacity-100 border border-red-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <TrashIcon className="h-7 w-7 text-red-500 mr-3" /> Confirm Deletion
            </h3>
            <p className="text-md text-gray-700 mb-6">
              Are you sure you want to delete the offer for "<span className="font-semibold">{offerToDelete.propertyName}</span>" from "<span className="font-semibold">{offerToDelete.clientName}</span>" with an amount of <span className="font-semibold">{formatPrice(offerToDelete.offerAmount)}</span>?
              This action <span className="font-bold text-red-600">cannot be undone</span>.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setOfferToDelete(null);
                }}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors duration-200 shadow-sm"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors duration-200 shadow-md flex items-center"
                disabled={isLoading}
              >
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <TrashIcon className="h-5 w-5 mr-2" />
                )}
                {isLoading ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Create/Edit Offer Modal (Passes the new lists) */}
      <OfferFormModal
        isOpen={showCreateEditModal}
        onClose={() => {
          setShowCreateEditModal(false);
          setOfferToEdit(null); 
          setError(null); 
        }}
        onSubmit={handleFormSubmit}
        offer={offerToEdit ?? undefined} 
        isLoading={isLoading}
        error={error}
        adminSlug={adminSlug}
        // PASSED NEW PROPS
        allProperties={allProperties}
        allClients={allClients}
        allAgents={allAgents}
      />

      {/* View Offer Details Modal (Unchanged) */}
      <OfferDetailsModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setOfferToView(null); 
        }}
        offer={offerToView} 
      />
    </>
  );
}