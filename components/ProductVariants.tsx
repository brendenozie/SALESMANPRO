'use client';

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  PlusIcon, 
  AdjustmentsHorizontalIcon,
  TrashIcon,
  CheckIcon
} from "@heroicons/react/24/outline";

interface ProductVariantsProps {
  formData: Record<string, any>;
  setFormData: (name: string, value: any) => void;
}

const CATEGORIES = ["color", "size", "material", "weight"] as const;

const PREDEFINED_OPTIONS = {
  color: ["Red", "Blue", "Green", "Gold"],
  size: ["S", "M", "L", "XL"],  
  material: ["Cotton", "Leather", "Metal", "Plastic"],
  weight: ["Light", "Medium", "Heavy"],
} as const;

const ProductVariants: React.FC<ProductVariantsProps> = ({ formData, setFormData }) => {
  // Local state to track the text input for "new" options per category
  const [newOptionInputs, setNewOptionInputs] = useState<Record<string, string>>({});

  // 1. Flatten active variants for the pricing table
  const allVariants = useMemo(() => {
    const list: any[] = [];
    CATEGORIES.forEach((cat) => {
      const items = formData[cat] || [];
      items.forEach((item: any, index: number) => {
        list.push({ ...item, category: cat, originalIndex: index });
      });
    });
    return list;
  }, [formData]);

  // 2. Toggle Predefined Logic
  const toggleOption = (category: string, name: string) => {
    const currentList = formData[category] || [];
    const existingIndex = currentList.findIndex((v: any) => v.name === name);

    if (existingIndex > -1) {
      const next = currentList.filter((_: any, i: number) => i !== existingIndex);
      setFormData(category, next);
    } else {
      setFormData(category, [...currentList, { name, extraPrice: 0 }]);
    }
  };

  // 3. Add a Brand New Option to a Category
  const handleAddNewOption = (category: string) => {
    const name = newOptionInputs[category]?.trim();
    if (!name) return;

    const currentList = formData[category] || [];
    // Prevent duplicates
    if (currentList.some((v: any) => v.name.toLowerCase() === name.toLowerCase())) {
      setNewOptionInputs({ ...newOptionInputs, [category]: "" });
      return;
    }

    setFormData(category, [...currentList, { name, extraPrice: 0 }]);
    setNewOptionInputs({ ...newOptionInputs, [category]: "" });
  };

  const updatePrice = (category: string, index: number, price: string) => {
    const next = [...(formData[category] || [])];
    next[index] = { ...next[index], extraPrice: price };
    setFormData(category, next);
  };

  const removeVariant = (category: string, index: number) => {
    const next = formData[category].filter((_: any, i: number) => i !== index);
    setFormData(category, next);
  };

  return (
    <section className="max-w-4xl mx-auto p-8 bg-white rounded-3xl shadow-xl border border-gray-100 space-y-10">
      
      {/* Header */}
      <div className="flex justify-between items-end border-b border-gray-100 pb-6">
        <div>
          <h3 className="text-2xl font-black text-gray-900">Variants & Pricing</h3>
          <p className="text-gray-500">Add predefined options or create your own per category.</p>
        </div>
      </div>

      {/* Category Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {CATEGORIES.map((cat) => (
          <div key={cat} className="space-y-3">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{cat}</h4>
            
            <div className="flex flex-wrap gap-2">
              {/* Predefined Buttons */}
              {PREDEFINED_OPTIONS[cat].map((opt) => {
                const isActive = (formData[cat] || []).some((v: any) => v.name === opt);
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => toggleOption(cat, opt)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border-2 ${
                      isActive 
                      ? "bg-blue-600 border-blue-600 text-white shadow-md" 
                      : "bg-white border-gray-100 text-gray-400 hover:border-gray-200"
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}

              {/* Inline "Add New" Input */}
              <div className="flex items-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 focus-within:border-blue-400 transition-all px-2 py-1">
                <input 
                  type="text"
                  placeholder="New..."
                  value={newOptionInputs[cat] || ""}
                  onChange={(e) => setNewOptionInputs({ ...newOptionInputs, [cat]: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddNewOption(cat))}
                  className="bg-transparent text-sm font-bold outline-none w-20 px-1 text-gray-700 placeholder:text-gray-300"
                />
                <button 
                  type="button"
                  onClick={() => handleAddNewOption(cat)}
                  className="p-1 hover:bg-blue-600 hover:text-white text-blue-500 rounded-lg transition-colors"
                >
                  <PlusIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pricing Table */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-gray-800">
          <AdjustmentsHorizontalIcon className="w-5 h-5 text-blue-500" />
          <h4 className="font-bold">Price Adjustments</h4>
        </div>

        <div className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
          <table className="w-full text-left">
            <thead className="bg-gray-100/50 text-[10px] uppercase tracking-widest text-gray-400">
              <tr>
                <th className="px-6 py-4">Option</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4 text-right">Surcharge ($)</th>
                <th className="w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <AnimatePresence mode="popLayout">
                {allVariants.map((v, idx) => (
                  <motion.tr 
                    key={`${v.category}-${v.name}`} 
                    layout 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white group"
                  >
                    <td className="px-6 py-4 font-semibold text-gray-700">
                      {v.name}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-bold uppercase py-1 px-2 bg-blue-50 text-blue-600 rounded">
                        {v.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-gray-300 text-xs">+</span>
                        <input 
                          type="number"
                          value={v.extraPrice}
                          onChange={(e) => updatePrice(v.category, v.originalIndex, e.target.value)}
                          className="bg-gray-50 border border-transparent hover:border-gray-200 focus:ring-2 focus:ring-blue-500 rounded-lg px-3 py-1 text-right font-bold text-blue-600 w-24 outline-none transition-all"
                        />
                      </div>
                    </td>
                    <td className="px-4">
                      <button 
                        onClick={() => removeVariant(v.category, v.originalIndex)} 
                        className="text-gray-300 hover:text-red-500 transition-colors"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
              {allVariants.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-400 text-sm italic">
                    No active variants. Select or add options above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default ProductVariants;