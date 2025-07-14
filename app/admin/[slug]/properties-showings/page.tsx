// app/admin/[adminSlug]/showings/page.tsx
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
} from '@heroicons/react/24/outline';
import Link from 'next/link';

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
};

// --- Sample Data Generation ---
const generateSampleShowings = (): Showing[] => [
  {
    id: 'SHW001',
    propertyId: 'PROP001',
    propertyName: 'Modern Apartment in Kilimani',
    clientId: 'CLNT001',
    clientName: 'Alice Wonderland',
    agentId: 'AGT001',
    agentName: 'John Doe',
    dateTime: new Date('2025-07-16T11:00:00Z').toISOString(),
    status: 'Scheduled',
    notes: 'Client is very keen on a quick purchase.',
    createdAt: new Date('2025-07-14T10:00:00Z').toISOString(),
  },
  {
    id: 'SHW002',
    propertyId: 'PROP002',
    propertyName: 'Spacious Family House, Karen',
    clientId: 'CLNT003',
    clientName: 'Grace Wanjiru',
    agentId: 'AGT002',
    agentName: 'Jane Smith',
    dateTime: new Date('2025-07-15T14:00:00Z').toISOString(),
    status: 'Completed',
    notes: 'Client liked it but budget might be an issue. Follow up with financing options.',
    createdAt: new Date('2025-07-11T09:00:00Z').toISOString(),
  },
  {
    id: 'SHW003',
    propertyId: 'PROP003',
    propertyName: 'Commercial Office Space, CBD',
    clientId: 'CLNT002',
    clientName: 'Bob The Builder',
    agentId: 'AGT001',
    agentName: 'John Doe',
    dateTime: new Date('2025-07-17T10:30:00Z').toISOString(),
    status: 'Scheduled',
    notes: 'Needs to confirm with business partner.',
    createdAt: new Date('2025-07-13T16:00:00Z').toISOString(),
  },
  {
    id: 'SHW004',
    propertyId: 'PROP005',
    propertyName: 'Studio Apartment, Westlands',
    clientId: 'CLNT001',
    clientName: 'Alice Wonderland',
    agentId: 'AGT002',
    agentName: 'Jane Smith',
    dateTime: new Date('2025-07-13T16:30:00Z').toISOString(),
    status: 'Canceled',
    notes: 'Client had a last-minute conflict.',
    createdAt: new Date('2025-07-12T13:00:00Z').toISOString(),
  },
];

interface ShowingsPageProps {
  params: {
    adminSlug: string;
  };
}

export default function ShowingsPage({ params }: ShowingsPageProps) {
  const { adminSlug } = params;
  const [showings, setShowings] = useState<Showing[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showingToDelete, setShowingToDelete] = useState<Showing | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

  const fetchShowings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Simulate API call
      // const res = await fetch(`${apiUrl}/showings?adminSlug=${adminSlug}`);
      // if (!res.ok) throw new Error('Failed to fetch showings');
      // const data: Showing[] = await res.json();
      // setShowings(data);

      const data = generateSampleShowings();
      // Sort by upcoming/recent
      setShowings(data.sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()));
    } catch (err: any) {
      console.error("Error fetching showings:", err);
      setError(err.message || "Failed to load showings.");
    } finally {
      setIsLoading(false);
    }
  }, [adminSlug]);

  useEffect(() => {
    fetchShowings();
  }, [fetchShowings]);

  const handleDeleteClick = (showing: Showing) => {
    setShowingToDelete(showing);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (showingToDelete) {
      setIsLoading(true);
      try {
        // Simulate API call for deletion
        // const res = await fetch(`${apiUrl}/showings/${showingToDelete.id}`, { method: 'DELETE' });
        // if (!res.ok) throw new Error('Failed to delete showing');
        setShowings(prev => prev.filter(s => s.id !== showingToDelete.id));
        setShowDeleteModal(false);
        setShowingToDelete(null);
      } catch (err: any) {
        setError(err.message || "Failed to delete showing.");
      } finally {
        setIsLoading(false);
      }
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

  const uniqueStatuses = useMemo(() => Array.from(new Set(showings.map(s => s.status))), [showings]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Property Showings
            <span className="ml-2 text-green-600 text-base sm:text-xl">📅</span>
          </h1>
          <p className="text-md text-gray-600 mt-1">
            Manage all scheduled and completed property viewings.
          </p>
        </div>
        <Link
          href={`/admin/${adminSlug}/showings/schedule-new`}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
          <PlusCircleIcon className="-ml-1 mr-3 h-5 w-5" aria-hidden="true" />
          Schedule New Showing
        </Link>
      </div>

      {/* Loading and Error Indicators */}
      {isLoading && (
        <div className="flex items-center justify-center py-4 text-blue-700 font-medium text-lg">
          <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading showings...
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="relative col-span-full md:col-span-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by property, client, agent..."
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
          {/* Add more filters, e.g., by date range */}
        </div>

        {/* Showings Table */}
        <div className="overflow-x-auto">
          {filteredShowings.length === 0 && !isLoading && !error ? (
            <p className="text-center text-gray-500 py-8">No showings found matching your criteria.</p>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Property
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Agent
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredShowings.map((showing) => (
                  <tr key={showing.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center gap-2">
                      <HomeIcon className="h-5 w-5 text-gray-500" /> {showing.propertyName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex items-center gap-2">
                      <UserIcon className="h-5 w-5 text-gray-500" /> {showing.clientName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex items-center gap-2">
                      <BriefcaseIcon className="h-5 w-5 text-gray-500" /> {showing.agentName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(showing.dateTime).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${showing.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' : ''}
                        ${showing.status === 'Completed' ? 'bg-green-100 text-green-800' : ''}
                        ${showing.status === 'Canceled' ? 'bg-red-100 text-red-800' : ''}
                      `}>
                        {showing.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Link href={`/admin/${adminSlug}/showings/${showing.id}`} className="text-indigo-600 hover:text-indigo-900" title="View Details">
                          <EyeIcon className="h-5 w-5" />
                        </Link>
                        <Link href={`/admin/${adminSlug}/showings/${showing.id}/edit`} className="text-blue-600 hover:text-blue-900" title="Edit">
                          <PencilSquareIcon className="h-5 w-5" />
                        </Link>
                        <button
                          onClick={() => handleDeleteClick(showing)}
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
      {showDeleteModal && showingToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm transform transition-all duration-300 scale-100 opacity-100">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Deletion</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete the showing for "{showingToDelete.propertyName}" with "{showingToDelete.clientName}" on {new Date(showingToDelete.dateTime).toLocaleDateString()}? This action cannot be undone.
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