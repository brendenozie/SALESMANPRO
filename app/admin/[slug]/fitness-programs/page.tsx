"use client";

import React from 'react';
import { getProgramsData, Program } from '@/constant/Data';
import { motion } from 'framer-motion';
import { BellAlertIcon, CalendarDateRangeIcon, CalendarDaysIcon, PencilIcon, PlusCircleIcon, TrashIcon, UserIcon } from '@heroicons/react/24/outline';


interface ProgramsProps {
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

// Variants for individual program cards
const cardVariants = {
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
    boxShadow: "0 10px 20px rgba(0, 0, 0, 0.2)",
    transition: {
      duration: 0.2,
    },
  },
};

// Reusable card component for a cleaner main file
const ProgramCard = ({ program }: { program: Program }) => {
  const statusColors = {
    active: 'bg-green-600 text-white',
    draft: 'bg-yellow-400 text-gray-900',
    inactive: 'bg-red-600 text-white',
  };

  const typeIcon = program.type === 'class' ? <CalendarDateRangeIcon className='w-6 h-6' /> : <BellAlertIcon className='w-6 h-6' />;
  const typeColor = program.type === 'class' ? 'bg-indigo-600' : 'bg-purple-600';
  const typeLabel = program.type === 'class' ? 'Class' : 'Program';

  return (
    <motion.div
      className="relative p-6 rounded-2xl shadow-xl overflow-hidden cursor-pointer flex flex-col bg-gray-800 text-gray-200"
      variants={cardVariants}
      whileHover="hover"
      initial="hidden"
      animate="visible"
    >
      {/* Program Status Badge */}
      <div
        className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold ${statusColors[program.status]}`}
      >
        {program.status.charAt(0).toUpperCase() + program.status.slice(1)}
      </div>

      {/* Program Type Tag */}
      <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${typeColor}`}>
        {typeIcon}
        {typeLabel}
      </div>

      <div className="mt-8 flex-grow">
        <h4 className="text-xl font-extrabold text-white mb-2 leading-tight">{program.name}</h4>
        <p className="text-sm text-gray-400 line-clamp-2">{program.description}</p>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-700 flex flex-col gap-2">
        <div className="flex items-center text-sm text-gray-400">
          <UserIcon className="mr-2 text-indigo-400 w-6 h-6" />
          <span>Instructor: {program.instructor}</span>
        </div>
        <div className="flex items-center text-sm text-gray-400">
          <CalendarDaysIcon className="mr-2 text-indigo-400 w-6 h-6" />
          <span>Duration: {program.duration}</span>
        </div>
      </div>

      <div className="mt-6 flex justify-between items-center">
        <span className="text-3xl font-bold text-green-400">${program.price.toFixed(2)}</span>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-3 bg-gray-700 rounded-full text-indigo-400 hover:bg-gray-600"
            aria-label="Edit program"
          >
            <PencilIcon className='w-6 h-6' />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-3 bg-gray-700 rounded-full text-red-400 hover:bg-gray-600"
            aria-label="Delete program"
          >
            <TrashIcon className='w-6 h-6' />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default function ProgramsPage({ params }: ProgramsProps) {
  const { adminSlug } = params;
  const programsData: Program[] = getProgramsData(adminSlug);

  return (
    <div className="min-h-screen bg-gray-900 p-8 text-gray-100 font-sans">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-bold text-white">Programs & Classes</h1>
        <motion.button
          whileHover={{ scale: 1.05, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition-colors"
        >
          <PlusCircleIcon className='w-6 h-6' />
          Add New Program
        </motion.button>
      </div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {programsData.map((program) => (
          <ProgramCard key={program.id} program={program} />
        ))}
      </motion.div>
    </div>
  );
}