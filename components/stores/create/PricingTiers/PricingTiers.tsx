'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  TrophyIcon,
  PlusCircleIcon,
  TrashIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { ProductForm } from '@/components/AddProductModal';
// import { ProductForm } from '@/types/typings'; // Assuming ProductForm is the correct type for your main form data

interface PricingTier {
  name: string;
  price: number;
  isFeatured?: boolean;
  features: string[];
  duration?: string;
  description?: string;
}

interface ProductPricingAndTiersProps {
  formData: ProductForm; // Use the actual type for the entire form data
  setFormData: (name: string, value: any) => void; // Matches the signature from useProductForm
}

export default function ProductPricingAndTiers({
  formData,
  setFormData, // Renamed from setFormData
}: ProductPricingAndTiersProps) {
  const [open, setOpen] = useState(true);

  // Memoize handler functions using useCallback
  const handleAddPricingTier = useCallback(() => {
    const currentTiers = formData.pricingTiers || [];
    const newTier: PricingTier = { name: '', price: 0, features: [], isFeatured: false }; // Ensure default for isFeatured
    setFormData('pricingTiers', [...currentTiers, newTier]);
  }, [formData.pricingTiers, setFormData]);

  const handleUpdatePricingTier = useCallback(
    (
      index: number,
      field: keyof PricingTier,
      value: string | number | boolean | string[]
    ) => {
      const currentTiers = formData.pricingTiers || [];
      // Create a shallow copy to ensure immutability
      const updatedTiers = [...currentTiers];

      if (!updatedTiers[index]) {
        console.warn(`Attempted to update non-existent tier at index ${index}. This might indicate a timing issue.`);
        return;
      }

      // Handle 'features' field specifically: convert comma-separated string to array
      if (field === 'features' && typeof value === 'string') {
        updatedTiers[index] = {
          ...updatedTiers[index],
          [field]: value.split(',').map((f) => f.trim()).filter(Boolean),
        } as PricingTier; // Type assertion for safety
      } else {
        // For other fields, directly update the property
        updatedTiers[index] = { ...updatedTiers[index], [field]: value } as PricingTier; // Type assertion
      }
      setFormData('pricingTiers', updatedTiers); // Update the parent state
    },
    [formData.pricingTiers, setFormData]
  );

  const handleRemovePricingTier = useCallback((index: number) => {
    const currentTiers = formData.pricingTiers || [];
    // Filter out the tier at the given index
    const updatedTiers = currentTiers.filter((_, i) => i !== index);
    setFormData('pricingTiers', updatedTiers);
  }, [formData.pricingTiers, setFormData]);

  // Effect to add an initial pricing tier if none exist
  useEffect(() => {
    if (!formData.pricingTiers || formData.pricingTiers.length === 0) {
      handleAddPricingTier();
    }
  }, [formData.pricingTiers, handleAddPricingTier]); // Dependency on handleAddPricingTier is crucial

  return (
    <section className="max-w-4xl mx-auto overflow-hidden rounded-2xl shadow-xl border border-gray-200"> {/* Added main section styling for consistency */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex justify-between items-center px-4 sm:px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-400 text-white rounded-t-2xl" // Rounded top for button
      >
        <div className="flex items-center space-x-3">
          <TrophyIcon className="h-6 w-6" />
          <h3 className="text-lg font-semibold">Pricing & Tiers</h3>
        </div>
        <span className="flex items-center">
          {open ? <ChevronUpIcon className="h-5 w-5" /> : <ChevronDownIcon className="h-5 w-5" />}
        </span>
      </button>

      {open && (
        <div className="px-4 sm:px-6 py-6 space-y-6 bg-white"> {/* Added bg-white */}
          <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4 sm:gap-0">
              <h4 className="text-2xl font-semibold text-gray-800">Pricing Tiers / Packages</h4>
              <button
                type="button"
                onClick={handleAddPricingTier}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <PlusCircleIcon className="-ml-1 mr-2 h-5 w-5" />
                Add Pricing Tier
              </button>
            </div>

            <div className="space-y-6">
              {(formData.pricingTiers || []).length === 0 && (
                <p className="text-center text-gray-500 py-4">
                  Click "Add Pricing Tier" to get started with your pricing options.
                </p>
              )}
              {(formData.pricingTiers || []).map((tier, index) => (
                <div key={index} className="relative bg-gray-50 p-6 rounded-lg border border-gray-200 shadow-sm">
                  <h5 className="text-xl font-bold mb-4 text-gray-800">Tier #{index + 1}</h5>
                  {/* Remove button moved to top right corner of each tier */}
                  <button
                    type="button"
                    onClick={() => handleRemovePricingTier(index)}
                    className="absolute top-3 right-3 text-red-500 hover:text-red-700 p-1 rounded-full bg-red-50 hover:bg-red-100 transition-colors"
                    aria-label="Remove pricing tier"
                    title="Remove this pricing tier"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    <label className="block">
                      <span className="text-gray-700 text-sm font-medium">Tier Name</span>
                      <input
                        type="text"
                        value={tier.name}
                        onChange={(e) => handleUpdatePricingTier(index, 'name', e.target.value)}
                        placeholder="E.g., Basic Package, Premium Plan"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    </label>

                    <label className="block">
                      <span className="text-gray-700 text-sm font-medium">Tier Price ($)</span>
                      <input
                        type="number"
                        step="0.01"
                        value={tier.price}
                        onChange={(e) => handleUpdatePricingTier(index, 'price', Number(e.target.value))}
                        placeholder="0.00"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    </label>

                    <label className="block">
                      <span className="text-gray-700 text-sm font-medium">Duration (Optional)</span>
                      <input
                        type="text"
                        value={tier.duration || ''}
                        onChange={(e) => handleUpdatePricingTier(index, 'duration', e.target.value)}
                        placeholder="E.g., 1 hour, 3 days, Monthly"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    </label>
                  </div>

                  <label className="flex items-center gap-2 mt-4">
                    <input
                      type="checkbox"
                      name="isFeatured"
                      checked={!!tier.isFeatured} // Ensure boolean
                      onChange={(e) => handleUpdatePricingTier(index, 'isFeatured', e.target.checked)}
                      className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out rounded"
                    />
                    <span className="text-sm text-gray-700 font-medium">Mark as Featured Tier</span>
                  </label>

                  <label className="block mt-4">
                    <span className="text-gray-700 text-sm font-medium">Description</span>
                    <textarea
                      rows={2}
                      value={tier.description || ''}
                      onChange={(e) => handleUpdatePricingTier(index, 'description', e.target.value)}
                      placeholder="Brief description of what this tier includes, e.g., 'Access to all basic features plus premium support.'"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </label>

                  <label className="block mt-4">
                    <span className="text-gray-700 text-sm font-medium">Features (comma-separated list of benefits)</span>
                    <input
                      type="text"
                      value={tier.features.join(', ')}
                      onChange={(e) => handleUpdatePricingTier(index, 'features', e.target.value)}
                      placeholder="Feature A, Feature B, Unlimited access, Priority support"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Enter each feature separated by a comma. These will be displayed as a list of benefits.
                    </p>
                  </label>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </section>
  );
}