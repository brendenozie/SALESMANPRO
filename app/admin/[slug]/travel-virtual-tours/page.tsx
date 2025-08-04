// AdminVirtualTours.jsx
"use client";

import React, { useState } from 'react';
import {
  PlayCircleIcon, PlusCircleIcon, PencilIcon, TrashIcon, MapPinIcon, ClockIcon, TagIcon
} from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import Image from 'next/image';

const customLoader = ({ src, width, quality }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

// Dummy Data
const initialVirtualTours = [
  { id: 'VT001', title: 'Explore Amazon Rainforest', location: 'Amazon, Brazil', duration: '5 min', category: 'Nature', videoUrl: 'https://www.youtube.com/embed/LXb3EKWsInQ', thumbnailUrl: 'https://images.unsplash.com/photo-1546522301-447544d673f4?q=80&w=2940&auto=format&fit=crop' },
  { id: 'VT002', title: 'A Walk Through Ancient Rome', location: 'Rome, Italy', duration: '7 min', category: 'History', videoUrl: 'https://www.youtube.com/embed/q_2h_2Q00c0', thumbnailUrl: 'https://images.unsplash.com/photo-1552832230-c0197cefa08d?q=80&w=2940&auto=format&fit=crop' },
  { id: 'VT003', title: 'Safari in Serengeti', location: 'Serengeti, Tanzania', duration: '6 min', category: 'Wildlife', videoUrl: 'https://www.youtube.com/embed/FwV8h6rC2i0', thumbnailUrl: 'https://images.unsplash.com/photo-1534515510-410a0e980362?q=80&w=2940&auto=format&fit=crop' },
];

export default function AdminVirtualTours() {
  const [virtualTours, setVirtualTours] = useState(initialVirtualTours);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTour, setCurrentTour] = useState(null); // For edit mode

  const openAddModal = () => {
    setCurrentTour(null);
    setIsModalOpen(true);
  };

  const openEditModal = (tour) => {
    setCurrentTour(tour);
    setIsModalOpen(true);
  };

  const handleSaveTour = (formData) => {
    if (currentTour) {
      // Edit existing
      setVirtualTours(virtualTours.map(t => t.id === formData.id ? formData : t));
      alert(`Virtual Tour "${formData.title}" updated.`);
    } else {
      // Add new
      const newId = `VT${String(virtualTours.length + 1).padStart(3, '0')}`;
      setVirtualTours([...virtualTours, { ...formData, id: newId }]);
      alert(`Virtual Tour "${formData.title}" added.`);
    }
    setIsModalOpen(false);
  };

  const handleDeleteTour = (id) => {
    if (confirm(`Are you sure you want to delete virtual tour ${id}?`)) {
      setVirtualTours(virtualTours.filter(t => t.id !== id));
      alert(`Virtual Tour ${id} deleted.`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-extrabold text-gray-900 mb-8"
      >
        Manage Virtual Tours
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white rounded-xl shadow-md p-6 mb-8"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">All Virtual Tours</h2>
          <motion.button
            onClick={openAddModal}
            className="flex items-center space-x-2 bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors duration-200"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <PlusCircleIcon className="h-5 w-5" />
            <span>Add New Tour</span>
          </motion.button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thumbnail</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {virtualTours.length > 0 ? (
                virtualTours.map((tour) => (
                  <tr key={tour.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{tour.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="relative w-20 h-12 rounded-md overflow-hidden">
                        <Image src={tour.thumbnailUrl} alt={tour.title} layout="fill" objectFit="cover"  loader={customLoader}/>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tour.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 flex items-center">
                      <MapPinIcon className="h-4 w-4 mr-1 text-gray-400" />
                      {tour.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 flex items-center">
                      <ClockIcon className="h-4 w-4 mr-1 text-gray-400" />
                      {tour.duration}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 flex items-center">
                      <TagIcon className="h-4 w-4 mr-1 text-gray-400" />
                      {tour.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <motion.button
                          onClick={() => alert(`Playing video for ${tour.title}: ${tour.videoUrl}`)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50 transition"
                          title="Play Video"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <PlayCircleIcon className="h-5 w-5" />
                        </motion.button>
                        <motion.button
                          onClick={() => openEditModal(tour)}
                          className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-50 transition"
                          title="Edit"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <PencilIcon className="h-5 w-5" />
                        </motion.button>
                        <motion.button
                          onClick={() => handleDeleteTour(tour.id)}
                          className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-50 transition"
                          title="Delete"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <TrashIcon className="h-5 w-5" />
                        </motion.button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">No virtual tours found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Add/Edit Virtual Tour Modal */}
      {isModalOpen && (
        <VirtualTourModal
          tour={currentTour}
          onSave={handleSaveTour}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}

// VirtualTourModal.jsx (Internal Component for Add/Edit)
function VirtualTourModal({ tour, onSave, onClose }) {
  const [title, setTitle] = useState(tour?.title || '');
  const [location, setLocation] = useState(tour?.location || '');
  const [duration, setDuration] = useState(tour?.duration || '');
  const [category, setCategory] = useState(tour?.category || '');
  const [videoUrl, setVideoUrl] = useState(tour?.videoUrl || '');
  const [thumbnailUrl, setThumbnailUrl] = useState(tour?.thumbnailUrl || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      id: tour?.id,
      title,
      location,
      duration,
      category,
      videoUrl,
      thumbnailUrl,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 50 }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {tour ? 'Edit Virtual Tour' : 'Add New Virtual Tour'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="tourTitle" className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              id="tourTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="tourLocation" className="block text-sm font-medium text-gray-700">Location</label>
            <input
              type="text"
              id="tourLocation"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="tourDuration" className="block text-sm font-medium text-gray-700">Duration (e.g., "5 min")</label>
            <input
              type="text"
              id="tourDuration"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="tourCategory" className="block text-sm font-medium text-gray-700">Category</label>
            <input
              type="text"
              id="tourCategory"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="tourVideoUrl" className="block text-sm font-medium text-gray-700">Video Embed URL (e.g., YouTube embed)</label>
            <input
              type="url"
              id="tourVideoUrl"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="tourThumbnailUrl" className="block text-sm font-medium text-gray-700">Thumbnail Image URL</label>
            <input
              type="url"
              id="tourThumbnailUrl"
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
            {thumbnailUrl && (
              <div className="mt-2 text-center">
                <Image src={thumbnailUrl} alt="Preview" width={100} height={60} objectFit="contain" className="rounded-md" loader={customLoader}/>
              </div>
            )}
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {tour ? 'Save Changes' : 'Add Tour'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}