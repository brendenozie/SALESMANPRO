'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  CalendarDaysIcon,
  PlusCircleIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  CheckCircleIcon,
  ClockIcon,
  XMarkIcon,
  HomeIcon, // For property icon
  UserIcon, // For client icon
  BriefcaseIcon, // For agent icon
  SparklesIcon, // Added for empty state flair
} from '@heroicons/react/24/outline';
import { useParams } from 'next/navigation';

// Import the new modal components
import { ShowingFormModal } from './ShowingFormModal';
import { ShowingDetailsModal } from './ShowingDetailsModal';

const apiUrl = "/api";//process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';;

// --- Type Definitions ---
export type Showing = {
  id: string;
  propertyId: string;
  propertyName: string;
  clientId: string;
  clientName: string;
  agentId: string;
  agentName: string;
  dateTime: string; // ISO string for showing time
  status: 'Scheduled' | 'Completed' | 'Canceled';
  notes?: string;
  createdAt: string;
  updatedAt: string; // Add updatedAt from Prisma schema
};

// --- Sample Data Generation (REMOVE IN PRODUCTION AFTER API IS READY) ---
// const generateSampleShowings = (): Showing[] => [
//   {
//     id: 'shw_001',
//     propertyId: 'prop_001',
//     propertyName: 'Modern Apartment in Kilimani',
//     clientId: 'clnt_001',
//     clientName: 'Alice Wonderland',
//     agentId: 'agt_001',
//     agentName: 'John Doe',
//     dateTime: new Date('2025-08-01T11:00:00Z').toISOString(), // Future date
//     status: 'Scheduled',
//     notes: 'Client is very keen on a quick purchase.',
//     createdAt: new Date('2025-07-28T10:00:00Z').toISOString(),
//     updatedAt: new Date('2025-07-28T10:00:00Z').toISOString(),
//   },
//   {
//     id: 'shw_002',
//     propertyId: 'prop_002',
//     propertyName: 'Spacious Family House, Karen',
//     clientId: 'clnt_003',
//     clientName: 'Grace Wanjiru',
//     agentId: 'agt_002',
//     agentName: 'Jane Smith',
//     dateTime: new Date('2025-07-29T14:00:00Z').toISOString(), // Past date (completed)
//     status: 'Completed',
//     notes: 'Client liked it but budget might be an issue. Follow up with financing options.',
//     createdAt: new Date('2025-07-25T09:00:00Z').toISOString(),
//     updatedAt: new Date('2025-07-29T14:05:00Z').toISOString(),
//   },
//   {
//     id: 'shw_003',
//     propertyId: 'prop_003',
//     propertyName: 'Commercial Office Space, CBD',
//     clientId: 'clnt_002',
//     clientName: 'Bob The Builder',
//     agentId: 'agt_001',
//     agentName: 'John Doe',
//     dateTime: new Date('2025-08-05T10:30:00Z').toISOString(), // Future date
//     status: 'Scheduled',
//     notes: 'Needs to confirm with business partner.',
//     createdAt: new Date('2025-07-27T16:00:00Z').toISOString(),
//     updatedAt: new Date('2025-07-27T16:00:00Z').toISOString(),
//   },
//   {
//     id: 'shw_004',
//     propertyId: 'prop_005',
//     propertyName: 'Studio Apartment, Westlands',
//     clientId: 'clnt_001',
//     clientName: 'Alice Wonderland',
//     agentId: 'agt_002',
//     agentName: 'Jane Smith',
//     dateTime: new Date('2025-07-26T16:30:00Z').toISOString(), // Past date (canceled)
//     status: 'Canceled',
//     notes: 'Client had a last-minute conflict.',
//     createdAt: new Date('2025-07-26T13:00:00Z').toISOString(),
//     updatedAt: new Date('2025-07-26T13:15:00Z').toISOString(),
//   },
// ];

interface ShowingsPageProps {
  params:Promise<{ slug: string }>
}

