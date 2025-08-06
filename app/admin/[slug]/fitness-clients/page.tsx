// app/[adminSlug]/clients/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  BellAlertIcon, EnvelopeIcon, PhoneIcon, PlusCircleIcon, UserCircleIcon, CalendarDaysIcon, ArrowRightCircleIcon, PencilIcon, TrashIcon
} from '@heroicons/react/24/outline'; // Added PencilIcon, TrashIcon
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import ConfirmationModal from '@/components/ConfirmationModal'; // Re-use this
import ClientModal from './ClientModal'; // New ClientModal component

// Define the ClientData interface to match the API response
interface ClientData {
  id: string;
  userId: string;
  name: string | null;
  email: string;
  phone: string | null;
  membershipType: string;
  membershipStatus: 'ACTIVE' | 'EXPIRED' | 'FROZEN' | 'PENDING';
  joinDate: string; // YYYY-MM-DD
  lastActive: string; // YYYY-MM-DD
  photoUrl: string | null;
}

interface ClientsPageProps {
  params: {
    adminSlug: string;
  };
}

const customLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

const containerVariants = {
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const clientCardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
  hover: {
    scale: 1.03,
    boxShadow: "0 15px 30px rgba(0, 0, 0, 0.3)",
    transition: {
      duration: 0.2,
    },
  },
};

