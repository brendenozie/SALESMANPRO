"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TicketIcon,
  PlusCircleIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  ArrowRightIcon,
  ExclamationCircleIcon,
  ArrowPathIcon, // For loading spinner
} from '@heroicons/react/24/outline';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// Framer Motion variants
const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: "easeOut" },
  },
};

const tableRowVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};


export default function AdminTickets({ adminSlug = 'your-org-slug' }: { adminSlug?: string }) {
  const [tickets, setTickets] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTicket, setCurrentTicket] = useState<any | null>(null); // For edit/add
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchTickets = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams({
        search: searchTerm,
      }).toString();

      const response = await fetch(`${apiUrl}/admin/${adminSlug}/tickets?${query}`,); 
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Fetched tickets:", data);
      setTickets(data.data.tickets);
    } catch (err: any) {
      setError(err.message || "Failed to fetch ticket types.");
      console.error("Tickets fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (adminSlug) {
      fetchTickets();
    }
  }, [adminSlug, searchTerm]);

  const handleAddEdit = (ticket?: any) => {
    setCurrentTicket(ticket || null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this ticket type? This action cannot be undone.")) {
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiUrl}/admin/${adminSlug}/tickets/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      await fetchTickets();
    } catch (err: any) {
      setError(err.message || "Failed to delete ticket type.");
      console.error("Delete ticket error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTicket = async (ticketData: any) => {
    setIsSaving(true);
    setError(null);
    try {
      const method = ticketData.id ? 'PUT' : 'POST';
      const url = ticketData.id ? `${apiUrl}/admin/${adminSlug}/tickets/${ticketData.id}` : `${apiUrl}/admin/${adminSlug}/tickets`;

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticketData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      await fetchTickets();
      setIsModalOpen(false);
      setCurrentTicket(null);
    } catch (err: any) {
      setError(err.message || "Failed to save ticket type.");
      console.error("Save ticket error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 p-8 sm:p-12 font-sans relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-purple-600/10 rounded-full filter blur-3xl opacity-50 animate-blob animation-delay-1000"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600/10 rounded-full filter blur-3xl opacity-50 animate-blob animation-delay-3000"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.h1
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
          className="text-4xl sm:text-5xl font-black tracking-tighter text-white mb-4"
        >
          Manage <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-500">Tickets</span>
        </motion.h1>
        <motion.p
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
          transition={{ delay: 0.2 }}
          className="text-lg text-gray-300 mb-12"
        >
          Oversee all ticket types, pricing, and inventory across your events.
        </motion.p>

        <div className="bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-700">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <div className="relative w-full sm:w-auto flex-grow">
              <input
                type="text"
                placeholder="Search tickets by event or type..."
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-900 border border-gray-700 text-white focus:outline-none focus:border-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              onClick={() => handleAddEdit()}
              className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors duration-300 shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 w-full sm:w-auto justify-center"
            >
              <PlusCircleIcon className="w-5 h-5 mr-2" /> Add New Ticket Type
            </motion.button>
          </div>

          {error && (
            <div className="bg-red-900/50 text-red-300 border border-red-700 p-4 rounded-lg mb-6 flex items-center gap-3">
              <ExclamationCircleIcon className="w-6 h-6" />
              <p>{error}</p>
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-10">
              <ArrowPathIcon className="w-16 h-16 animate-spin text-indigo-500 mx-auto" />
              <p className="mt-4 text-xl text-gray-400">Loading ticket types...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider rounded-tl-lg">Event Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Ticket Type</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Price</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Quantity</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Sold</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Remaining</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider rounded-tr-lg">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {tickets.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 whitespace-nowrap text-center text-gray-400 italic">
                        <div className="flex flex-col items-center justify-center py-8">
                          <ExclamationCircleIcon className="w-12 h-12 mb-4 text-gray-600" />
                          <p>No ticket types found.</p>
                          <p className="text-sm">Try adjusting your search or add a new ticket type.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    tickets.map((ticket, index) => (
                      <motion.tr
                        key={ticket.id}
                        variants={tableRowVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-gray-700/50 transition-colors duration-200"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{ticket.eventName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{ticket.type}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">${ticket.price.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{ticket.quantity.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{ticket.sold.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{ticket.remaining.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => alert(`Viewing sales for ${ticket.type} of ${ticket.eventName}`)} // Replace with actual sales view
                              className="text-indigo-400 hover:text-indigo-300 p-2 rounded-full hover:bg-gray-700/50 transition"
                              title="View Sales"
                            >
                              <EyeIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleAddEdit(ticket)}
                              className="text-purple-400 hover:text-purple-300 p-2 rounded-full hover:bg-gray-700/50 transition"
                              title="Edit Ticket Type"
                            >
                              <PencilSquareIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(ticket.id)}
                              className="text-red-400 hover:text-red-300 p-2 rounded-full hover:bg-gray-700/50 transition"
                              title="Delete Ticket Type"
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add/Edit Ticket Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-700 w-full max-w-lg"
            >
              <h3 className="text-2xl font-bold text-white mb-6">{currentTicket ? 'Edit Ticket Type' : 'Add New Ticket Type'}</h3>
              {error && isSaving && (
                <div className="bg-red-900/50 text-red-300 border border-red-700 p-3 rounded-lg mb-4 flex items-center gap-2 text-sm">
                  <ExclamationCircleIcon className="w-5 h-5" />
                  <p>{error}</p>
                </div>
              )}
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                handleSaveTicket({
                  id: currentTicket?.id,
                  eventName: formData.get('eventName'), // This field is for display, not directly saved to marketplaceListing
                  type: formData.get('type'),
                  price: parseFloat(formData.get('price') as string),
                  quantity: parseInt(formData.get('quantity') as string),
                  description: formData.get('description'), // Add description field
                  isAvailable: formData.get('isAvailable') === 'true', // Add isAvailable field
                });
              }}>
                <div className="mb-4">
                  <label htmlFor="ticketEventName" className="block text-gray-300 text-sm font-bold mb-2">Associated Event Name (Informational)</label>
                  <input
                    type="text"
                    id="ticketEventName"
                    name="eventName"
                    defaultValue={currentTicket?.eventName || ''}
                    className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 text-white focus:outline-none focus:border-indigo-500"
                    placeholder="e.g., Summer Music Fest"
                    // This field is for display/linking. In a real app, you'd have a dropdown to select an actual event ID.
                    // For this mock, it's just text.
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="ticketType" className="block text-gray-300 text-sm font-bold mb-2">Ticket Type Name</label>
                  <input
                    type="text"
                    id="ticketType"
                    name="type"
                    defaultValue={currentTicket?.type || ''}
                    className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="ticketDescription" className="block text-gray-300 text-sm font-bold mb-2">Description</label>
                  <textarea
                    id="ticketDescription"
                    name="description"
                    defaultValue={currentTicket?.description || ''}
                    rows={2}
                    className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 text-white focus:outline-none focus:border-indigo-500"
                  ></textarea>
                </div>
                <div className="mb-4">
                  <label htmlFor="ticketPrice" className="block text-gray-300 text-sm font-bold mb-2">Price ($)</label>
                  <input
                    type="number"
                    id="ticketPrice"
                    name="price"
                    defaultValue={currentTicket?.price || ''}
                    step="0.01"
                    className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="ticketQuantity" className="block text-gray-300 text-sm font-bold mb-2">Quantity</label>
                  <input
                    type="number"
                    id="ticketQuantity"
                    name="quantity"
                    defaultValue={currentTicket?.quantity || ''}
                    className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div className="mb-6">
                  <label htmlFor="isAvailable" className="block text-gray-300 text-sm font-bold mb-2">Is Available?</label>
                  <select
                    id="isAvailable"
                    name="isAvailable"
                    defaultValue={currentTicket?.isAvailable?.toString() || 'true'}
                    className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 text-white focus:outline-none focus:border-indigo-500"
                    required
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-3 bg-gray-700 text-white font-semibold rounded-xl hover:bg-gray-600 transition-colors duration-300"
                    disabled={isSaving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <ArrowPathIcon className="w-5 h-5 mr-2 animate-spin" /> Saving...
                      </>
                    ) : (
                      'Save Ticket'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
