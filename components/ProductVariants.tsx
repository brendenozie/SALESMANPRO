'use client';

import React, { useCallback } from "react";
import { motion } from "framer-motion";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";

// It's highly recommended to import ProductForm from AddProductModal.tsx for better type safety
// For simplicity in this example, we'll use a generic Record<string, any> for updateField's 'name'
interface ProductVariantsProps {
  formData: Record<string, any>;
  // Corrected type to match the updateField function from the parent
  setFormData: (name: string, value: any) => void;
}

const VARIANT_OPTIONS = {
  colors: ["Red", "Blue", "Green", "Black", "White"],
  sizes: ["S", "M", "L", "XL"],
  materials: ["Cotton", "Leather", "Metal", "Plastic"],
  weights: ["Light", "Medium", "Heavy"],
} as const;

const ProductVariants: React.FC<ProductVariantsProps> = ({ formData, setFormData }) => {
  // Toggle selection of a predefined variant option
  const handleOptionToggle = useCallback(
    (category: keyof typeof VARIANT_OPTIONS, option: string) => {
      const currentList: string[] = formData[category] || [];
      const updatedList = currentList.includes(option)
        ? currentList.filter((v) => v !== option)
        : [...currentList, option];
      setFormData(category, updatedList); // Use updateField directly
    },
    [formData, setFormData] // Dependencies: formData and updateField itself
  );

  // Add a new empty custom variant
  const addCustomVariant = () => {
    const existing = Array.isArray(formData.customVariants) ? formData.customVariants : [];
    const next = [...existing, { name: "", extraPrice: "" }];
    setFormData("customVariants", next); // Use updateField
  };

  // Update a field of a specific custom variant
  const updateCustomVariant = (index: number, field: "name" | "extraPrice", value: string) => {
    const variants = Array.isArray(formData.customVariants) ? [...formData.customVariants] : [];
    variants[index] = { ...variants[index], [field]: value };
    setFormData("customVariants", variants); // Use updateField
  };

  // Remove a custom variant by index
  const removeCustomVariant = (index: number) => {
    const variants = Array.isArray(formData.customVariants) ? [...formData.customVariants] : [];
    variants.splice(index, 1);
    setFormData("customVariants", variants); // Use updateField
  };

  return (
    <section className="p-6 bg-white rounded-2xl shadow-lg border border-gray-200 space-y-8">
      {/* Header */}
      <div>
        <h3 className="text-2xl font-bold text-gray-800">Product Variants</h3>
        <p className="text-gray-500 mt-1">
          Choose from predefined options or add your own custom variants.
        </p>
      </div>

      {/* Predefined Variant Categories */}
      {(Object.keys(VARIANT_OPTIONS) as (keyof typeof VARIANT_OPTIONS)[]).map((category) => {
        const selectedCount = (formData[category] || []).length;
        return (
          <div key={category} className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-lg font-medium capitalize text-gray-700">
                {category}
              </label>
              {selectedCount > 0 && (
                <span className="text-sm text-blue-600">{selectedCount} selected</span>
              )}
            </div>
            <div className="flex flex-wrap gap-3">
              {VARIANT_OPTIONS[category].map((option) => {
                const isSelected = (formData[category] || []).includes(option);
                return (
                  <motion.button
                    key={option}
                    type="button"
                    onClick={() => handleOptionToggle(category, option)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-5 py-2 rounded-2xl font-medium transition-colors focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-blue-200 ${
                      isSelected
                        ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {option}
                  </motion.button>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Custom Variants Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-medium text-gray-700">Custom Variants</h4>
          <button
            onClick={addCustomVariant}
            className="inline-flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md shadow"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Add Variant</span>
          </button>
        </div>
        <p className="text-sm text-gray-500">
          (Define custom variant names and extra pricing, if applicable.)
        </p>

        {Array.isArray(formData.customVariants) && formData.customVariants.length > 0 ? (
          <div className="space-y-3">
            {formData.customVariants.map((variant: any, idx: number) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center space-x-3"
              >
                <input
                  type="text"
                  name={`variantName-${idx}`}
                  value={variant.name}
                  onChange={(e) => updateCustomVariant(idx, "name", e.target.value)}
                  placeholder="Variant name"
                  className="flex-1 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
                <div className="flex items-center space-x-1">
                  <span className="text-gray-700">$</span>
                  <input
                    type="number"
                    name={`variantPrice-${idx}`}
                    value={variant.extraPrice}
                    onChange={(e) => updateCustomVariant(idx, "extraPrice", e.target.value)}
                    placeholder="0.00"
                    className="w-24 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    min="0"
                  />
                </div>
                <button
                  onClick={() => removeCustomVariant(idx)}
                  className="text-red-600 hover:text-red-800"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No custom variants added yet.</p>
        )}
      </div>
    </section>
  );
};

export default ProductVariants;