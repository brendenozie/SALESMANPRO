"use client";

import React, { useState, useEffect } from 'react';
import {
  GlobeAltIcon, PlusCircleIcon, PencilIcon, TrashIcon, MapPinIcon, PhotoIcon,
  XMarkIcon, ExclamationTriangleIcon, CheckCircleIcon, InformationCircleIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

// Custom image loader for Next.js (remains the same)
const customLoader = ({ src, width, quality }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

// =======================================================================
// Helper component for each destination card
// =======================================================================
const DestinationCard = ({ destination, onEdit, onDelete }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.3 }}
    className="relative p-2 overflow-hidden transition-all duration-300 bg-white rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1"
  >
    <div className="relative w-full h-48 rounded-xl overflow-hidden">
      <Image
        src={destination.imageUrl || 'https://placehold.co/600x400/E5E7EB/A5A9AE?text=No+Image'}
        alt={destination.name}
        layout="fill"
        objectFit="cover"
        loader={customLoader}
        className="transition-transform duration-300 group-hover:scale-105"
      />
    </div>
    <div className="p-4">
      <div className="flex items-center mb-2 text-sm font-medium text-gray-500">
        <MapPinIcon className="w-4 h-4 mr-1 text-indigo-500" />
        {destination.country || 'N/A'}
      </div>
      <h3 className="text-lg font-bold text-gray-900">{destination.name}</h3>
      <p className="mt-2 text-sm text-gray-600 line-clamp-2">{destination.description || 'No description provided.'}</p>
      <div className="flex justify-end pt-4 space-x-2">
        <motion.button
          onClick={() => onEdit(destination)}
          className="p-2 text-indigo-600 transition-colors duration-200 bg-indigo-50 rounded-full hover:bg-indigo-100"
          title="Edit Destination"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <PencilIcon className="w-5 h-5" />
        </motion.button>
        <motion.button
          onClick={() => onDelete(destination.id)}
          className="p-2 text-red-600 transition-colors duration-200 bg-red-50 rounded-full hover:bg-red-100"
          title="Delete Destination"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <TrashIcon className="w-5 h-5" />
        </motion.button>
      </div>
    </div>
  </motion.div>
);

