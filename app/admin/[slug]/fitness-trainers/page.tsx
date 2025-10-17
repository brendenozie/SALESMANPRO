"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  BellAlertIcon, EnvelopeIcon, PhoneIcon, PlusCircleIcon, UserCircleIcon, PencilIcon, TrashIcon
} from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import ConfirmationModal from '@/components/ConfirmationModal';
import TrainerModal, { TrainerData } from './TrainerModal';
import toast from 'react-hot-toast';


const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3000/api";


const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => `${src}?w=${width}&q=${quality || 75}`;


// Define the TrainerData interface
// interface TrainerData {
//   id: string;
//   userId: string;
//   name: string | null;
//   email: string;
//   phone: string | null;
//   specialty: string;
//   bio: string | null;
//   certifications: string[];
//   photoUrl: string | null;
//   status: 'ACTIVE' | 'ON_LEAVE' | 'INACTIVE';
// }

interface TrainersPageProps {
  params:Promise<{ slug: string }>
}

// A reusable component for a single trainer's card
const TrainerCard = ({ trainer, onEdit, onDelete }: { trainer: TrainerData; onEdit: (trainer: TrainerData) => void; onDelete: (trainer: TrainerData) => void; }) => {
  const statusColors = {
    ACTIVE: 'bg-green-500/30 text-green-300 border-green-500',
    ON_LEAVE: 'bg-yellow-500/30 text-yellow-300 border-yellow-500',
    INACTIVE: 'bg-red-500/30 text-red-300 border-red-500',
  };

  const trainerCardVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
    hover: {
      scale: 1.03,
      boxShadow: "0 15px 30px rgba(0, 0, 0, 0.3)",
      transition: { duration: 0.2 },
    },
  };

  return (
    <motion.div
      className="bg-gray-800/60 backdrop-blur-md p-6 rounded-3xl shadow-xl flex flex-col items-center text-center relative border border-gray-700 transition-all duration-300"
      variants={trainerCardVariants}
      whileHover="hover"
      initial="hidden"
      animate="visible"
    >
      {/* Status Badge */}
      <div
        className={`absolute top-5 right-5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${statusColors[trainer.status]}`}
      >
        {trainer.status.replace('_', ' ')}
      </div>

      {/* Trainer Image or Placeholder */}
      <div className="w-32 h-32 rounded-full overflow-hidden mb-4 border-4 border-indigo-600 shadow-lg flex-shrink-0 relative">
        {trainer.photoUrl ? (
          <Image
            src={trainer.photoUrl}
            alt={trainer.name || 'Trainer'}
            fill
            style={{ objectFit: 'cover' }}
            loader={loader}
            priority
            className="transition-transform duration-300 hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-gray-700 flex items-center justify-center text-indigo-400 text-5xl">
            <UserCircleIcon className='w-20 h-20' />
          </div>
        )}
      </div>

      <h4 className="text-3xl font-extrabold text-white mb-1 leading-tight">{trainer.name}</h4>
      <p className="text-teal-400 font-semibold mb-3">{trainer.specialty}</p>

      <p className="text-sm text-gray-400 mb-6 line-clamp-3 flex-grow">{trainer.bio}</p>

      {/* Contact & Details */}
      <div className="w-full text-left text-sm text-gray-400 border-t border-gray-700 pt-4 mt-auto space-y-2">
        <div className="flex items-center space-x-2">
          <EnvelopeIcon className="text-indigo-400 w-5 h-5" />
          <p>{trainer.email}</p>
        </div>
        <div className="flex items-center space-x-2">
          <PhoneIcon className="text-indigo-400 w-5 h-5" />
          <p>{trainer.phone || 'N/A'}</p>
        </div>
        <div className="flex items-start space-x-2">
          <BellAlertIcon className="text-indigo-400 mt-1 w-5 h-5" />
          <p className="flex-1">
            <span className="font-semibold text-gray-300">Certifications:</span>{' '}
            {trainer.certifications.length > 0 ? trainer.certifications.join(', ') : 'N/A'}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex w-full justify-center gap-4 mt-6">
        <motion.button
          onClick={() => onEdit(trainer)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-md hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
        >
          <PencilIcon className="w-5 h-5" /> Edit
        </motion.button>
        <motion.button
          onClick={() => onDelete(trainer)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold shadow-md hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
        >
          <TrashIcon className="w-5 h-5" /> Delete
        </motion.button>
      </div>
    </motion.div>
  );
};


export default function TrainersPage() {
  const { slug } = useParams();

  const [trainers, setTrainers] = useState<TrainerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTrainerModalOpen, setIsTrainerModalOpen] = useState(false);
  const [currentTrainer, setCurrentTrainer] = useState<TrainerData | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [trainerToDelete, setTrainerToDelete] = useState<TrainerData | null>(null);

  const fetchTrainers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiBaseUrl}/admin/trainers?companyId=${slug}`, {
        method: 'GET',
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: TrainerData[] = (await response.json()).data || [];
      setTrainers(data);
    } catch (err: any) {
      setError(err.message);
      console.error("Failed to fetch trainers:", err);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchTrainers();
  }, [fetchTrainers]);

  const openAddModal = () => {
    setCurrentTrainer(null);
    setIsTrainerModalOpen(true);
  };

  const openEditModal = (trainer: TrainerData) => {
    setCurrentTrainer(trainer);
    setIsTrainerModalOpen(true);
  };

  const handleSaveTrainer = (savedTrainer: TrainerData) => {
    if (currentTrainer) {
      setTrainers(prevTrainers => prevTrainers.map(t => t.id === savedTrainer.id ? savedTrainer : t));
      toast.success(`Trainer "${savedTrainer.name}" updated successfully.`);
    } else {
      setTrainers(prevTrainers => [savedTrainer, ...prevTrainers]);
      toast.success(`Trainer "${savedTrainer.name}" added successfully.`);
    }
    setIsTrainerModalOpen(false);
  };

  const handleDeleteTrainerClick = (trainer: TrainerData) => {
    setTrainerToDelete(trainer);
    setIsConfirmModalOpen(true);
  };

  const confirmDeleteTrainer = async () => {
    if (!trainerToDelete) return;

    setIsConfirmModalOpen(false);
    const toastId = toast.loading(`Deleting trainer "${trainerToDelete.name}"...`);

    try {
      const response = await fetch(`${apiBaseUrl}/admin/trainers/${trainerToDelete.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to delete trainer "${trainerToDelete.name}".`);
      }

      setTrainers(prevTrainers => prevTrainers.filter(t => t.id !== trainerToDelete.id));
      toast.success(`Trainer "${trainerToDelete.name}" deleted successfully.`, { id: toastId });
    } catch (err: any) {
      setError(err.message);
      toast.error(`Error: ${err.message}`, { id: toastId });
    } finally {
      setLoading(false);
      setTrainerToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-950 to-gray-900 p-8 text-white font-sans">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-5xl md:text-6xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-600 mb-6 drop-shadow-lg"
      >
        Fitness Staff Dashboard
      </motion.h1>

      <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
        Oversee all your fitness trainers, manage their profiles, and update their availability and certifications.
      </p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-gray-800/50 rounded-3xl shadow-2xl p-8 mb-12 border border-gray-700 backdrop-blur-md"
      >
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-4 md:mb-0">All Trainers</h2>
          <motion.button
            onClick={openAddModal}
            className="flex items-center space-x-2 bg-gradient-to-r from-teal-500 to-blue-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:from-teal-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <PlusCircleIcon className="h-6 w-6" />
            <span>Add New Trainer</span>
          </motion.button>
        </div>

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-700/50 rounded-3xl h-[450px] animate-pulse"></div>
            ))}
          </div>
        )}

        {error && (
          <div className="bg-red-900/50 text-red-300 p-6 rounded-lg text-center mb-8 border border-red-700">
            <p className="font-bold text-lg">Error loading trainers:</p>
            <p className="text-sm">{error}</p>
            <p className="mt-2 text-xs">Please try refreshing the page or contact support.</p>
          </div>
        )}

        {!loading && !error && trainers.length === 0 ? (
          <div className="text-center py-20 bg-gray-700/30 rounded-2xl border border-gray-600">
            <p className="text-xl text-gray-400">No trainers found. Start by adding one! 💪</p>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.1 } },
            }}
          >
            {trainers.map((trainer) => (
              <motion.div key={trainer.id} variants={{ hidden: { opacity: 0, y: 50 }, visible: { opacity: 1, y: 0 } }}>
                <TrainerCard
                  trainer={trainer}
                  onEdit={openEditModal}
                  onDelete={handleDeleteTrainerClick}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>

      {/* Add/Edit Trainer Modal */}
      <TrainerModal
        isOpen={isTrainerModalOpen}
        onClose={() => setIsTrainerModalOpen(false)}
        onSave={handleSaveTrainer}
        trainer={currentTrainer}
        slug={slug?.toString() || ''}
      />

      {/* Confirmation Modal for Deletion */}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmDeleteTrainer}
        title="Confirm Deletion"
        message={`Are you sure you want to delete trainer "${trainerToDelete?.name || 'N/A'}"? This action cannot be undone.`}
        confirmText="Delete"
      />
    </div>
  );
}