"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  PhoneIcon, PlusCircleIcon, UserCircleIcon, CalendarDaysIcon, ArrowPathIcon, PencilIcon, TrashIcon, CheckCircleIcon, CreditCardIcon
} from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import ConfirmationModal from '@/components/ConfirmationModal';
import ClientModal, { ClientData } from './ClientModal';
import toast from 'react-hot-toast'; // Import react-hot-toast

const apiBaseUrl = "/api";//process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';

// Define the ClientData interface
// interface ClientData {
//   id: string;
//   userId: string;
//   name: string | null;
//   email: string;
//   phone: string | null;
//   membershipType: string;
//   membershipStatus: 'ACTIVE' | 'EXPIRED' | 'FROZEN' | 'PENDING';
//   joinDate: string; // YYYY-MM-DD
//   lastActive: string; // YYYY-MM-DD
//   photoUrl: string | null;
// }

interface ClientsPageProps {
  params:Promise<{ slug: string }>
}

const customLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

// Variants for the main container
const containerVariants = {
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// Variants for individual client cards
const clientCardVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
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

// Reusable component for a single client's card
const ClientCard = ({ client, onEdit, onDelete }: { client: ClientData; onEdit: (client: ClientData) => void; onDelete: (client: ClientData) => void; }) => {
  const statusColors = {
    ACTIVE: 'bg-green-600/30 text-green-300 border-green-600',
    EXPIRED: 'bg-red-600/30 text-red-300 border-red-600',
    FROZEN: 'bg-yellow-400/30 text-yellow-300 border-yellow-400',
    PENDING: 'bg-blue-600/30 text-blue-300 border-blue-600',
  };

  const statusIcons = {
    ACTIVE: <CheckCircleIcon className="w-4 h-4 mr-2" />,
    EXPIRED: <ArrowPathIcon className="w-4 h-4 mr-2" />,
    FROZEN: <ArrowPathIcon className="w-4 h-4 mr-2" />,
    PENDING: <ArrowPathIcon className="w-4 h-4 mr-2" />,
  };
  
  const formattedStatus = client.membershipStatus.replace('_', ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());

  return (
    <motion.div
      className="bg-gray-800/60 backdrop-blur-md p-6 rounded-3xl shadow-xl flex flex-col relative border border-gray-700 transition-all duration-300"
      variants={clientCardVariants}
      whileHover="hover"
      initial="hidden"
      animate="visible"
    >
      {/* Client Profile */}
      <div className="flex items-center gap-4 mb-4">
        {/* User Image Placeholder */}
        <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0 border-4 border-indigo-600 bg-gray-700 flex items-center justify-center text-indigo-400 text-3xl">
          {client.photoUrl ? (
            <Image
              src={client.photoUrl}
              alt={client.name || 'Client'}
              width={80}
              height={80}
              objectFit="cover"
              className="transition-transform duration-300 hover:scale-110"
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
          <h4 className="text-2xl font-extrabold text-white leading-tight">{client.name}</h4>
          <p className="text-sm text-gray-400">{client.email}</p>
        </div>
      </div>

      {/* Membership Details */}
      <div className="border-t border-gray-700 pt-4 mt-auto">
        <div className={`px-4 py-2 mb-4 rounded-xl text-sm font-bold flex items-center justify-center border ${statusColors[client.membershipStatus]}`}>
          {statusIcons[client.membershipStatus]}
          <span>{formattedStatus} Member</span>
        </div>

        <div className="space-y-3 text-sm text-gray-400">
          <div className="flex items-center">
            <CreditCardIcon className="w-5 h-5 mr-3 text-cyan-400" />
            <p className="font-semibold text-gray-300">Membership: <span className="font-normal text-white">{client.membershipType}</span></p>
          </div>
          <div className="flex items-center">
            <CalendarDaysIcon className="w-5 h-5 mr-3 text-cyan-400" />
            <p className="font-semibold text-gray-300">Joined: <span className="font-normal text-white">{client.joinDate}</span></p>
          </div>
          <div className="flex items-center">
            <ArrowPathIcon className="w-5 h-5 mr-3 text-cyan-400" />
            <p className="font-semibold text-gray-300">Last Active: <span className="font-normal text-white">{client.lastActive}</span></p>
          </div>
          <div className="flex items-center">
            <PhoneIcon className="w-5 h-5 mr-3 text-cyan-400" />
            <p className="font-semibold text-gray-300">Phone: <span className="font-normal text-white">{client.phone || 'N/A'}</span></p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mt-6 pt-6 border-t border-gray-700">
        <motion.button
          onClick={() => onEdit(client)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-md"
        >
          <PencilIcon className="w-5 h-5" /> Edit
        </motion.button>
        <motion.button
          onClick={() => onDelete(client)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors flex items-center justify-center gap-2 shadow-md"
        >
          <TrashIcon className="w-5 h-5" /> Delete
        </motion.button>
      </div>
    </motion.div>
  );
};


// Skeleton Loader Component
const ClientCardSkeleton = () => (
  <div className="bg-gray-800/60 p-6 rounded-3xl shadow-xl flex flex-col relative border border-gray-700 animate-pulse h-[400px]">
    <div className="flex items-center gap-4 mb-4">
      <div className="w-20 h-20 rounded-full bg-gray-700"></div>
      <div className="flex-grow space-y-2">
        <div className="h-6 bg-gray-700 rounded-lg w-3/4"></div>
        <div className="h-4 bg-gray-700 rounded-lg w-1/2"></div>
      </div>
    </div>
    <div className="border-t border-gray-700 pt-4 mt-auto space-y-4">
      <div className="h-10 bg-gray-700 rounded-xl"></div>
      <div className="h-4 bg-gray-700 rounded-lg w-full"></div>
      <div className="h-4 bg-gray-700 rounded-lg w-2/3"></div>
      <div className="h-4 bg-gray-700 rounded-lg w-2/3"></div>
      <div className="h-4 bg-gray-700 rounded-lg w-1/2"></div>
    </div>
    <div className="flex gap-4 mt-6 pt-6 border-t border-gray-700">
      <div className="h-12 bg-gray-700 rounded-xl flex-1"></div>
      <div className="h-12 bg-gray-700 rounded-xl flex-1"></div>
    </div>
  </div>
);


export default function ClientsPage() {
  const { slug } = useParams();

  const [clients, setClients] = useState<ClientData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [currentClient, setCurrentClient] = useState<ClientData | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<ClientData | null>(null);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiBaseUrl}/admin/travel-users?companyId=${slug}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Credentials': 'include' },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: ClientData[] = (await response.json()).data;
      setClients(data);
    } catch (err: any) {
      setError(err.message);
      console.error("Failed to fetch clients:", err);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const openAddModal = () => {
    setCurrentClient(null);
    setIsClientModalOpen(true);
  };

  const openEditModal = (client: ClientData) => {
    setCurrentClient(client);
    setIsClientModalOpen(true);
  };

  const handleSaveClient = (savedClient: ClientData) => {
    if (currentClient) {
      setClients(prevClients => prevClients.map(c => c.id === savedClient.id ? savedClient : c));
      toast.success(`Member "${savedClient.name}" updated successfully.`);
    } else {
      setClients(prevClients => [savedClient, ...prevClients]);
      toast.success(`Member "${savedClient.name}" added successfully.`);
    }
    setIsClientModalOpen(false);
  };

  const handleDeleteClientClick = (client: ClientData) => {
    setClientToDelete(client);
    setIsConfirmModalOpen(true);
  };

  const confirmDeleteClient = async () => {
    if (!clientToDelete) return;

    setIsConfirmModalOpen(false);
    const toastId = toast.loading(`Deleting member "${clientToDelete.name}"...`);

    try {
      const response = await fetch(`${apiBaseUrl}/admin/travel-users/${clientToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'Credentials': 'include' },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to delete member "${clientToDelete.name}".`);
      }

      setClients(prevClients => prevClients.filter(c => c.id !== clientToDelete.id));
      toast.success(`Member "${clientToDelete.name}" deleted successfully.`, { id: toastId });
    } catch (err: any) {
      setError(err.message);
      toast.error(`Error: ${err.message}`, { id: toastId });
    } finally {
      setLoading(false);
      setClientToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-950 to-gray-900 p-8 text-white font-sans">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-5xl md:text-6xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 mb-6 drop-shadow-lg"
      >
        Manage Memberships
      </motion.h1>

      <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
        Oversee all your members, track their status, and manage their membership details.
      </p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-gray-800/50 backdrop-blur-md rounded-3xl shadow-2xl p-8 mb-12 border border-gray-700"
      >
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-4 md:mb-0">All Members</h2>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <ClientCardSkeleton key={i} />
            ))}
          </div>
        )}

        {error && (
          <div className="bg-red-900/50 text-red-300 p-6 rounded-lg text-center mb-8 border border-red-700">
            <p className="font-bold text-lg">Error loading members:</p>
            <p className="text-sm">{error}</p>
            <p className="mt-2 text-xs">Please try refreshing the page or contact support.</p>
          </div>
        )}

        {!loading && !error && clients.length === 0 ? (
          <div className="text-center py-20 bg-gray-700/30 rounded-2xl border border-gray-600">
            <p className="text-xl text-gray-400">No members found. Start by adding one! 🤸</p>
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
        slug={slug?.toString() || ''}
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