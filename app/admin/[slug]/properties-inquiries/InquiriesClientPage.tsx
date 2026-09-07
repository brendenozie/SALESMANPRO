// app/admin/[slug]/inquiries/InquiriesClientPage.tsx
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  ArchiveBoxIcon,
  UserCircleIcon,
  BuildingOfficeIcon,
  CalendarDaysIcon,
  XMarkIcon,
  EyeIcon,
  SparklesIcon,
  ArrowPathIcon,
  PaperAirplaneIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';

// --- Type Definitions (Exported for Parent Component use) ---
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

// --- Props for the Client Component ---
interface InquiriesClientPageProps {
    slug: string;
    initialInquiries: Inquiry[];
    isInitialLoadSuccessful: boolean;
    serverLoadError: string | null;
}

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";;

function fetchInquiries(slug: string): Promise<Inquiry[]> {
  return fetch(`${apiBaseUrl}/admin/inquiries?companyId=${encodeURIComponent(slug)}`)
    .then(res => {
      if (!res.ok) throw new Error("Failed to fetch inquiries");
      return res.json();
    })
    .then(data => data.data.results);
}

// Only use this function for client-initiated refresh/re-sync
  // const fetchInquiries = useCallback(async () => {
  //   setIsLoading(true);
  //   setError(null);
  //   const refreshToastId = toast.loading("Refreshing inquiries...");
  //   try {
  //     // For demonstration, we'll use a mocked API call that returns the sample data
  //     // In a real app, this would be a full client-side fetch:
  //     const res = await fetch(`${apiBaseUrl}/admin/inquiries?companyId=${encodeURIComponent(slug)}`); 
      
  //     const data: Inquiry[] = initialInquiries; // Use the server's initial data as a mock refresh result
  //     setInquiries(data.sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime()));
  //     toast.success("Inquiries refreshed successfully!", { id: refreshToastId });

  //   } catch (err: any) {
  //     console.error("Error fetching inquiries:", err);
  //     setError(err.message || "Failed to load inquiries.");
  //     toast.error(err.message || "Failed to refresh inquiries.", { id: refreshToastId });
  //   } finally {
  //     setIsLoading(false);
  //   }
  // }, [slug, apiBaseUrl, initialInquiries]); // initialInquiries dependency keeps the mock data accurate for re-fetch

