// app/admin/[adminSlug]/clients/page.tsx
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  UserGroupIcon,
  PlusCircleIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  PhoneIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  CheckBadgeIcon, // For lead status or verified client
  XMarkIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

// --- Type Definitions ---
export type ClientProfile = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  inquiryCount: number;
  dealStatus: 'Lead' | 'Active' | 'Closed' | 'Archived';
  lastActivity: string; // ISO string
  notes?: string;
  preferredPropertyTypes: string[];
  budgetRange: string; // e.g., "10M-20M KES"
};

// --- Sample Data Generation ---
const generateSampleClients = (): ClientProfile[] => [
  {
    id: 'CLNT001',
    name: 'Sarah Kimani',
    email: 'sarah.k@example.com',
    phone: '+254701234567',
    inquiryCount: 5,
    dealStatus: 'Active',
    lastActivity: new Date('2024-07-12T14:30:00Z').toISOString(),
    preferredPropertyTypes: ['Apartment', 'Townhouse'],
    budgetRange: '15M-25M KES',
  },
  {
    id: 'CLNT002',
    name: 'David Omondi',
    email: 'david.o@example.com',
    phone: '+254702345678',
    inquiryCount: 2,
    dealStatus: 'Lead',
    lastActivity: new Date('2024-07-10T10:00:00Z').toISOString(),
    preferredPropertyTypes: ['Commercial'],
    budgetRange: '50M+ KES',
  },
  {
    id: 'CLNT003',
    name: 'Grace Wanjiru',
    email: 'grace.w@example.com',
    phone: '+254703456789',
    inquiryCount: 1,
    dealStatus: 'Closed',
    lastActivity: new Date('2024-06-20T16:00:00Z').toISOString(),
    preferredPropertyTypes: ['House'],
    budgetRange: '30M-40M KES',
  },
  {
    id: 'CLNT004',
    name: 'Peter Ngugi',
    email: 'peter.n@example.com',
    inquiryCount: 0,
    dealStatus: 'Archived',
    lastActivity: new Date('2024-05-01T08:00:00Z').toISOString(),
    preferredPropertyTypes: [],
    budgetRange: 'Any',
  },
];

interface ClientsPageProps {
  params: {
    adminSlug: string;
  };
}

export default function ClientsPage({ params }: ClientsPageProps) {
  const { adminSlug } = params;
  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDealStatus, setFilterDealStatus] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<ClientProfile | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

  const fetchClients = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Simulate API call
      // const res = await fetch(`${apiUrl}/clients?adminSlug=${adminSlug}`);
      // if (!res.ok) throw new Error('Failed to fetch clients');
      // const data: ClientProfile[] = await res.json();
      // setClients(data);

      const data = generateSampleClients();
      setClients(data.sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()));
    } catch (err: any) {
      console.error("Error fetching clients:", err);
      setError(err.message || "Failed to load clients.");
    } finally {
      setIsLoading(false);
    }
  }, [adminSlug]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleDeleteClick = (client: ClientProfile) => {
    setClientToDelete(client);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (clientToDelete) {
      setIsLoading(true);
      try {
        // Simulate API call for deletion
        // const res = await fetch(`${apiUrl}/clients/${clientToDelete.id}`, { method: 'DELETE' });
        // if (!res.ok) throw new Error('Failed to delete client');
        setClients(prev => prev.filter(c => c.id !== clientToDelete.id));
        setShowDeleteModal(false);
        setClientToDelete(null);
      } catch (err: any) {
        setError(err.message || "Failed to delete client.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (client.phone?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
      const matchesDealStatus = filterDealStatus === 'All' || client.dealStatus === filterDealStatus;
      return matchesSearch && matchesDealStatus;
    });
  }, [clients, searchTerm, filterDealStatus]);

  const uniqueDealStatuses = useMemo(() => Array.from(new Set(clients.map(c => c.dealStatus))), [clients]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Manage Clients
            <span className="ml-2 text-orange-600 text-base sm:text-xl">🤝</span>
          </h1>
          <p className="text-md text-gray-600 mt-1">
            Keep track of all your client interactions and deal progress.
          </p>
        </div>
        <Link
          href={`/admin/${adminSlug}/clients/add-new`}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
          <PlusCircleIcon className="-ml-1 mr-3 h-5 w-5" aria-hidden="true" />
          Add New Client
        </Link>
      </div>

      {/* Loading and Error Indicators */}
      {isLoading && (
        <div className="flex items-center justify-center py-4 text-blue-700 font-medium text-lg">
          <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading clients...
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
              placeholder="Search by name, email, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500
                         focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <select
              value={filterDealStatus}
              onChange={(e) => setFilterDealStatus(e.target.value)}
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="All">All Deal Statuses</option>
              {uniqueDealStatuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          {/* Add more filters, e.g., by preferred property type, budget */}
        </div>

        {/* Clients Table */}
        <div className="overflow-x-auto">
          {filteredClients.length === 0 && !isLoading && !error ? (
            <p className="text-center text-gray-500 py-8">No clients found matching your criteria.</p>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deal Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Inquiries
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Activity
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{client.name}</div>
                      <div className="text-sm text-gray-500">{client.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {client.phone && <p className="flex items-center gap-1"><PhoneIcon className="h-4 w-4" /> {client.phone}</p>}
                      <p className="flex items-center gap-1"><EnvelopeIcon className="h-4 w-4" /> {client.email}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${client.dealStatus === 'Active' ? 'bg-green-100 text-green-800' : ''}
                        ${client.dealStatus === 'Lead' ? 'bg-blue-100 text-blue-800' : ''}
                        ${client.dealStatus === 'Closed' ? 'bg-purple-100 text-purple-800' : ''}
                        ${client.dealStatus === 'Archived' ? 'bg-gray-100 text-gray-800' : ''}
                      `}>
                        {client.dealStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <ChatBubbleLeftRightIcon className="h-4 w-4" /> {client.inquiryCount}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(client.lastActivity).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Link href={`/admin/${adminSlug}/clients/${client.id}`} className="text-indigo-600 hover:text-indigo-900" title="View Details">
                          <EyeIcon className="h-5 w-5" />
                        </Link>
                        <Link href={`/admin/${adminSlug}/clients/${client.id}/edit`} className="text-blue-600 hover:text-blue-900" title="Edit">
                          <PencilSquareIcon className="h-5 w-5" />
                        </Link>
                        <button
                          onClick={() => handleDeleteClick(client)}
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
      {showDeleteModal && clientToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm transform transition-all duration-300 scale-100 opacity-100">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Deletion</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete client "{clientToDelete.name}"? This action cannot be undone.
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