"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClockIcon,
  PaperAirplaneIcon,
  PencilIcon,
  PlusIcon,
  UserGroupIcon,
  TrashIcon,
  ExclamationCircleIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  BellIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import ConfirmationModal from '@/components/ConfirmationModal';
import CommunicationModal, { CommunicationData } from './CommunicationModal';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 260, damping: 25 } 
  },
  exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
};

// Reusable component for a single communication card
const CommunicationCard = ({ 
  comm, 
  onEdit, 
  onDelete, 
}: { 
  comm: CommunicationData; 
  onEdit: (comm: CommunicationData) => void; 
  onDelete: (comm: CommunicationData) => void; 
}) => {
  const statusStyles = {
    SENT: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
    DRAFT: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
    SCHEDULED: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-500/20',
    FAILED: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border-rose-200 dark:border-rose-500/20',
  };

  const statusIcons = {
    SENT: <PaperAirplaneIcon className='w-3.5 h-3.5' />,
    DRAFT: <PencilIcon className='w-3.5 h-3.5' />,
    SCHEDULED: <ClockIcon className='w-3.5 h-3.5' />,
    FAILED: <ExclamationCircleIcon className='w-3.5 h-3.5' />,
  };

  const typeIcons = {
    EMAIL: <EnvelopeIcon className="w-4 h-4" />,
    SMS: <ChatBubbleLeftRightIcon className="w-4 h-4" />,
    NOTIFICATION: <BellIcon className="w-4 h-4" />,
    IN_APP_MESSAGE: <BellIcon className="w-4 h-4" />,
  };

  const formatRecipients = (recipients: string[]) => {
    if (!recipients || recipients.length === 0) return 'No recipients';
    if (recipients.includes('all_clients')) return 'All Clients';
    return recipients.length === 1 ? '1 Client' : `${recipients.length} Clients`;
  };

  const formattedDate = comm.status === 'SENT' 
    ? comm.sentDate 
    : comm.scheduledDate ? comm.scheduledDate.replace('T', ' ').slice(0, 16) : null;

  return (
    <motion.div
      variants={cardVariants}
      layout
      className="group relative bg-white dark:bg-zinc-900/60 backdrop-blur-md p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800/80 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between gap-4"
    >
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border flex items-center gap-1.5 ${statusStyles[comm.status]}`}>
              {statusIcons[comm.status]}
              {comm.status.charAt(0).toUpperCase() + comm.status.slice(1).toLowerCase()}
            </span>
            <span className="flex items-center gap-1 text-xs font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
              {typeIcons[comm.communicationType] || typeIcons.NOTIFICATION}
              {comm.communicationType.replace('_', ' ')}
            </span>
          </div>
          
          {formattedDate && (
            <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
              {comm.status === 'SENT' ? 'Sent' : 'Scheduled'}: {formattedDate}
            </span>
          )}
        </div>

        <h4 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-1 tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
          {comm.subject}
        </h4>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
          {comm.content}
        </p>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800/60 mt-2">
        <div className="flex items-center text-xs font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/40 px-2.5 py-1 rounded-lg">
          <UserGroupIcon className="mr-1.5 text-zinc-400 dark:text-zinc-500 w-4 h-4" />
          <span>{formatRecipients(comm.recipients)}</span>
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(comm)}
            className="p-2 rounded-xl text-zinc-500 dark:text-zinc-400 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-400 transition-all"
            title="Edit Message"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(comm)}
            className="p-2 rounded-xl text-zinc-500 dark:text-zinc-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400 transition-all"
            title="Delete Message"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

interface CommunicationsClientProps {
  companyId: string;
  slug: string;
}

export default function CommunicationsClient({ companyId, slug }: CommunicationsClientProps) {
  const [communications, setCommunications] = useState<CommunicationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCommunicationModalOpen, setIsCommunicationModalOpen] = useState(false);
  const [currentCommunication, setCurrentCommunication] = useState<CommunicationData | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [communicationToDelete, setCommunicationToDelete] = useState<CommunicationData | null>(null);

  const fetchCommunications = useCallback(async () => {
    const activeIdentifier = slug || companyId;
    if (!activeIdentifier) return;

    setLoading(true);
    try {
      const response = await fetch(`${apiBaseUrl}/admin/communications?companyId=${activeIdentifier}`, { 
        credentials: 'include', 
      });
      if (!response.ok) throw new Error('Failed to fetch communications.');
      const data = (await response.json()).data || [];
      setCommunications(data);
    } catch (err: any) {
      toast.error(`Error loading communications: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [slug, companyId]);

  useEffect(() => {
    fetchCommunications();
  }, [fetchCommunications]);

  const openComposeModal = () => {
    setCurrentCommunication(null);
    setIsCommunicationModalOpen(true);
  };

  const openEditModal = (comm: CommunicationData) => {
    setCurrentCommunication(comm);
    setIsCommunicationModalOpen(true);
  };

  const handleSaveCommunication = (savedComm: CommunicationData) => {
    if (currentCommunication) {
      setCommunications(prev => prev.map(c => c.id === savedComm.id ? savedComm : c));
      toast.success(`Message updated successfully.`);
    } else {
      setCommunications(prev => [savedComm, ...prev]);
      toast.success(`Message created successfully!`);
    }
    setIsCommunicationModalOpen(false);
  };

  const handleDeleteCommunicationClick = (comm: CommunicationData) => {
    setCommunicationToDelete(comm);
    setIsConfirmModalOpen(true);
  };

  const confirmDeleteCommunication = async () => {
    if (!communicationToDelete) return;

    setIsConfirmModalOpen(false);
    const toastId = toast.loading('Deleting message...');

    try {
      const response = await fetch(`${apiBaseUrl}/admin/communications/${communicationToDelete.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = (await response.json()).data || {};
        throw new Error(errorData.message || 'Failed to delete message.');
      }

      setCommunications(prev => prev.filter(c => c.id !== communicationToDelete.id));
      toast.success('Message deleted successfully.', { id: toastId });
    } catch (err: any) {
      toast.error(`Error deleting message: ${err.message}`, { id: toastId });
    } finally {
      setCommunicationToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl bg-gradient-to-r from-zinc-900 via-zinc-700 to-indigo-600 dark:from-white dark:via-zinc-200 dark:to-indigo-400 bg-clip-text text-transparent">
              Communications
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Compose, schedule, and track broadcast distributions across channels.
            </p>
          </div>

          <motion.button
            onClick={openComposeModal}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white shadow-sm shadow-indigo-500/10 transition-all w-full md:w-auto self-start md:self-center"
          >
            <PlusIcon className='w-4 h-4 stroke-[2.5]' />
            Compose Message
          </motion.button>
        </div>

        {/* Workspace Layout */}
        <div className="w-full">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <div className="relative w-10 h-10">
                <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin"></div>
              </div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 animate-pulse font-medium">Loading history...</p>
            </div>
          ) : communications.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20 px-4 bg-white dark:bg-zinc-900/40 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col items-center max-w-xl mx-auto"
            >
              <div className="p-3 bg-zinc-100 dark:bg-zinc-800/60 rounded-2xl text-zinc-400 dark:text-zinc-500 mb-4">
                <PaperAirplaneIcon className="w-6 h-6 -rotate-12" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1">No transmissions yet</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 max-w-xs">
                Your outbox is empty. Get started by dispatching your first campaign notification or email template.
              </p>
              <button
                onClick={openComposeModal}
                className="text-xs font-semibold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 px-4 py-2 rounded-xl hover:opacity-90 transition-opacity"
              >
                Create Broadcast
              </button>
            </motion.div>
          ) : (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              <AnimatePresence mode="popLayout">
                {communications.map((comm) => (
                  <CommunicationCard
                    key={comm.id}
                    comm={comm}
                    onEdit={openEditModal}
                    onDelete={handleDeleteCommunicationClick}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>

      <CommunicationModal
        isOpen={isCommunicationModalOpen}
        onClose={() => setIsCommunicationModalOpen(false)}
        onSave={handleSaveCommunication}
        communication={currentCommunication}
        slug={slug}
      />

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmDeleteCommunication}
        title="Delete Template"
        message={`This will permanently remove the message arrangement "${communicationToDelete?.subject || 'Untitled'}" along with scheduled parameters. This cannot be undone.`}
        confirmText="Confirm Delete"
      />
    </div>
  );
}