export default function InquiriesClientPage({ slug, initialInquiries, isInitialLoadSuccessful, serverLoadError }: InquiriesClientPageProps) {
  
  // State is initialized with data passed from the Server Component
  const [inquiries, setInquiries] = useState<Inquiry[]>(initialInquiries);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  
  // Client-side loading state is now used only for actions (like updates) or re-fetches
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(serverLoadError);

  // Reply Modal State
  const [replyInquiry, setReplyInquiry] = useState<Inquiry | null>(null);
  const [replyChannel, setReplyChannel] = useState<'EMAIL' | 'WHATSAPP' | 'BOTH'>('EMAIL');
  const [replyMessage, setReplyMessage] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);

  const handleSendReply = async () => {
    if (!replyInquiry) return;
    if (!replyMessage.trim()) {
      toast.error('Please enter a response message.');
      return;
    }

    setIsSendingReply(true);
    const toastId = toast.loading(`Sending reply via ${replyChannel}...`);

    try {
      const res = await fetch(`/api/admin/inquiries/${encodeURIComponent(replyInquiry.id)}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: replyChannel,
          replyMessage: replyMessage.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to dispatch reply');
      }

      toast.success(data.message || 'Reply sent successfully!', { id: toastId });
      setInquiries((prev) =>
        prev.map((inq) => (inq.id === replyInquiry.id ? { ...inq, status: 'Responded' } : inq))
      );
      setReplyInquiry(null);
      setReplyMessage('');
    } catch (err: any) {
      toast.error(err.message || 'Error sending reply', { id: toastId });
    } finally {
      setIsSendingReply(false);
    }
  };
  const updateInquiryStatus = useCallback(async (id: string, newStatus: Inquiry['status']) => {
    setIsLoading(true);
    const toastId = toast.loading(`Updating status to ${newStatus}...`);
    setError(null);
    try {
      const res = await fetch(`${apiBaseUrl}/admin/inquiries/${encodeURIComponent(id)}/status`, { method: 'PUT', body: JSON.stringify({ status: newStatus }), headers: { 'Content-Type': 'application/json' } });
      
      if (!res.ok) throw new Error("Failed to update inquiry status");
      const updatedInquiry: Inquiry = await res.json();

      // Update local state with the updated inquiry
      setInquiries(prev => prev.map(inq => (inq.id === id ? updatedInquiry : inq)));

      toast.success(`Inquiry marked as ${newStatus}!`, { id: toastId });
    } catch (err: any) {
      toast.error(err.message || "Failed to update status.", { id: toastId });
      setError(err.message || "Failed to update status.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // --- Filtering Logic (Client-side) ---
  // const filteredInquiries = useMemo(() => {
  //   return inquiries && inquiries.length > 0 && inquiries.filter(inq => {
  //     const matchesSearch = inq.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //       inq.clientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //       (inq.clientPhone?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
  //       inq.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //       (inq.propertyName?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
  //       (inq.assignedToAgentName?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
  //     const matchesStatus = filterStatus === 'All' || inq.status === filterStatus;
  //     return matchesSearch && matchesStatus;
  //   });
  // }, [inquiries, searchTerm, filterStatus]);
  const filteredInquiries = useMemo(() => {
    // Ensure inquiries exists and is an array
    if (!Array.isArray(inquiries)) return []; 

    return inquiries.filter(inq => {
      // Add optional chaining to EVERYTHING to prevent crashes
      const name = inq.clientName?.toLowerCase() || '';
      const email = inq.clientEmail?.toLowerCase() || '';
      const msg = inq.message?.toLowerCase() || '';
      
      const matchesSearch = name.includes(searchTerm.toLowerCase()) ||
                            email.includes(searchTerm.toLowerCase()) ||
                            msg.includes(searchTerm.toLowerCase());
                            
      const matchesStatus = filterStatus === 'All' || inq.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [inquiries, searchTerm, filterStatus]);

  // Use all possible statuses for the filter dropdown regardless of current data
  const uniqueStatuses: Inquiry['status'][] = useMemo(() => ['New', 'Read', 'Responded', 'Archived'], []);

  // Helper to get status badge class
  const getStatusBadgeClass = (status: Inquiry['status']) => {
    switch (status) {
      case 'New': return 'bg-indigo-100 text-indigo-800 ring-indigo-600/20';
      case 'Read': return 'bg-blue-100 text-blue-800 ring-blue-600/20';
      case 'Responded': return 'bg-green-100 text-green-800 ring-green-600/20';
      case 'Archived': return 'bg-gray-100 text-gray-800 ring-gray-600/20';
      default: return 'bg-gray-100 text-gray-800 ring-gray-600/20';
    }
  };

  if (!isInitialLoadSuccessful && !isLoading && error && !inquiries) {
    return (
        <div className="bg-red-50 border border-red-400 text-red-800 px-8 py-10 rounded-2xl relative shadow-lg flex items-center justify-center animate-fade-in-down">
          <div className="flex flex-col items-center">
            <XMarkIcon className="h-10 w-10 text-red-600 mb-4" />
            <strong className="font-bold text-xl">Could not load initial inquiries.</strong>
            <span className="block text-md mt-2">{error}</span>
            <button 
                onClick={() => {
                  setIsLoading(true);
                  setError(null);
                  fetchInquiries(slug)
                    .then(data => {
                      setInquiries(data.sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime()));
                      setError(null);
                    })
                    .catch(err => {
                      console.error("Error fetching inquiries:", err);
                      setError(err.message || "Failed to load inquiries.");
                    })
                    .finally(() => setIsLoading(false));
                }}
                className="mt-6 px-6 py-3 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition font-semibold flex items-center disabled:opacity-50"
                disabled={isLoading}
            >
                <ArrowPathIcon className={`h-5 w-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Try Refreshing
            </button>
          </div>
        </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      
      {/* Search and Filters Section (Client-side interactivity) */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-7 animate-slide-in-up">
        
        {/* Loading and Refresh Indicators */}
        {isLoading && (
            <div className="flex items-center justify-center py-4 text-blue-700 font-medium text-lg mb-4">
                <svg className="animate-spin h-6 w-6 text-blue-500 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing request...
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-7">
          <div className="relative col-span-full md:col-span-2">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by client name, email, property, or message..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl leading-6 bg-gray-50 placeholder-gray-500
                         focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-base shadow-sm transition-all duration-200"
            />
          </div>
          <div>
            <label htmlFor="filterStatus" className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
            <select
              id="filterStatus"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="block w-full py-3 px-4 border border-gray-300 bg-white rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-base transition-all duration-200"
            >
              <option value="All">All Statuses</option>
              {uniqueStatuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Inquiries List/Table */}
        <div className="overflow-x-auto rounded-xl shadow-inner border border-gray-100 bg-gray-50 p-1">
          {filteredInquiries && filteredInquiries.length === 0 ? (
            <div className="text-center text-gray-500 py-20 bg-white rounded-xl shadow-md border border-gray-200">
              <ChatBubbleLeftRightIcon className="mx-auto h-16 w-16 text-gray-300 mb-4 animate-bounce-slight" />
              <h3 className="mt-3 text-2xl font-semibold text-gray-900">No inquiries found</h3>
              <p className="mt-2 text-md text-gray-600">
                Adjust your search filters or check back later for new client messages.
              </p>
              <SparklesIcon className="mx-auto h-12 w-12 text-yellow-400 mt-6 animate-pulse" />
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-100 to-gray-200">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">
                    Client
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">
                    Message Summary
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">
                    Property
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">
                    Received
                  </th>
                  <th scope="col" className="relative px-6 py-4">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInquiries && filteredInquiries.map((inquiry) => (
                  <tr key={inquiry.id} className="hover:bg-purple-50 transition-colors duration-200 ease-in-out">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <UserCircleIcon className="h-9 w-9 text-gray-400 mr-3 flex-shrink-0" />
                        <div>
                          <div className="text-md font-medium text-gray-900">{inquiry.clientName}</div>
                          <div className="text-sm text-gray-500">{inquiry.clientEmail}</div>
                          {inquiry.clientPhone && <div className="text-xs text-gray-400 flex items-center mt-1"><CalendarDaysIcon className="h-3.5 w-3.5 mr-1" />{inquiry.clientPhone}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800 max-w-xs overflow-hidden text-ellipsis whitespace-nowrap">
                      {inquiry.message}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div className="flex items-center">
                        {inquiry.propertyName && <BuildingOfficeIcon className="h-4 w-4 mr-1 text-gray-400" />}
                        {inquiry.propertyName || 'General Inquiry'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3.5 py-1.5 inline-flex text-xs leading-5 font-bold rounded-full shadow-sm ring-1 ring-inset ${getStatusBadgeClass(inquiry.status)}`}>
                        {inquiry.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <CalendarDaysIcon className="h-4 w-4 mr-1.5 text-gray-400" />
                        {new Date(inquiry.receivedAt).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          href={`/admin/${slug}/inquiries/${inquiry.id}`}
                          className="text-indigo-600 hover:text-indigo-800 p-2.5 rounded-full hover:bg-indigo-50 transition-all duration-200 transform hover:scale-110"
                          title="View Details"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </Link>
                        {inquiry.status !== 'Responded' && inquiry.status !== 'Archived' && (
                          <button
                            onClick={() => updateInquiryStatus(inquiry.id, 'Responded')}
                            className="text-green-600 hover:text-green-800 p-2.5 rounded-full hover:bg-green-50 transition-all duration-200 transform hover:scale-110"
                            title="Mark as Responded"
                            disabled={isLoading}
                          >
                            <CheckCircleIcon className="h-5 w-5" />
                          </button>
                        )}
                        {inquiry.status !== 'Archived' && (
                          <button
                            onClick={() => updateInquiryStatus(inquiry.id, 'Archived')}
                            className="text-gray-600 hover:text-gray-800 p-2.5 rounded-full hover:bg-gray-50 transition-all duration-200 transform hover:scale-110"
                            title="Archive Inquiry"
                            disabled={isLoading}
                          >
                            <ArchiveBoxIcon className="h-5 w-5" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setReplyInquiry(inquiry);
                            setReplyChannel(inquiry.clientPhone ? 'BOTH' : 'EMAIL');
                            setReplyMessage('');
                          }}
                          className="text-orange-600 hover:text-orange-800 p-2.5 rounded-full hover:bg-orange-50 transition-all duration-200 transform hover:scale-110"
                          title="Reply via Email / WhatsApp"
                        >
                          <PaperAirplaneIcon className="h-5 w-5" />
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

      {/* Reply Modal */}
      {replyInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Reply to Customer</h3>
                <p className="text-xs text-gray-500">
                  Responding to <strong>{replyInquiry.clientName}</strong> ({replyInquiry.clientEmail})
                </p>
              </div>
              <button
                onClick={() => setReplyInquiry(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 text-xs text-gray-700">
              <span className="font-semibold text-gray-500 block mb-1">Customer Inquiry:</span>
              <p className="italic">{replyInquiry.message}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Dispatch Channel
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setReplyChannel('EMAIL')}
                  className={`py-2 px-3 rounded-lg border font-semibold ${
                    replyChannel === 'EMAIL'
                      ? 'border-orange-500 bg-orange-50 text-orange-600'
                      : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                  }`}
                >
                  Email
                </button>
                <button
                  type="button"
                  onClick={() => setReplyChannel('WHATSAPP')}
                  disabled={!replyInquiry.clientPhone}
                  className={`py-2 px-3 rounded-lg border font-semibold ${
                    replyChannel === 'WHATSAPP'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-600'
                      : 'border-gray-200 hover:bg-gray-50 text-gray-600 disabled:opacity-40'
                  }`}
                  title={!replyInquiry.clientPhone ? 'No phone number on inquiry' : ''}
                >
                  WhatsApp
                </button>
                <button
                  type="button"
                  onClick={() => setReplyChannel('BOTH')}
                  disabled={!replyInquiry.clientPhone}
                  className={`py-2 px-3 rounded-lg border font-semibold ${
                    replyChannel === 'BOTH'
                      ? 'border-purple-500 bg-purple-50 text-purple-600'
                      : 'border-gray-200 hover:bg-gray-50 text-gray-600 disabled:opacity-40'
                  }`}
                  title={!replyInquiry.clientPhone ? 'No phone number on inquiry' : ''}
                >
                  Both
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Your Response Message
              </label>
              <textarea
                rows={4}
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Type your message here..."
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setReplyInquiry(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendReply}
                disabled={isSendingReply}
                className="px-5 py-2 text-xs font-semibold rounded-xl bg-orange-600 hover:bg-orange-700 text-white transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                <PaperAirplaneIcon className="w-4 h-4" />
                {isSendingReply ? 'Transmitting...' : 'Send Response'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}