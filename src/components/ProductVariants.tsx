import React, { useCallback } from "react";

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
        const current = prev[key] as string[] || [];
        const updated = current.includes(value)
          ? current.filter(v => v !== value)
          : [...current, value];
        return { ...prev, [key]: updated };
      });
    },
    [setFormData]
  );

  return (
    <section className="p-6 bg-white rounded-2xl shadow-xl space-y-6 border border-gray-200">
      <h3 className="text-xl font-semibold">Product Variants</h3>
      { (Object.keys(VARIANT_OPTIONS) as Array<keyof typeof VARIANT_OPTIONS>).map(category => (
        <div key={category}>
          <label className="block text-gray-800 font-medium capitalize">{category}</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {VARIANT_OPTIONS[category].map(option => (
              <button
                key={option}
                type="button"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                  formData[category]?.includes(option)
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
                onClick={() => handleMultiSelect(category, option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
};

export default ProductVariants;
