// AdminDestinations.jsx
"use client";

import React, { useState } from 'react';
import {
  GlobeAltIcon, PlusCircleIcon, PencilIcon, TrashIcon, MapPinIcon, PhotoIcon
} from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import Image from 'next/image';

const customLoader = ({ src, width, quality }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};
// Dummy Data
const initialDestinations = [
  { id: 'D001', name: 'Bali, Indonesia', country: 'Indonesia', description: 'Lush landscapes and spiritual retreats.', imageUrl: 'https://images.unsplash.com/photo-1536152470817-f90694154373?q=80&w=2940&auto=format&fit=crop' },
  { id: 'D002', name: 'Paris, France', country: 'France', description: 'City of lights, art, and romance.', imageUrl: 'https://images.unsplash.com/photo-1502602898662-a318aa667858?q=80&w=2940&auto=format&fit=crop' },
  { id: 'D003', name: 'Kyoto, Japan', country: 'Japan', description: 'Ancient temples and cherry blossoms.', imageUrl: 'https://images.unsplash.com/photo-1545562083-d73b08767ef2?q=80&w=2940&auto=format&fit=crop' },
  { id: 'D004', name: 'Serengeti, Tanzania', country: 'Tanzania', description: 'Witness the Great Migration.', imageUrl: 'https://images.unsplash.com/photo-1534515510-410a0e980362?q=80&w=2940&auto=format&fit=crop' },
];

export default function AdminDestinations() {
  const [destinations, setDestinations] = useState(initialDestinations);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDestination, setCurrentDestination] = useState(null); // For edit mode

  const openAddModal = () => {
    setCurrentDestination(null);
    setIsModalOpen(true);
  };

  const openEditModal = (destination) => {
    setCurrentDestination(destination);
    setIsModalOpen(true);
  };

  const handleSaveDestination = (formData) => {
    if (currentDestination) {
      // Edit existing
      setDestinations(destinations.map(d => d.id === formData.id ? formData : d));
      alert(`Destination ${formData.name} updated.`);
    } else {
      // Add new
      const newId = `D${String(destinations.length + 1).padStart(3, '0')}`;
      setDestinations([...destinations, { ...formData, id: newId }]);
      alert(`Destination ${formData.name} added.`);
    }
    setIsModalOpen(false);
  };

  const handleDeleteDestination = (id) => {
    if (confirm(`Are you sure you want to delete destination ${id}?`)) {
      setDestinations(destinations.filter(d => d.id !== id));
      alert(`Destination ${id} deleted.`);
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
        Manage Destinations
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white rounded-xl shadow-md p-6 mb-8"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">All Destinations</h2>
          <motion.button
            onClick={openAddModal}
            className="flex items-center space-x-2 bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors duration-200"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <PlusCircleIcon className="h-5 w-5" />
            <span>Add New Destination</span>
          </motion.button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Country</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {destinations.length > 0 ? (
                destinations.map((destination) => (
                  <tr key={destination.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{destination.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="relative w-16 h-10 rounded-md overflow-hidden">
                        <Image src={destination.imageUrl} alt={destination.name} layout="fill" objectFit="cover" loader={customLoader}/>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{destination.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{destination.country}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{destination.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <motion.button
                          onClick={() => openEditModal(destination)}
                          className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-50 transition"
                          title="Edit"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <PencilIcon className="h-5 w-5" />
                        </motion.button>
                        <motion.button
                          onClick={() => handleDeleteDestination(destination.id)}
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
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">No destinations found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Add/Edit Destination Modal */}
      {isModalOpen && (
        <DestinationModal
          destination={currentDestination}
          onSave={handleSaveDestination}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}

// DestinationModal.jsx (Internal Component for Add/Edit)
function DestinationModal({ destination, onSave, onClose }) {
  const [name, setName] = useState(destination?.name || '');
  const [country, setCountry] = useState(destination?.country || '');
  const [description, setDescription] = useState(destination?.description || '');
  const [imageUrl, setImageUrl] = useState(destination?.imageUrl || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      id: destination?.id, // Keep ID if editing
      name,
      country,
      description,
      imageUrl,
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
          {destination ? 'Edit Destination' : 'Add New Destination'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700">Country</label>
            <input
              type="text"
              id="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            ></textarea>
          </div>
          <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">Image URL</label>
            <input
              type="url"
              id="imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
            {imageUrl && (
              <div className="mt-2 text-center">
                <Image src={imageUrl} alt="Preview" width={100} height={60} objectFit="contain" className="rounded-md" loader={customLoader}/>
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
              {destination ? 'Save Changes' : 'Add Destination'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}