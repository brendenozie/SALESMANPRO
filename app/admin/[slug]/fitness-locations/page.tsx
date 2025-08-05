"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Location, getLocationsData } from '@/constant/Data';
import { CalendarDateRangeIcon, EnvelopeOpenIcon, MapIcon, PencilIcon, PhoneIcon, UserIcon } from '@heroicons/react/24/outline';


interface LocationsProps {
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

const locationCardVariants = {
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

// Reusable card component for a cleaner main file
const LocationCard = ({ location }: { location: Location }) => {
  const statusColors = {
    open: 'bg-green-600 text-white',
    closed: 'bg-red-600 text-white',
    maintenance: 'bg-yellow-400 text-gray-900',
  };

  return (
    <motion.div
      className="bg-gray-800 rounded-2xl shadow-xl overflow-hidden flex flex-col relative"
      variants={locationCardVariants}
      whileHover="hover"
    >
      {/* Location Image (if available) or a vibrant placeholder */}
      <div className="relative h-48 bg-gray-700 flex items-center justify-center text-gray-400 text-4xl">
        {location.imageUrl ? (
          <img src={location.imageUrl} alt={location.name} className="w-full h-full object-cover" />
        ) : (
          <div className="p-6 bg-gray-700 w-full h-full flex items-center justify-center">
            <MapIcon className="text-indigo-400 text-5xl w-6 h-6" />
          </div>
        )}
        <div
          className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold ${statusColors[location.status]}`}
        >
          {location.status.charAt(0).toUpperCase() + location.status.slice(1)}
        </div>
      </div>

      <div className="p-6 flex flex-col flex-grow">
        <h4 className="text-xl font-extrabold text-white mb-1 leading-tight">{location.name}</h4>
        <p className="text-sm text-gray-400 mb-4">{location.address}</p>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div className="flex items-center text-gray-400">
            <UserIcon className="mr-2 text-indigo-400 w-6 h-6" />
            <span>Capacity: {location.capacity}</span>
          </div>
          <div className="flex items-center text-gray-400">
            <CalendarDateRangeIcon className="mr-2 text-indigo-400 w-6 h-6" />
            <span>Open: {location.openHours || 'N/A'}</span>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-4 mt-auto">
          <div className="flex items-center text-sm text-gray-400 mb-2">
            <PhoneIcon className="mr-2 text-indigo-400 w-6 h-6" />
            <p>{location.phone}</p>
          </div>
          <div className="flex items-center text-sm text-gray-400 mb-4">
            <EnvelopeOpenIcon className="mr-2 text-indigo-400 w-6 h-6" />
            <p>{location.email}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-auto">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-1 py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors"
          >
            <span className="flex items-center justify-center gap-2">
              <PencilIcon className='w-6 h-6' />
              Manage
            </span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default function LocationsPage({ params }: LocationsProps) {
  const { adminSlug } = params;
  const locationsData: Location[] = getLocationsData(adminSlug);

  return (
    <div className="min-h-screen bg-gray-900 p-8 text-gray-100 font-sans">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-bold text-white">Locations & Facilities</h1>
        <motion.button
          whileHover={{ scale: 1.05, rotate: 2 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition-colors"
        >
          <PencilIcon className='w-6 h-6' />
          Add New Location
        </motion.button>
      </div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {locationsData.map((location) => (
          <LocationCard key={location.id} location={location} />
        ))}
      </motion.div>
    </div>
  );
}