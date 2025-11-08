"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  PlayCircleIcon, PlusCircleIcon, PencilIcon, TrashIcon, MapPinIcon, ClockIcon, TagIcon
} from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import ConfirmationModal from '@/components/ConfirmationModal';
import VirtualTourModal, { VirtualTourData } from './VirtualTourModal';
import VideoPlayerModal from './VideoPlayerModal';
import toast from 'react-hot-toast';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';;//process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';

// Define the VirtualTourData interface to match the API response
// interface VirtualTourData {
//   id: string;
//   title: string;
//   location: string;
//   duration: string;
//   category: string;
//   videoUrl: string;
//   thumbnailUrl: string;
//   description?: string;
//   published?: boolean;
// }

const customLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

// Framer Motion variants for staggered list animation
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function AdminVirtualToursPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [virtualTours, setVirtualTours] = useState<VirtualTourData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTourModalOpen, setIsTourModalOpen] = useState(false);
  const [currentTour, setCurrentTour] = useState<VirtualTourData | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [tourToDelete, setTourToDelete] = useState<VirtualTourData | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [videoToPlay, setVideoToPlay] = useState<{ url: string; title: string } | null>(null);

  // Function to fetch virtual tours from the API
  const fetchVirtualTours = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiBaseUrl}/admin/virtual-tours?companyId=${slug}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Credentials': 'include' },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: VirtualTourData[] = ( await response.json()).data;
      setVirtualTours(data);
    } catch (err: any) {
      setError(err.message);
      toast.error(`Failed to fetch virtual tours: ${err.message}`);
      console.error("Failed to fetch virtual tours:", err);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchVirtualTours();
  }, [fetchVirtualTours]);

  const openAddModal = () => {
    setCurrentTour(null);
    setIsTourModalOpen(true);
  };

  const openEditModal = (tour: VirtualTourData) => {
    setCurrentTour(tour);
    setIsTourModalOpen(true);
  };

  const handleSaveTour = (savedTour: VirtualTourData) => {
    if (currentTour) {
      setVirtualTours(prevTours => prevTours.map(t => t.id === savedTour.id ? savedTour : t));
      toast.success(`Virtual Tour "${savedTour.title}" updated successfully.`);
    } else {
      setVirtualTours(prevTours => [savedTour, ...prevTours]);
      toast.success(`Virtual Tour "${savedTour.title}" added successfully.`);
    }
    setIsTourModalOpen(false);
  };

  const handleDeleteTourClick = (tour: VirtualTourData) => {
    setTourToDelete(tour);
    setIsConfirmModalOpen(true);
  };

  const confirmDeleteTour = async () => {
    if (!tourToDelete) return;

    setIsConfirmModalOpen(false);
    const toastId = toast.loading(`Deleting tour "${tourToDelete.title}"...`);
    
    try {
      const response = await fetch(`${apiBaseUrl}/admin/virtual-tours/${tourToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'Credentials': 'include' },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to delete virtual tour "${tourToDelete.title}".`);
      }

      setVirtualTours(prevTours => prevTours.filter(t => t.id !== tourToDelete.id));
      toast.success(`Virtual Tour "${tourToDelete.title}" deleted successfully.`, { id: toastId });
    } catch (err: any) {
      setError(err.message);
      toast.error(`Error deleting virtual tour: ${err.message}`, { id: toastId });
    } finally {
      setTourToDelete(null);
    }
  };

  const handlePlayVideo = (tour: VirtualTourData) => {
    setVideoToPlay({ url: tour.videoUrl, title: tour.title });
    setIsVideoModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-8 text-white font-sans">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-5xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-600 mb-12 drop-shadow-lg"
      >
        Manage Immersive Virtual Tours
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-gray-800 rounded-3xl shadow-2xl p-8 mb-12 border border-gray-700"
      >
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-4 md:mb-0">All Virtual Tours</h2>
          <motion.button
            onClick={openAddModal}
            className="flex items-center space-x-2 bg-gradient-to-r from-teal-500 to-indigo-600 text-white font-semibold py-3 px-6 rounded-full shadow-lg hover:from-teal-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <PlusCircleIcon className="h-6 w-6" />
            <span>Add New Tour</span>
          </motion.button>
        </div>

        {loading && (
          <div className="text-center py-20">
            <svg className="animate-spin h-10 w-10 text-indigo-400 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-xl text-gray-400">Loading virtual tours...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-900 bg-opacity-30 text-red-200 p-6 rounded-xl text-center mb-8 border border-red-700">
            <p className="font-bold text-lg">Error loading tours:</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        <AnimatePresence>
          {!loading && !error && virtualTours.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-20"
            >
              <p className="text-xl text-gray-400">No virtual tours found. Start by adding one!</p>
            </motion.div>
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              {virtualTours.map((tour) => (
                <motion.div
                  key={tour.id}
                  variants={itemVariants}
                  className="relative bg-gray-900 rounded-3xl shadow-xl overflow-hidden border border-gray-700 transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl"
                  whileHover={{ y: -5 }}
                >
                  <div className="relative w-full h-56 bg-gray-700 overflow-hidden group">
                    <Image
                      src={tour.thumbnailUrl}
                      alt={tour.title}
                      layout="fill"
                      objectFit="cover"
                      className="transition-transform duration-300 group-hover:scale-110"
                      loader={customLoader}
                      onError={(e) => {
                        e.currentTarget.src = 'https://placehold.co/400x250/E0E7FF/4338CA?text=Thumbnail+Error';
                      }}
                    />
                    <motion.button
                      onClick={() => handlePlayVideo(tour)}
                      className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 text-white text-opacity-80 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      aria-label={`Play ${tour.title}`}
                    >
                      <PlayCircleIcon className="h-20 w-20 text-indigo-400 drop-shadow-lg" />
                    </motion.button>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-1 leading-tight">{tour.title}</h3>
                    <p className="text-sm text-gray-400 line-clamp-2 mb-3">{tour.description || 'No description available.'}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-4">
                      <div className="flex items-center">
                        <MapPinIcon className="h-4 w-4 mr-2 text-sky-400" />
                        <span>{tour.location}</span>
                      </div>
                      <div className="flex items-center">
                        <ClockIcon className="h-4 w-4 mr-2 text-yellow-400" />
                        <span>{tour.duration}</span>
                      </div>
                      <div className="flex items-center">
                        <TagIcon className="h-4 w-4 mr-2 text-purple-400" />
                        <span>{tour.category}</span>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-3 mt-4">
                      <motion.button
                        onClick={() => openEditModal(tour)}
                        className="p-2 rounded-full bg-gray-700 text-indigo-400 hover:bg-indigo-600 hover:text-white transition-colors"
                        title="Edit Tour"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <PencilIcon className="h-5 w-5" />
                      </motion.button>
                      <motion.button
                        onClick={() => handleDeleteTourClick(tour)}
                        className="p-2 rounded-full bg-gray-700 text-red-400 hover:bg-red-600 hover:text-white transition-colors"
                        title="Delete Tour"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <TrashIcon className="h-5 w-5" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Add/Edit Virtual Tour Modal */}
      <VirtualTourModal
        isOpen={isTourModalOpen}
        onClose={() => setIsTourModalOpen(false)}
        onSave={handleSaveTour}
        tour={currentTour}
        slug={slug}
      />

      {/* Confirmation Modal for Deletion */}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmDeleteTour}
        title="Confirm Deletion"
        message={`Are you sure you want to delete virtual tour "${tourToDelete?.title || 'N/A'}"? This action cannot be undone.`}
        confirmText="Delete"
      />

      {/* Video Player Modal */}
      <VideoPlayerModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        videoUrl={videoToPlay?.url || ''}
        title={videoToPlay?.title || ''}
      />
    </div>
  );
}