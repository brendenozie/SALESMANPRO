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
  TruckIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import toast from 'react-hot-toast';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

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

interface InquiriesClientProps {
  companyId: string;
}

export default function InquiriesClient({ companyId }: InquiriesClientProps) {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Conversion state
  const [convertingInquiry, setConvertingInquiry] = useState<Inquiry | null>(null);
  const [converting, setConverting] = useState(false);
  const [deliveryForm, setDeliveryForm] = useState({
    pickupAddress: '',
    deliveryAddress: '',
    packageDescription: '',
    weightKg: '5',
    serviceType: 'STANDARD',
  });

  const handleConvertToDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!convertingInquiry) return;
    setConverting(true);
    try {
      const res = await fetch('/api/admin/deliveries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId,
          customerName: convertingInquiry.clientName,
          customerEmail: convertingInquiry.clientEmail,
          customerContact: convertingInquiry.clientPhone,
          pickupAddress: deliveryForm.pickupAddress,
          deliveryAddress: deliveryForm.deliveryAddress,
          packageDescription: deliveryForm.packageDescription,
          weightKg: Number(deliveryForm.weightKg) || 1,
          serviceType: deliveryForm.serviceType,
          notes: `Converted from Inquiry #${convertingInquiry.id}: ${convertingInquiry.message}`,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create delivery');

      await updateInquiryStatus(convertingInquiry.id, 'Responded');
      toast.success(`Delivery created! Tracking: ${data.data?.trackingNumber}`);
      setConvertingInquiry(null);
    } catch (err: any) {
      toast.error(err.message || 'Conversion failed');
    } finally {
      setConverting(false);
    }
  };

  const fetchInquiries = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBaseUrl}/admin/inquiries?companyId=${encodeURIComponent(companyId)}`, {
        credentials: 'include',
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to fetch inquiries.');
      }
      const responseData = await res.json();
      const data: Inquiry[] = responseData.data?.results || responseData.data;
      setInquiries(data.sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime()));
    } catch (err: any) {
      setError(err.message || 'Failed to load inquiries.');
    } finally {
      setIsLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  const updateInquiryStatus = useCallback(
    async (id: string, newStatus: Inquiry['status']) => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`${apiBaseUrl}/admin/inquiries/${encodeURIComponent(id)}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: newStatus }),
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Failed to update inquiry status.');
        }

        // Optimistically update UI
        setInquiries((prev) =>
          prev.map((inq) => (inq.id === id ? { ...inq, status: newStatus } : inq))
        );
        fetchInquiries();
      } catch (err: any) {
        setError(err.message || 'Failed to update status.');
      } finally {
        setIsLoading(false);
      }
    },
    [fetchInquiries]
  );

  const filteredInquiries = useMemo(() => {
    return inquiries.filter((inq) => {
      const matchesSearch =
        inq.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inq.clientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (inq.clientPhone?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
        inq.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (inq.propertyName?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
        (inq.assignedToAgentName?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
      const matchesStatus = filterStatus === 'All' || inq.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [inquiries, searchTerm, filterStatus]);

  const uniqueStatuses = useMemo(() => {
    const statuses = Array.from(new Set(inquiries.map((i) => i.status)));
    const order: Inquiry['status'][] = ['New', 'Read', 'Responded', 'Archived'];
    return statuses.sort((a, b) => order.indexOf(a) - order.indexOf(b));
  }, [inquiries]);

  const getStatusBadgeClass = (status: Inquiry['status']) => {
    switch (status) {
      case 'New':
        return 'bg-indigo-100 text-indigo-800 ring-indigo-600/20';
      case 'Read':
        return 'bg-blue-100 text-blue-800 ring-blue-600/20';
      case 'Responded':
        return 'bg-green-100 text-green-800 ring-green-600/20';
      case 'Archived':
        return 'bg-gray-100 text-gray-800 ring-gray-600/20';
      default:
        return 'bg-gray-100 text-gray-800 ring-gray-600/20';
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gradient-to-br from-purple-50 to-blue-100 min-h-screen font-sans text-gray-800">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
        <div className="flex flex-col">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight flex items-center">
            <ChatBubbleLeftRightIcon className="h-10 w-10 text-purple-600 mr-4 drop-shadow-md" />
            Client Inquiries
            <span className="ml-4 text-teal-600 text-xl sm:text-2xl transform rotate-6 animate-pulse-slight">📧</span>
          </h1>
          <p className="text-lg text-gray-600 mt-3 max-w-2xl">
            Effectively manage and respond to all incoming client questions and leads from a centralized dashboard.
          </p>
        </div>
      </div>

      {/* Loading and Error Indicators */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-12 bg-white rounded-2xl shadow-xl border border-blue-200 animate-fade-in-up">
          <svg className="animate-spin h-10 w-10 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-xl font-medium text-blue-700">Loading your client inquiries...</p>
          <p className="text-md text-gray-500 mt-2">Connecting you with valuable leads!</p>
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
                {uniqueStatuses.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Inquiries List/Table */}
          <div className="overflow-x-auto rounded-xl shadow-inner border border-gray-100 bg-gray-50 p-1">
            {filteredInquiries.length === 0 ? (
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
                      Interested Item
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
                  {filteredInquiries.map((inquiry) => (
                    <tr key={inquiry.id} className="hover:bg-purple-50 transition-colors duration-200 ease-in-out">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <UserCircleIcon className="h-9 w-9 text-gray-400 mr-3 flex-shrink-0" />
                          <div>
                            <div className="text-md font-medium text-gray-900">{inquiry.clientName}</div>
                            <div className="text-sm text-gray-500">{inquiry.clientEmail}</div>
                            {inquiry.clientPhone && (
                              <div className="text-xs text-gray-400 flex items-center mt-1">
                                <CalendarDaysIcon className="h-3.5 w-3.5 mr-1" />
                                {inquiry.clientPhone}
                              </div>
                            )}
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
                          <button
                            onClick={() => {
                              setConvertingInquiry(inquiry);
                              setDeliveryForm({
                                pickupAddress: '',
                                deliveryAddress: '',
                                packageDescription: inquiry.message || 'Logistics Consignment',
                                weightKg: '5',
                                serviceType: 'STANDARD',
                              });
                            }}
                            className="text-cyan-600 hover:text-cyan-800 p-2.5 rounded-full hover:bg-cyan-50 transition-all duration-200 transform hover:scale-110"
                            title="Convert to Delivery Dispatch"
                          >
                            <TruckIcon className="h-5 w-5" />
                          </button>
                          <Link
                            href={`/admin/${companyId}/inquiries/${inquiry.id}`}
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

      {/* Convert to Delivery Modal */}
      {convertingInquiry && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
              <div>
                <h3 className="text-xl font-black text-slate-900 uppercase">Convert Inquiry to Delivery</h3>
                <p className="text-xs text-slate-500">Dispatch order for {convertingInquiry.clientName}</p>
              </div>
              <button onClick={() => setConvertingInquiry(null)} className="p-2 text-slate-400 hover:text-slate-600">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleConvertToDelivery} className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Pickup Address *</label>
                <input
                  type="text"
                  required
                  value={deliveryForm.pickupAddress}
                  onChange={(e) => setDeliveryForm({ ...deliveryForm, pickupAddress: e.target.value })}
                  className="w-full border rounded-xl px-3 py-2.5 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="e.g. Warehouse 1, CBD"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Destination Address *</label>
                <input
                  type="text"
                  required
                  value={deliveryForm.deliveryAddress}
                  onChange={(e) => setDeliveryForm({ ...deliveryForm, deliveryAddress: e.target.value })}
                  className="w-full border rounded-xl px-3 py-2.5 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="e.g. Client Office / Residence"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Weight (KG)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={deliveryForm.weightKg}
                    onChange={(e) => setDeliveryForm({ ...deliveryForm, weightKg: e.target.value })}
                    className="w-full border rounded-xl px-3 py-2 text-xs text-slate-800 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Service Tier</label>
                  <select
                    value={deliveryForm.serviceType}
                    onChange={(e) => setDeliveryForm({ ...deliveryForm, serviceType: e.target.value })}
                    className="w-full border rounded-xl px-3 py-2 text-xs text-slate-800 outline-none"
                  >
                    <option value="STANDARD">Standard</option>
                    <option value="EXPRESS">Express</option>
                    <option value="SAME_DAY">Same Day</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Notes / Description</label>
                <textarea
                  rows={2}
                  value={deliveryForm.packageDescription}
                  onChange={(e) => setDeliveryForm({ ...deliveryForm, packageDescription: e.target.value })}
                  className="w-full border rounded-xl p-3 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setConvertingInquiry(null)}
                  className="w-1/3 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={converting}
                  className="w-2/3 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs shadow-lg shadow-cyan-100 disabled:opacity-50"
                >
                  {converting ? 'Creating Delivery...' : 'Create Delivery Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}