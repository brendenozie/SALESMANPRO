"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  PlusCircleIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';


const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';;//process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

const tableRowVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

interface Ticket {
  id: string;
  eventName: string;
  type: string;
  price: number;
  quantity: number;
  sold: number;
  remaining: number;
  description?: string;
  isAvailable?: boolean;
}

interface AdminTicketsClientProps {
  slug: string;
  initialTickets: Ticket[];
}

export default function AdminTicketsClient({ slug, initialTickets }: AdminTicketsClientProps) {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTicket, setCurrentTicket] = useState<Ticket | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter tickets client-side
  const filteredTickets = tickets.filter(ticket =>
    ticket.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddEdit = (ticket?: Ticket) => {
    setCurrentTicket(ticket || null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this ticket type?")) return;
    try {
      const response = await fetch(`${apiBaseUrl}/admin/${slug}/tickets/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error("Failed to delete");
      setTickets(prev => prev.filter(t => t.id !== id));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSaveTicket = async (ticketData: any) => {
    setIsSaving(true);
    try {
      const method = ticketData.id ? 'PUT' : 'POST';
      const url = ticketData.id
        ? `${apiBaseUrl}/admin/${slug}/tickets/${ticketData.id}`
        : `${apiBaseUrl}/admin/${slug}/tickets`;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ticketData),
      });

      if (!response.ok) throw new Error("Failed to save ticket");
      const updatedTicket = await response.json();

      setTickets(prev =>
        ticketData.id
          ? prev.map(t => (t.id === ticketData.id ? updatedTicket.data : t))
          : [...prev, updatedTicket.data]
      );
      setIsModalOpen(false);
      setCurrentTicket(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 p-8 sm:p-12 font-sans relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.h1
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
          className="text-4xl sm:text-5xl font-black tracking-tighter text-white mb-4"
        >
          Manage <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-500">Tickets</span>
        </motion.h1>

        <div className="bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-700">
          {/* Search + Add */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <div className="relative w-full sm:w-auto flex-grow">
              <input
                type="text"
                placeholder="Search tickets..."
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-900 border border-gray-700 text-white focus:outline-none focus:border-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
            <motion.button
              onClick={() => handleAddEdit()}
              className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
            >
              <PlusCircleIcon className="w-5 h-5 mr-2" /> Add Ticket
            </motion.button>
          </div>

          {error && (
            <div className="bg-red-900/50 text-red-300 border border-red-700 p-4 rounded-lg mb-6 flex items-center gap-3">
              <ExclamationCircleIcon className="w-6 h-6" />
              <p>{error}</p>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Event</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Sold</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Remaining</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {filteredTickets.map((ticket, i) => (
                  <motion.tr
                    key={ticket.id}
                    variants={tableRowVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: i * 0.05 }}
                    className="hover:bg-gray-700/50"
                  >
                    <td className="px-6 py-4">{ticket.eventName}</td>
                    <td className="px-6 py-4">{ticket.type}</td>
                    <td className="px-6 py-4">${ticket.price.toFixed(2)}</td>
                    <td className="px-6 py-4">{ticket.quantity}</td>
                    <td className="px-6 py-4">{ticket.sold}</td>
                    <td className="px-6 py-4">{ticket.remaining}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => alert("View sales")} className="text-indigo-400 hover:text-indigo-300 p-2">
                          <EyeIcon className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleAddEdit(ticket)} className="text-purple-400 hover:text-purple-300 p-2">
                          <PencilSquareIcon className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleDelete(ticket.id)} className="text-red-400 hover:text-red-300 p-2">
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal (kept same as your version) */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <motion.div className="bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-700 w-full max-w-lg">
              <h3 className="text-2xl font-bold text-white mb-6">
                {currentTicket ? "Edit Ticket" : "Add Ticket"}
              </h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  const data = new FormData(form);
                  handleSaveTicket({
                    id: currentTicket?.id,
                    eventName: data.get("eventName"),
                    type: data.get("type"),
                    price: parseFloat(data.get("price") as string),
                    quantity: parseInt(data.get("quantity") as string),
                    description: data.get("description"),
                    isAvailable: data.get("isAvailable") === "true",
                  });
                }}
              >
                <input name="eventName" placeholder="Event name" defaultValue={currentTicket?.eventName || ""} className="mb-3 w-full px-4 py-2 bg-gray-900 border border-gray-700 text-white rounded" />
                <input name="type" placeholder="Ticket type" defaultValue={currentTicket?.type || ""} className="mb-3 w-full px-4 py-2 bg-gray-900 border border-gray-700 text-white rounded" />
                <input type="number" name="price" placeholder="Price" defaultValue={currentTicket?.price || ""} className="mb-3 w-full px-4 py-2 bg-gray-900 border border-gray-700 text-white rounded" />
                <input type="number" name="quantity" placeholder="Quantity" defaultValue={currentTicket?.quantity || ""} className="mb-3 w-full px-4 py-2 bg-gray-900 border border-gray-700 text-white rounded" />
                <textarea name="description" placeholder="Description" defaultValue={currentTicket?.description || ""} className="mb-3 w-full px-4 py-2 bg-gray-900 border border-gray-700 text-white rounded" />
                <select name="isAvailable" defaultValue={currentTicket?.isAvailable?.toString() || "true"} className="mb-4 w-full px-4 py-2 bg-gray-900 border border-gray-700 text-white rounded">
                  <option value="true">Available</option>
                  <option value="false">Unavailable</option>
                </select>

                <div className="flex justify-end gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-700 rounded">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-indigo-600 rounded text-white">
                    {isSaving ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : "Save"}
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
