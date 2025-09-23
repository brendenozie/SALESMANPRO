"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';
import Image from 'next/image';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => `${src}?w=${width}&q=${quality || 75}`;

// Define the PromotionData interface
export interface PromotionData {
  id?: string;
  name: string;
  code: string;
  discount: string;
  discountValue: number;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'SCHEDULED' | 'EXPIRED' | 'DRAFT';
  description?: string;
  imageUrl?: string;
}

interface PromotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (promo: PromotionData) => void;
  promotion?: PromotionData | null;
  slug: string;
}

const DISCOUNT_TYPES = ['PERCENTAGE', 'FIXED_AMOUNT'];
const PROMOTION_STATUSES = ['ACTIVE', 'SCHEDULED', 'EXPIRED', 'DRAFT'];

const PromotionModal: React.FC<PromotionModalProps> = ({ isOpen, onClose, onSave, promotion, slug }) => {
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
  const [formError, setFormError] = useState<string | null>(null);

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
    setFormError(null);
  }, [promotion, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFormError(null);

    if (!name || !code || discountValue === undefined || !discountType || !startDate || !endDate || !status) {
      setFormError('Please fill in all required fields.');
      setLoading(false);
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setFormError('Start date cannot be after end date.');
      setLoading(false);
      return;
    }

    const method = promotion ? 'PUT' : 'POST';
    const url = promotion ? `/api/admin/promotion-discount/${promotion.id}` : `/api/admin/promotion-discount?companyId=${slug}`;
    
    const toastId = toast.loading(`${promotion ? 'Updating' : 'Creating'} promotion...`);

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
      onSave(savedPromotion);
      onClose();
      toast.success(`Promotion "${savedPromotion.name}" saved successfully!`, { id: toastId });
    } catch (err: any) {
      setFormError(err.message);
      toast.error(`Error: ${err.message}`, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 backdrop-blur-sm bg-black bg-opacity-70 flex items-center justify-center z-[1000] p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-gray-800 text-white  max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl p-8 w-full max-w-lg relative border border-gray-700"
          initial={{ scale: 0.9, y: -50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 50 }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
          onClick={(e:any) => e.stopPropagation()}
        >
          <motion.button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            aria-label="Close modal"
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
          >
            <XMarkIcon className="w-8 h-8" />
          </motion.button>

          <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-600 mb-8 text-center drop-shadow-md">
            {promotion ? 'Edit Promotion' : 'Create New Promotion'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Promotion Name</label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-gray-700 text-white border border-gray-600 focus:ring-pink-500 focus:border-pink-500 placeholder-gray-500 transition-colors"
                  placeholder="e.g., 'Summer Sale'"
                  required
                />
              </div>
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-300 mb-1">Discount Code</label>
                <input
                  type="text"
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-2 rounded-xl bg-gray-700 text-white border border-gray-600 focus:ring-pink-500 focus:border-pink-500 placeholder-gray-500 transition-colors"
                  placeholder="e.g., 'SUMMER20'"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="discountValue" className="block text-sm font-medium text-gray-300 mb-1">Discount Value</label>
                <input
                  type="number"
                  id="discountValue"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(Number(e.target.value))}
                  className="w-full px-4 py-2 rounded-xl bg-gray-700 text-white border border-gray-600 focus:ring-pink-500 focus:border-pink-500 placeholder-gray-500 transition-colors"
                  required
                  min="0"
                  step={discountType === 'PERCENTAGE' ? "0.01" : "1"}
                  placeholder={discountType === 'PERCENTAGE' ? "e.g., 20.00" : "e.g., 10"}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Discount Type</label>
                <div className="flex bg-gray-700 rounded-xl p-1 border border-gray-600">
                  {DISCOUNT_TYPES.map((type) => (
                    <motion.button
                      key={type}
                      type="button"
                      onClick={() => setDiscountType(type as 'PERCENTAGE' | 'FIXED_AMOUNT')}
                      className={`flex-1 text-center py-2 rounded-lg text-sm font-medium transition-colors ${
                        discountType === type ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-300 hover:bg-gray-600'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {type.replace('_', ' ')}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-300 mb-1">Start Date</label>
                <input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-gray-700 text-white border border-gray-600 focus:ring-pink-500 focus:border-pink-500 placeholder-gray-500 transition-colors"
                  required
                />
              </div>
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-300 mb-1">End Date</label>
                <input
                  type="date"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-gray-700 text-white border border-gray-600 focus:ring-pink-500 focus:border-pink-500 placeholder-gray-500 transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PROMOTION_STATUSES.map((s) => (
                  <motion.button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s as 'ACTIVE' | 'SCHEDULED' | 'EXPIRED' | 'DRAFT')}
                    className={`text-center py-2 rounded-lg text-sm font-medium transition-all ${
                      status === s
                        ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {s}
                  </motion.button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">Description (Optional)</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 rounded-xl bg-gray-700 text-white border border-gray-600 focus:ring-pink-500 focus:border-pink-500 placeholder-gray-500 transition-colors"
                placeholder="Briefly describe the promotion..."
              ></textarea>
            </div>
            
            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-300 mb-1">Image URL (Optional)</label>
              <input
                type="url"
                id="imageUrl"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-gray-700 text-white border border-gray-600 focus:ring-pink-500 focus:border-pink-500 placeholder-gray-500 transition-colors"
                placeholder="https://example.com/promotion_banner.jpg"
              />
              {imageUrl && (
                <div className="mt-4 flex flex-col items-center">
                  <p className="text-sm text-gray-400 mb-2">Image Preview:</p>
                  <div className="relative w-full h-40 rounded-xl overflow-hidden shadow-lg border border-gray-600">
                    <Image
                      src={imageUrl}
                      alt="Preview"
                      loader={loader}
                      layout="fill"
                      objectFit="cover"
                      className="transition-transform duration-300 hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.src = 'https://placehold.co/400x250/E0E7FF/4338CA?text=Image+Error';
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {formError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-900/30 text-red-300 px-4 py-3 rounded-lg text-sm text-center border border-red-700"
              >
                {formError}
              </motion.div>
            )}
            
            <div className="flex flex-col md:flex-row justify-end space-y-3 md:space-y-0 md:space-x-3 mt-6">
              <motion.button
                type="button"
                onClick={onClose}
                className="w-full md:w-auto px-6 py-3 rounded-full text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                className="w-full md:w-auto px-6 py-3 rounded-full text-sm font-medium text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={loading}
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5 text-white mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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