// app/admin/[adminSlug]/offers/page.tsx
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
} from '@heroicons/react/24/outline';
import Link from 'next/link';

// --- Type Definitions ---
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
  closureDate?: string; // ISO string
  notes?: string;
  contractUrl?: string; // Link to the contract document
};

// --- Sample Data Generation ---
const generateSampleOffers = (): OfferContract[] => [
  {
    id: 'OFF001',
    propertyId: 'PROP001',
    propertyName: 'Modern Apartment in Kilimani',
    clientId: 'CLNT001',
    clientName: 'Alice Wonderland',
    agentId: 'AGT001',
    agentName: 'John Doe',
    offerAmount: 14500000,
    status: 'Pending',
    offerDate: new Date('2025-07-14T12:00:00Z').toISOString(),
    notes: 'Client made a cash offer, waiting for seller approval.',
  },
  {
    id: 'OFF002',
    propertyId: 'PROP002',
    propertyName: 'Spacious Family House, Karen',
    clientId: 'CLNT003',
    clientName: 'Grace Wanjiru',
    agentId: 'AGT002',
    agentName: 'Jane Smith',
    offerAmount: 43000000,
    status: 'Accepted',
    offerDate: new Date('2025-07-08T10:00:00Z').toISOString(),
    closureDate: new Date('2025-07-15T10:00:00Z').toISOString(),
    notes: 'Accepted. Finalizing paperwork.',
    contractUrl: 'https://example.com/contract-prop002.pdf',
  },
  {
    id: 'OFF003',
    propertyId: 'PROP003',
    propertyName: 'Commercial Office Space, CBD',
    clientId: 'CLNT002',
    clientName: 'Bob The Builder',
    agentId: 'AGT001',
    agentName: 'John Doe',
    offerAmount: 78000000,
    status: 'Rejected',
    offerDate: new Date('2025-07-05T14:00:00Z').toISOString(),
    notes: 'Seller wanted higher price.',
  },
  {
    id: 'OFF004',
    propertyId: 'PROP004',
    propertyName: 'Prime Land in Ruiru',
    clientId: 'CLNT004',
    clientName: 'Peter Ngugi',
    agentId: 'AGT003',
    agentName: 'Emily White',
    offerAmount: 20000000,
    status: 'Closed',
    offerDate: new Date('2024-12-01T09:00:00Z').toISOString(),
    closureDate: new Date('2025-01-10T10:00:00Z').toISOString(),
    notes: 'Deal successfully closed.',
    contractUrl: 'https://example.com/contract-prop004.pdf',
  },
];

interface OffersPageProps {
  params: {
    adminSlug: string;
  };
}

export default function OffersPage({ params }: OffersPageProps) {
  const { adminSlug } = params;
  const [offers, setOffers] = useState<OfferContract[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

  const fetchOffers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Simulate API call
      // const res = await fetch(`${apiUrl}/offers?adminSlug=${adminSlug}`);
      // if (!res.ok) throw new Error('Failed to fetch offers');
      // const data: OfferContract[] = await res.json();
      // setOffers(data);

      const data = generateSampleOffers();
      setOffers(data.sort((a, b) => new Date(b.offerDate).getTime() - new Date(a.offerDate).getTime()));
    } catch (err: any) {
      console.error("Error fetching offers:", err);
      setError(err.message || "Failed to load offers.");
    } finally {
      setIsLoading(false);
    }
  }, [adminSlug]);

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  const updateOfferStatus = async (id: string, newStatus: OfferContract['status']) => {
    setIsLoading(true);
    try {
      // const res = await fetch(`${apiUrl}/offers/${id}/status`, {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ status: newStatus }),
      // });
      // if (!res.ok) throw new Error('Failed to update offer status');
      setOffers(prev =>
        prev.map(offer => (offer.id === id ? { ...offer, status: newStatus, closureDate: newStatus === 'Closed' ? new Date().toISOString() : offer.closureDate } : offer))
      );
    } catch (err: any) {
      setError(err.message || "Failed to update status.");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredOffers = useMemo(() => {
    return offers.filter(offer => {
      const matchesSearch = offer.propertyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            offer.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            offer.agentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (offer.notes?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
      const matchesStatus = filterStatus === 'All' || offer.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [offers, searchTerm, filterStatus]);

  const uniqueStatuses = useMemo(() => Array.from(new Set(offers.map(o => o.status))), [offers]);

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
            Offers & Contracts
            <span className="ml-2 text-purple-600 text-base sm:text-xl">📄</span>
          </h1>
          <p className="text-md text-gray-600 mt-1">
            Track and manage all property offers and sales contracts.
          </p>
        </div>
        <Link
          href={`/admin/${adminSlug}/offers/create-new`}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
          <PlusCircleIcon className="-ml-1 mr-3 h-5 w-5" aria-hidden="true" />
          Create New Offer
        </Link>
      </div>

      {/* Loading and Error Indicators */}
      {isLoading && (
        <div className="flex items-center justify-center py-4 text-blue-700 font-medium text-lg">
          <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading offers...
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
          {/* Add more filters, e.g., by amount range */}
        </div>

        {/* Offers Table */}
        <div className="overflow-x-auto">
          {filteredOffers.length === 0 && !isLoading && !error ? (
            <p className="text-center text-gray-500 py-8">No offers found matching your criteria.</p>
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
                    Offer Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Offer Date
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOffers.map((offer) => (
                  <tr key={offer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center gap-2">
                      <BuildingOfficeIcon className="h-5 w-5 text-gray-500" /> {offer.propertyName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex items-center gap-2">
                      <UserIcon className="h-5 w-5 text-gray-500" /> {offer.clientName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex items-center gap-2">
                      <BriefcaseIcon className="h-5 w-5 text-gray-500" /> {offer.agentName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="font-semibold">{formatPrice(offer.offerAmount)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${offer.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${offer.status === 'Accepted' ? 'bg-green-100 text-green-800' : ''}
                        ${offer.status === 'Rejected' ? 'bg-red-100 text-red-800' : ''}
                        ${offer.status === 'Closed' ? 'bg-purple-100 text-purple-800' : ''}
                      `}>
                        {offer.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(offer.offerDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Link href={`/admin/${adminSlug}/offers/${offer.id}`} className="text-indigo-600 hover:text-indigo-900" title="View Details">
                          <EyeIcon className="h-5 w-5" />
                        </Link>
                        {offer.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => updateOfferStatus(offer.id, 'Accepted')}
                              className="text-green-600 hover:text-green-900"
                              title="Mark as Accepted"
                              disabled={isLoading}
                            >
                              <CheckBadgeIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => updateOfferStatus(offer.id, 'Rejected')}
                              className="text-red-600 hover:text-red-900"
                              title="Mark as Rejected"
                              disabled={isLoading}
                            >
                              <XMarkIcon className="h-5 w-5" />
                            </button>
                          </>
                        )}
                        {offer.status === 'Accepted' && (
                          <button
                            onClick={() => updateOfferStatus(offer.id, 'Closed')}
                            className="text-purple-600 hover:text-purple-900"
                            title="Mark as Closed"
                            disabled={isLoading}
                          >
                            <CheckBadgeIcon className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}