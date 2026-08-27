"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  PlayIcon, 
  PlusIcon, 
  PencilSquareIcon, 
  TrashIcon, 
  MapPinIcon, 
  ClockIcon, 
  TagIcon 
} from '@heroicons/react/24/outline';

import ConfirmationModal from '@/components/ConfirmationModal';
import VirtualTourModal, { VirtualTourData } from './VirtualTourModal';
import VideoPlayerModal from './VideoPlayerModal';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';

const customLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

// Framer Motion micro-interactions
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 15 }
  },
};

interface VirtualToursClientProps {
  companyId: string;
  slug: string;
}

export default function VirtualToursClient({ companyId, slug }: VirtualToursClientProps) {
  const [virtualTours, setVirtualTours] = useState<VirtualTourData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTourModalOpen, setIsTourModalOpen] = useState(false);
  const [currentTour, setCurrentTour] = useState<VirtualTourData | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [tourToDelete, setTourToDelete] = useState<VirtualTourData | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [videoToPlay, setVideoToPlay] = useState<{ url: string; title: string } | null>(null);

  const fetchVirtualTours = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiBaseUrl}/admin/virtual-tours?companyId=${companyId}`, { 
        credentials: 'include' 
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: VirtualTourData[] = (await response.json()).data || [];
      setVirtualTours(data);
    } catch (err: any) {
      setError(err.message);
      toast.error(`Failed to fetch virtual tours: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

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
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = (await response.json()).data || {};
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 px-4 py-8 sm:px-6 lg:px-8 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-500 dark:from-indigo-400 dark:to-purple-400">
              Virtual Tours Portal
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Create, update, and manage your immersive interactive experiences.
            </p>
          </div>

          <motion.button
            onClick={openAddModal}
            className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-medium py-2.5 px-5 rounded-xl shadow-md shadow-indigo-200 dark:shadow-none transition-all duration-200"
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
          >
            <PlusIcon className="h-5 w-5 stroke-[2.5]" />
            <span>Add New Tour</span>
          </motion.button>
        </header>

        {/* Global Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="relative w-12 h-12">
              <div className="absolute w-full h-full rounded-full border-[3px] border-slate-200 dark:border-slate-800"></div>
              <div className="absolute w-full h-full rounded-full border-[3px] border-indigo-600 dark:border-indigo-400 border-t-transparent animate-spin"></div>
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 animate-pulse">Retrieving digital experiences...</p>
          </div>
        )}

        {/* Error Boundary Display */}
        {error && (
          <div className="bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300 p-5 rounded-2xl text-center mb-8 border border-rose-100 dark:border-rose-900/50 max-w-2xl mx-auto backdrop-blur-sm">
            <p className="font-semibold text-base mb-1">Unable to update configuration</p>
            <p className="text-xs opacity-90 font-mono">{error}</p>
          </div>
        )}

        {/* Main Workspace Display */}
        <AnimatePresence mode="wait">
          {!loading && !error && (
            virtualTours.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center justify-center text-center py-24 px-6 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm"
              >
                <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-4 text-slate-400">
                  <MapPinIcon className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">No active environments discovered</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                  Get started by provisioning your initial immersive staging layer using the creation tool above.
                </p>
              </motion.div>
            ) : (
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8"
                variants={containerVariants}
                initial="hidden"
                animate="show"
              >
                {virtualTours.map((tour) => (
                  <motion.div
                    key={tour.id}
                    variants={itemVariants}
                    className="group relative flex flex-col justify-between bg-white dark:bg-slate-800/60 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-700/50 overflow-hidden hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300"
                  >
                    {/* Media Node */}
                    <div className="relative w-full aspect-video sm:aspect-[4/3] md:aspect-video bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <Image
                        src={tour.thumbnailUrl}
                        alt={tour.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        loader={customLoader}
                        unoptimized
                        onError={(e) => {
                          e.currentTarget.src = 'https://placehold.co/600x400/E2E8F0/475569?text=Frame+Rendering+Unavailable';
                        }}
                      />
                      {/* Play Action Layer Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-950/40 backdrop-blur-[2px] transition-opacity duration-300 opacity-0 group-hover:opacity-100">
                        <motion.button
                          onClick={() => handlePlayVideo(tour)}
                          className="p-4 rounded-full bg-white/90 text-slate-900 shadow-xl hover:bg-white transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          aria-label={`Preview ${tour.title}`}
                        >
                          <PlayIcon className="h-6 w-6 fill-current stroke-none pl-0.5" />
                        </motion.button>
                      </div>
                    </div>

                    {/* Metadata Content Block */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {tour.title}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 h-8">
                          {tour.description || 'No descriptive summary specified for this tracking layout.'}
                        </p>

                        {/* Inline Tag Chips */}
                        <div className="mt-4 space-y-2">
                          <div className="flex items-center text-xs font-medium text-slate-600 dark:text-slate-400">
                            <MapPinIcon className="h-3.5 w-3.5 mr-2 text-indigo-500/80 shrink-0" />
                            <span className="truncate">{tour.location}</span>
                          </div>
                          
                          <div className="flex items-center justify-between gap-2 pt-1">
                            <div className="flex items-center text-xs font-medium text-slate-600 dark:text-slate-400">
                              <ClockIcon className="h-3.5 w-3.5 mr-2 text-amber-500/80 shrink-0" />
                              <span>{tour.duration}</span>
                            </div>
                            <div className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                              <TagIcon className="h-3 w-3 mr-1 text-violet-500/80" />
                              <span className="truncate max-w-[70px]">{tour.category}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Explicit Administrative Mutation Hooks */}
                      <div className="flex justify-end gap-2 mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                        <button
                          onClick={() => openEditModal(tour)}
                          className="inline-flex items-center justify-center p-2 rounded-lg bg-slate-50 hover:bg-indigo-50 dark:bg-slate-800/40 dark:hover:bg-indigo-950/40 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors border border-slate-200/40 dark:border-transparent"
                          title="Modify Content Node"
                        >
                          <PencilSquareIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTourClick(tour)}
                          className="inline-flex items-center justify-center p-2 rounded-lg bg-slate-50 hover:bg-rose-50 dark:bg-slate-800/40 dark:hover:bg-rose-950/40 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 transition-colors border border-slate-200/40 dark:border-transparent"
                          title="Purge Active Environment"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )
          )}
        </AnimatePresence>
      </div>

      {/* Global Interface Overlays */}
      <VirtualTourModal
        isOpen={isTourModalOpen}
        onClose={() => setIsTourModalOpen(false)}
        onSave={handleSaveTour}
        tour={currentTour}
        slug={slug}
      />

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmDeleteTour}
        title="Confirm Deletion"
        message={`Are you sure you want to delete virtual tour "${tourToDelete?.title || 'N/A'}"? This action cannot be undone.`}
        confirmText="Delete"
      />

      <VideoPlayerModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        videoUrl={videoToPlay?.url || ''}
        title={videoToPlay?.title || ''}
      />
    </div>
  );
}