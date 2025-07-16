// AdminPackages.jsx
"use client";

import React, { useState } from 'react';
import {
  BriefcaseIcon, PlusCircleIcon, PencilIcon, TrashIcon, ClockIcon, CurrencyDollarIcon, MapPinIcon
} from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';

// Dummy Data
const initialPackages = [
  { id: 'PKG001', name: 'Luxury Bali Honeymoon', destination: 'Bali', duration: '7 Days', price: 2500, status: 'Active', imageUrl: 'https://images.unsplash.com/photo-1542362543-b2611e9f16d7?q=80&w=2940&auto=format&fit=crop' },
  { id: 'PKG002', name: 'Alaskan Glacier Cruise', destination: 'Alaska', duration: '10 Days', price: 4500, status: 'Active', imageUrl: 'https://images.unsplash.com/photo-1506953823976-5271ccbfb894?q=80&w=2940&auto=format&fit=crop' },
  { id: 'PKG003', name: 'Romantic Parisian Getaway', destination: 'Paris', duration: '5 Days', price: 1500, status: 'Draft', imageUrl: 'https://images.unsplash.com/photo-1502602898662-a318aa667858?q=80&w=2940&auto=format&fit=crop' },
  { id: 'PKG004', name: 'Serengeti Wildlife Safari', destination: 'Serengeti', duration: '8 Days', price: 5000, status: 'Active', imageUrl: 'https://images.unsplash.com/photo-1534515510-410a0e980362?q=80&w=2940&auto=format&fit=crop' },
];

export default function AdminPackages() {
  const [packages, setPackages] = useState(initialPackages);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPackage, setCurrentPackage] = useState(null); // For edit mode

  const openAddModal = () => {
    setCurrentPackage(null);
    setIsModalOpen(true);
  };

  const openEditModal = (pkg) => {
    setCurrentPackage(pkg);
    setIsModalOpen(true);
  };

  const handleSavePackage = (formData) => {
    if (currentPackage) {
      // Edit existing
      setPackages(packages.map(p => p.id === formData.id ? formData : p));
      alert(`Package ${formData.name} updated.`);
    } else {
      // Add new
      const newId = `PKG${String(packages.length + 1).padStart(3, '0')}`;
      setPackages([...packages, { ...formData, id: newId }]);
      alert(`Package ${formData.name} added.`);
    }
    setIsModalOpen(false);
  };

  const handleDeletePackage = (id) => {
    if (confirm(`Are you sure you want to delete package ${id}?`)) {
      setPackages(packages.filter(p => p.id !== id));
      alert(`Package ${id} deleted.`);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Draft': return 'bg-yellow-100 text-yellow-800';
      case 'Archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
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
        Manage Packages & Tours
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white rounded-xl shadow-md p-6 mb-8"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">All Packages</h2>
          <motion.button
            onClick={openAddModal}
            className="flex items-center space-x-2 bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors duration-200"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <PlusCircleIcon className="h-5 w-5" />
            <span>Add New Package</span>
          </motion.button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destination</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {packages.length > 0 ? (
                packages.map((pkg) => (
                  <tr key={pkg.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{pkg.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="relative w-16 h-10 rounded-md overflow-hidden">
                        <Image src={pkg.imageUrl} alt={pkg.name} layout="fill" objectFit="cover" />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{pkg.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{pkg.destination}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{pkg.duration}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${pkg.price.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(pkg.status)}`}>
                        {pkg.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <motion.button
                          onClick={() => openEditModal(pkg)}
                          className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-50 transition"
                          title="Edit"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <PencilIcon className="h-5 w-5" />
                        </motion.button>
                        <motion.button
                          onClick={() => handleDeletePackage(pkg.id)}
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
                  <td colSpan="8" className="px-6 py-4 text-center text-gray-500">No packages found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Add/Edit Package Modal */}
      {isModalOpen && (
        <PackageModal
          pkg={currentPackage}
          onSave={handleSavePackage}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}

// PackageModal.jsx (Internal Component for Add/Edit)
function PackageModal({ pkg, onSave, onClose }) {
  const [name, setName] = useState(pkg?.name || '');
  const [destination, setDestination] = useState(pkg?.destination || '');
  const [duration, setDuration] = useState(pkg?.duration || '');
  const [price, setPrice] = useState(pkg?.price || '');
  const [status, setStatus] = useState(pkg?.status || 'Draft');
  const [imageUrl, setImageUrl] = useState(pkg?.imageUrl || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      id: pkg?.id,
      name,
      destination,
      duration,
      price: Number(price),
      status,
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
          {pkg ? 'Edit Package' : 'Add New Package'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="packageName" className="block text-sm font-medium text-gray-700">Package Name</label>
            <input
              type="text"
              id="packageName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="packageDestination" className="block text-sm font-medium text-gray-700">Destination</label>
            <input
              type="text"
              id="packageDestination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="packageDuration" className="block text-sm font-medium text-gray-700">Duration (e.g., "7 Days")</label>
            <input
              type="text"
              id="packageDuration"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="packagePrice" className="block text-sm font-medium text-gray-700">Price</label>
            <input
              type="number"
              id="packagePrice"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="packageStatus" className="block text-sm font-medium text-gray-700">Status</label>
            <select
              id="packageStatus"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="Active">Active</option>
              <option value="Draft">Draft</option>
              <option value="Archived">Archived</option>
            </select>
          </div>
          <div>
            <label htmlFor="packageImageUrl" className="block text-sm font-medium text-gray-700">Image URL</label>
            <input
              type="url"
              id="packageImageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
            {imageUrl && (
              <div className="mt-2 text-center">
                <Image src={imageUrl} alt="Preview" width={100} height={60} objectFit="contain" className="rounded-md" />
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
              {pkg ? 'Save Changes' : 'Add Package'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}