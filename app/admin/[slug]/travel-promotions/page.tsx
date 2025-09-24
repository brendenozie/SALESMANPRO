"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  TagIcon, PlusCircleIcon, PencilIcon, TrashIcon, CalendarDaysIcon,
  CurrencyDollarIcon, 
} from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';
import ConfirmationModal from '@/components/ConfirmationModal';
import PromotionModal, { PromotionData } from './PromotionModal';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { PercentBadgeIcon } from '@heroicons/react/24/outline';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => `${src}?w=${width}&q=${quality || 75}`;

// Define the PromotionData interface


// Function to get the color for the status badge
const getStatusColor = (status: PromotionData['status']) => {
  switch (status) {
    case 'ACTIVE': return 'bg-green-500/20 text-green-300';
    case 'SCHEDULED': return 'bg-blue-500/20 text-blue-300';
    case 'EXPIRED': return 'bg-red-500/20 text-red-300';
    case 'DRAFT': return 'bg-yellow-500/20 text-yellow-300';
    default: return 'bg-gray-500/20 text-gray-300';
  }
};

const PromotionCard: React.FC<{ promo: PromotionData, onEdit: (p: PromotionData) => void, onDelete: (p: PromotionData) => void }> = ({ promo, onEdit, onDelete }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.1 }}
    className="relative bg-gray-800/60 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden transform hover:scale-[1.02] transition-transform duration-300 group"
  >
    {promo.imageUrl && (
      <div className="absolute inset-0 z-0">
        <img
          src={promo.imageUrl}
          alt={promo.name}
          className="w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity duration-300"
        />
      </div>
    )}

    <div className="relative z-10 p-6 flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(promo.status)}`}>
          {promo.status}
        </span>
        <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <motion.button
            onClick={() => onEdit(promo)}
            className="p-2 rounded-full bg-gray-700 text-indigo-400 hover:bg-indigo-600 hover:text-white transition-colors"
            title="Edit Promotion"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <PencilIcon className="h-5 w-5" />
          </motion.button>
          <motion.button
            onClick={() => onDelete(promo)}
            className="p-2 rounded-full bg-gray-700 text-red-400 hover:bg-red-600 hover:text-white transition-colors"
            title="Delete Promotion"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <TrashIcon className="h-5 w-5" />
          </motion.button>
        </div>
      </div>

      <h3 className="text-2xl font-bold text-white mb-2 leading-tight drop-shadow-md">{promo.name}</h3>
      <p className="text-gray-400 text-sm mb-4 line-clamp-2">{promo.description || 'No description provided.'}</p>
      
      <div className="mt-auto space-y-3">
        <div className="flex items-center space-x-2">
          <TagIcon className="h-5 w-5 text-purple-400" />
          <span className="font-mono text-lg font-bold text-yellow-300">{promo.code}</span>
        </div>

        <div className="flex items-center space-x-2">
          {promo.discountType === 'PERCENTAGE' ? (
            <PercentBadgeIcon className="h-5 w-5 text-green-400" />
          ) : (
            <CurrencyDollarIcon className="h-5 w-5 text-green-400" />
          )}
          <span className="text-xl font-bold text-green-400">{promo.discount}</span>
        </div>

        <div className="flex items-center space-x-2 text-gray-400 text-sm">
          <CalendarDaysIcon className="h-5 w-5 text-indigo-400" />
          <span>{promo.startDate}</span>
          <span>-</span>
          <span>{promo.endDate}</span>
        </div>
      </div>
    </div>
  </motion.div>
);

export default function AdminPromotionsPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [promotions, setPromotions] = useState<PromotionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPromotionModalOpen, setIsPromotionModalOpen] = useState(false);
  const [currentPromotion, setCurrentPromotion] = useState<PromotionData | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [promotionToDelete, setPromotionToDelete] = useState<PromotionData | null>(null);

  const fetchPromotions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/promotion-discount?companyId=${slug}`);
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
  }, [slug]);

  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  const openAddModal = () => {
    setCurrentPromotion(null);
    setIsPromotionModalOpen(true);
  };

  const openEditModal = (promo: PromotionData) => {
    setCurrentPromotion(promo);
    setIsPromotionModalOpen(true);
  };

  const handleSavePromotion = (savedPromotion: PromotionData) => {
    if (currentPromotion) {
      setPromotions(prevPromos => prevPromos.map(p => p.id === savedPromotion.id ? savedPromotion : p));
      toast.success(`Promotion "${savedPromotion.name}" updated successfully.`);
    } else {
      setPromotions(prevPromos => [savedPromotion, ...prevPromos]);
      toast.success(`Promotion "${savedPromotion.name}" created successfully.`);
    }
    setIsPromotionModalOpen(false);
  };

  const handleDeletePromotionClick = (promo: PromotionData) => {
    setPromotionToDelete(promo);
    setIsConfirmModalOpen(true);
  };

  const confirmDeletePromotion = async () => {
    if (!promotionToDelete) return;

    setIsConfirmModalOpen(false);
    const toastId = toast.loading(`Deleting promotion "${promotionToDelete.name}"...`);

    try {
      const response = await fetch(`/api/admin/promotion-discount/${promotionToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to delete promotion "${promotionToDelete.name}".`);
      }

      setPromotions(prevPromos => prevPromos.filter(p => p.id !== promotionToDelete.id));
      toast.success(`Promotion "${promotionToDelete.name}" deleted successfully.`, { id: toastId });
    } catch (err: any) {
      setError(err.message);
      toast.error(`Error: ${err.message}`, { id: toastId });
    } finally {
      setPromotionToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-950 to-gray-900 p-8 text-white font-sans">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-5xl md:text-6xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-600 mb-6 drop-shadow-lg"
      >
        Promotions & Deals
      </motion.h1>

      <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
        Efficiently create, edit, and manage dynamic promotions and discount codes for your virtual tours and products.
      </p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-gray-800/50 rounded-3xl shadow-2xl p-8 mb-12 border border-gray-700 backdrop-blur-md"
      >
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-4 md:mb-0">All Promotions</h2>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-700 rounded-2xl h-60 shadow-lg"></div>
            ))}
          </div>
        )}

        {error && (
          <div className="bg-red-900/50 text-red-300 p-6 rounded-lg text-center mb-8 border border-red-700">
            <p className="font-bold text-lg">Error loading promotions:</p>
            <p className="text-sm">{error}</p>
            <p className="mt-2 text-xs">Please try refreshing the page or contact support.</p>
          </div>
        )}

        {!loading && !error && promotions.length === 0 ? (
          <div className="text-center py-20 bg-gray-700/30 rounded-2xl border border-gray-600">
            <p className="text-xl text-gray-400">No promotions found. Click 'Create New Promotion' to get started! 🚀</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {promotions.map((promo) => (
              <PromotionCard
                key={promo.id}
                promo={promo}
                onEdit={openEditModal}
                onDelete={handleDeletePromotionClick}
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* Add/Edit Promotion Modal */}
      <PromotionModal
        isOpen={isPromotionModalOpen}
        onClose={() => setIsPromotionModalOpen(false)}
        onSave={handleSavePromotion}
        promotion={currentPromotion}
        slug={slug}
      />

      {/* Confirmation Modal for Deletion */}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmDeletePromotion}
        title="Confirm Deletion"
        message={`Are you sure you want to delete promotion "${promotionToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
      />
    </div>
  );
}