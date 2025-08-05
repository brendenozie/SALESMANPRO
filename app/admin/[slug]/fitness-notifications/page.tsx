"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { getCommunicationsData, Communication } from '@/constant/Data';
import { ArrowRightCircleIcon, ClockIcon, PaperAirplaneIcon, PencilIcon, PlusCircleIcon, UserCircleIcon } from '@heroicons/react/24/outline';

interface CommunicationsProps {
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

const NewMessagePanel = () => (
  <motion.div
    className="bg-gray-800 p-8 rounded-2xl shadow-xl flex flex-col justify-between h-full"
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5, delay: 0.3 }}
  >
    <div className="flex items-center gap-4 mb-6">
      <div className="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center text-2xl">
        <PencilIcon className='w-6 h-6' />
      </div>
      <div>
        <h3 className="text-2xl font-bold text-white">Create a New Message</h3>
        <p className="text-gray-400">Send an email, SMS, or notification to members.</p>
      </div>
    </div>
    
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition-colors"
    >
      <PlusCircleIcon className='w-6 h-6' />
      Compose New Message
    </motion.button>
  </motion.div>
);

const CommunicationCard = ({ comm }: { comm: Communication }) => {
  const statusColors = {
    sent: 'bg-blue-600 text-white',
    draft: 'bg-yellow-400 text-gray-900',
    scheduled: 'bg-purple-600 text-white',
  };

  const statusIcons = {
    sent: <PaperAirplaneIcon className='w-6 h-6' />,
    draft: <PencilIcon className='w-6 h-6' />,
    scheduled: <ClockIcon className='w-6 h-6' />,
  };

  return (
    <motion.div
      className="bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-700 flex flex-col cursor-pointer"
      variants={commCardVariants}
      whileHover="hover"
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${statusColors[comm.status]}`}
          >
            {statusIcons[comm.status]}
            {comm.status.charAt(0).toUpperCase() + comm.status.slice(1)}
          </span>
          <p className="text-xs text-gray-400">
            {comm.type.charAt(0).toUpperCase() + comm.type.slice(1)}
          </p>
        </div>
        {comm.sentDate && (
          <span className="text-xs text-gray-400">{comm.sentDate}</span>
        )}
      </div>

      <h4 className="text-xl font-extrabold text-white mb-2 leading-tight">{comm.subject}</h4>
      <p className="text-sm text-gray-400 mb-4 line-clamp-2">{comm.content}</p>

      <div className="mt-auto flex justify-between items-center pt-4 border-t border-gray-700">
        <div className="flex items-center text-sm text-gray-400">
          <UserCircleIcon className="mr-2 text-indigo-400 w-6 h-6" />
          <span>{comm.recipients}</span>
        </div>
        <ArrowRightCircleIcon className="text-indigo-600 w-6 h-6" />
      </div>
    </motion.div>
  );
};

export default function CommunicationsPage({ params }: CommunicationsProps) {
  const { adminSlug } = params;
  const communicationsData: Communication[] = getCommunicationsData(adminSlug);

  return (
    <div className="min-h-screen bg-gray-900 p-8 text-gray-100 font-sans">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-bold text-white">Communications & Notifications</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <NewMessagePanel />
        </div>
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-white">Message History</h3>
          </div>
          <div className="grid grid-cols-1 gap-6">
            {communicationsData.map((comm) => (
              <CommunicationCard key={comm.id} comm={comm} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}