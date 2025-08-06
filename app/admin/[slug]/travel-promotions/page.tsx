// app/[adminSlug]/promotions/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  TagIcon, PlusCircleIcon, PencilIcon, TrashIcon, CalendarDaysIcon, CurrencyDollarIcon
} from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';
import ConfirmationModal from '@/components/ConfirmationModal'; // Re-use this
import PromotionModal from './PromotionModal'; // New PromotionModal component

// Define the PromotionData interface to match the API response
interface PromotionData {
  id: string;
  name: string;
  code: string;
  discount: string; // Formatted string for display
  discountValue: number; // Raw value for logic
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT'; // Enum value
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  status: 'ACTIVE' | 'SCHEDULED' | 'EXPIRED' | 'DRAFT'; // Enum value
  description?: string;
  imageUrl?: string;
}

export default function AdminPromotionsPage() {
  const params = useParams();
  const adminSlug = params.adminSlug as string;

  const [promotions, setPromotions] = useState<PromotionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPromotionModalOpen, setIsPromotionModalOpen] = useState(false);
  const [currentPromotion, setCurrentPromotion] = useState<PromotionData | null>(null); // For edit mode
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [promotionToDelete, setPromotionToDelete] = useState<PromotionData | null>(null);

  // Function to fetch promotions from the API
  const fetchPromotions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/${adminSlug}/promotions`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: PromotionData[] = await response.json();
      setPromotions(data);
    } catch (err: any) {
      setError(err.message);
      console.error("Failed to fetch promotions:", err);
    } finally {
      setLoading(false);
    }
  }, [adminSlug]);

  // Fetch promotions on component mount
  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  const openAddModal = () => {
    setCurrentPromotion(null); // Clear current promotion for add mode
    setIsPromotionModalOpen(true);
  };

  const openEditModal = (promo: PromotionData) => {
    setCurrentPromotion(promo);
    setIsPromotionModalOpen(true);
  };

  const handleSavePromotion = (savedPromotion: PromotionData) => {
    if (currentPromotion) {
      // If editing, update the existing promotion in the list
      setPromotions(prevPromos => prevPromos.map(p => p.id === savedPromotion.id ? savedPromotion : p));
      alert(`Promotion "${savedPromotion.name}" updated successfully.`);
    } else {
      // If adding, prepend the new promotion to the list
      setPromotions(prevPromos => [savedPromotion, ...prevPromos]);
      alert(`Promotion "${savedPromotion.name}" created successfully.`);
    }
    setIsPromotionModalOpen(false);
  };

  const handleDeletePromotionClick = (promo: PromotionData) => {
    setPromotionToDelete(promo);
    setIsConfirmModalOpen(true);
  };

  const confirmDeletePromotion = async () => {
    if (!promotionToDelete) return;

    setIsConfirmModalOpen(false); // Close modal immediately
    setLoading(true); // Show loading state for deletion
    setError(null);

    try {
      const response = await fetch(`/api/admin/${adminSlug}/promotions/${promotionToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to delete promotion "${promotionToDelete.name}".`);
      }

      // If deletion is successful, update the local state
      setPromotions(prevPromos => prevPromos.filter(p => p.id !== promotionToDelete.id));
      alert(`Promotion "${promotionToDelete.name}" deleted successfully.`);
    } catch (err: any) {
      setError(err.message);
      alert(`Error deleting promotion: ${err.message}`);
    } finally {
      setLoading(false);
      setPromotionToDelete(null); // Clear promotion to delete
    }
  };

  const getStatusColor = (status: PromotionData['status']) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'SCHEDULED': return 'bg-blue-100 text-blue-800';
      case 'EXPIRED': return 'bg-gray-100 text-gray-800';
      case 'DRAFT': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-800 p-8 text-white font-sans">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-5xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-600 mb-12 drop-shadow-lg"
      >
        Manage Dynamic Promotions & Deals
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-gray-800 rounded-3xl shadow-2xl p-8 mb-12 border border-gray-700"
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-white">All Promotions</h2>
          <motion.button
            onClick={openAddModal}
            className="flex items-center space-x-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <PlusCircleIcon className="h-6 w-6" />
            <span>Create New Promotion</span>
          </motion.button>
        </div>

        {loading && (
          <div className="text-center py-20">
            <svg className="animate-spin h-10 w-10 text-pink-400 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-xl text-gray-400">Loading promotions...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-900 bg-opacity-50 text-red-200 p-6 rounded-lg text-center mb-8 border border-red-700">
            <p className="font-bold text-lg">Error loading promotions:</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {!loading && !error && promotions.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-gray-400">No promotions found. Start by creating one!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Discount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Start Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">End Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-gray-900 divide-y divide-gray-700">
                {promotions.map((promo) => (
                  <tr key={promo.id} className="hover:bg-gray-800 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{promo.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{promo.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{promo.code}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-400 font-semibold">{promo.discount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{promo.discountType.replace('_', ' ')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 flex items-center">
                      <CalendarDaysIcon className="h-4 w-4 mr-1 text-purple-400" />
                      {promo.startDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 flex items-center">
                      <CalendarDaysIcon className="h-4 w-4 mr-1 text-purple-400" />
                      {promo.endDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(promo.status)}`}>
                        {promo.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <motion.button
                          onClick={() => openEditModal(promo)}
                          className="p-2 rounded-full bg-gray-700 text-indigo-400 hover:bg-indigo-600 hover:text-white transition-colors"
                          title="Edit Promotion"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <PencilIcon className="h-5 w-5" />
                        </motion.button>
                        <motion.button
                          onClick={() => handleDeletePromotionClick(promo)}
                          className="p-2 rounded-full bg-gray-700 text-red-400 hover:bg-red-600 hover:text-white transition-colors"
                          title="Delete Promotion"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <TrashIcon className="h-5 w-5" />
                        </motion.button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Add/Edit Promotion Modal */}
      <PromotionModal
        isOpen={isPromotionModalOpen}
        onClose={() => setIsPromotionModalOpen(false)}
        onSave={handleSavePromotion}
        promotion={currentPromotion}
        adminSlug={adminSlug}
      />

      {/* Confirmation Modal for Deletion */}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmDeletePromotion}
        title="Confirm Deletion"
        message={`Are you sure you want to delete promotion "${promotionToDelete?.name || 'N/A'}"? This action cannot be undone.`}
        confirmText="Delete"
      />
    </div>
  );
}
