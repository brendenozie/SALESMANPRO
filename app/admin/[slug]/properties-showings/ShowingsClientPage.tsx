// app/admin/[slug]/showings/ShowingsClientPage.tsx
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
  HomeIcon,
  UserIcon,
  BriefcaseIcon,
  SparklesIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon, // Needed for SelectField helper in form modal
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast'; 

// --- IMPORTING THE NEW MODAL COMPONENTS ---
import { ShowingFormModal } from './ShowingFormModal'; 
import { ShowingDetailsModal } from './ShowingDetailsModal'; 


// --- Type Definitions --
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
  updatedAt: string;
};

// New type for properties, clients, and agents lists
export type SelectOption = { id: string; name: string };


// --- Props for the Client Component ---
interface ShowingsClientPageProps {
    adminSlug: string; 
    initialShowings: Showing[]; 
    isInitialLoadSuccessful: boolean;
    serverLoadError: string | null;
    // NEW PROPS FOR FORM DATA
    allProperties: SelectOption[];
    allClients: SelectOption[];
    allAgents: SelectOption[];
}


export default function ShowingsClientPage({ 
    adminSlug, 
    initialShowings, 
    isInitialLoadSuccessful, 
    serverLoadError,
    allProperties, // Destructured New Prop
    allClients,    // Destructured New Prop
    allAgents,     // Destructured New Prop
}: ShowingsClientPageProps) {
  
  // Initialize state with data passed from the Server Component
  const [showings, setShowings] = useState<Showing[]>(initialShowings);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  
  // Loading and error states for client-side actions
  // Use serverLoadError for initial load error display
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(serverLoadError);

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showingToDelete, setShowingToDelete] = useState<Showing | null>(null);
  const [showCreateEditModal, setShowCreateEditModal] = useState(false);
  const [showingToEdit, setShowingToEdit] = useState<Showing | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showingToView, setShowingToView] = useState<Showing | null>(null);

  // Set the base URL for client-side API calls
  const apiUrl = "/api";//process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';;

  // --- Data Fetching/Refetching (Client-side) ---
  const fetchShowings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const toastId = toast.loading("Refreshing showings...");
    try {
      // NOTE: In a real app, this would be an actual fetch call to /admin/showings.
      // For this example, we mock a successful refresh with current data to prevent loss of unsaved client data.
      toast.success("Showings refreshed!", { id: toastId });
    } catch (err: any) {
      console.error("Error fetching showings:", err);
      setError(err.message || "Failed to load showings.");
      toast.error(err.message || "Failed to refresh showings.", { id: toastId });
    } finally {
      setIsLoading(false);
    }
  }, []); 

  // --- CRUD Handlers (Simulation) ---
  
  const handleCreateNewShowing = () => {
    setShowingToEdit(null);
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
  
  const handleFormSubmit = async (formData: Partial<Showing>) => {
    setIsLoading(true);
    setError(null);
    const toastId = toast.loading(showingToEdit ? 'Updating showing...' : 'Scheduling showing...');

    try {
      // Simulate API success
      await new Promise(resolve => setTimeout(resolve, 800));

      // Optimistically update state
      const newOrUpdatedShowing = { 
        ...(showingToEdit || {}), 
        ...formData, 
        id: showingToEdit?.id || `shw_${Math.floor(Math.random() * 1000)}`,
        createdAt: showingToEdit?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as Showing;

      setShowings(prev => {
        if (showingToEdit) {
          return prev.map(s => s.id === newOrUpdatedShowing.id ? newOrUpdatedShowing : s);
        } else {
          return [newOrUpdatedShowing, ...prev].sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
        }
      });
      
      toast.success(showingToEdit ? 'Showing updated successfully!' : 'Showing scheduled successfully!', { id: toastId });
      setShowCreateEditModal(false);
      setShowingToEdit(null);
    } catch (err: any) {
      toast.error(err.message || `Failed to ${showingToEdit ? 'update' : 'schedule'} showing.`, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };


  const confirmDelete = async () => {
    if (!showingToDelete) return;

    setIsLoading(true);
    setError(null);
    setShowDeleteModal(false); 
    const deleteToastId = toast.loading(`Deleting showing for ${showingToDelete.clientName}...`);

    try {
      // Simulate API success
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Update state
      setShowings(prev => prev.filter(s => s.id !== showingToDelete.id));
      toast.success('Showing deleted permanently.', { id: deleteToastId });
      setShowingToDelete(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete showing.", { id: deleteToastId });
    } finally {
      setIsLoading(false);
    }
  };

  const updateShowingStatus = async (showingId: string, newStatus: Showing['status']) => {
    setIsLoading(true);
    setError(null);
    const toastId = toast.loading(`Marking as ${newStatus}...`);

    try {
      // Simulate API success
      await new Promise(resolve => setTimeout(resolve, 500));

      // Optimistically update state
      setShowings(prev =>
        prev.map(s => (s.id === showingId ? { ...s, status: newStatus, updatedAt: new Date().toISOString() } : s))
      );
      
      toast.success(`Showing successfully marked as ${newStatus}!`, { id: toastId });
    } catch (err: any) {
      toast.error(err.message || `Failed to update status to ${newStatus}.`, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  // --- Filtering Logic (Client-side) ---
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

  const uniqueStatuses: Showing['status'][] = useMemo(() => {
    return ['Scheduled', 'Completed', 'Canceled'];
  }, []);

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
    <>
      <Toaster position="top-right" reverseOrder={false} />

      {/* Schedule New Showing Button (Interactive) */}
      <div className="flex justify-end mb-6">
        <button
          onClick={handleCreateNewShowing}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 transform hover:scale-105"
        >
          <PlusCircleIcon className="-ml-1 mr-3 h-5 w-5" aria-hidden="true" />
          Schedule New Showing
        </button>
      </div>

      {/* Loading and Error Indicators (Client-side) */}
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

      {/* Search and Filters Section (Client-side interactivity) */}
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
                {uniqueStatuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
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
                    <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">Property</th>
                    <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">Client</th>
                    <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">Agent</th>
                    <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">Date & Time</th>
                    <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">Status</th>
                    <th scope="col" className="relative px-6 py-4"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredShowings.map((showing) => (
                    <tr key={showing.id} className="hover:bg-indigo-50 transition-colors duration-200 ease-in-out">
                      <td className="px-6 py-4 whitespace-nowrap text-md font-medium text-gray-900">
                        <div className="flex items-center gap-2"><HomeIcon className="h-5 w-5 text-gray-500 flex-shrink-0" /><span className="truncate max-w-[150px]">{showing.propertyName}</span></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center gap-2"><UserIcon className="h-5 w-5 text-gray-500 flex-shrink-0" /> {showing.clientName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center gap-2"><BriefcaseIcon className="h-5 w-5 text-gray-500 flex-shrink-0" /> {showing.agentName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center gap-2"><ClockIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />{new Date(showing.dateTime).toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3.5 py-1.5 inline-flex text-xs leading-5 font-bold rounded-full shadow-sm ring-1 ring-inset ${getStatusBadgeClass(showing.status)}`}>
                          {showing.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleViewDetailsClick(showing)}
                            className="text-indigo-600 hover:text-indigo-800 p-2.5 rounded-full hover:bg-indigo-50 transition-all duration-200 transform hover:scale-110"
                            title="View Details"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>
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

      {/* --- Modals (Client-side components) --- */}
      {/* Delete Confirmation Modal - (Unchanged) */}
      {showDeleteModal && showingToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md transform transition-all duration-300 scale-100 opacity-100 border border-red-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <ExclamationTriangleIcon className="h-7 w-7 text-red-500 mr-3" /> Confirm Deletion
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


      {/* Create/Edit Showing Modal (Passed the new lists) */}
      <ShowingFormModal
        isOpen={showCreateEditModal}
        onClose={() => {
          setShowCreateEditModal(false);
          setShowingToEdit(null); // Clear editing state on close
          setError(null); // Clear any errors
        }}
        onSubmit={handleFormSubmit}
        showing={showingToEdit ?? undefined} 
        isLoading={isLoading}
        error={error}
        adminSlug={adminSlug}
        // PASSED NEW PROPS
        allProperties={allProperties}
        allClients={allClients}
        allAgents={allAgents}
      />

      {/* View Showing Details Modal (Unchanged) */}
      <ShowingDetailsModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setShowingToView(null);
        }}
        showing={showingToView}
      />
    </>
  );
}