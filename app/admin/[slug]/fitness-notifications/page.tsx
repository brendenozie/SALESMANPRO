// app/[adminSlug]/communications/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRightCircleIcon, ClockIcon, PaperAirplaneIcon, PencilIcon, PlusCircleIcon, UserCircleIcon, TrashIcon
} from '@heroicons/react/24/outline'; // Added TrashIcon
import { useParams } from 'next/navigation';
import ConfirmationModal from '@/components/ConfirmationModal'; // Re-use this
import CommunicationModal from './CommunicationModal'; // New CommunicationModal component

// Define the CommunicationData interface to match the API response
interface CommunicationData {
  id: string;
  subject: string;
  content: string;
  communicationType: 'EMAIL' | 'SMS' | 'NOTIFICATION' | 'IN_APP_MESSAGE';
  status: 'DRAFT' | 'SCHEDULED' | 'SENT' | 'FAILED';
  recipients: string[];
  sentDate: string | null; // YYYY-MM-DD
  scheduledDate: string | null; // YYYY-MM-DDTHH:MM
}

interface CommunicationsPageProps {
  params: {
    adminSlug: string;
  };
}

const commCardVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } },
  hover: {
    scale: 1.02,
    boxShadow: "0 10px 20px rgba(0, 0, 0, 0.2)",
    transition: {
      duration: 0.2,
    },
  },
};

