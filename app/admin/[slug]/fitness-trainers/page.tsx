"use client";

import React from 'react';
import { getTrainersData, Trainer } from '@/constant/Data';
import { motion } from 'framer-motion';
import { BellAlertIcon, EnvelopeIcon, PhoneIcon, PlusCircleIcon, UserCircleIcon } from '@heroicons/react/24/outline';

interface TrainersProps {
  params: {
    adminSlug: string;
  };
}

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
const TrainerCard = ({ trainer }: { trainer: Trainer }) => {
  const statusColors = {
    active: 'bg-green-500 text-white',
    onleave: 'bg-yellow-400 text-gray-900',
    inactive: 'bg-gray-500 text-white',
  };

  return (
    <motion.div
      className="bg-gray-800 p-6 rounded-2xl shadow-xl flex flex-col items-center text-center relative"
      variants={trainerCardVariants}
      whileHover="hover"
    >
      {/* Status Badge */}
      <div
        className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold ${statusColors[trainer.status]}`}
      >
        {trainer.status.charAt(0).toUpperCase() + trainer.status.slice(1)}
      </div>

      {/* Trainer Image or Placeholder */}
      <div className="w-28 h-28 rounded-full overflow-hidden mb-4 border-4 border-indigo-600 shadow-lg">
        {trainer.photoUrl ? (
          <img src={trainer.photoUrl} alt={trainer.name} className="object-cover w-full h-full" />
        ) : (
          <div className="w-full h-full bg-gray-700 flex items-center justify-center text-indigo-400 text-5xl">
            <UserCircleIcon className='w-6 h-6' />
          </div>
        )}
      </div>

      <h4 className="text-2xl font-extrabold text-white mb-1 leading-tight">{trainer.name}</h4>
      <p className="text-indigo-400 font-semibold mb-3">{trainer.specialty}</p>
      
      <p className="text-sm text-gray-400 mb-6 line-clamp-3 flex-grow">{trainer.bio}</p>

      {/* Contact & Details */}
      <div className="w-full text-left text-sm text-gray-400 border-t border-gray-700 pt-4 mt-auto">
        <div className="flex items-center space-x-2 mb-2">
          <EnvelopeIcon className="text-indigo-400 w-6 h-6" />
          <p>{trainer.email}</p>
        </div>
        <div className="flex items-center space-x-2 mb-2">
          <PhoneIcon className="text-indigo-400 w-6 h-6" />
          <p>{trainer.phone}</p>
        </div>
        <div className="flex items-start space-x-2">
          <BellAlertIcon className="text-indigo-400 mt-1 w-6 h-6" />
          <p className="flex-1">
            <span className="font-semibold text-gray-300">Certifications:</span> {trainer.certifications.join(', ')}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex w-full justify-center gap-4 mt-6">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-md hover:bg-indigo-700"
        >
          Edit Profile
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="flex-1 py-3 bg-gray-700 text-gray-300 rounded-xl font-bold shadow-md hover:bg-gray-600"
        >
          View Details
        </motion.button>
      </div>
    </motion.div>
  );
};

export default function TrainersPage({ params }: TrainersProps) {
  const { adminSlug } = params;
  const trainersData: Trainer[] = getTrainersData(adminSlug);

  return (
    <div className="min-h-screen bg-gray-900 p-8 text-gray-100 font-sans">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-bold text-white">Trainers & Staff</h1>
        <motion.button
          whileHover={{ scale: 1.05, rotate: 2 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition-colors"
        >
          <PlusCircleIcon className='w-6 h-6' />
          Add New Trainer
        </motion.button>
      </div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {trainersData.map((trainer) => (
          <TrainerCard key={trainer.id} trainer={trainer} />
        ))}
      </motion.div>
    </div>
  );
}