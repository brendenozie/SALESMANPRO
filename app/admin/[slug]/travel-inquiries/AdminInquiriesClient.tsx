// app/admin/[slug]/inquiries/AdminInquiriesClient.tsx
'use client';

import React, { useState } from 'react';
import {
  EyeIcon, CheckCircleIcon, TrashIcon, EnvelopeIcon, FunnelIcon
} from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';

// --- Type Definitions ---
interface Inquiry {
  id: string;
  name: string;
  email: string;
  type: string;
  message: string;
  status: 'Pending' | 'Resolved';
  date: string;
}

interface InquiryModalProps {
  inquiry: Inquiry | null;
  onClose: () => void;
}

// Dummy Data
const initialInquiries: Inquiry[] = [
  { id: 'INQ001', name: 'John Doe', email: 'john.doe@example.com', type: 'Booking Issue', message: 'I need to change my booking date for BKG001.', status: 'Pending', date: '2025-07-14' },
  { id: 'INQ002', name: 'Jane Smith', email: 'jane.smith@example.com', type: 'General Question', message: 'What are the visa requirements for Japan?', status: 'Resolved', date: '2025-07-13' },
  { id: 'INQ003', name: 'Peter Jones', email: 'peter.j@example.com', type: 'Expert Consultation', message: 'I\'d like to speak with an expert about a safari trip.', status: 'Pending', date: '2025-07-12' },
];

interface AdminInquiriesClientProps {
  slug: string;
  companyId: string;
}

export default function AdminInquiriesClient({ slug, companyId }: AdminInquiriesClientProps) {
  const [inquiries, setInquiries] = useState<Inquiry[]>(initialInquiries);
  const [filterStatus, setFilterStatus] = useState<'All' | 'Pending' | 'Resolved'>('All');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentInquiry, setCurrentInquiry] = useState<Inquiry | null>(null);

  const filteredInquiries = inquiries.filter((inquiry: Inquiry) =>
    filterStatus === 'All' || inquiry.status === filterStatus
  );

  const handleMarkResolved = (id: string) => {
    if (confirm(`Mark inquiry ${id} as resolved?`)) {
      setInquiries(inquiries.map((inquiry: Inquiry) =>
        inquiry.id === id ? { ...inquiry, status: 'Resolved' } : inquiry
      ));
      alert(`Inquiry ${id} marked as resolved.`);
    }
  };

  const handleDeleteInquiry = (id: string) => {
    if (confirm(`Are you sure you want to delete inquiry ${id}?`)) {
      setInquiries(inquiries.filter((inquiry: Inquiry) => inquiry.id !== id));
      alert(`Inquiry ${id} deleted.`);
    }
  };

  const openViewModal = (inquiry: Inquiry) => {
    setCurrentInquiry(inquiry);
    setIsModalOpen(true);
  };

  const getStatusColor = (status: Inquiry['status']) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-extrabold text-gray-900 mb-8"
      >
        Manage Inquiries
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white rounded-xl shadow-md p-6 mb-8"
      >
        <div className="flex items-center gap-4 mb-6">
          <FunnelIcon className="h-6 w-6 text-gray-500" />
          <label htmlFor="inquiryStatusFilter" className="font-medium text-gray-700">Filter by Status:</label>
          <select
            id="inquiryStatusFilter"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'All' | 'Pending' | 'Resolved')}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="All">All</option>
            <option value="Pending">Pending</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message Snippet</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInquiries.length > 0 ? (
                filteredInquiries.map((inquiry: Inquiry) => (
                  <tr key={inquiry.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{inquiry.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{inquiry.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 flex items-center">
                      <EnvelopeIcon className="h-4 w-4 mr-1 text-gray-400" />
                      {inquiry.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{inquiry.type}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{inquiry.message}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{inquiry.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(inquiry.status)}`}>
                        {inquiry.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <motion.button
                          onClick={() => openViewModal(inquiry)}
                          className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-50 transition"
                          title="View Details"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <EyeIcon className="h-5 w-5" />
                        </motion.button>
                        {inquiry.status === 'Pending' && (
                          <motion.button
                            onClick={() => handleMarkResolved(inquiry.id)}
                            className="text-green-600 hover:text-green-900 p-1 rounded-full hover:bg-green-50 transition"
                            title="Mark as Resolved"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <CheckCircleIcon className="h-5 w-5" />
                          </motion.button>
                        )}
                        <motion.button
                          onClick={() => handleDeleteInquiry(inquiry.id)}
                          className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-50 transition"
                          title="Delete Inquiry"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <TrashIcon className="h-5 w-5" />
                        </motion.button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-gray-500">No inquiries found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* View Inquiry Details Modal */}
      {isModalOpen && (
        <InquiryModal
          inquiry={currentInquiry}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}

// InquiryModal Sub-Component
const InquiryModal: React.FC<InquiryModalProps> = ({ inquiry, onClose }) => {
  if (!inquiry) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 50 }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Inquiry Details</h2>
        <div className="space-y-4 text-gray-700">
          <div>
            <p className="font-semibold">ID:</p>
            <p>{inquiry.id}</p>
          </div>
          <div>
            <p className="font-semibold">Name:</p>
            <p>{inquiry.name}</p>
          </div>
          <div>
            <p className="font-semibold">Email:</p>
            <p>{inquiry.email}</p>
          </div>
          <div>
            <p className="font-semibold">Type:</p>
            <p>{inquiry.type}</p>
          </div>
          <div>
            <p className="font-semibold">Message:</p>
            <p className="bg-gray-50 p-3 rounded-md border border-gray-200">{inquiry.message}</p>
          </div>
          <div>
            <p className="font-semibold">Date:</p>
            <p>{inquiry.date}</p>
          </div>
          <div>
            <p className="font-semibold">Status:</p>
            <span className={`px-2 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${inquiry.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
              {inquiry.status}
            </span>
          </div>
        </div>
        <div className="flex justify-end mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};