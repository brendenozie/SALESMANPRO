'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  TrophyIcon,
  PlusCircleIcon,
  TrashIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  StarIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { ProductForm } from '@/types/typings';

interface PricingTier {
  name: string;
  price: number;
  isFeatured?: boolean;
  features: string[];
  duration?: string;
  description?: string;
}

// interface ProductPricingAndTiersProps {
//   pricingTiers: PricingTier[];
//   setFormData: (name: string, value: any) => void;
// }
interface ProductPricingAndTiersProps {
  formData: ProductForm;
  setFormData: <K extends keyof ProductForm>(name: K, value: ProductForm[K]) => void;
}

export default function ProductPricingAndTiers({
  formData,
  setFormData,
}: ProductPricingAndTiersProps) {
  const [open, setOpen] = useState(true);
  const pricingTiers = formData.pricingTiers || [];

  const handleAddPricingTier = useCallback(() => {
    const currentTiers = pricingTiers || [];
    const newTier: PricingTier = {
      name: '',
      price: 0,
      features: [],
      isFeatured: false,
    };
    setFormData('pricingTiers', [...currentTiers, newTier]);
  }, [pricingTiers, setFormData]);

  const handleUpdatePricingTier = useCallback(
    (index: number, field: keyof PricingTier, value: any) => {
      const updatedTiers = [...(pricingTiers || [])];
      if (!updatedTiers[index]) return;

      // updatedTiers[index][field] = value;
      updatedTiers[index] = { ...updatedTiers[index], [field]: value } as PricingTier; 

      setFormData('pricingTiers', updatedTiers);
    },
    [pricingTiers, setFormData]
  );

  const handleRemovePricingTier = useCallback(
    (index: number) => {
      const updatedTiers = pricingTiers.filter((_, i) => i !== index);
      setFormData('pricingTiers', updatedTiers);
    },
    [pricingTiers, setFormData]
  );

  useEffect(() => {
    if (!pricingTiers || pricingTiers.length === 0) {
      handleAddPricingTier();
    }
  }, [pricingTiers, handleAddPricingTier]);

  return (
    <section className="max-w-4xl mx-auto overflow-hidden rounded-2xl shadow-xl border border-gray-200">
      {/* Toggle Header */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex justify-between items-center px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-t-2xl"
      >
        <div className="flex items-center space-x-3">
          <TrophyIcon className="h-6 w-6" />
          <h3 className="text-lg font-semibold">Pricing & Tiers</h3>
        </div>
        {open ? (
          <ChevronUpIcon className="h-5 w-5" />
        ) : (
          <ChevronDownIcon className="h-5 w-5" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="px-6 py-6 bg-white space-y-6"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-xl font-semibold text-gray-800">
                Pricing Tiers / Packages
              </h4>
              <button
                type="button"
                onClick={handleAddPricingTier}
                className="inline-flex items-center px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium shadow transition"
              >
                <PlusCircleIcon className="h-5 w-5 mr-2" />
                Add Tier
              </button>
            </div>

            {/* Tiers */}
            <div className="space-y-6">
              {pricingTiers && pricingTiers.map((tier, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className={`relative p-6 rounded-xl border shadow-sm ${
                    tier.isFeatured
                      ? 'border-blue-500 ring-2 ring-blue-300'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => handleRemovePricingTier(index)}
                    className="absolute top-3 right-3 text-red-500 hover:text-red-700 p-1 rounded-full bg-red-50 hover:bg-red-100"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>

                  {/* Tier title */}
                  <div className="flex items-center gap-2 mb-4">
                    <h5 className="text-lg font-bold text-gray-800">
                      Tier #{index + 1}
                    </h5>
                    {tier.isFeatured && (
                      <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 font-medium">
                        <StarIcon className="h-4 w-4" />
                        Featured
                      </span>
                    )}
                  </div>

                  {/* Inputs */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <input
                      type="text"
                      value={tier.name}
                      onChange={(e) =>
                        handleUpdatePricingTier(index, 'name', e.target.value)
                      }
                      placeholder="Tier Name"
                      className="p-2 border rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                    <input
                      type="number"
                      value={tier.price}
                      onChange={(e) =>
                        handleUpdatePricingTier(index, 'price', +e.target.value)
                      }
                      placeholder="Price"
                      className="p-2 border rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                    <input
                      type="text"
                      value={tier.duration || ''}
                      onChange={(e) =>
                        handleUpdatePricingTier(index, 'duration', e.target.value)
                      }
                      placeholder="Duration"
                      className="p-2 border rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Featured Checkbox */}
                  <label className="flex items-center gap-2 mb-3">
                    <input
                      type="checkbox"
                      checked={!!tier.isFeatured}
                      onChange={(e) =>
                        handleUpdatePricingTier(
                          index,
                          'isFeatured',
                          e.target.checked
                        )
                      }
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="text-sm">Mark as Featured</span>
                  </label>

                  {/* Description */}
                  <textarea
                    rows={2}
                    value={tier.description || ''}
                    onChange={(e) =>
                      handleUpdatePricingTier(
                        index,
                        'description',
                        e.target.value
                      )
                    }
                    placeholder="Tier description..."
                    className="w-full p-2 border rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                  />

                  {/* Features as Tags */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Features
                    </label>

                    <div className="flex flex-wrap gap-2 mb-2">
                      {tier.features && tier.features.map((feature : string, i: number) => (
                        <span
                          key={i}
                          className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs"
                        >
                          {feature}
                          <button
                            type="button"
                            onClick={() => {
                              const updated = tier.features.filter(
                                (_: string, idx: number) => idx !== i
                              );
                              handleUpdatePricingTier(index, 'features', updated);
                            }}
                          >
                            <XMarkIcon className="h-4 w-4 text-blue-600 hover:text-blue-800" />
                          </button>
                        </span>
                      ))}
                    </div>

                    <input
                      type="text"
                      placeholder="Type a feature and press Enter"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                          e.preventDefault();
                          const newFeature = e.currentTarget.value.trim();
                          handleUpdatePricingTier(index, 'features', [
                            ...tier.features,
                            newFeature,
                          ]);
                          e.currentTarget.value = '';
                        }
                      }}
                      className="w-full p-2 border rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
