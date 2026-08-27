// app/admin/[adminSlug]/clients/ClientsClient.tsx
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserPlusIcon, MagnifyingGlassIcon, PhoneIcon, EnvelopeIcon,
  ChevronLeftIcon, ChevronRightIcon,
} from '@heroicons/react/24/solid';

// Dummy Data Helper
const getClientsData = (companyId: string) => [
  {
    id: 'cl001',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    phone: '555-123-4567',
    registeredDate: '2024-01-15',
    lastActivity: '2025-07-10',
    totalPurchases: 2,
  },
  {
    id: 'cl002',
    name: 'Bob Williams',
    email: 'bob@example.com',
    phone: '555-987-6543',
    registeredDate: '2023-11-20',
    lastActivity: '2025-07-08',
    totalPurchases: 1,
  },
  {
    id: 'cl003',
    name: 'Charlie Davis',
    email: 'charlie@example.com',
    phone: '555-567-8901',
    registeredDate: '2025-03-01',
    lastActivity: '2025-07-05',
    totalPurchases: 0,
  },
  {
    id: 'cl004',
    name: 'Diana Prince',
    email: 'diana@example.com',
    phone: '555-234-5678',
    registeredDate: '2024-06-01',
    lastActivity: '2025-07-15',
    totalPurchases: 1,
  },
  {
    id: 'cl005',
    name: 'Eve Taylor',
    email: 'eve@example.com',
    phone: '555-876-5432',
    registeredDate: '2023-09-10',
    lastActivity: '2025-07-13',
    totalPurchases: 3,
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

interface ClientsClientProps {
  companyId: string;
}

export default function ClientsClient({ companyId }: ClientsClientProps) {
  const [clients] = useState(getClientsData(companyId));
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm)
  );

  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const currentItems = filteredClients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleViewDetails = (id: string) => {
    alert(`Viewing details for client ${id}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white p-6 md:p-10">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-extrabold mb-8 text-blue-700 dark:text-blue-400"
      >
        Client Management
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
            placeholder="Search clients by name, email, or phone..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
        <button
          onClick={() => alert("Add New Client")}
          className="flex items-center px-6 py-3 bg-green-600 text-white rounded-xl shadow-md hover:bg-green-700 transition-colors font-semibold"
        >
          <UserPlusIcon className="w-5 h-5 mr-2" />
          Add New Client
        </button>
      </motion.div>

      <AnimatePresence mode="wait">
        {filteredClients.length === 0 ? (
          <motion.div
            key="no-clients"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center py-10 text-xl text-gray-500 dark:text-gray-400"
          >
            No clients found matching your search.
          </motion.div>
        ) : (
          <motion.div
            key="client-list"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Client Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Registered</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Last Activity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Purchases</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {currentItems.map((client) => (
                    <motion.tr
                      key={client.id}
                      variants={itemVariants}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{client.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <EnvelopeIcon className="w-4 h-4" /> {client.email}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <PhoneIcon className="w-4 h-4" /> {client.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {client.registeredDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {client.lastActivity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-semibold">
                        {client.totalPurchases}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleViewDetails(client.id)}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                          aria-label={`View details for ${client.name}`}
                        >
                          View Details
                        </button>
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
      {filteredClients.length > itemsPerPage && (
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