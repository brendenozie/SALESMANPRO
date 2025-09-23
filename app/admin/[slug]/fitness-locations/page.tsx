"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  MapIcon, PlusCircleIcon, PencilIcon, TrashIcon, PhoneIcon, EnvelopeIcon, UsersIcon, CalendarDaysIcon, GlobeAltIcon, ExclamationCircleIcon
} from '@heroicons/react/24/solid'; // Updated to solid icons
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import ConfirmationModal from '@/components/ConfirmationModal';
import LocationModal, { LocationData } from './LocationModal';
import toast from 'react-hot-toast';

// Define the LocationData interface to match the API response
// interface LocationData {
//   id: string;
//   name: string;
//   slug: string;
//   address: string;
//   city: string;
//   state: string | null;
//   zipCode: string | null;
//   country: string;
//   description: string | null;
//   imageUrl: string | null;
//   phone: string | null;
//   email: string | null;
//   capacity: number | null;
//   openHours: string | null;
//   status: 'OPEN' | 'CLOSED' | 'MAINTENANCE';
// }

interface LocationsPageProps {
  params: {
    slug: string;
  };
}

const customLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

const containerVariants = {
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const locationCardVariants = {
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

// Reusable card component for a cleaner main file
const LocationCard = ({ location, onEdit, onDelete }: { location: LocationData; onEdit: (location: LocationData) => void; onDelete: (location: LocationData) => void; }) => {
  const statusColors = {
    OPEN: 'bg-green-600/30 text-green-300 border-green-600',
    CLOSED: 'bg-red-600/30 text-red-300 border-red-600',
    MAINTENANCE: 'bg-yellow-400/30 text-yellow-300 border-yellow-400',
  };

  return (
    <motion.div
      className="bg-gray-800/60 backdrop-blur-md rounded-3xl shadow-xl overflow-hidden flex flex-col relative border border-gray-700 transition-all duration-300"
      variants={locationCardVariants}
      whileHover="hover"
      initial="hidden"
      animate="visible"
    >
      {/* Location Image (if available) or a vibrant placeholder */}
      <div className="relative h-48 bg-gray-700 flex items-center justify-center text-gray-400 text-4xl">
        {location.imageUrl ? (
          <Image
            src={location.imageUrl}
            alt={location.name}
            layout="fill"
            objectFit="cover"
            className="transition-transform duration-300 hover:scale-110"
            loader={customLoader}
            onError={(e) => {
              e.currentTarget.src = 'https://placehold.co/600x400/1F2937/9CA3AF?text=Image+Not+Found';
            }}
          />
        ) : (
          <div className="p-6 bg-gray-700 w-full h-full flex items-center justify-center">
            <GlobeAltIcon className="text-indigo-400 w-16 h-16" />
          </div>
        )}
        <div
          className={`absolute top-4 left-4 px-4 py-2 rounded-full text-xs font-bold border ${statusColors[location.status]}`}
        >
          {location.status.charAt(0).toUpperCase() + location.status.slice(1).toLowerCase()}
        </div>
      </div>

      <div className="p-6 flex flex-col flex-grow">
        <h4 className="text-2xl font-extrabold text-white mb-1 leading-tight">{location.name}</h4>
        <p className="text-sm text-gray-400 mb-4">{location.address}, {location.city}, {location.country}</p>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4 text-sm mb-4 border-t border-gray-700 pt-4">
          <div className="flex items-center text-gray-400">
            <UsersIcon className="mr-2 text-indigo-400 w-5 h-5" />
            <span className='font-semibold'>Capacity: <span className='font-normal text-white'>{location.capacity || 'N/A'}</span></span>
          </div>
          <div className="flex items-center text-gray-400">
            <CalendarDaysIcon className="mr-2 text-indigo-400 w-5 h-5" />
            <span className='font-semibold'>Open: <span className='font-normal text-white'>{location.openHours || 'N/A'}</span></span>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-4 mt-auto space-y-3">
          <div className="flex items-center text-sm text-gray-400">
            <PhoneIcon className="mr-2 text-indigo-400 w-5 h-5" />
            <p className='font-normal text-white'>{location.phone || 'N/A'}</p>
          </div>
          <div className="flex items-center text-sm text-gray-400">
            <EnvelopeIcon className="mr-2 text-indigo-400 w-5 h-5" />
            <p className='font-normal text-white'>{location.email || 'N/A'}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-6 pt-6 border-t border-gray-700">
          <motion.button
            onClick={() => onEdit(location)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
          >
            <PencilIcon className='w-5 h-5' />
            Edit
          </motion.button>
          <motion.button
            onClick={() => onDelete(location)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
          >
            <TrashIcon className='w-5 h-5' />
            Delete
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

// Skeleton Loader Component
const LocationCardSkeleton = () => (
  <div className="bg-gray-800/60 p-0 rounded-3xl shadow-xl flex flex-col relative border border-gray-700 animate-pulse h-[550px]">
    <div className="relative h-48 bg-gray-700 rounded-t-3xl"></div>
    <div className="p-6 flex flex-col flex-grow">
      <div className="h-8 bg-gray-700 rounded-lg w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-700 rounded-lg w-full mb-4"></div>
      <div className="grid grid-cols-2 gap-4 text-sm mb-4 border-t border-gray-700 pt-4">
        <div className="h-6 bg-gray-700 rounded-lg"></div>
        <div className="h-6 bg-gray-700 rounded-lg"></div>
      </div>
      <div className="border-t border-gray-700 pt-4 mt-auto space-y-3">
        <div className="h-5 bg-gray-700 rounded-lg w-full"></div>
        <div className="h-5 bg-gray-700 rounded-lg w-2/3"></div>
      </div>
      <div className="flex gap-4 mt-6 pt-6 border-t border-gray-700">
        <div className="h-12 bg-gray-700 rounded-xl flex-1"></div>
        <div className="h-12 bg-gray-700 rounded-xl flex-1"></div>
      </div>
    </div>
  </div>
);

export default function LocationsPage({ params }: LocationsPageProps) {
  const { slug } = params;

  const [locations, setLocations] = useState<LocationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null); // For edit mode
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState<LocationData | null>(null);

  // Function to fetch locations from the API
  const fetchLocations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/locationsv2?companyId=${slug}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const responser = await response.json();
      
      const data: LocationData[] = responser.data;

      setLocations(data);
    } catch (err: any) {
      setError(err.message);
      console.error("Failed to fetch locations:", err);
      toast.error(`Failed to fetch locations: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  // Fetch locations on component mount
  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  const openAddModal = () => {
    setCurrentLocation(null); // Clear current location for add mode
    setIsLocationModalOpen(true);
  };

  const openEditModal = (location: LocationData) => {
    setCurrentLocation(location);
    setIsLocationModalOpen(true);
  };

  const handleSaveLocation = (savedLocation: LocationData) => {
    if (currentLocation) {
      // If editing, update the existing location in the list
      setLocations(prevLocations => prevLocations.map(loc => loc.id === savedLocation.id ? savedLocation : loc));
      toast.success(`Location "${savedLocation.name}" updated successfully.`);
    } else {
      // If adding, prepend the new location to the list
      setLocations(prevLocations => [savedLocation, ...prevLocations]);
      toast.success(`Location "${savedLocation.name}" added successfully.`);
    }
    setIsLocationModalOpen(false);
  };

  const handleDeleteLocationClick = (location: LocationData) => {
    setLocationToDelete(location);
    setIsConfirmModalOpen(true);
  };

  const confirmDeleteLocation = async () => {
    if (!locationToDelete) return;

    setIsConfirmModalOpen(false); // Close modal immediately
    const toastId = toast.loading(`Deleting location "${locationToDelete.name}"...`);
    setLoading(true); // Show loading state for deletion

    try {
      const response = await fetch(`/api/admin/locationsv2/${locationToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to delete location "${locationToDelete.name}".`);
      }

      // If deletion is successful, update the local state
      setLocations(prevLocations => prevLocations.filter(loc => loc.id !== locationToDelete.id));
      toast.success(`Location "${locationToDelete.name}" deleted successfully.`, { id: toastId });
    } catch (err: any) {
      setError(err.message);
      toast.error(`Error deleting location: ${err.message}`, { id: toastId });
    } finally {
      setLoading(false);
      setLocationToDelete(null); // Clear location to delete
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900 p-8 text-white font-sans">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-5xl md:text-6xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-6 drop-shadow-lg"
      >
        Manage Facilities
      </motion.h1>

      <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
        Oversee and manage all your gym locations, from contact details to operational status and capacity.
      </p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-gray-800/50 backdrop-blur-md rounded-3xl shadow-2xl p-8 mb-12 border border-gray-700"
      >
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-4 md:mb-0">All Locations</h2>
          <motion.button
            onClick={openAddModal}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <PlusCircleIcon className="h-6 w-6" />
            <span>Add New Location</span>
          </motion.button>
        </div>

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <LocationCardSkeleton key={i} />
            ))}
          </div>
        )}

        {error && (
          <div className="bg-red-900/50 text-red-300 p-6 rounded-lg text-center mb-8 border border-red-700">
            <p className="font-bold text-lg">Error loading locations:</p>
            <p className="text-sm">{error}</p>
            <p className="mt-2 text-xs">Please try refreshing the page or contact support.</p>
          </div>
        )}

        {!loading && !error && locations.length === 0 ? (
          <div className="text-center py-20 bg-gray-700/30 rounded-2xl border border-gray-600">
            <p className="text-xl text-gray-400">No locations found. Start by adding one! 🗺️</p>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {locations.map((location) => (
              <LocationCard
                key={location.id}
                location={location}
                onEdit={openEditModal}
                onDelete={handleDeleteLocationClick}
              />
            ))}
          </motion.div>
        )}
      </motion.div>

      {/* Add/Edit Location Modal */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onSave={handleSaveLocation}
        location={currentLocation}
        slug={slug}
      />

      {/* Confirmation Modal for Deletion */}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmDeleteLocation}
        title="Confirm Deletion"
        message={`Are you sure you want to delete location "${locationToDelete?.name || 'N/A'}"? This action cannot be undone.`}
        confirmText="Delete"
      />
    </div>
  );
}