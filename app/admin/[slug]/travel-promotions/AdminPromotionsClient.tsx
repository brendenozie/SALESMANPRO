"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  TagIcon, 
  PlusIcon, 
  PencilSquareIcon, 
  TrashIcon, 
  CalendarDaysIcon,
  CurrencyDollarIcon,
  TicketIcon
} from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmationModal from '@/components/ConfirmationModal';
import PromotionModal, { PromotionData } from './PromotionModal';
import toast from 'react-hot-toast';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';

// Accessible status styling for both light and dark backgrounds
const getStatusClasses = (status: PromotionData['status']) => {
  switch (status) {
    case 'ACTIVE': 
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20';
    case 'SCHEDULED': 
      return 'bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-500/20';
    case 'EXPIRED': 
      return 'bg-rose-100 text-rose-800 dark:bg-rose-500/10 dark:text-rose-400 border-rose-200 dark:border-rose-500/20';
    case 'DRAFT': 
      return 'bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-500/20';
    default: 
      return 'bg-slate-100 text-slate-800 dark:bg-slate-500/10 dark:text-slate-400 border-slate-200 dark:border-slate-500/20';
  }
};

const PromotionCard: React.FC<{ 
  promo: PromotionData, 
  onEdit: (p: PromotionData) => void, 
  onDelete: (p: PromotionData) => void 
}> = ({ promo, onEdit, onDelete }) => (
  <motion.div
    layout
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    transition={{ duration: 0.3 }}
    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md transition-all duration-300 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900/60 dark:backdrop-blur-md"
  >
    {promo.imageUrl && (
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src={promo.imageUrl}
          alt={promo.name}
          className="h-full w-full object-cover opacity-[0.04] transition-transform duration-500 group-hover:scale-105 dark:opacity-10"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent dark:from-slate-900" />
      </div>
    )}

    <div className="relative z-10 p-5 md:p-6 flex flex-col h-full grow">
      <div className="flex items-center justify-between gap-4 mb-4">
        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${getStatusClasses(promo.status)}`}>
          {promo.status}
        </span>
        
        <div className="flex items-center space-x-1.5 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={() => onEdit(promo)}
            className="p-2 rounded-lg text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
            title="Edit Promotion"
          >
            <PencilSquareIcon className="h-4 w-4 md:h-5 md:w-5" />
          </button>
          <button
            onClick={() => onDelete(promo)}
            className="p-2 rounded-lg text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
            title="Delete Promotion"
          >
            <TrashIcon className="h-4 w-4 md:h-5 md:w-5" />
          </button>
        </div>
      </div>

      <div className="grow">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white line-clamp-1 mb-1.5">
          {promo.name}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-5">
          {promo.description || 'No description provided.'}
        </p>
      </div>
      
      <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800/60 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300">
            <TagIcon className="h-4 w-4 text-slate-400" />
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">Code</span>
          </div>
          <span className="font-mono text-sm font-bold bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded text-indigo-600 dark:text-yellow-400">
            {promo.code}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300">
            {promo.discountType === 'PERCENTAGE' ? (
              <TicketIcon className="h-4 w-4 text-emerald-500" />
            ) : (
              <CurrencyDollarIcon className="h-4 w-4 text-emerald-500" />
            )}
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">Value</span>
          </div>
          <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
            {promo.discountType === 'PERCENTAGE' ? `${promo.discount}%` : `$${promo.discount}`}
          </span>
        </div>

        <div className="flex items-center justify-between pt-1 text-xs text-slate-400 dark:text-slate-500">
          <div className="flex items-center space-x-1">
            <CalendarDaysIcon className="h-3.5 w-3.5" />
            <span>Validity</span>
          </div>
          <span className="font-medium text-slate-600 dark:text-slate-400">
            {promo.startDate} – {promo.endDate}
          </span>
        </div>
      </div>
    </div>
  </motion.div>
);

interface AdminPromotionsClientProps {
  companyId: string;
  slug: string;
}

export default function AdminPromotionsClient({ companyId, slug }: AdminPromotionsClientProps) {
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
      const response = await fetch(
        `${apiBaseUrl}/admin/promotion-discount?companyId=${companyId}`,
        { method: 'GET', headers: { 'Content-Type': 'application/json', 'Credentials': 'include' } }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: PromotionData[] = (await response.json()).data || [];
      setPromotions(data);
    } catch (err: any) {
      setError(err.message);
      console.error("Failed to fetch promotions:", err);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

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
      const response = await fetch(`${apiBaseUrl}/admin/promotion-discount/${promotionToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'Credentials': 'include' },
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
    <div className="min-h-screen bg-slate-50 transition-colors duration-300 dark:bg-slate-950 p-4 sm:p-6 md:p-10 text-slate-800 dark:text-slate-100 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <header className="text-center md:text-left space-y-3">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white"
          >
            Promotions &amp; Deals
          </motion.h1>
          <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 max-w-2xl">
            Efficiently create, edit, and manage dynamic promotions and discount codes for your virtual tours and products.
          </p>
        </header>

        {/* Dashboard Canvas block */}
        <main className="bg-white border border-slate-200 dark:border-slate-800/80 rounded-2xl sm:rounded-3xl shadow-sm dark:shadow-2xl p-4 sm:p-6 md:p-8 dark:bg-slate-900/40 backdrop-blur-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8 pb-5 border-b border-slate-100 dark:border-slate-800/60">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Active Catalog</h2>
              <p className="text-xs text-slate-400 dark:text-slate-500">Live system sync</p>
            </div>
            
            <button
              onClick={openAddModal}
              className="inline-flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-medium py-2.5 px-4 md:px-5 rounded-xl shadow-sm transition-all duration-200 text-sm active:scale-95"
            >
              <PlusIcon className="h-4 w-4 stroke-2" />
              <span>New Promotion</span>
            </button>
          </div>

          {/* Loading View Skeleton */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-slate-100 dark:bg-slate-800 rounded-2xl h-56 animate-pulse border border-slate-200/50 dark:border-transparent" />
              ))}
            </div>
          )}

          {/* Error Alert Display */}
          {error && (
            <div className="bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 p-5 rounded-xl border border-rose-200 dark:border-rose-900/40 max-w-xl mx-auto text-center space-y-2">
              <p className="font-semibold">Unable to map remote dashboard state</p>
              <p className="text-xs opacity-90 font-mono">{error}</p>
            </div>
          )}

          {/* Cards Interface Grid */}
          {!loading && !error && (
            <AnimatePresence mode="popLayout">
              {promotions.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-16 px-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-950/30"
                >
                  <p className="text-slate-400 dark:text-slate-500 text-base font-medium">
                    No promotions found. Click &apos;New Promotion&apos; to launch catalog additions. 🚀
                  </p>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
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
            </AnimatePresence>
          )}
        </main>
      </div>

      <PromotionModal
        isOpen={isPromotionModalOpen}
        onClose={() => setIsPromotionModalOpen(false)}
        onSave={handleSavePromotion}
        promotion={currentPromotion}
        slug={slug}
      />

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