// Reusable component for a single communication card
const CommunicationCard = ({ comm, onEdit, onDelete }: { comm: CommunicationData; onEdit: (comm: CommunicationData) => void; onDelete: (comm: CommunicationData) => void; }) => {
  const statusColors = {
    SENT: 'bg-blue-600 text-white',
    DRAFT: 'bg-yellow-400 text-gray-900',
    SCHEDULED: 'bg-purple-600 text-white',
    FAILED: 'bg-red-600 text-white', // Added FAILED status color
  };

  const statusIcons = {
    SENT: <PaperAirplaneIcon className='w-5 h-5' />,
    DRAFT: <PencilIcon className='w-5 h-5' />,
    SCHEDULED: <ClockIcon className='w-5 h-5' />,
    FAILED: <ExclamationCircleIcon className='w-5 h-5' />, // Assuming ExclamationCircleIcon for FAILED
  };

  // Helper to format recipient display
  const formatRecipients = (recipients: string[]) => {
    if (recipients.includes('all_clients')) return 'All Clients';
    if (recipients.length === 1) return `1 Client`; // Could fetch client name if needed
    return `${recipients.length} Clients`;
  };

  return (
    <motion.div
      className="bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-700 flex flex-col cursor-pointer"
      variants={commCardVariants}
      whileHover="hover"
      initial="hidden"
      animate="visible"
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${statusColors[comm.status]}`}
          >
            {statusIcons[comm.status]}
            {comm.status.charAt(0).toUpperCase() + comm.status.slice(1).toLowerCase()}
          </span>
          <p className="text-xs text-gray-400">
            {comm.communicationType.replace('_', ' ').charAt(0).toUpperCase() + comm.communicationType.replace('_', ' ').slice(1).toLowerCase()}
          </p>
        </div>
        {(comm.sentDate || comm.scheduledDate) && (
          <span className="text-xs text-gray-400">
            {comm.status === 'SENT' ? `Sent: ${comm.sentDate}` : `Scheduled: ${comm.scheduledDate?.split('T')[0]} ${comm.scheduledDate?.split('T')[1]}`}
          </span>
        )}
      </div>

      <h4 className="text-xl font-extrabold text-white mb-2 leading-tight">{comm.subject}</h4>
      <p className="text-sm text-gray-400 mb-4 line-clamp-2">{comm.content}</p>

      <div className="mt-auto flex justify-between items-center pt-4 border-t border-gray-700">
        <div className="flex items-center text-sm text-gray-400">
          <UserCircleIcon className="mr-2 text-indigo-400 w-5 h-5" />
          <span>{formatRecipients(comm.recipients)}</span>
        </div>
        <div className="flex items-center space-x-2">
          <motion.button
            onClick={() => onEdit(comm)}
            className="p-1 rounded-full text-indigo-400 hover:bg-indigo-700 hover:text-white transition-colors"
            title="Edit Message"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <PencilIcon className="w-5 h-5" />
          </motion.button>
          <motion.button
            onClick={() => onDelete(comm)}
            className="p-1 rounded-full text-red-400 hover:bg-red-700 hover:text-white transition-colors"
            title="Delete Message"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <TrashIcon className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default function CommunicationsPage({ params }: CommunicationsPageProps) {
  const { adminSlug } = params;

  const [communications, setCommunications] = useState<CommunicationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCommunicationModalOpen, setIsCommunicationModalOpen] = useState(false);
  const [currentCommunication, setCurrentCommunication] = useState<CommunicationData | null>(null); // For edit mode
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [communicationToDelete, setCommunicationToDelete] = useState<CommunicationData | null>(null);

  // Function to fetch communications from the API
  const fetchCommunications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/${adminSlug}/communications`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: CommunicationData[] = await response.json();
      setCommunications(data);
    } catch (err: any) {
      setError(err.message);
      console.error("Failed to fetch communications:", err);
    } finally {
      setLoading(false);
    }
  }, [adminSlug]);

  // Fetch communications on component mount
  useEffect(() => {
    fetchCommunications();
  }, [fetchCommunications]);

  const openComposeModal = () => {
    setCurrentCommunication(null); // Clear current communication for compose mode
    setIsCommunicationModalOpen(true);
  };

  const openEditModal = (comm: CommunicationData) => {
    setCurrentCommunication(comm);
    setIsCommunicationModalOpen(true);
  };

  const handleSaveCommunication = (savedComm: CommunicationData) => {
    if (currentCommunication) {
      // If editing, update the existing communication in the list
      setCommunications(prevComms => prevComms.map(c => c.id === savedComm.id ? savedComm : c));
      alert(`Message "${savedComm.subject}" updated successfully.`);
    } else {
      // If composing new, prepend the new communication to the list
      setCommunications(prevComms => [savedComm, ...prevComms]);
      alert(`Message "${savedComm.subject}" sent/scheduled successfully.`);
    }
    setIsCommunicationModalOpen(false);
  };

  const handleDeleteCommunicationClick = (comm: CommunicationData) => {
    setCommunicationToDelete(comm);
    setIsConfirmModalOpen(true);
  };

  const confirmDeleteCommunication = async () => {
    if (!communicationToDelete) return;

    setIsConfirmModalOpen(false); // Close modal immediately
    setLoading(true); // Show loading state for deletion
    setError(null);

    try {
      const response = await fetch(`/api/admin/${adminSlug}/communications/${communicationToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to delete message "${communicationToDelete.subject}".`);
      }

      // If deletion is successful, update the local state
      setCommunications(prevComms => prevComms.filter(c => c.id !== communicationToDelete.id));
      alert(`Message "${communicationToDelete.subject}" deleted successfully.`);
    } catch (err: any) {
      setError(err.message);
      alert(`Error deleting message: ${err.message}`);
    } finally {
      setLoading(false);
      setCommunicationToDelete(null); // Clear communication to delete
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-8 text-white font-sans">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-5xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-600 mb-12 drop-shadow-lg"
      >
        Manage Communications & Notifications
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-gray-800 rounded-3xl shadow-2xl p-8 mb-12 border border-gray-700"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <motion.div
              className="bg-gray-900 p-8 rounded-2xl shadow-xl flex flex-col justify-between h-full border border-gray-700"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center text-2xl flex-shrink-0">
                  <PencilIcon className='w-8 h-8' />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Compose New Message</h3>
                  <p className="text-gray-400 text-sm">Send an email, SMS, or notification to your members.</p>
                </div>
              </div>

              <motion.button
                onClick={openComposeModal}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold bg-gradient-to-r from-indigo-600 to-blue-700 text-white shadow-lg hover:from-indigo-700 hover:to-blue-800 transition-all duration-300"
              >
                <PlusCircleIcon className='w-6 h-6' />
                Compose Message
              </motion.button>
            </motion.div>
          </div>
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-3xl font-bold text-white">Message History</h3>
            </div>
            {loading && (
              <div className="text-center py-20">
                <svg className="animate-spin h-10 w-10 text-teal-400 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-xl text-gray-400">Loading communications...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-900 bg-opacity-50 text-red-200 p-6 rounded-lg text-center mb-8 border border-red-700">
                <p className="font-bold text-lg">Error loading communications:</p>
                <p className="text-sm">{error}</p>
              </div>
            )}

            {!loading && !error && communications.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-xl text-gray-400">No communications found. Compose your first message!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {communications.map((comm) => (
                  <CommunicationCard
                    key={comm.id}
                    comm={comm}
                    onEdit={openEditModal}
                    onDelete={handleDeleteCommunicationClick}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Communication Modal for Compose/Edit */}
      <CommunicationModal
        isOpen={isCommunicationModalOpen}
        onClose={() => setIsCommunicationModalOpen(false)}
        onSave={handleSaveCommunication}
        communication={currentCommunication}
        adminSlug={adminSlug}
      />

      {/* Confirmation Modal for Deletion */}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmDeleteCommunication}
        title="Confirm Deletion"
        message={`Are you sure you want to delete the message "${communicationToDelete?.subject || 'N/A'}"? This action cannot be undone.`}
        confirmText="Delete"
      />
    </div>
  );
}