// A reusable component for a single client's card
const ClientCard = ({ client, onEdit, onDelete }: { client: ClientData; onEdit: (client: ClientData) => void; onDelete: (client: ClientData) => void; }) => {
  const statusColors = {
    ACTIVE: 'bg-green-600 text-white',
    EXPIRED: 'bg-red-600 text-white',
    FROZEN: 'bg-yellow-400 text-gray-900',
    PENDING: 'bg-blue-600 text-white',
  };

  return (
    <motion.div
      className="bg-gray-800 p-6 rounded-2xl shadow-xl flex flex-col relative border border-gray-700"
      variants={clientCardVariants}
      whileHover="hover"
      initial="hidden"
      animate="visible"
    >
      {/* Client Profile and Status */}
      <div className="flex items-center gap-4 mb-4">
        {/* User Image Placeholder */}
        <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 border-2 border-indigo-500 bg-gray-700 flex items-center justify-center text-indigo-400 text-3xl">
          {client.photoUrl ? (
            <Image
              src={client.photoUrl}
              alt={client.name || 'Client'}
              layout="fill"
              objectFit="cover"
              loader={customLoader}
              onError={(e) => {
                e.currentTarget.src = 'https://placehold.co/128x128/E0E7FF/4338CA?text=No+Photo';
              }}
            />
          ) : (
            <UserCircleIcon className="w-full h-full" />
          )}
        </div>
        <div className="flex-grow">
          <h4 className="text-xl font-bold text-white leading-tight">{client.name}</h4>
          <p className="text-sm text-gray-400">{client.email}</p>
        </div>
        <div
          className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[client.membershipStatus]}`}
        >
          {client.membershipStatus.replace('_', ' ').charAt(0).toUpperCase() + client.membershipStatus.replace('_', ' ').slice(1).toLowerCase()}
        </div>
      </div>

      {/* Membership Details */}
      <div className="border-t border-gray-700 pt-4 mt-auto">
        <p className="text-sm font-semibold text-gray-400 mb-2">Membership: <span className="text-white ml-2">{client.membershipType}</span></p>
        <div className="flex items-center text-sm text-gray-400 mb-2">
          <CalendarDaysIcon className="w-4 h-4 mr-2 text-indigo-400" />
          <p>Joined: {client.joinDate}</p>
        </div>
        <div className="flex items-center text-sm text-gray-400 mb-2">
          <ArrowRightCircleIcon className="w-4 h-4 mr-2 text-indigo-400" />
          <p>Last Active: {client.lastActive}</p>
        </div>
        <div className="flex items-center text-sm text-gray-400">
          <PhoneIcon className="w-4 h-4 mr-2 text-indigo-400" />
          <p>Phone: {client.phone || 'N/A'}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mt-6 pt-4 border-t border-gray-700">
        <motion.button
          onClick={() => onEdit(client)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex-1 py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
        >
          <PencilIcon className="w-5 h-5" /> Edit
        </motion.button>
        <motion.button
          onClick={() => onDelete(client)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex-1 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
        >
          <TrashIcon className="w-5 h-5" /> Delete
        </motion.button>
      </div>
    </motion.div>
  );
};

export default function ClientsPage({ params }: ClientsPageProps) {
  const { adminSlug } = params;

  const [clients, setClients] = useState<ClientData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [currentClient, setCurrentClient] = useState<ClientData | null>(null); // For edit mode
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<ClientData | null>(null);

  // Function to fetch clients from the API
  const fetchClients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/${adminSlug}/clients`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: ClientData[] = await response.json();
      setClients(data);
    } catch (err: any) {
      setError(err.message);
      console.error("Failed to fetch clients:", err);
    } finally {
      setLoading(false);
    }
  }, [adminSlug]);

  // Fetch clients on component mount
  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const openAddModal = () => {
    setCurrentClient(null); // Clear current client for add mode
    setIsClientModalOpen(true);
  };

  const openEditModal = (client: ClientData) => {
    setCurrentClient(client);
    setIsClientModalOpen(true);
  };

  const handleSaveClient = (savedClient: ClientData) => {
    if (currentClient) {
      // If editing, update the existing client in the list
      setClients(prevClients => prevClients.map(c => c.id === savedClient.id ? savedClient : c));
      alert(`Client ${savedClient.name} updated successfully.`);
    } else {
      // If adding, prepend the new client to the list
      setClients(prevClients => [savedClient, ...prevClients]);
      alert(`Client ${savedClient.name} added successfully.`);
    }
    setIsClientModalOpen(false);
  };

  const handleDeleteClientClick = (client: ClientData) => {
    setClientToDelete(client);
    setIsConfirmModalOpen(true);
  };

  const confirmDeleteClient = async () => {
    if (!clientToDelete) return;

    setIsConfirmModalOpen(false); // Close modal immediately
    setLoading(true); // Show loading state for deletion
    setError(null);

    try {
      const response = await fetch(`/api/admin/${adminSlug}/clients/${clientToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to delete client "${clientToDelete.name}".`);
      }

      // If deletion is successful, update the local state
      setClients(prevClients => prevClients.filter(c => c.id !== clientToDelete.id));
      alert(`Client "${clientToDelete.name}" deleted successfully.`);
    } catch (err: any) {
      setError(err.message);
      alert(`Error deleting client: ${err.message}`);
    } finally {
      setLoading(false);
      setClientToDelete(null); // Clear client to delete
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-teal-900 p-8 text-white font-sans">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-5xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 mb-12 drop-shadow-lg"
      >
        Manage Valued Members
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-gray-800 rounded-3xl shadow-2xl p-8 mb-12 border border-gray-700"
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-white">All Members</h2>
          <motion.button
            onClick={openAddModal}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <PlusCircleIcon className="h-6 w-6" />
            <span>Add New Member</span>
          </motion.button>
        </div>

        {loading && (
          <div className="text-center py-20">
            <svg className="animate-spin h-10 w-10 text-cyan-400 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-xl text-gray-400">Loading members...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-900 bg-opacity-50 text-red-200 p-6 rounded-lg text-center mb-8 border border-red-700">
            <p className="font-bold text-lg">Error loading members:</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {!loading && !error && clients.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-gray-400">No members found. Start by adding one!</p>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {clients.map((client) => (
              <ClientCard
                key={client.id}
                client={client}
                onEdit={openEditModal}
                onDelete={handleDeleteClientClick}
              />
            ))}
          </motion.div>
        )}
      </motion.div>

      {/* Add/Edit Client Modal */}
      <ClientModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onSave={handleSaveClient}
        client={currentClient}
        adminSlug={adminSlug}
      />

      {/* Confirmation Modal for Deletion */}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmDeleteClient}
        title="Confirm Deletion"
        message={`Are you sure you want to delete member "${clientToDelete?.name || 'N/A'}"? This action cannot be undone.`}
        confirmText="Delete"
      />
    </div>
  );
}