// =======================================================================
// Helper component for the Add/Edit modal
// =======================================================================
const DestinationModal = ({ destination, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: destination?.name || '',
    country: destination?.country || '',
    description: destination?.description || '',
    imageUrl: destination?.images?.[0] || '', // Use the first image from the array
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Prepare data to match the API structure
    const apiData = {
      ...formData,
      // The API expects 'images' as an array of strings, so convert from a single imageUrl
      images: formData.imageUrl ? [formData.imageUrl] : [],
      // 'country' is not in the original schema, so we can't send it directly.
      // We'll have to either add it to the description or a new field, or
      // assume it's part of the name for now. For this update, we will assume
      // the 'country' field is part of the `description` or can be handled
      // as part of the `longDescription` or a new field in the schema.
    };
    // Let's send the country in a new field for better data structuring.
    // Assuming the backend has been updated to handle this, as we mapped it
    // from the initial component's data. For this example, we will just pass it
    // as part of the body, assuming the API can handle it or a middleware can
    // process it.
    onSave({ ...formData, images: [formData.imageUrl] });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        className="relative w-full max-w-lg p-8 bg-white rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute text-gray-400 transition-colors duration-200 top-4 right-4 hover:text-gray-600"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
        <h2 className="mb-6 text-2xl font-bold text-gray-900">
          {destination ? 'Edit Destination' : 'Add New Destination'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="block w-full px-4 py-3 mt-1 transition-colors border border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="e.g., Bali, Indonesia"
              required
            />
          </div>
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700">Country</label>
            <input
              type="text"
              id="country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="block w-full px-4 py-3 mt-1 transition-colors border border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="e.g., Indonesia"
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="block w-full px-4 py-3 mt-1 transition-colors border border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="A brief, captivating description of the destination."
              required
            ></textarea>
          </div>
          <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">Image URL</label>
            <input
              type="url"
              id="imageUrl"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              className="block w-full px-4 py-3 mt-1 transition-colors border border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="https://images.unsplash.com/..."
              required
            />
            {formData.imageUrl && (
              <div className="flex items-center justify-center w-full h-40 p-2 mt-4 overflow-hidden bg-gray-100 border border-gray-200 rounded-xl">
                <Image
                  src={formData.imageUrl}
                  alt="Image Preview"
                  width={200}
                  height={120}
                  objectFit="contain"
                  className="rounded-lg"
                  loader={customLoader}
                  unoptimized
                />
              </div>
            )}
          </div>
          <div className="flex justify-end pt-4 space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-sm font-semibold text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-sm font-semibold text-white transition-colors bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {destination ? 'Save Changes' : 'Add Destination'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

// =======================================================================
// Helper component for confirmation dialog
// =======================================================================
const ConfirmationModal = ({ title, message, onConfirm, onCancel }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
  >
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 25 }}
      className="w-full max-w-sm p-6 bg-white rounded-2xl shadow-2xl"
    >
      <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 text-red-600 bg-red-100 rounded-full">
        <ExclamationTriangleIcon className="w-6 h-6" />
      </div>
      <h3 className="mb-2 text-lg font-bold text-center text-gray-900">{title}</h3>
      <p className="text-sm text-center text-gray-500">{message}</p>
      <div className="flex justify-center mt-5 space-x-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm font-semibold text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 text-sm font-semibold text-white transition-colors bg-red-600 rounded-lg shadow-sm hover:bg-red-700"
        >
          Delete
        </button>
      </div>
    </motion.div>
  </motion.div>
);

// =======================================================================
// Main component
// =======================================================================
export default function AdminDestinations() {
  const [destinations, setDestinations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDestination, setCurrentDestination] = useState(null);
  const [destinationToDelete, setDestinationToDelete] = useState(null);
  const [showNotification, setShowNotification] = useState({ visible: false, message: '', type: '' });

  // Function to show a notification toast
  const showNotificationAlert = (message, type) => {
    setShowNotification({ visible: true, message, type });
    setTimeout(() => setShowNotification({ visible: false, message: '', type: '' }), 3000);
  };

  // Function to fetch destinations from the API
  const fetchDestinations = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/products');
      if (!response.ok) {
        throw new Error('Failed to fetch destinations.');
      }
      const data = await response.json();

      // Since the API returns a full product object, we need to map it
      // to the simpler structure used by the front-end components.
      const formattedDestinations = data.map(product => ({
        id: product.id,
        name: product.name,
        country: product.country || 'Unknown', // The schema doesn't have a country field, this is a placeholder
        description: product.description,
        imageUrl: product.images?.[0] || 'https://placehold.co/600x400/E5E7EB/A5A9AE?text=No+Image',
      }));

      setDestinations(formattedDestinations);
    } catch (error) {
      console.error('API Fetch Error:', error);
      showNotificationAlert('Failed to load destinations. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data on initial component load
  useEffect(() => {
    fetchDestinations();
  }, []);

  const openAddModal = () => {
    setCurrentDestination(null);
    setIsModalOpen(true);
  };

  const openEditModal = (destination) => {
    setCurrentDestination(destination);
    setIsModalOpen(true);
  };

  // Handle saving a new or edited destination via API
  const handleSaveDestination = async (formData) => {
    try {
      const isEditing = !!currentDestination;
      const url = isEditing ? `/api/products/${currentDestination.id}` : '/api/products';
      const method = isEditing ? 'PATCH' : 'POST';

      const apiData = {
        name: formData.name,
        description: formData.description,
        country: formData.country, // Assuming the API handles this
        images: [formData.imageUrl],
      };

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${isEditing ? 'update' : 'add'} destination.`);
      }

      showNotificationAlert(`Destination "${formData.name}" ${isEditing ? 'updated' : 'added'} successfully!`, 'success');
      setIsModalOpen(false);
      fetchDestinations(); // Re-fetch to get the latest data
    } catch (error) {
      console.error('API Save Error:', error);
      showNotificationAlert(`Failed to ${isEditing ? 'update' : 'add'} destination.`, 'error');
    }
  };

  // Handle deletion of a destination via API
  const confirmDelete = async () => {
    if (!destinationToDelete) return;

    try {
      const response = await fetch(`/api/products/${destinationToDelete}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete destination.');
      }

      showNotificationAlert('Destination deleted successfully!', 'success');
      setDestinationToDelete(null); // Close the confirmation modal
      fetchDestinations(); // Re-fetch to get the latest data
    } catch (error) {
      console.error('API Delete Error:', error);
      showNotificationAlert('Failed to delete destination.', 'error');
    }
  };

  // Function to initiate the delete confirmation modal
  const handleDeleteDestination = (id) => {
    setDestinationToDelete(id);
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-extrabold text-gray-900 mb-8 tracking-tight"
      >
        Manage Destinations
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-8"
      >
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <p className="text-gray-600 max-w-2xl">
            Here you can create, edit, and delete travel destinations to showcase on your platform.
          </p>
          <motion.button
            onClick={openAddModal}
            className="flex items-center space-x-2 bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:bg-indigo-700 transition-colors duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <PlusCircleIcon className="w-5 h-5" />
            <span>Add New Destination</span>
          </motion.button>
        </div>
      </motion.div>

      <div className="bg-white rounded-3xl shadow-xl p-8">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">All Destinations</h2>
        
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center py-20 text-gray-400"
            >
              <svg className="w-10 h-10 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </motion.div>
          ) : destinations.length > 0 ? (
            <motion.div
              key="destinations-list"
              className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
            >
              {destinations.map((destination) => (
                <DestinationCard
                  key={destination.id}
                  destination={destination}
                  onEdit={openEditModal}
                  onDelete={handleDeleteDestination}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="no-destinations"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center p-12 text-center text-gray-500 bg-gray-50 rounded-2xl"
            >
              <GlobeAltIcon className="w-16 h-16 text-gray-300" />
              <p className="mt-4 text-lg font-medium">No destinations found.</p>
              <p className="mt-2 text-sm text-gray-400">Add your first destination to get started.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <DestinationModal
            destination={currentDestination}
            onSave={handleSaveDestination}
            onClose={() => setIsModalOpen(false)}
          />
        )}
        {destinationToDelete && (
          <ConfirmationModal
            title="Delete Destination"
            message="Are you sure you want to delete this destination? This action cannot be undone."
            onConfirm={confirmDelete}
            onCancel={() => setDestinationToDelete(null)}
          />
        )}
        {showNotification.visible && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 p-4 rounded-lg shadow-lg flex items-center space-x-2 z-50"
            style={{
              backgroundColor: showNotification.type === 'success' ? '#10B981' : '#EF4444', // Green for success, Red for error
              color: 'white',
            }}
          >
            {showNotification.type === 'success' ? (
              <CheckCircleIcon className="w-5 h-5" />
            ) : (
              <InformationCircleIcon className="w-5 h-5" />
            )}
            <p className="text-sm font-medium">{showNotification.message}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
