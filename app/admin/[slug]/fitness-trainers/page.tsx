// app/[adminSlug]/trainers/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  BellAlertIcon, EnvelopeIcon, PhoneIcon, PlusCircleIcon, UserCircleIcon, PencilIcon, TrashIcon
} from '@heroicons/react/24/outline'; // Added PencilIcon, TrashIcon
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import ConfirmationModal from '@/components/ConfirmationModal'; // Re-use this
import TrainerModal from './TrainerModal'; // New TrainerModal component

// Define the TrainerData interface to match the API response
interface TrainerData {
  id: string;
  userId: string;
  name: string | null;
  email: string;
  phone: string | null;
  specialty: string;
  bio: string | null;
  certifications: string[];
  photoUrl: string | null;
  status: 'ACTIVE' | 'ON_LEAVE' | 'INACTIVE';
}

interface TrainersPageProps {
  params: {
    adminSlug: string;
  };
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

// Variants for individual trainer cards
const trainerCardVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  hover: {
    scale: 1.03,
    boxShadow: "0 15px 30px rgba(0, 0, 0, 0.3)",
    transition: { duration: 0.2 },
  },
};

// A reusable component for a single trainer's card
const TrainerCard = ({ trainer, onEdit, onDelete }: { trainer: TrainerData; onEdit: (trainer: TrainerData) => void; onDelete: (trainer: TrainerData) => void; }) => {
  const statusColors = {
    ACTIVE: 'bg-green-500 text-white',
    ON_LEAVE: 'bg-yellow-400 text-gray-900',
    INACTIVE: 'bg-gray-500 text-white',
  };

  return (
    <motion.div
      className="bg-gray-800 p-6 rounded-2xl shadow-xl flex flex-col items-center text-center relative border border-gray-700"
      variants={trainerCardVariants}
      whileHover="hover"
      initial="hidden"
      animate="visible"
    >
      {/* Status Badge */}
      <div
        className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold ${statusColors[trainer.status]}`}
      >
        {trainer.status.replace('_', ' ').charAt(0).toUpperCase() + trainer.status.replace('_', ' ').slice(1).toLowerCase()}
      </div>

      {/* Trainer Image or Placeholder */}
      <div className="w-28 h-28 rounded-full overflow-hidden mb-4 border-4 border-indigo-600 shadow-lg flex-shrink-0">
        {trainer.photoUrl ? (
          <Image
            src={trainer.photoUrl}
            alt={trainer.name || 'Trainer'}
            layout="fill"
            objectFit="cover"
            loader={customLoader}
            onError={(e) => {
              e.currentTarget.src = 'https://placehold.co/128x128/E0E7FF/4338CA?text=No+Photo';
            }}
          />
        ) : (
          <div className="w-full h-full bg-gray-700 flex items-center justify-center text-indigo-400 text-5xl">
            <UserCircleIcon className='w-16 h-16' />
          </div>
        )}
      </div>

      <h4 className="text-2xl font-extrabold text-white mb-1 leading-tight">{trainer.name}</h4>
      <p className="text-indigo-400 font-semibold mb-3">{trainer.specialty}</p>

      <p className="text-sm text-gray-400 mb-6 line-clamp-3 flex-grow">{trainer.bio}</p>

      {/* Contact & Details */}
      <div className="w-full text-left text-sm text-gray-400 border-t border-gray-700 pt-4 mt-auto">
        <div className="flex items-center space-x-2 mb-2">
          <EnvelopeIcon className="text-indigo-400 w-5 h-5" />
          <p>{trainer.email}</p>
        </div>
        <div className="flex items-center space-x-2 mb-2">
          <PhoneIcon className="text-indigo-400 w-5 h-5" />
          <p>{trainer.phone}</p>
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


export default function TrainersPage({ params }: TrainersPageProps) {
  const { adminSlug } = params;

  const [trainers, setTrainers] = useState<TrainerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTrainerModalOpen, setIsTrainerModalOpen] = useState(false);
  const [currentTrainer, setCurrentTrainer] = useState<TrainerData | null>(null); // For edit mode
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [trainerToDelete, setTrainerToDelete] = useState<TrainerData | null>(null);

  // Function to fetch trainers from the API
  const fetchTrainers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/${adminSlug}/trainers`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: TrainerData[] = await response.json();
      setTrainers(data);
    } catch (err: any) {
      setError(err.message);
      console.error("Failed to fetch trainers:", err);
    } finally {
      setLoading(false);
    }
  }, [adminSlug]);

  // Fetch trainers on component mount
  useEffect(() => {
    fetchTrainers();
  }, [fetchTrainers]);

  const openAddModal = () => {
    setCurrentTrainer(null); // Clear current trainer for add mode
    setIsTrainerModalOpen(true);
  };

  const openEditModal = (trainer: TrainerData) => {
    setCurrentTrainer(trainer);
    setIsTrainerModalOpen(true);
  };

  const handleSaveTrainer = (savedTrainer: TrainerData) => {
    if (currentTrainer) {
      // If editing, update the existing trainer in the list
      setTrainers(prevTrainers => prevTrainers.map(t => t.id === savedTrainer.id ? savedTrainer : t));
      alert(`Trainer ${savedTrainer.name} updated successfully.`);
    } else {
      // If adding, prepend the new trainer to the list
      setTrainers(prevTrainers => [savedTrainer, ...prevTrainers]);
      alert(`Trainer ${savedTrainer.name} added successfully.`);
    }
    setIsTrainerModalOpen(false);
  };

  const handleDeleteTrainerClick = (trainer: TrainerData) => {
    setTrainerToDelete(trainer);
    setIsConfirmModalOpen(true);
  };

  const confirmDeleteTrainer = async () => {
    if (!trainerToDelete) return;

    setIsConfirmModalOpen(false); // Close modal immediately
    setLoading(true); // Show loading state for deletion
    setError(null);

    try {
      const response = await fetch(`/api/admin/${adminSlug}/trainers/${trainerToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to delete trainer "${trainerToDelete.name}".`);
      }

      // If deletion is successful, update the local state
      setTrainers(prevTrainers => prevTrainers.filter(t => t.id !== trainerToDelete.id));
      alert(`Trainer "${trainerToDelete.name}" deleted successfully.`);
    } catch (err: any) {
      setError(err.message);
      alert(`Error deleting trainer: ${err.message}`);
    } finally {
      setLoading(false);
      setTrainerToDelete(null); // Clear trainer to delete
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-gray-900 p-8 text-white font-sans">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-5xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-600 mb-12 drop-shadow-lg"
      >
        Manage Fitness Trainers & Staff
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-gray-800 rounded-3xl shadow-2xl p-8 mb-12 border border-gray-700"
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-white">All Trainers</h2>
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
          <div className="text-center py-20">
            <svg className="animate-spin h-10 w-10 text-teal-400 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-xl text-gray-400">Loading trainers...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-900 bg-opacity-50 text-red-200 p-6 rounded-lg text-center mb-8 border border-red-700">
            <p className="font-bold text-lg">Error loading trainers:</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {!loading && !error && trainers.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-gray-400">No trainers found. Start by adding one!</p>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {trainers.map((trainer) => (
              <TrainerCard
                key={trainer.id}
                trainer={trainer}
                onEdit={openEditModal}
                onDelete={handleDeleteTrainerClick}
              />
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
        adminSlug={adminSlug}
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
