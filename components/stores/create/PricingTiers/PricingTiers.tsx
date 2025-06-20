import React, { useEffect, useState } from 'react';
import {
  TrophyIcon, // Still importing, but not used if awards are removed
  PlusCircleIcon,
  TrashIcon, // Used for consistency for removal
  ChevronUpIcon,
  ChevronDownIcon,
  XMarkIcon, // Used for consistency for removal
} from '@heroicons/react/24/outline';
import { StoreForm } from '@/types/typings';

// 1. Define the type for a single Pricing Tier
interface PricingTier {
  name: string;
  price: number;
  isFeatured?: boolean;
  features: string[]; // Stored as an array of strings
  duration?: string; // Optional field
  description?: string; // Optional field
}

interface ProductPricingAndTiersProps {
  formData: StoreForm;
  setFormData: React.Dispatch<React.SetStateAction<StoreForm>>;
}

export default function ProductPricingAndTiers({
  formData,
  setFormData,
}:ProductPricingAndTiersProps)  {
  const [open, setOpen] = useState(true); // State for accordion collapse

  // Handlers for Pricing Tiers - these now correctly use passed setFormData
  const handleAddPricingTier = () => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      pricingTiers: [
        ...(prevFormData.pricingTiers || []),
        { name: '', price: 0, features: [] }, // Initialize with empty/default values
      ],
    }));
  };

  const handleUpdatePricingTier = (
    index: number,
    field: keyof PricingTier, // Use keyof for type safety on field name
    value: string | number | string[] | boolean
  ) => {
    setFormData((prevFormData) => {
      const updatedTiers = [...(prevFormData.pricingTiers || [])];
      if (field === "features") {
        // Features are comma-separated, split them into an array
        updatedTiers[index] = {
          ...updatedTiers[index],
          [field]: (value as string).split(',').map((f) => f.trim()).filter((f) => f !== ''),
        };
      } else {
        updatedTiers[index] = { ...updatedTiers[index], [field]: value };
      }
      return { ...prevFormData, pricingTiers: updatedTiers };
    });
  };

  const handleRemovePricingTier = (index: number) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      pricingTiers: (prevFormData.pricingTiers || []).filter((_, i) => i !== index),
    }));
  };

  // Optional: Add an initial empty pricing tier if none exist
  // This replaces the useEffect that was specific to "awards"
  useEffect(() => {
    if (!formData.pricingTiers || formData.pricingTiers.length === 0) {
      handleAddPricingTier();
    }
  }, [formData.pricingTiers]); // Dependency on pricingTiers ensures it runs only once or when tiers become empty

  return (
    <section className="max-w-4xl mx-auto overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex justify-between items-center px-4 sm:px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-400 text-white"
      >
        <div className="flex items-center space-x-3">
          <TrophyIcon className="h-6 w-6" /> {/* Kept TrophyIcon for visual, can be changed */}
          <h3 className="text-lg font-semibold">Pricing & Tiers</h3>
        </div>
        <span className="flex items-center">
          {open ? <ChevronUpIcon className="h-5 w-5" /> : <ChevronDownIcon className="h-5 w-5" />}
        </span>
      </button>

      {/* Content */}
      {open && (
        <div className="px-4 sm:px-6 py-6 space-y-6">

          <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="justify-between">
              <h4 className="text-2xl font-semibold mb-4 text-gray-800">Pricing Tiers/Packages</h4>
              
            <button
              type="button"
              onClick={handleAddPricingTier}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              <PlusCircleIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Add Pricing Tier
            </button>
            </div>
            <div className="space-y-6">
              {(formData.pricingTiers || []).map((tier, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative">
                  <h5 className="text-lg font-semibold mb-3 text-gray-800">Tier #{index + 1}</h5>
                  <button
                    type="button"
                    onClick={() => handleRemovePricingTier(index)}
                    className="absolute top-3 right-3 text-red-500 hover:text-red-700 transition-colors duration-200"
                    aria-label="Remove pricing tier"
                  >
                    <TrashIcon className="w-5 h-5" /> {/* Use TrashIcon for consistency */}
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <label className="block">
                      <span className="text-gray-600 text-sm">Tier Name</span>
                      <input
                        type="text"
                        className="mt-1 block w-full rounded-lg border-gray-300 p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        value={tier.name}
                        onChange={(e) => handleUpdatePricingTier(index, 'name', e.target.value)}
                        placeholder="E.g., Basic Package, Premium Plan"
                      />
                    </label>
                    <label className="block">
                      <span className="text-gray-600 text-sm">Tier Price ($)</span>
                      <input
                        type="number"
                        step="0.01"
                        className="mt-1 block w-full rounded-lg border-gray-300 p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        value={tier.price || ''}
                        onChange={(e) =>
                          handleUpdatePricingTier(index, 'price', Number(e.target.value))
                        }
                        placeholder="0.00"
                      />
                    </label>
                    <label className="block">
                      <span className="text-gray-600 text-sm">Duration (Optional)</span>
                      <input
                        type="text"
                        className="mt-1 block w-full rounded-lg border-gray-300 p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        value={tier.duration || ''}
                        onChange={(e) =>
                          handleUpdatePricingTier(index, 'duration', e.target.value)
                        }
                        placeholder="E.g., 1 hour, 3 days, Monthly"
                      />
                    </label>
                  </div>
                  
                  <label className="flex items-center gap-2 mt-6">
                      <input
                        type="checkbox"
                        name="isFeatured"
                        checked={Boolean(tier.isFeatured || false)}
                        onChange={(e) =>
                          handleUpdatePricingTier(index, 'isFeatured', e.target.checked)
                        }
                      />
                      <span className="text-sm">Featured</span>
                    </label>
                  <label className="block mt-4">
                    <span className="text-gray-600 text-sm">Description</span>
                    <textarea
                      className="mt-1 block w-full rounded-lg border-gray-300 p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                      value={tier.description || ''}
                      onChange={(e) =>
                        handleUpdatePricingTier(index, 'description', e.target.value)
                      }
                      rows={2}
                      placeholder="Brief description of what this tier includes."
                    ></textarea>
                  </label>
                  <label className="block mt-4">
                    <span className="text-gray-600 text-sm">Features (comma-separated)</span>
                    <input
                      type="text"
                      className="mt-1 block w-full rounded-lg border-gray-300 p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                      value={tier.features.join(', ')} // Display as comma-separated string
                      onChange={(e) => handleUpdatePricingTier(index, 'features', e.target.value)}
                      placeholder="Feature A, Feature B, Feature C"
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
};