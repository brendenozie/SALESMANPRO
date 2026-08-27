"use client";

import React, { useState, useMemo } from "react";
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserIcon,
  TagIcon,
  Squares2X2Icon,
  ArrowRightIcon,
  FunnelIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/outline";

// -------------------------
// Types & Interfaces (Placeholder definition for single file)
// -------------------------
interface ProductRequest {
  requestId: string;
  productId: string;
  productName: string;
  quantityRequested: number;
  salesAgentId: string | null;
  salesAgentName: string;
  status: "PENDING" | "APPROVED" | "DECLINED";
  requestedAt: string;
}

interface ClientProps {
  initialRequests: ProductRequest[];
}

// -------------------------
// Helper: Status Display Component
// -------------------------
const StatusPill: React.FC<{ status: ProductRequest['status'] }> = ({ status }) => {
  let classes = "";
  let Icon: React.ElementType;
  let text = status.toUpperCase();

  switch (status) {
    case "PENDING":
      classes = "bg-yellow-500/10 text-yellow-600 border-yellow-500";
      Icon = ClockIcon;
      break;
    case "APPROVED":
      classes = "bg-green-500/10 text-green-600 border-green-500";
      Icon = CheckCircleIcon;
      break;
    case "DECLINED":
      classes = "bg-red-500/10 text-red-600 border-red-500";
      Icon = XCircleIcon;
      break;
    default:
      classes = "bg-gray-500/10 text-gray-600 border-gray-500";
      Icon = ClockIcon;
  }

  return (
    <span
      className={`flex items-center gap-1.5 px-3 py-1 text-sm font-semibold rounded-full border ${classes} transition-colors duration-200`}
      title={`Request Status: ${text}`}
    >
      <Icon className="h-4 w-4" />
      {text}
    </span>
  );
};


// -------------------------
// Main Component
// -------------------------

