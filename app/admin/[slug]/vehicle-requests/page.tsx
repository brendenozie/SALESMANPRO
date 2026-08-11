// app/admin/[adminSlug]/requests/page.js
'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChatBubbleLeftRightIcon, CheckCircleIcon, XCircleIcon, EnvelopeIcon, UserCircleIcon,
  MagnifyingGlassIcon, ChevronLeftIcon, ChevronRightIcon, TrashIcon
} from '@heroicons/react/24/solid';
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';

// Dummy Data
const getRequestsData = (adminSlug:any) => [
  {
    id: 'req001',
    clientName: 'Alice Johnson',
    clientEmail: 'alice@example.com',
    type: 'Test Drive',
    details: 'Interested in a test drive for the 2023 Tesla Model 3.',
    status: 'Pending',
    date: '2025-07-14',
  },
  {
    id: 'req002',
    clientName: 'Bob Williams',
    clientEmail: 'bob@example.com',
    type: 'Financing Inquiry',
    details: 'Looking for financing options for a 2024 Toyota RAV4.',
    status: 'In Progress',
    date: '2025-07-12',
  },
  {
    id: 'req003',
    clientName: 'Charlie Davis',
    clientEmail: 'charlie@example.com',
    type: 'Vehicle Inquiry',
    details: 'Need more photos and specifications for the 2022 Ford F-150.',
    status: 'Completed',
    date: '2025-07-10',
  },
  {
    id: 'req004',
    clientName: 'Diana Prince',
    clientEmail: 'diana@example.com',
    type: 'Service Appointment',
    details: 'Schedule an oil change for a 2021 Honda Civic.',
    status: 'Pending',
    date: '2025-07-15',
  },
  {
    id: 'req005',
    clientName: 'Eve Taylor',
    clientEmail: 'eve@example.com',
    type: 'Trade-in Appraisal',
    details: 'Requesting an appraisal for a 2018 Nissan Rogue.',
    status: 'Pending',
    date: '2025-07-13',
  },
];

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function AdminRequestsPage({ params }: PageProps) {
  const { slug } = await params;

    const session = await getAuthSession();
  
    // 1. Safely resolve the exact same identifier used in AdminStoreLayout
    const identifier = slug || session?.user?.id || '';
  
    // 2. Retrieve the memoized company data (no extra DB cost)
    const company = await findCompanyCached(identifier, "page");
  
    if (!company) {
      return <div>Company not found</div>;
    }
  
    // Use the actual database ID for your API calls, ensuring consistency
    const companyId = company.id;
  const [requests, setRequests] = useState(getRequestsData(companyId));
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredRequests = requests.filter(request =>
    (request.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
     request.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
     request.details.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterStatus === 'All' || request.status === filterStatus)
  );

  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const currentItems = filteredRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleUpdateStatus = (id:any, newStatus:any) => {
    setRequests(requests.map(req =>
      req.id === id ? { ...req, status: newStatus } : req
    ));
    alert(`Request ${id} status updated to ${newStatus}`);
  };

  const handleDelete = (id:any) => {
    if (confirm(`Are you sure you want to delete request ${id}?`)) {
      setRequests(requests.filter(req => req.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white p-6 md:p-10">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-extrabold mb-8 text-blue-700 dark:text-blue-400"
      >
        Client Requests
      </motion.h1>

      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4"
      >
        <div className="relative w-full md:w-1/2 lg:w-1/3">
          <input
            type="text"
            placeholder="Search requests..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
        <div className="w-full md:w-auto flex items-center gap-2">
          <label htmlFor="status-filter" className="text-gray-700 dark:text-gray-300">Status:</label>
          <select
            id="status-filter"
            className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1); // Reset to first page on filter change
            }}
          >
            <option value="All">All</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {filteredRequests.length === 0 ? (
          <motion.div
            key="no-requests"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center py-10 text-xl text-gray-500 dark:text-gray-400"
          >
            No requests found matching your criteria.
          </motion.div>
        ) : (
          <motion.div
            key="request-list"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Client</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Details</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {currentItems.map((request) => (
                    <motion.tr
                      key={request.id}
                      variants={itemVariants}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{request.clientName}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <EnvelopeIcon className="w-4 h-4" /> {request.clientEmail}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                        {request.type}
                      </td>
                      <td className="px-6 py-4 max-w-xs truncate text-sm text-gray-500 dark:text-gray-400">
                        {request.details}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          request.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100' :
                          request.status === 'In Progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100' :
                          'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                        }`}>
                          {request.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                            {request.status !== 'Completed' && (
                                <button
                                    onClick={() => handleUpdateStatus(request.id, 'Completed')}
                                    className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                                    aria-label={`Mark request ${request.id} as completed`}
                                >
                                    <CheckCircleIcon className="w-5 h-5" />
                                </button>
                            )}
                            <button
                                onClick={() => handleDelete(request.id)}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                                aria-label={`Delete request ${request.id}`}
                            >
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pagination */}
      {filteredRequests.length > itemsPerPage && (
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="flex justify-center items-center mt-8 space-x-4"
        >
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            aria-label="Previous page"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <span className="text-gray-700 dark:text-gray-300">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            aria-label="Next page"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </motion.div>
      )}
    </div>
  );
}