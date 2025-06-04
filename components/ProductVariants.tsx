import React, { useCallback } from "react";
import { motion } from "framer-motion";

interface ProductVariantsProps {
  formData: Record<string, string[]>;
  setFormData: React.Dispatch<React.SetStateAction<Record<string, any>>>;
}

const VARIANT_OPTIONS = {
  colors: ["Red", "Blue", "Green", "Black", "White"],
  sizes: ["S", "M", "L", "XL"],
  materials: ["Cotton", "Leather", "Metal", "Plastic"],
  weights: ["Light", "Medium", "Heavy"]
} as const;

const ProductVariants: React.FC<ProductVariantsProps> = ({ formData, setFormData }) => {
  const handleMultiSelect = useCallback(
    (key: keyof typeof VARIANT_OPTIONS, value: string) => {
      setFormData(prev => {
        const current = (prev[key] as string[]) || [];
        const updated = current.includes(value)
          ? current.filter(v => v !== value)
          : [...current, value];
        return { ...prev, [key]: updated };
      });
    },
    [setFormData]
  );

  return (
    <section className="p-6 bg-white rounded-2xl shadow-lg space-y-8 border border-gray-200">
      <h3 className="text-2xl font-bold text-gray-800">Product Variants</h3>

      {/* Only show color/size if subcategory is Clothing/Fashion or similar */}
      {/* {["Clothing", "Shoes", "Watches", "Jewelry", "Beauty Products", "Skincare", "Haircare", "Sports Equipment", "Fashion"].includes(
            formData.subCategory
          ) && (
            <div>
              <label className="block text-sm font-medium">Color (comma‐separated)</label>
              <input
                name="color"
                type="text"
                value={formData.color}
                onChange={handleInputChange}
                placeholder="e.g. Red, Blue, Green"
                className="mt-1 block w-full border-gray-300 rounded-md"
              />
            </div>
          )} */}

      {(Object.keys(VARIANT_OPTIONS) as Array<keyof typeof VARIANT_OPTIONS>).map(category => (
        <div key={category} className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-lg font-medium capitalize text-gray-700">
              {category}
            </label>
            {formData[category]?.length > 0 && (
              <span className="text-sm text-blue-600">
                {formData[category].length} selected
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            {VARIANT_OPTIONS[category].map(option => {
              const isSelected = formData[category]?.includes(option);
              return (
                <motion.button
                  key={option}
                  type="button"
                  onClick={() => handleMultiSelect(category, option)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-5 py-2 rounded-2xl font-medium transition-colors focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-blue-200 
                    ${isSelected 
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                  `}
                >
                  {option}
                </motion.button>
              );
            })}
          </div>
        </div>
      ))}
      <div className="space-y-4">
      <p className="text-sm text-gray-500">
        (Add different variants for this product, e.g. sizes, colors, or plans.)
      </p>
      <button
        onClick={() => {
          const next = [...(formData.variants || []), { name: "", extraPrice: 0 }];
          setFormData({ ...formData, variants: next });
        }}
        className="bg-blue-600 text-white px-3 py-1 rounded-md"
      >
        + Add Variant
      </button>
      {formData.variants?.map((v: any, idx: number) => (
        <div key={idx} className="flex items-center space-x-2">
          <input
            name={`variantName-${idx}`}
            type="text"
            value={v.name}
            onChange={(e) => {
              const updated = [...formData.variants];
              // updated[idx].name = e.target.value;
              setFormData({ ...formData, variants: updated });
            }}
            placeholder="Variant name"
            className="border-gray-300 rounded-md p-1 flex-1"
          />
          <input
            name={`variantPrice-${idx}`}
            type="number"
            value={v.extraPrice}
            onChange={(e) => {
              const updated = [...formData.variants];
              // updated[idx].extraPrice = parseFloat(e.target.value);
              setFormData({ ...formData, variants: updated });
            }}
            placeholder="Extra price"
            className="border-gray-300 rounded-md p-1 w-24"
          />
          <button
            onClick={() => {
              const updated = formData.variants.filter((_: any, i: number) => i !== idx);
              setFormData({ ...formData, variants: updated });
            }}
            className="text-red-600"
          >
            ✕
          </button>
        </div>
      ))}
      </div>
    </section>
  );
};

export default ProductVariants;
