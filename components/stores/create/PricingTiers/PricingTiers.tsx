import React, { useEffect, useState } from 'react';
import {
  TrophyIcon,
  PlusCircleIcon,
  TrashIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { StoreForm } from '@/types/typings';

interface PricingTier {
  name: string;
  price: number;
  isFeatured?: boolean;
  features: string[];
  duration?: string;
  description?: string;
}

interface ProductPricingAndTiersProps {
  formData: StoreForm;
  setFormData: React.Dispatch<React.SetStateAction<StoreForm>>;
}

export default function ProductPricingAndTiers({
  formData,
  setFormData,
}: ProductPricingAndTiersProps) {
  const [open, setOpen] = useState(true);

  const handleAddPricingTier = () => {
    setFormData((prev) => ({
      ...prev,
      pricingTiers: [...(prev.pricingTiers || []), { name: '', price: 0, features: [] }],
    }));
  };

  const handleUpdatePricingTier = (
    index: number,
    field: keyof PricingTier,
    value: string | number | boolean | string[]
  ) => {
    setFormData((prev) => {
      const updatedTiers = [...(prev.pricingTiers || [])];
      if (field === 'features' && typeof value === 'string') {
        updatedTiers[index][field] = value
          .split(',')
          .map((f) => f.trim())
          .filter(Boolean);
      } else {
        updatedTiers[index] = { ...updatedTiers[index], [field]: value };
      }
      return { ...prev, pricingTiers: updatedTiers };
    });
  };

  const handleRemovePricingTier = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      pricingTiers: (prev.pricingTiers || []).filter((_, i) => i !== index),
    }));
  };

  useEffect(() => {
    if (!formData.pricingTiers || formData.pricingTiers.length === 0) {
      handleAddPricingTier();
    }
  }, [formData.pricingTiers]);

  return (
    <section className="max-w-4xl mx-auto overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex justify-between items-center px-4 sm:px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-400 text-white"
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
        <div className="px-4 sm:px-6 py-6 space-y-6">
          <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-4">
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
              {(formData.pricingTiers || []).map((tier, index) => (
                <div key={index} className="relative bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h5 className="text-lg font-semibold mb-3 text-gray-800">Tier #{index + 1}</h5>
                  <button
                    type="button"
                    onClick={() => handleRemovePricingTier(index)}
                    className="absolute top-3 right-3 text-red-500 hover:text-red-700"
                    aria-label="Remove pricing tier"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <label className="block">
                      <span className="text-gray-600 text-sm">Tier Name</span>
                      <input
                        type="text"
                        value={tier.name}
                        onChange={(e) => handleUpdatePricingTier(index, 'name', e.target.value)}
                        placeholder="E.g., Basic Package, Premium Plan"
                        className="mt-1 block w-full rounded-lg border-gray-300 p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </label>

                    <label className="block">
                      <span className="text-gray-600 text-sm">Tier Price ($)</span>
                      <input
                        type="number"
                        step="0.01"
                        value={tier.price}
                        onChange={(e) => handleUpdatePricingTier(index, 'price', Number(e.target.value))}
                        placeholder="0.00"
                        className="mt-1 block w-full rounded-lg border-gray-300 p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </label>

                    <label className="block">
                      <span className="text-gray-600 text-sm">Duration (Optional)</span>
                      <input
                        type="text"
                        value={tier.duration || ''}
                        onChange={(e) => handleUpdatePricingTier(index, 'duration', e.target.value)}
                        placeholder="E.g., 1 hour, 3 days, Monthly"
                        className="mt-1 block w-full rounded-lg border-gray-300 p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </label>
                  </div>

                  <label className="flex items-center gap-2 mt-6">
                    <input
                      type="checkbox"
                      name="isFeatured"
                      checked={!!tier.isFeatured}
                      onChange={(e) => handleUpdatePricingTier(index, 'isFeatured', e.target.checked)}
                    />
                    <span className="text-sm text-gray-700">Featured</span>
                  </label>

                  <label className="block mt-4">
                    <span className="text-gray-600 text-sm">Description</span>
                    <textarea
                      rows={2}
                      value={tier.description || ''}
                      onChange={(e) => handleUpdatePricingTier(index, 'description', e.target.value)}
                      placeholder="Brief description of what this tier includes."
                      className="mt-1 block w-full rounded-lg border-gray-300 p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </label>

                  <label className="block mt-4">
                    <span className="text-gray-600 text-sm">Features (comma-separated)</span>
                    <input
                      type="text"
                      value={tier.features.join(', ')}
                      onChange={(e) => handleUpdatePricingTier(index, 'features', e.target.value)}
                      placeholder="Feature A, Feature B, Feature C"
                      className="mt-1 block w-full rounded-lg border-gray-300 p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
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
