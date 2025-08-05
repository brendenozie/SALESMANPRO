"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { BellAlertIcon, BriefcaseIcon, CheckCircleIcon, ClockIcon, InformationCircleIcon, MapPinIcon, PencilIcon, PlusCircleIcon, StarIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';

// Custom image loader for Next.js
const customLoader = ({ src, width, quality }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

// =======================================================================
// Helper component for each package card
// =======================================================================
const TourPackageCard = ({ pkg, onEdit, onDelete }) => {
  // Function to get a color based on the package status
  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'DRAFT': return 'bg-yellow-100 text-yellow-800';
      case 'ARCHIVED': return 'bg-slate-200 text-slate-800';
      case 'INACTIVE': return 'bg-red-100 text-red-800';
      case 'FEATURED': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, type: "spring", stiffness: 100 }}
      className="relative flex flex-col overflow-hidden transition-all duration-300 bg-white rounded-3xl shadow-xl hover:shadow-2xl hover:-translate-y-2 group"
    >
      <div className="relative w-full h-48 rounded-t-[20px] overflow-hidden">
        <Image
          src={pkg.imageUrl || 'https://placehold.co/600x400/E5E7EB/A5A9AE?text=No+Image'}
          alt={pkg.name}
          layout="fill"
          objectFit="cover"
          loader={customLoader}
          className="transition-transform duration-500 group-hover:scale-110"
        />
        {pkg.status === 'FEATURED' && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-4 left-4 flex items-center space-x-1 px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-full shadow-lg"
          >
            <StarIcon className="w-4 h-4 text-white" />
            <span>Featured</span>
          </motion.div>
        )}
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-center justify-between mb-4">
          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(pkg.status)}`}>
            {pkg.status}
          </span>
          <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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
        <h3 className="text-2xl font-bold text-slate-900 line-clamp-1">{pkg.name}</h3>
        <p className="mt-2 text-sm text-slate-600 line-clamp-2 flex-grow">{pkg.description || 'No description provided.'}</p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-4 mt-auto text-slate-700 border-t border-slate-100">
          <div className="flex items-center space-x-2">
            <MapPinIcon className="w-4 h-4 text-indigo-500" />
            {/* The destination names are now an array on the package object */}
            <span className="text-sm font-medium line-clamp-1">{pkg.destinations.map(d => d.name).join(', ')}</span>
          </div>
          <div className="flex items-center space-x-2">
            <ClockIcon className="w-4 h-4 text-indigo-500" />
            <span className="text-sm font-medium">{pkg.duration}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-bold text-slate-900">{pkg.price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// =======================================================================
// Helper component for the Add/Edit modal
// =======================================================================
const TourPackageModal = ({ pkg, onSave, onClose, destinations }) => {
  const [formData, setFormData] = useState({
    name: pkg?.name || '',
    slug: pkg?.slug || '',
    description: pkg?.description || '',
    longDescription: pkg?.longDescription || '',
    duration: pkg?.duration || '',
    price: pkg?.price || 0,
    status: pkg?.status || 'DRAFT',
    imageUrl: pkg?.imageUrl || '',
    destinationIds: pkg?.destinations?.map(d => d.id) || [],
  });

  // Handle changes for input fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle changes for the multi-select destination input
  const handleDestinationChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
    setFormData(prev => ({ ...prev, destinationIds: selectedOptions }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...formData, id: pkg?.id, price: Number(formData.price) });
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
        className="relative w-full max-w-lg p-8 bg-white rounded-3xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute text-slate-400 transition-colors duration-200 top-5 right-5 hover:text-slate-600"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
        <h2 className="mb-6 text-3xl font-bold text-slate-900">
          {pkg ? 'Edit Tour Package' : 'Add New Tour Package'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-1">Package Name</label>
            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} placeholder="e.g., Luxury Bali Honeymoon" required className="block w-full px-4 py-3 mt-1 transition-colors border border-slate-300 rounded-xl shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none" />
          </div>
          <div>
            <label htmlFor="slug" className="block text-sm font-semibold text-slate-700 mb-1">Slug</label>
            <input type="text" id="slug" name="slug" value={formData.slug} onChange={handleChange} placeholder="e.g., luxury-bali-honeymoon" required className="block w-full px-4 py-3 mt-1 transition-colors border border-slate-300 rounded-xl shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none" />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
            <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows="3" placeholder="A brief, captivating description of the package." required className="block w-full px-4 py-3 mt-1 transition-colors border border-slate-300 rounded-xl shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none" />
          </div>
          <div>
            <label htmlFor="longDescription" className="block text-sm font-semibold text-slate-700 mb-1">Long Description</label>
            <textarea id="longDescription" name="longDescription" value={formData.longDescription} onChange={handleChange} rows="5" placeholder="A more detailed description for the package page." className="block w-full px-4 py-3 mt-1 transition-colors border border-slate-300 rounded-xl shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="destinationIds" className="block text-sm font-semibold text-slate-700 mb-1">Destinations</label>
              <select
                id="destinationIds"
                name="destinationIds"
                value={formData.destinationIds}
                onChange={handleDestinationChange}
                multiple
                className="block w-full px-4 py-3 mt-1 transition-colors border border-slate-300 rounded-xl shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none h-32"
              >
                {destinations.map(destination => (
                  <option key={destination.id} value={destination.id}>{destination.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="duration" className="block text-sm font-semibold text-slate-700 mb-1">Duration (e.g., "7 Days")</label>
              <input type="text" id="duration" name="duration" value={formData.duration} onChange={handleChange} placeholder="e.g., 7 Days, 6 Nights" required className="block w-full px-4 py-3 mt-1 transition-colors border border-slate-300 rounded-xl shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="block text-sm font-semibold text-slate-700 mb-1">Price</label>
              <input type="number" id="price" name="price" value={formData.price} onChange={handleChange} placeholder="e.g., 2500" required className="block w-full px-4 py-3 mt-1 transition-colors border border-slate-300 rounded-xl shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none" />
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-semibold text-slate-700 mb-1">Status</label>
              <select id="status" name="status" value={formData.status} onChange={handleChange} className="block w-full px-4 py-3 mt-1 transition-colors border border-slate-300 rounded-xl shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none">
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="FEATURED">Featured</option>
                <option value="DRAFT">Draft</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="imageUrl" className="block text-sm font-semibold text-slate-700 mb-1">Image URL</label>
            <input type="url" id="imageUrl" name="imageUrl" value={formData.imageUrl} onChange={handleChange} placeholder="https://images.unsplash.com/..." required className="block w-full px-4 py-3 mt-1 transition-colors border border-slate-300 rounded-xl shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none" />
            {formData.imageUrl && (
              <div className="flex items-center justify-center w-full h-40 p-2 mt-4 overflow-hidden bg-slate-100 border border-slate-200 rounded-xl">
                <Image src={formData.imageUrl} alt="Image Preview" width={200} height={120} objectFit="contain" className="rounded-lg" loader={customLoader} unoptimized />
              </div>
            )}
          </div>
          <div className="flex justify-end pt-4 space-x-3">
            <button type="button" onClick={onClose} className="px-6 py-2 text-sm font-semibold text-slate-700 transition-colors bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500">
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
      className="w-full max-w-sm p-8 bg-white rounded-2xl shadow-2xl"
    >
      <div className="flex items-center justify-center w-14 h-14 mx-auto mb-4 text-red-600 bg-red-100 rounded-full">
        <BellAlertIcon className="w-8 h-8" />
      </div>
      <h3 className="mb-2 text-2xl font-bold text-center text-slate-900">{title}</h3>
      <p className="text-sm text-center text-slate-500">{message}</p>
      <div className="flex justify-center mt-6 space-x-4">
        <button onClick={onCancel} className="px-6 py-3 text-sm font-semibold text-slate-700 transition-colors bg-white border border-slate-300 rounded-xl shadow-sm hover:bg-slate-50">
          Cancel
        </button>
        <button onClick={onConfirm} className="px-6 py-3 text-sm font-semibold text-white transition-colors bg-red-600 rounded-xl shadow-sm hover:bg-red-700">
          Delete
        </button>
      </div>
    </motion.div>
  </motion.div>
);

// =======================================================================
// Helper component for notification toast
// =======================================================================
const Notification = ({ message, type }) => {
  const getNotificationColor = (type) => {
    switch (type) {
      case 'success': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-blue-500';
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircleIcon className="w-5 h-5" />;
      case 'error': return <InformationCircleIcon className="w-5 h-5" />;
      default: return <InformationCircleIcon className="w-5 h-5" />;
    }
  };

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 50, opacity: 0 }}
      className={`fixed bottom-8 left-1/2 -translate-x-1/2 p-4 rounded-xl shadow-xl flex items-center space-x-2 z-[60] text-white ${getNotificationColor(type)}`}
    >
      {getIcon(type)}
      <p className="text-sm font-medium">{message}</p>
    </motion.div>
  );
};

// =======================================================================
// Main component
// =======================================================================
export default function AdminPackages() {
  const [tourPackages, setTourPackages] = useState([]);
  const [destinations, setDestinations] = useState([]);
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

  // API handler to fetch all tour packages and destinations
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [packagesRes, destinationsRes] = await Promise.all([
        fetch('/api/admin/travel-packages'),
        fetch('/api/admin/destinations')
      ]);

      const packagesData = await packagesRes.json();
      const destinationsData = await destinationsRes.json();
      
      if (!packagesRes.ok || !destinationsRes.ok) {
        throw new Error(packagesData.message || destinationsData.message || 'Failed to fetch data');
      }

      setTourPackages(packagesData);
      setDestinations(destinationsData);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      showNotificationAlert(`Failed to fetch data: ${error.message}`, 'error');
      setTourPackages([]);
      setDestinations([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // API handler for saving a package (CREATE/UPDATE)
  const handleSavePackage = async (formData) => {
    setIsModalOpen(false);
    setIsLoading(true);
    const isEditing = !!formData.id;
    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing ? `/api/admin/travel-packages/${formData.id}` : '/api/admin/travel-packages';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `Failed to ${isEditing ? 'update' : 'create'} tour package`);
      }

      showNotificationAlert(`Package "${formData.name}" ${isEditing ? 'updated' : 'added'} successfully!`, 'success');

    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} package:`, error);
      showNotificationAlert(error.message, 'error');
    } finally {
      // Re-fetch data to reflect changes
      await fetchData();
    }
  };

  // API handler for deleting a package
  const confirmDelete = async () => {
    if (!packageToDelete) return;

    const id = packageToDelete;
    setPackageToDelete(null); // Close the confirmation modal
    setIsLoading(true);

    try {
      const response = await fetch(`/api/admin/travel-packages/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete tour package');
      }

      showNotificationAlert('Package deleted successfully!', 'success');
      
    } catch (error) {
      console.error('Error deleting package:', error);
      showNotificationAlert(error.message, 'error');
    } finally {
      // Re-fetch data to reflect changes
      await fetchData();
    }
  };

  const openAddModal = () => {
    setCurrentPackage(null);
    setIsModalOpen(true);
  };

  const openEditModal = (pkg) => {
    setCurrentPackage(pkg);
    setIsModalOpen(true);
  };

  const handleDeletePackage = (id) => {
    setPackageToDelete(id);
  };

  return (
    <div className="min-h-screen p-4 sm:p-8 bg-slate-50 font-inter">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 text-4xl sm:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600"
      >
        Manage Tour Packages
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-8"
      >
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <p className="max-w-2xl text-slate-600">
            Create, edit, and delete travel packages and tours to showcase on your platform.
          </p>
          <motion.button
            onClick={openAddModal}
            className="flex items-center space-x-2 bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <PlusCircleIcon className="w-5 h-5" />
            <span>Add New Package</span>
          </motion.button>
        </div>
      </motion.div>

      <div className="p-4 sm:p-8 bg-white shadow-2xl rounded-3xl">
        <h2 className="mb-8 text-3xl font-bold text-slate-900">All Tour Packages</h2>
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-80 animate-pulse rounded-3xl bg-slate-200"></div>
              ))}
            </motion.div>
          ) : tourPackages.length > 0 ? (
            <motion.div
              key="packages-list"
              className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              <AnimatePresence>
                {tourPackages.map((pkg) => (
                  <TourPackageCard
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
              className="flex flex-col items-center justify-center p-12 text-center text-slate-500 bg-slate-50 rounded-2xl"
            >
              <BriefcaseIcon className="w-16 h-16 text-slate-300" />
              <p className="mt-4 text-xl font-medium">No tour packages found.</p>
              <p className="mt-2 text-sm text-slate-400">Add your first package to get started.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <TourPackageModal
            pkg={currentPackage}
            onSave={handleSavePackage}
            onClose={() => setIsModalOpen(false)}
            destinations={destinations}
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
          <Notification
            message={showNotification.message}
            type={showNotification.type}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