export default function ShowingsPage() {
  const { slug: companyId } = useParams() as { slug: string }; // Get the company slug from URL params

  const [showings, setShowings] = useState<Showing[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for Modals
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showingToDelete, setShowingToDelete] = useState<Showing | null>(null);
  const [showCreateEditModal, setShowCreateEditModal] = useState(false);
  const [showingToEdit, setShowingToEdit] = useState<Showing | null>(null); // Null for create, object for edit
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showingToView, setShowingToView] = useState<Showing | null>(null);

  const fetchShowings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}/admin/showings?companyId=${encodeURIComponent(companyId)}`, { credentials: 'include' });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to fetch showings.');
      }
      const data = (await res.json()).data;
      console.log("Fetched showings:", data); 
      setShowings(data.sort((a: Showing, b: Showing) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()));
    } catch (err: any) {
      console.error("Error fetching showings:", err);
      setError(err.message || "Failed to load showings.");
    } finally {
      setIsLoading(false);
    }
  }, [companyId, apiUrl]);

  useEffect(() => {
    fetchShowings();
  }, [fetchShowings]);

  // --- Showing Actions ---

  const handleCreateNewShowing = () => {
    setShowingToEdit(null); // Ensure no showing is pre-filled for create mode
    setShowCreateEditModal(true);
  };

  const handleEditClick = (showing: Showing) => {
    setShowingToEdit(showing);
    setShowCreateEditModal(true);
  };

  const handleViewDetailsClick = (showing: Showing) => {
    setShowingToView(showing);
    setShowDetailsModal(true);
  };

  const handleDeleteClick = (showing: Showing) => {
    setShowingToDelete(showing);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!showingToDelete) return;

    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}/admin/showings/${encodeURIComponent(showingToDelete.id)}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'credentials': 'include' },
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to delete showing.');
      }
      // Optimistically update UI, then refetch for data consistency
      setShowings(prev => prev.filter(s => s.id !== showingToDelete.id));
      setShowDeleteModal(false);
      setShowingToDelete(null);
      await fetchShowings(); // Re-fetch to ensure UI is in sync
    } catch (err: any) {
      setError(err.message || "Failed to delete showing.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = async (formData: Partial<Showing>) => {
    setIsLoading(true);
    setError(null);
    try {
      let res;
      if (showingToEdit) {
        // Edit existing showing
        res = await fetch(`${apiUrl}/admin/showings/${encodeURIComponent(showingToEdit.id)}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'credentials': 'include' },
          body: JSON.stringify(formData),
        });
      } else {
        // Create new showing
        res = await fetch(`${apiUrl}/admin/showings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'credentials': 'include' },
          body: JSON.stringify(formData),
        });
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Failed to ${showingToEdit ? 'update' : 'create'} showing.`);
      }

      setShowCreateEditModal(false);
      setShowingToEdit(null); // Clear for next operation
      await fetchShowings(); // Re-fetch all showings to update the list
    } catch (err: any) {
      setError(err.message || `Failed to ${showingToEdit ? 'update' : 'create'} showing.`);
    } finally {
      setIsLoading(false);
    }
  };

  const updateShowingStatus = async (showingId: string, newStatus: Showing['status']) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}/admin/showings/${encodeURIComponent(showingId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'credentials': 'include' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Failed to update showing status.`);
      }
      await fetchShowings(); // Re-fetch to get the latest data
    } catch (err: any) {
      setError(err.message || `Failed to update showing status.`);
    } finally {
      setIsLoading(false);
    }
  };


  const filteredShowings = useMemo(() => {
    return showings.filter(showing => {
      const matchesSearch = showing.propertyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        showing.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        showing.agentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (showing.notes?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
      const matchesStatus = filterStatus === 'All' || showing.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [showings, searchTerm, filterStatus]);

  const uniqueStatuses = useMemo(() => {
    const statuses = Array.from(new Set(showings.map(s => s.status)));
    const order: Showing['status'][] = ['Scheduled', 'Completed', 'Canceled'];
    return statuses.sort((a, b) => order.indexOf(a) - order.indexOf(b));
  }, [showings]);

  // Helper to get status badge class
  const getStatusBadgeClass = (status: Showing['status']) => {
    switch (status) {
      case 'Scheduled': return 'bg-blue-100 text-blue-800 ring-blue-600/20';
      case 'Completed': return 'bg-green-100 text-green-800 ring-green-600/20';
      case 'Canceled': return 'bg-red-100 text-red-800 ring-red-600/20';
      default: return 'bg-gray-100 text-gray-800 ring-gray-600/20';
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gradient-to-br from-indigo-50 to-green-100 min-h-screen font-sans text-gray-800">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
        <div className="flex flex-col">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight flex items-center">
            <CalendarDaysIcon className="h-10 w-10 text-green-600 mr-4 drop-shadow-md" />
             Viewing Schedule 
            <span className="ml-4 text-purple-600 text-xl sm:text-2xl transform rotate-6 animate-bounce-slight">🏠</span>
          </h1>
          <p className="text-lg text-gray-600 mt-3 max-w-2xl">
            Efficiently manage and track all viewings and appointments.
          </p>
        </div>
        <button
          onClick={handleCreateNewShowing} // Use button to open modal
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 transform hover:scale-105"
        >
          <PlusCircleIcon className="-ml-1 mr-3 h-5 w-5" aria-hidden="true" />
          Schedule New Showing
        </button>
      </div>

      {/* Loading and Error Indicators */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-12 bg-white rounded-2xl shadow-xl border border-blue-200 animate-fade-in-up">
          <svg className="animate-spin h-10 w-10 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-xl font-medium text-blue-700">Loading your property showings...</p>
          <p className="text-md text-gray-500 mt-2">Getting your schedule ready!</p>
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
                {uniqueStatuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            {/* You could add more filters here, e.g., by date range, agent */}
          </div>

          {/* Showings Table */}
          <div className="overflow-x-auto rounded-xl shadow-inner border border-gray-100 bg-gray-50 p-1">
            {filteredShowings.length === 0 ? (
              <div className="text-center text-gray-500 py-20 bg-white rounded-xl shadow-md border border-gray-200">
                <CalendarDaysIcon className="mx-auto h-16 w-16 text-gray-300 mb-4 animate-bounce-slight" />
                <h3 className="mt-3 text-2xl font-semibold text-gray-900">No showings found</h3>
                <p className="mt-2 text-md text-gray-600">
                  Adjust your search filters or schedule a new showing.
                </p>
                <SparklesIcon className="mx-auto h-12 w-12 text-yellow-400 mt-6 animate-pulse" />
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-100 to-gray-200">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">
                      Property
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">
                      Client
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">
                      Agent
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="relative px-6 py-4">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredShowings.map((showing) => (
                    <tr key={showing.id} className="hover:bg-indigo-50 transition-colors duration-200 ease-in-out">
                      <td className="px-6 py-4 whitespace-nowrap text-md font-medium text-gray-900">
                        <div className="flex items-center gap-2">
                          <HomeIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />
                          <span className="truncate max-w-[150px]">{showing.propertyName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <UserIcon className="h-5 w-5 text-gray-500 flex-shrink-0" /> {showing.clientName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <BriefcaseIcon className="h-5 w-5 text-gray-500 flex-shrink-0" /> {showing.agentName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <ClockIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          {new Date(showing.dateTime).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3.5 py-1.5 inline-flex text-xs leading-5 font-bold rounded-full shadow-sm ring-1 ring-inset ${getStatusBadgeClass(showing.status)}`}>
                          {showing.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleViewDetailsClick(showing)} // View details button
                            className="text-indigo-600 hover:text-indigo-800 p-2.5 rounded-full hover:bg-indigo-50 transition-all duration-200 transform hover:scale-110"
                            title="View Details"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>
                          {/* Only allow edit/complete/cancel for Scheduled showings or based on your business logic */}
                          {showing.status === 'Scheduled' && (
                            <>
                              <button
                                onClick={() => updateShowingStatus(showing.id, 'Completed')}
                                className="text-green-600 hover:text-green-800 p-2.5 rounded-full hover:bg-green-50 transition-all duration-200 transform hover:scale-110"
                                title="Mark as Completed"
                              >
                                <CheckCircleIcon className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleEditClick(showing)}
                                className="text-blue-600 hover:text-blue-800 p-2.5 rounded-full hover:bg-blue-50 transition-all duration-200 transform hover:scale-110"
                                title="Edit Showing"
                              >
                                <PencilSquareIcon className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => updateShowingStatus(showing.id, 'Canceled')}
                                className="text-red-600 hover:text-red-800 p-2.5 rounded-full hover:bg-red-50 transition-all duration-200 transform hover:scale-110"
                                title="Cancel Showing"
                              >
                                <XMarkIcon className="h-5 w-5" />
                              </button>
                            </>
                          )}
                          {/* Always allow delete, but only prompt with modal */}
                          <button
                            onClick={() => handleDeleteClick(showing)}
                            className="text-gray-600 hover:text-gray-800 p-2.5 rounded-full hover:bg-gray-50 transition-all duration-200 transform hover:scale-110"
                            title="Delete Showing"
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

      {/* Delete Confirmation Modal (Existing) */}
      {showDeleteModal && showingToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md transform transition-all duration-300 scale-100 opacity-100 border border-red-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <TrashIcon className="h-7 w-7 text-red-500 mr-3" /> Confirm Deletion
            </h3>
            <p className="text-md text-gray-700 mb-6">
              Are you sure you want to delete the showing for "<span className="font-semibold">{showingToDelete.propertyName}</span>" with "<span className="font-semibold">{showingToDelete.clientName}</span>" on <span className="font-semibold">{new Date(showingToDelete.dateTime).toLocaleDateString()}</span>?
              This action <span className="font-bold text-red-600">cannot be undone</span>.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setShowingToDelete(null);
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

      {/* Create/Edit Showing Modal */}
      <ShowingFormModal
        isOpen={showCreateEditModal}
        onClose={() => {
          setShowCreateEditModal(false);
          setShowingToEdit(null); // Clear editing state on close
          setError(null); // Clear any errors
        }}
        onSubmit={handleFormSubmit}
        showing={showingToEdit ?? undefined} // Pass the showing for edit mode, undefined if null
        isLoading={isLoading}
        error={error}
        adminSlug={companyId} // Pass slug for companyId
      />

      {/* View Showing Details Modal */}
      <ShowingDetailsModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setShowingToView(null); // Clear viewing state on close
        }}
        showing={showingToView} // Pass the showing to display
      />
    </div>
  );
}