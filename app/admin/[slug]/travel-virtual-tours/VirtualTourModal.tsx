"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';
import toast from 'react-hot-toast';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';;//process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';

// Define the VirtualTourData interface to match the expected API response
export interface VirtualTourData {
  id?: string;
  title: string;
  location: string;
  duration: string;
  category: string;
  videoUrl: string;
  thumbnailUrl: string;
  description?: string;
  published?: boolean;
}

interface VirtualTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tour: VirtualTourData) => void;
  tour?: VirtualTourData | null;
  slug: string;
}

const customLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

const VirtualTourModal: React.FC<VirtualTourModalProps> = ({ isOpen, onClose, onSave, tour, slug }) => {
  const [title, setTitle] = useState(tour?.title || '');
  const [location, setLocation] = useState(tour?.location || '');
  const [duration, setDuration] = useState(tour?.duration || '');
  const [category, setCategory] = useState(tour?.category || '');
  const [videoUrl, setVideoUrl] = useState(tour?.videoUrl || '');
  const [thumbnailUrl, setThumbnailUrl] = useState(tour?.thumbnailUrl || '');
  const [description, setDescription] = useState(tour?.description || '');
  const [published, setPublished] = useState(tour?.published || false);

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

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
    setFormError(null);
  }, [tour, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFormError(null);

    // Basic client-side validation
    if (!title || !location || !duration || !category || !videoUrl || !thumbnailUrl) {
      setFormError('Please fill in all required fields.');
      setLoading(false);
      return;
    }

    const method = tour ? 'PUT' : 'POST';
    const url = tour ? `${apiBaseUrl}/admin/virtual-tours/${tour.id}` : `${apiBaseUrl}/admin/virtual-tours?companyId=${slug}`;

    const toastId = toast.loading(`${tour ? 'Updating' : 'Adding'} tour...`);

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Credentials': 'include'
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
      onSave(savedTour);
      onClose();
      toast.success(`Virtual tour "${savedTour.title}" saved successfully!`, { id: toastId });
    } catch (err: any) {
      setFormError(err.message);
      toast.error(`Error: ${err.message}`, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 backdrop-blur-sm bg-black bg-opacity-70 flex items-center justify-center z-[1000] p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-gray-800 text-white rounded-3xl shadow-2xl  max-h-[90vh] overflow-y-auto p-8 w-full max-w-xl relative border border-gray-700"
          initial={{ scale: 0.9, y: -50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 50 }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
          onClick={(e:any) => e.stopPropagation()} // Prevent closing when clicking inside modal
        >
          <motion.button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            aria-label="Close modal"
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
          >
            <XMarkIcon className="w-8 h-8" />
          </motion.button>

          <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-600 mb-8 text-center drop-shadow-md">
            {tour ? 'Edit Virtual Tour' : 'Add New Virtual Tour'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">Title</label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-gray-700 text-white border border-gray-600 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500 transition-colors"
                  placeholder="e.g., 'Historical District Tour'"
                  required
                />
              </div>
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-300 mb-1">Location</label>
                <input
                  type="text"
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-gray-700 text-white border border-gray-600 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500 transition-colors"
                  placeholder="e.g., 'Downtown, San Francisco'"
                  required
                />
              </div>
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-300 mb-1">Duration (e.g., "5 min")</label>
                <input
                  type="text"
                  id="duration"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-gray-700 text-white border border-gray-600 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500 transition-colors"
                  placeholder="e.g., '10 min'"
                  required
                />
              </div>
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-1">Category</label>
                <input
                  type="text"
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-gray-700 text-white border border-gray-600 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500 transition-colors"
                  placeholder="e.g., 'Urban Exploration'"
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-300 mb-1">Video Embed URL (e.g., YouTube embed)</label>
                <input
                  type="url"
                  id="videoUrl"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-gray-700 text-white border border-gray-600 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500 transition-colors"
                  placeholder="https://www.youtube.com/embed/dQw4w9WgXcQ"
                  required
                />
              </div>
              <div>
                <label htmlFor="thumbnailUrl" className="block text-sm font-medium text-gray-300 mb-1">Thumbnail Image URL</label>
                <input
                  type="url"
                  id="thumbnailUrl"
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-gray-700 text-white border border-gray-600 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500 transition-colors"
                  placeholder="https://example.com/tour_thumbnail.jpg"
                  required
                />
                {thumbnailUrl && (
                  <div className="mt-4 flex flex-col items-center">
                    <p className="text-sm text-gray-400 mb-2">Thumbnail Preview:</p>
                    <div className="relative w-full max-w-[300px] h-40 rounded-xl overflow-hidden shadow-lg border border-gray-600">
                      <Image
                        src={thumbnailUrl}
                        alt="Preview"
                        layout="fill"
                        objectFit="cover"
                        className="transition-transform duration-300 hover:scale-105"
                        loader={customLoader}
                        onError={(e) => {
                          e.currentTarget.src = 'https://placehold.co/400x250/E0E7FF/4338CA?text=Thumbnail+Error';
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">Description (Optional)</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 rounded-xl bg-gray-700 text-white border border-gray-600 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500 transition-colors"
                  placeholder="A brief description of the virtual tour."
                ></textarea>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="published"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-600 rounded bg-gray-700"
              />
              <label htmlFor="published" className="ml-2 block text-sm text-gray-300">Publish Tour</label>
            </div>

            {formError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-900 bg-opacity-30 text-red-300 px-4 py-3 rounded-lg text-sm text-center border border-red-700"
              >
                {formError}
              </motion.div>
            )}
            <div className="flex flex-col md:flex-row justify-end space-y-3 md:space-y-0 md:space-x-3 mt-6">
              <motion.button
                type="button"
                onClick={onClose}
                className="w-full md:w-auto px-6 py-3 rounded-full text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                className="w-full md:w-auto px-6 py-3 rounded-full text-sm font-medium text-white bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={loading}
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5 text-white mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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