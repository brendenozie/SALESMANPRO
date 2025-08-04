"use client";

import React, { useState, useEffect } from 'react';
import {
  BriefcaseIcon, PlusCircleIcon, PencilIcon, TrashIcon, ClockIcon, CurrencyDollarIcon, MapPinIcon,
  XMarkIcon, ExclamationTriangleIcon, CheckCircleIcon, InformationCircleIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

// Custom image loader for Next.js
const customLoader = ({ src, width, quality }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

// =======================================================================
// Helper component for each package card
// =======================================================================
const PackageCard = ({ pkg, onEdit, onDelete }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'DRAFT': return 'bg-yellow-100 text-yellow-800';
      case 'ARCHIVED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, type: "spring", stiffness: 100 }}
      className="relative p-2 overflow-hidden transition-all duration-300 bg-white rounded-3xl shadow-md hover:shadow-xl hover:-translate-y-1 group"
    >
      <div className="relative w-full h-48 rounded-2xl overflow-hidden">
        <Image
          src={pkg.imageUrl || 'https://placehold.co/600x400/E5E7EB/A5A9AE?text=No+Image'}
          alt={pkg.name}
          layout="fill"
          objectFit="cover"
          loader={customLoader}
          className="transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(pkg.status)}`}>
            {pkg.status}
          </span>
          <div className="flex space-x-2">
            <motion.button
              onClick={() => onEdit(pkg)}
              className="p-2 text-indigo-600 transition-colors duration-200 bg-indigo-50 rounded-full hover:bg-indigo-100"
              title="Edit Package"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <PencilIcon className="w-5 h-5" />
            </motion.button>
            <motion.button
              onClick={() => onDelete(pkg.id)}
              className="p-2 text-red-600 transition-colors duration-200 bg-red-50 rounded-full hover:bg-red-100"
              title="Delete Package"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <TrashIcon className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
        <h3 className="text-xl font-bold text-gray-900 line-clamp-1">{pkg.name}</h3>
        <p className="mt-2 text-sm text-gray-600 line-clamp-2">{pkg.description || 'No description provided.'}</p>
        <div className="flex items-center justify-between pt-4 mt-4 text-gray-700 border-t border-gray-100">
          <div className="flex items-center space-x-1">
            <MapPinIcon className="w-4 h-4 text-indigo-500" />
            <span className="text-sm font-medium">{pkg.destination}</span>
          </div>
          <div className="flex items-center space-x-1">
            <ClockIcon className="w-4 h-4 text-indigo-500" />
            <span className="text-sm font-medium">{pkg.duration}</span>
          </div>
          <div className="flex items-center space-x-1">
            <CurrencyDollarIcon className="w-4 h-4 text-indigo-500" />
            <span className="text-sm font-bold text-gray-900">{pkg.price.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// =======================================================================
// Helper component for the Add/Edit modal
// =======================================================================
const PackageModal = ({ pkg, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: pkg?.name || '',
    description: pkg?.description || '',
    destination: pkg?.destination || '',
    duration: pkg?.duration || '',
    price: pkg?.price || 0,
    status: pkg?.status || 'DRAFT',
    imageUrl: pkg?.imageUrl || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...formData, id: pkg?.id });
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
          {pkg ? 'Edit Package' : 'Add New Package'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Package Name</label>
            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} placeholder="e.g., Luxury Bali Honeymoon" required className="block w-full px-4 py-3 mt-1 transition-colors border border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows="3" placeholder="A brief, captivating description of the package." required className="block w-full px-4 py-3 mt-1 transition-colors border border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
          </div>
          <div>
            <label htmlFor="destination" className="block text-sm font-medium text-gray-700">Destination</label>
            <input type="text" id="destination" name="destination" value={formData.destination} onChange={handleChange} placeholder="e.g., Bali" required className="block w-full px-4 py-3 mt-1 transition-colors border border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
          </div>
          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700">Duration (e.g., "7 Days")</label>
            <input type="text" id="duration" name="duration" value={formData.duration} onChange={handleChange} placeholder="e.g., 7 Days" required className="block w-full px-4 py-3 mt-1 transition-colors border border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
          </div>
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price</label>
            <input type="number" id="price" name="price" value={formData.price} onChange={handleChange} placeholder="e.g., 2500" required className="block w-full px-4 py-3 mt-1 transition-colors border border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
            <select id="status" name="status" value={formData.status} onChange={handleChange} className="block w-full px-4 py-3 mt-1 transition-colors border border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
              <option value="ACTIVE">Active</option>
              <option value="DRAFT">Draft</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
          <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">Image URL</label>
            <input type="url" id="imageUrl" name="imageUrl" value={formData.imageUrl} onChange={handleChange} placeholder="https://images.unsplash.com/..." required className="block w-full px-4 py-3 mt-1 transition-colors border border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
            {formData.imageUrl && (
              <div className="flex items-center justify-center w-full h-40 p-2 mt-4 overflow-hidden bg-gray-100 border border-gray-200 rounded-xl">
                <Image src={formData.imageUrl} alt="Image Preview" width={200} height={120} objectFit="contain" className="rounded-lg" loader={customLoader} unoptimized />
              </div>
            )}
          </div>
          <div className="flex justify-end pt-4 space-x-3">
            <button type="button" onClick={onClose} className="px-6 py-2 text-sm font-semibold text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              Cancel
            </button>
            <button type="submit" className="px-6 py-2 text-sm font-semibold text-white transition-colors bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              {pkg ? 'Save Changes' : 'Add Package'}
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
        <button onClick={onCancel} className="px-4 py-2 text-sm font-semibold text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50">
          Cancel
        </button>
        <button onClick={onConfirm} className="px-4 py-2 text-sm font-semibold text-white transition-colors bg-red-600 rounded-lg shadow-sm hover:bg-red-700">
          Delete
        </button>
      </div>
    </motion.div>
  </motion.div>
);

// =======================================================================
// Main component
// =======================================================================
export default function AdminPackages() {
  const [packages, setPackages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPackage, setCurrentPackage] = useState(null);
  const [packageToDelete, setPackageToDelete] = useState(null);
  const [showNotification, setShowNotification] = useState({ visible: false, message: '', type: '' });

  // Function to show a notification toast
  const showNotificationAlert = (message, type) => {
    setShowNotification({ visible: true, message, type });
    setTimeout(() => setShowNotification({ visible: false, message: '', type: '' }), 3000);
  };

  // Function to fetch packages from the API
  const fetchPackages = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/packages');
      if (!response.ok) {
        throw new Error('Failed to fetch packages.');
      }
      const data = await response.json();
      setPackages(data);
    } catch (error) {
      console.error('API Fetch Error:', error);
      showNotificationAlert('Failed to load packages. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data on initial component load
  useEffect(() => {
    fetchPackages();
  }, []);

  const openAddModal = () => {
    setCurrentPackage(null);
    setIsModalOpen(true);
  };

  const openEditModal = (pkg) => {
    setCurrentPackage(pkg);
    setIsModalOpen(true);
  };

  // Handle saving a new or edited package via API
  const handleSavePackage = async (formData) => {
    try {
      const isEditing = !!formData.id;
      const url = isEditing ? `/api/packages/${formData.id}` : '/api/packages';
      const method = isEditing ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${isEditing ? 'update' : 'add'} package.`);
      }

      showNotificationAlert(`Package "${formData.name}" ${isEditing ? 'updated' : 'added'} successfully!`, 'success');
      setIsModalOpen(false);
      fetchPackages(); // Re-fetch to get the latest data
    } catch (error) {
      console.error('API Save Error:', error);
      showNotificationAlert(`Failed to ${isEditing ? 'update' : 'add'} package.`, 'error');
    }
  };

  // Handle deletion of a package via API
  const confirmDelete = async () => {
    if (!packageToDelete) return;

    try {
      const response = await fetch(`/api/packages/${packageToDelete}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete package.');
      }

      showNotificationAlert('Package deleted successfully!', 'success');
      setPackageToDelete(null); // Close the confirmation modal
      fetchPackages(); // Re-fetch to get the latest data
    } catch (error) {
      console.error('API Delete Error:', error);
      showNotificationAlert('Failed to delete package.', 'error');
    }
  };

  // Function to initiate the delete confirmation modal
  const handleDeletePackage = (id) => {
    setPackageToDelete(id);
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50 font-inter">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 text-4xl font-extrabold tracking-tight text-gray-900"
      >
        Manage Packages
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-8"
      >
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <p className="max-w-2xl text-gray-600">
            Here you can create, edit, and delete travel packages and tours to showcase on your platform.
          </p>
          <motion.button
            onClick={openAddModal}
            className="flex items-center space-x-2 bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:bg-indigo-700 transition-colors duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <PlusCircleIcon className="w-5 h-5" />
            <span>Add New Package</span>
          </motion.button>
        </div>
      </motion.div>

      <div className="p-8 bg-white shadow-xl rounded-3xl">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">All Packages</h2>
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
          ) : packages.length > 0 ? (
            <motion.div
              key="packages-list"
              className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              <AnimatePresence>
                {packages.map((pkg) => (
                  <PackageCard
                    key={pkg.id}
                    pkg={pkg}
                    onEdit={openEditModal}
                    onDelete={handleDeletePackage}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              key="no-packages"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center p-12 text-center text-gray-500 bg-gray-50 rounded-2xl"
            >
              <BriefcaseIcon className="w-16 h-16 text-gray-300" />
              <p className="mt-4 text-lg font-medium">No packages found.</p>
              <p className="mt-2 text-sm text-gray-400">Add your first package to get started.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <PackageModal
            pkg={currentPackage}
            onSave={handleSavePackage}
            onClose={() => setIsModalOpen(false)}
          />
        )}
        {packageToDelete && (
          <ConfirmationModal
            title="Delete Package"
            message="Are you sure you want to delete this package? This action cannot be undone."
            onConfirm={confirmDelete}
            onCancel={() => setPackageToDelete(null)}
          />
        )}
        {showNotification.visible && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 p-4 rounded-lg shadow-lg flex items-center space-x-2 z-50"
            style={{
              backgroundColor: showNotification.type === 'success' ? '#10B981' : '#EF4444',
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
