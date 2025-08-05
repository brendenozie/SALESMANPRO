"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Client, getClientsData } from '@/constant/Data';
import {
  BellAlertIcon,
  EnvelopeIcon,
  PhoneIcon,
  PlusCircleIcon,
  UserCircleIcon,
  CalendarDaysIcon,
  ArrowRightCircleIcon
} from '@heroicons/react/24/outline';

interface ClientsProps {
  params: {
    adminSlug: string;
  };
}

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
const ClientCard = ({ client }: { client: Client }) => {
  const statusColors = {
    active: 'bg-green-600 text-white',
    expired: 'bg-red-600 text-white',
    frozen: 'bg-yellow-400 text-gray-900',
  };

  return (
    <motion.div
      className="bg-gray-800 p-6 rounded-2xl shadow-xl flex flex-col relative"
      variants={clientCardVariants}
      whileHover="hover"
    >
      {/* Client Profile and Status */}
      <div className="flex items-center gap-4 mb-4">
        {/* User Image Placeholder */}
        <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 bg-gray-700 flex items-center justify-center text-indigo-400 text-3xl">
          <UserCircleIcon className="w-full h-full" />
        </div>
        <div className="flex-grow">
          <h4 className="text-xl font-bold text-white leading-tight">{client.name}</h4>
          <p className="text-sm text-gray-400">{client.email}</p>
        </div>
        <div
          className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[client.membershipStatus]}`}
        >
          {client.membershipStatus.charAt(0).toUpperCase() + client.membershipStatus.slice(1)}
        </div>
      </div>

      {/* Membership Details */}
      <div className="border-t border-gray-700 pt-4 mt-auto">
        <p className="text-sm font-semibold text-gray-400 mb-2">Membership: <span className="text-white ml-2">{client.membershipType}</span></p>
        <div className="flex items-center text-sm text-gray-400 mb-2">
          <CalendarDaysIcon className="w-4 h-4 mr-2 text-indigo-400" />
          <p>Joined: {client.joinDate}</p>
        </div>
        <div className="flex items-center text-sm text-gray-400">
          <ArrowRightCircleIcon className="w-4 h-4 mr-2 text-indigo-400" />
          <p>Last Active: {client.lastActive}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mt-6 pt-4 border-t border-gray-700">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex-1 py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors"
        >
          View Profile
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex-1 py-3 bg-gray-700 text-gray-300 rounded-lg font-bold hover:bg-gray-600 transition-colors"
        >
          Send Message
        </motion.button>
      </div>
    </motion.div>
  );
};

export default function ClientsPage({ params }: ClientsProps) {
  const { adminSlug } = params;
  const clientsData: Client[] = getClientsData(adminSlug);

  return (
    <div className="min-h-screen bg-gray-900 p-8 text-gray-100 font-sans">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-bold text-white">All Members</h1>
        <motion.button
          whileHover={{ scale: 1.05, rotate: 2 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition-colors"
        >
          <PlusCircleIcon className="h-5 w-5" />
          Add New Member
        </motion.button>
      </div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {clientsData.map((client) => (
          <ClientCard key={client.id} client={client} />
        ))}
      </motion.div>
    </div>
  );
}