export default function ProductRequestsClient({ initialRequests }: ClientProps) {
  // We use initialRequests as the constant source of truth
  const [requests] = useState<ProductRequest[]>(initialRequests);
  
  // State for filtering and pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<"all" | ProductRequest['status']>("all");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 6; 

  // --- Filtering & Searching (Intuitive) ---
  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const matchesSearch = req.productName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = selectedStatus === "all" || req.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [requests, searchTerm, selectedStatus]);

  // --- Pagination Logic ---
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedRequests = filteredRequests.slice(indexOfFirstItem, indexOfLastItem);
  
  // --- Summary Counts (Engaging) ---
  const summaryCounts = useMemo(() => ({
    total: requests.length,
    pending: requests.filter(r => r.status === 'PENDING').length,
    approved: requests.filter(r => r.status === 'APPROVED').length,
  }), [requests]);

  // Placeholder action handlers (in a real app, these would call an API)
  const handleAction = (requestId: string, action: 'APPROVE' | 'DECLINE') => {
    alert(`Action: ${action} Request ID: ${requestId} (Placeholder - No API call made)`);
    // In a real app, this would trigger a state update after a successful API call
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-10">
      
      {/* 🌟 HEADER */}
      <header className="max-w-7xl mx-auto mb-8 border-b border-gray-200 pb-5">
        <h1 className="text-4xl font-extrabold text-gray-900 leading-tight flex items-center gap-3">
          Product Request Stream <ShoppingBagIcon className="h-8 w-8 text-indigo-600" />
        </h1>
        <p className="text-lg text-gray-500 mt-1">
          Review, track, and manage all sales agent product requests.
        </p>
      </header>

      {/* 📊 SUMMARY CARDS */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="p-5 bg-white rounded-xl shadow-lg border-l-4 border-indigo-500">
          <p className="text-sm text-gray-500 font-medium">Total Requests</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{summaryCounts.total}</p>
        </div>
        <div className="p-5 bg-white rounded-xl shadow-lg border-l-4 border-yellow-500">
          <p className="text-sm text-gray-500 font-medium">Pending Review</p>
          <p className="text-3xl font-bold text-yellow-600 mt-1">{summaryCounts.pending}</p>
        </div>
        <div className="p-5 bg-white rounded-xl shadow-lg border-l-4 border-green-500">
          <p className="text-sm text-gray-500 font-medium">Approved Requests</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{summaryCounts.approved}</p>
        </div>
      </div>
      
      {/* 🔍 SEARCH & FILTERS */}
      <div className="max-w-7xl mx-auto bg-white p-5 rounded-xl shadow-inner border border-gray-100 mb-8 flex flex-col sm:flex-row gap-4 justify-between items-center">
        
        {/* Search Input */}
        <div className="w-full sm:w-1/2 relative">
            <input
              type="text"
              placeholder="Search by product name..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition duration-150"
            />
            <svg className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>

        {/* Status Filter */}
        <div className="w-full sm:w-auto flex items-center gap-2">
            <FunnelIcon className="h-5 w-5 text-gray-500" />
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value as "all" | ProductRequest['status']);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white appearance-none focus:ring-2 focus:ring-indigo-500 transition duration-150 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="DECLINED">Declined</option>
            </select>
        </div>
      </div>

      {/* 📦 REQUEST LIST (Captivating and Visually Appealing) */}
      <div className="max-w-7xl mx-auto">
        
        {paginatedRequests.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {paginatedRequests.map((request) => (
                    <div
                        key={request.requestId}
                        className="p-6 bg-white rounded-2xl shadow-xl hover:shadow-2xl transition duration-300 border-l-4 border-gray-200 hover:border-indigo-500/50 transform hover:-translate-y-0.5"
                    >
                        {/* Status & Date Header */}
                        <div className="flex justify-between items-start mb-4 border-b border-gray-100 pb-3">
                            <StatusPill status={request.status} />
                            <p className="text-xs text-gray-400 font-medium">
                                <ClockIcon className="h-3 w-3 inline mr-1" />
                                {new Date(request.requestedAt).toLocaleDateString()}
                            </p>
                        </div>

                        {/* Product Name */}
                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Squares2X2Icon className="h-5 w-5 text-indigo-600" />
                            {request.productName}
                        </h3>

                        {/* Details Grid */}
                        <div className="space-y-3 text-sm text-gray-700 bg-indigo-50/50 p-4 rounded-lg">
                            <p className="flex justify-between">
                                <span className="font-medium text-gray-600 flex items-center gap-2">
                                    <TagIcon className="h-4 w-4 text-indigo-400" />
                                    Request ID:
                                </span>
                                <span className="font-semibold text-gray-800">{request.requestId.substring(0, 8)}...</span>
                            </p>
                            <p className="flex justify-between">
                                <span className="font-medium text-gray-600 flex items-center gap-2">
                                    <UserIcon className="h-4 w-4 text-indigo-400" />
                                    Sales Agent:
                                </span>
                                <span className="font-semibold text-gray-800">{request.salesAgentName}</span>
                            </p>
                            <p className="flex justify-between text-base border-t border-indigo-200 pt-3 font-bold">
                                <span>Quantity Requested:</span>
                                <span className="text-indigo-600">{request.quantityRequested} Units</span>
                            </p>
                        </div>
                        
                        {/* Action Buttons */}
                        {request.status === 'PENDING' && (
                            <div className="flex justify-end gap-3 mt-5">
                                <button 
                                    onClick={() => handleAction(request.requestId, 'APPROVE')}
                                    className="px-4 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition shadow-md font-medium"
                                >
                                    Approve
                                </button>
                                <button 
                                    onClick={() => handleAction(request.requestId, 'DECLINE')}
                                    className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition shadow-md font-medium"
                                >
                                    Decline
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        ) : (
            // Empty/No Match State
            <div className="bg-white p-16 rounded-xl shadow-xl border-2 border-dashed border-gray-300 text-center max-w-xl mx-auto">
              <XCircleIcon className="h-16 w-16 text-red-400 mx-auto mb-4" />
              <p className="text-2xl font-semibold text-gray-700">No Requests Found</p>
              <p className="text-gray-500 mt-2">
                {requests.length === 0 ? "Your request stream is currently empty." : "Try adjusting your search or filter settings."}
              </p>
            </div>
        )}
      </div>

      {/* 📄 PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-4 mt-10">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            className="px-5 py-2 bg-indigo-600 rounded-lg text-white font-medium disabled:bg-gray-300 disabled:text-gray-600 hover:bg-indigo-700 transition"
          >
            &larr; Previous Page
          </button>
          <span className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium">{`Page ${currentPage} of ${totalPages}`}</span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            className="px-5 py-2 bg-indigo-600 rounded-lg text-white font-medium disabled:bg-gray-300 disabled:text-gray-600 hover:bg-indigo-700 transition"
          >
            Next Page &rarr;
          </button>
        </div>
      )}
    </div>
  );
}
