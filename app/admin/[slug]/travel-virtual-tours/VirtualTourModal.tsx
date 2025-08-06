// components/VirtualTourModal.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

// Define the VirtualTourData interface to match the expected API response
interface VirtualTourData {
  id?: string; // Optional for new tours
  title: string;
  location: string;
  duration: string;
  category: string;
  videoUrl: string;
  thumbnailUrl: string;
  description?: string; // Optional field
  published?: boolean; // Optional field
}

interface VirtualTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tour: VirtualTourData) => void;
  tour?: VirtualTourData | null; // Tour data for editing, null for adding
  adminSlug: string;
}

const customLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

const VirtualTourModal: React.FC<VirtualTourModalProps> = ({ isOpen, onClose, onSave, tour, adminSlug }) => {
  const [title, setTitle] = useState(tour?.title || '');
  const [location, setLocation] = useState(tour?.location || '');
  const [duration, setDuration] = useState(tour?.duration || '');
  const [category, setCategory] = useState(tour?.category || '');
  const [videoUrl, setVideoUrl] = useState(tour?.videoUrl || '');
  const [thumbnailUrl, setThumbnailUrl] = useState(tour?.thumbnailUrl || '');
  const [description, setDescription] = useState(tour?.description || '');
  const [published, setPublished] = useState(tour?.published || false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (tour) {
      setTitle(tour.title);
      setLocation(tour.location);
      setDuration(tour.duration);
      setCategory(tour.category);
      setVideoUrl(tour.videoUrl);
      setThumbnailUrl(tour.thumbnailUrl);
      setDescription(tour.description || '');
      setPublished(tour.published || false);
    } else {
      // Reset form for new tour
      setTitle('');
      setLocation('');
      setDuration('');
      setCategory('');
      setVideoUrl('');
      setThumbnailUrl('');
      setDescription('');
      setPublished(false);
    }
  }, [tour]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Basic client-side validation
    if (!title || !location || !duration || !category || !videoUrl || !thumbnailUrl) {
      setError('Please fill in all required fields.');
      setLoading(false);
      return;
    }

    const method = tour ? 'PUT' : 'POST';
    const url = tour ? `/api/admin/${adminSlug}/virtual-tours/${tour.id}` : `/api/admin/${adminSlug}/virtual-tours`;

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          location,
          duration,
          category,
          videoUrl,
          thumbnailUrl,
          description: description || null,
          published,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${tour ? 'update' : 'create'} virtual tour.`);
      }

      const savedTour: VirtualTourData = await response.json();
      onSave(savedTour); // Pass the saved tour data back to the parent
      onClose(); // Close the modal
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg relative text-gray-900"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <XMarkIcon className="w-7 h-7" />
          </button>
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            {tour ? 'Edit Virtual Tour' : 'Add New Virtual Tour'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">Duration (e.g., "5 min")</label>
              <input
                type="text"
                id="duration"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <input
                type="text"
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700 mb-1">Video Embed URL (e.g., YouTube embed)</label>
              <input
                type="url"
                id="videoUrl"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label htmlFor="thumbnailUrl" className="block text-sm font-medium text-gray-700 mb-1">Thumbnail Image URL</label>
              <input
                type="url"
                id="thumbnailUrl"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
              {thumbnailUrl && (
                <div className="mt-2 text-center">
                  <Image src={thumbnailUrl} alt="Preview" width={100} height={60} objectFit="contain" className="rounded-md" loader={customLoader} />
                </div>
              )}
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
              ></textarea>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="published"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="published" className="ml-2 block text-sm text-gray-900">Publish Tour</label>
            </div>

            {error && (
              <div className="bg-red-100 text-red-800 px-4 py-2 rounded-lg text-sm text-center">
                {error}
              </div>
            )}
            <div className="flex justify-end space-x-3 mt-6">
              <motion.button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={loading}
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  tour ? 'Save Changes' : 'Add Tour'
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default VirtualTourModal;
