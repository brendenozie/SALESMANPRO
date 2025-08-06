// components/PromotionModal.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';

// Define the PromotionData interface to match the expected API response
interface PromotionData {
  id?: string; // Optional for new promotions
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

interface PromotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (promo: PromotionData) => void;
  promotion?: PromotionData | null; // Promotion data for editing, null for adding
  adminSlug: string;
}

const DISCOUNT_TYPES = ['PERCENTAGE', 'FIXED_AMOUNT'];
const PROMOTION_STATUSES = ['ACTIVE', 'SCHEDULED', 'EXPIRED', 'DRAFT'];

const PromotionModal: React.FC<PromotionModalProps> = ({ isOpen, onClose, onSave, promotion, adminSlug }) => {
  const [name, setName] = useState(promotion?.name || '');
  const [code, setCode] = useState(promotion?.code || '');
  const [discountValue, setDiscountValue] = useState(promotion?.discountValue || 0);
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED_AMOUNT'>(promotion?.discountType || 'PERCENTAGE');
  const [startDate, setStartDate] = useState(promotion?.startDate || '');
  const [endDate, setEndDate] = useState(promotion?.endDate || '');
  const [status, setStatus] = useState<'ACTIVE' | 'SCHEDULED' | 'EXPIRED' | 'DRAFT'>(promotion?.status || 'SCHEDULED');
  const [description, setDescription] = useState(promotion?.description || '');
  const [imageUrl, setImageUrl] = useState(promotion?.imageUrl || '');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (promotion) {
      setName(promotion.name);
      setCode(promotion.code);
      setDiscountValue(promotion.discountValue);
      setDiscountType(promotion.discountType);
      setStartDate(promotion.startDate);
      setEndDate(promotion.endDate);
      setStatus(promotion.status);
      setDescription(promotion.description || '');
      setImageUrl(promotion.imageUrl || '');
    } else {
      // Reset form for new promotion
      setName('');
      setCode('');
      setDiscountValue(0);
      setDiscountType('PERCENTAGE');
      setStartDate('');
      setEndDate('');
      setStatus('SCHEDULED');
      setDescription('');
      setImageUrl('');
    }
  }, [promotion]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Basic client-side validation
    if (!name || !code || discountValue === undefined || !discountType || !startDate || !endDate || !status) {
      setError('Please fill in all required fields.');
      setLoading(false);
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError('Start date cannot be after end date.');
      setLoading(false);
      return;
    }

    const method = promotion ? 'PUT' : 'POST';
    const url = promotion ? `/api/admin/${adminSlug}/promotions/${promotion.id}` : `/api/admin/${adminSlug}/promotions`;

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          code,
          discountValue: Number(discountValue),
          discountType,
          startDate,
          endDate,
          status,
          description: description || null,
          imageUrl: imageUrl || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${promotion ? 'update' : 'create'} promotion.`);
      }

      const savedPromotion: PromotionData = await response.json();
      onSave(savedPromotion); // Pass the saved promotion data back to the parent
      onClose(); // Close the modal
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md relative text-gray-900"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <XMarkIcon className="w-7 h-7" />
          </button>
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            {promotion ? 'Edit Promotion' : 'Create New Promotion'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Promotion Name</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">Discount Code</label>
              <input
                type="text"
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())} // Auto-uppercase code
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="discountValue" className="block text-sm font-medium text-gray-700 mb-1">Discount Value</label>
                <input
                  type="number"
                  id="discountValue"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(Number(e.target.value))}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                  min="0"
                  step={discountType === 'PERCENTAGE' ? "0.01" : "1"} // Allow decimals for percentage
                />
              </div>
              <div>
                <label htmlFor="discountType" className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
                <select
                  id="discountType"
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value as 'PERCENTAGE' | 'FIXED_AMOUNT')}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  {DISCOUNT_TYPES.map((type) => (
                    <option key={type} value={type}>{type.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as 'ACTIVE' | 'SCHEDULED' | 'EXPIRED' | 'DRAFT')}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                {PROMOTION_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
              ></textarea>
            </div>
            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">Image URL (Optional)</label>
              <input
                type="url"
                id="imageUrl"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
              />
              {imageUrl && (
                <div className="mt-2 text-center">
                  <img src={imageUrl} alt="Preview" className="h-24 w-auto object-contain rounded-md mx-auto" />
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-100 text-red-800 px-4 py-2 rounded-lg text-sm text-center">
                {error}
              </div>
            )}
            <div className="flex justify-end space-x-3 mt-6">
              <motion.button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={loading}
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  promotion ? 'Save Changes' : 'Create Promotion'
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PromotionModal;
