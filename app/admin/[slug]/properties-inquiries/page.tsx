// app/admin/[adminSlug]/inquiries/page.tsx
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  EnvelopeOpenIcon,
  ArchiveBoxIcon,
  UserCircleIcon,
  BuildingOfficeIcon,
  CalendarDaysIcon,
  XMarkIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

// --- Type Definitions ---
export type Inquiry = {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  message: string;
  propertyId?: string;
  propertyName?: string;
  status: 'New' | 'Read' | 'Responded' | 'Archived';
  receivedAt: string; // ISO string
  assignedToAgentId?: string;
  assignedToAgentName?: string;
};

// --- Sample Data Generation ---
const generateSampleInquiries = (): Inquiry[] => [
  {
    id: 'INQ001',
    clientName: 'Alice Wonderland',
    clientEmail: 'alice@example.com',
    clientPhone: '+254711223344',
    message: 'I am interested in the Modern Apartment in Kilimani. Can I schedule a viewing next week?',
    propertyId: 'PROP001',
    propertyName: 'Modern Apartment in Kilimani',
    status: 'New',
    receivedAt: new Date('2024-07-14T10:00:00Z').toISOString(),
    assignedToAgentId: 'AGT001',
    assignedToAgentName: 'John Doe',
  },
  {
    id: 'INQ002',
    clientName: 'Bob The Builder',
    clientEmail: 'bob@example.com',
    message: 'Looking for a commercial space around CBD. What options do you have under 100M KES?',
    status: 'Read',
    receivedAt: new Date('2024-07-13T15:00:00Z').toISOString(),
  },
  {
    id: 'INQ003',
    clientName: 'Eve Johnson',
    clientEmail: 'eve.j@example.com',
    clientPhone: '+254722334455',
    message: 'Could you provide more details about the Spacious Family House in Karen? Any recent price changes?',
    propertyId: 'PROP002',
    propertyName: 'Spacious Family House, Karen',
    status: 'Responded',
    receivedAt: new Date('2024-07-12T09:00:00Z').toISOString(),
    assignedToAgentId: 'AGT002',
    assignedToAgentName: 'Jane Smith',
  },
  {
    id: 'INQ004',
    clientName: 'Frank Green',
    clientEmail: 'frank.g@example.com',
    message: 'I am looking for land in Ruiru. Do you have anything available for agricultural use?',
    status: 'Archived',
    receivedAt: new Date('2024-07-01T11:00:00Z').toISOString(),
  },
];

interface InquiriesPageProps {
  params: {
    adminSlug: string;
  };
}

export default function InquiriesPage({ params }: InquiriesPageProps) {
  const { adminSlug } = params;
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

  const fetchInquiries = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Simulate API call
      // const res = await fetch(`${apiUrl}/inquiries?adminSlug=${adminSlug}`);
      // if (!res.ok) throw new Error('Failed to fetch inquiries');
      // const data: Inquiry[] = await res.json();
      // setInquiries(data);

      const data = generateSampleInquiries();
      setInquiries(data.sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime()));
    } catch (err: any) {
      console.error("Error fetching inquiries:", err);
      setError(err.message || "Failed to load inquiries.");
    } finally {
      setIsLoading(false);
    }
  }, [adminSlug]);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  const updateInquiryStatus = async (id: string, newStatus: Inquiry['status']) => {
    // In a real app, you'd send an API request to update the status
    // For now, simulate success
    setIsLoading(true);
    try {
      // const res = await fetch(`${apiUrl}/inquiries/${id}/status`, {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ status: newStatus }),
      // });
      // if (!res.ok) throw new Error('Failed to update inquiry status');
      setInquiries(prev =>
        prev.map(inq => (inq.id === id ? { ...inq, status: newStatus } : inq))
      );
    } catch (err: any) {
      setError(err.message || "Failed to update status.");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredInquiries = useMemo(() => {
    return inquiries.filter(inq => {
      const matchesSearch = inq.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            inq.clientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (inq.clientPhone?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
                            inq.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (inq.propertyName?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
                            (inq.assignedToAgentName?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
      const matchesStatus = filterStatus === 'All' || inq.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [inquiries, searchTerm, filterStatus]);

  const uniqueStatuses = useMemo(() => Array.from(new Set(inquiries.map(i => i.status))), [inquiries]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Client Inquiries
            <span className="ml-2 text-sky-600 text-base sm:text-xl">💬</span>
          </h1>
          <p className="text-md text-gray-600 mt-1">
            Manage all incoming messages and leads from potential clients.
          </p>
        </div>
        {/* No direct "Add New Inquiry" button, as inquiries typically come from clients */}
      </div>

      {/* Loading and Error Indicators */}
      {isLoading && (
        <div className="flex items-center justify-center py-4 text-blue-700 font-medium text-lg">
          <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading inquiries...
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
              placeholder="Search by client, property, message..."
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
          {/* Add more filters, e.g., by assigned agent */}
        </div>

        {/* Inquiries List */}
        <div className="overflow-x-auto">
          {filteredInquiries.length === 0 && !isLoading && !error ? (
            <p className="text-center text-gray-500 py-8">No inquiries found matching your criteria.</p>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Message Summary
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Property
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Received
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInquiries.map((inquiry) => (
                  <tr key={inquiry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{inquiry.clientName}</div>
                      <div className="text-sm text-gray-500">{inquiry.clientEmail}</div>
                      {inquiry.clientPhone && <div className="text-xs text-gray-400">{inquiry.clientPhone}</div>}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800 max-w-xs truncate">
                      {inquiry.message}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {inquiry.propertyName || 'General Inquiry'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${inquiry.status === 'New' ? 'bg-indigo-100 text-indigo-800' : ''}
                        ${inquiry.status === 'Read' ? 'bg-blue-100 text-blue-800' : ''}
                        ${inquiry.status === 'Responded' ? 'bg-green-100 text-green-800' : ''}
                        ${inquiry.status === 'Archived' ? 'bg-gray-100 text-gray-800' : ''}
                      `}>
                        {inquiry.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(inquiry.receivedAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Link href={`/admin/${adminSlug}/inquiries/${inquiry.id}`} className="text-indigo-600 hover:text-indigo-900" title="View Details">
                          <EyeIcon className="h-5 w-5" />
                        </Link>
                        {inquiry.status !== 'Responded' && inquiry.status !== 'Archived' && (
                          <button
                            onClick={() => updateInquiryStatus(inquiry.id, 'Responded')}
                            className="text-green-600 hover:text-green-900"
                            title="Mark as Responded"
                            disabled={isLoading}
                          >
                            <CheckCircleIcon className="h-5 w-5" />
                          </button>
                        )}
                        {inquiry.status !== 'Archived' && (
                          <button
                            onClick={() => updateInquiryStatus(inquiry.id, 'Archived')}
                            className="text-gray-600 hover:text-gray-900"
                            title="Archive Inquiry"
                            disabled={isLoading}
                          >
                            <ArchiveBoxIcon className="h-5 w-5" />
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