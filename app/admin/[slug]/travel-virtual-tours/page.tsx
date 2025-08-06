// app/[adminSlug]/virtual-tours/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  PlayCircleIcon, PlusCircleIcon, PencilIcon, TrashIcon, MapPinIcon, ClockIcon, TagIcon
} from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import ConfirmationModal from '@/components/ConfirmationModal'; // Re-use this
import VirtualTourModal from './VirtualTourModal'; // New VirtualTourModal component
import VideoPlayerModal from './VideoPlayerModal'; // New VideoPlayerModal component

// Define the VirtualTourData interface to match the API response
interface VirtualTourData {
  id: string;
  title: string;
  location: string;
  duration: string;
  category: string;
  videoUrl: string;
  thumbnailUrl: string;
  description?: string;
  published?: boolean;
}

const customLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

export default function AdminVirtualToursPage() {
  const params = useParams();
  const adminSlug = params.adminSlug as string;

  const [virtualTours, setVirtualTours] = useState<VirtualTourData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTourModalOpen, setIsTourModalOpen] = useState(false);
  const [currentTour, setCurrentTour] = useState<VirtualTourData | null>(null); // For edit mode
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [tourToDelete, setTourToDelete] = useState<VirtualTourData | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [videoToPlay, setVideoToPlay] = useState<{ url: string; title: string } | null>(null);


  // Function to fetch virtual tours from the API
  const fetchVirtualTours = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/${adminSlug}/virtual-tours`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: VirtualTourData[] = await response.json();
      setVirtualTours(data);
    } catch (err: any) {
      setError(err.message);
      console.error("Failed to fetch virtual tours:", err);
    } finally {
      setLoading(false);
    }
  }, [adminSlug]);

  // Fetch virtual tours on component mount
  useEffect(() => {
    fetchVirtualTours();
  }, [fetchVirtualTours]);

  const openAddModal = () => {
    setCurrentTour(null); // Clear current tour for add mode
    setIsTourModalOpen(true);
  };

  const openEditModal = (tour: VirtualTourData) => {
    setCurrentTour(tour);
    setIsTourModalOpen(true);
  };

  const handleSaveTour = (savedTour: VirtualTourData) => {
    if (currentTour) {
      // If editing, update the existing tour in the list
      setVirtualTours(prevTours => prevTours.map(t => t.id === savedTour.id ? savedTour : t));
      alert(`Virtual Tour "${savedTour.title}" updated successfully.`);
    } else {
      // If adding, prepend the new tour to the list
      setVirtualTours(prevTours => [savedTour, ...prevTours]);
      alert(`Virtual Tour "${savedTour.title}" added successfully.`);
    }
    setIsTourModalOpen(false);
  };

  const handleDeleteTourClick = (tour: VirtualTourData) => {
    setTourToDelete(tour);
    setIsConfirmModalOpen(true);
  };

  const confirmDeleteTour = async () => {
    if (!tourToDelete) return;

    setIsConfirmModalOpen(false); // Close modal immediately
    setLoading(true); // Show loading state for deletion
    setError(null);

    try {
      const response = await fetch(`/api/admin/${adminSlug}/virtual-tours/${tourToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to delete virtual tour "${tourToDelete.title}".`);
      }

      // If deletion is successful, update the local state
      setVirtualTours(prevTours => prevTours.filter(t => t.id !== tourToDelete.id));
      alert(`Virtual Tour "${tourToDelete.title}" deleted successfully.`);
    } catch (err: any) {
      setError(err.message);
      alert(`Error deleting virtual tour: ${err.message}`);
    } finally {
      setLoading(false);
      setTourToDelete(null); // Clear tour to delete
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
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-white">All Virtual Tours</h2>
          <motion.button
            onClick={openAddModal}
            className="flex items-center space-x-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
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
          <div className="bg-red-900 bg-opacity-50 text-red-200 p-6 rounded-lg text-center mb-8 border border-red-700">
            <p className="font-bold text-lg">Error loading tours:</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {!loading && !error && virtualTours.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-gray-400">No virtual tours found. Start by adding one!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {virtualTours.map((tour) => (
              <motion.div
                key={tour.id}
                className="relative bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-700 transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                whileHover={{ y: -5 }}
              >
                <div className="relative w-full h-48 bg-gray-700 overflow-hidden">
                  <Image
                    src={tour.thumbnailUrl}
                    alt={tour.title}
                    layout="fill"
                    objectFit="cover"
                    className="transition-transform duration-300 hover:scale-110"
                    loader={customLoader}
                    onError={(e) => {
                      e.currentTarget.src = 'https://placehold.co/400x250/E0E7FF/4338CA?text=Thumbnail+Error';
                    }}
                  />
                  <motion.button
                    onClick={() => handlePlayVideo(tour)}
                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-opacity-80 hover:text-opacity-100 transition-opacity duration-300 opacity-0 hover:opacity-100"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label={`Play ${tour.title}`}
                  >
                    <PlayCircleIcon className="h-20 w-20 text-indigo-400 drop-shadow-lg" />
                  </motion.button>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2 leading-tight">{tour.title}</h3>
                  <p className="text-sm text-gray-400 line-clamp-2 mb-3">{tour.description || 'No description available.'}</p>
                  <div className="flex items-center text-sm text-gray-400 mb-2">
                    <MapPinIcon className="h-4 w-4 mr-2 text-indigo-400" />
                    <span>{tour.location}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-400 mb-2">
                    <ClockIcon className="h-4 w-4 mr-2 text-indigo-400" />
                    <span>{tour.duration}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-400 mb-4">
                    <TagIcon className="h-4 w-4 mr-2 text-indigo-400" />
                    <span>{tour.category}</span>
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
          </div>
        )}
      </motion.div>

      {/* Add/Edit Virtual Tour Modal */}
      <VirtualTourModal
        isOpen={isTourModalOpen}
        onClose={() => setIsTourModalOpen(false)}
        onSave={handleSaveTour}
        tour={currentTour}
        adminSlug={adminSlug}
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
