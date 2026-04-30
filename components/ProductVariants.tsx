'use client';

import React, { useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  PlusIcon, 
  AdjustmentsHorizontalIcon,
  TrashIcon
} from "@heroicons/react/24/outline";

interface ProductVariantsProps {
  formData: Record<string, any>;
  setFormData: (name: string, value: any) => void;
}

const VARIANT_CATEGORIES = {
  color: ["Red", "Blue", "Green", "Gold"],
  size: ["S", "M", "L", "XL"],  
  material: ["Cotton", "Leather", "Metal", "Plastic"],
  weight: ["Light", "Medium", "Heavy"],
} as const;

const ProductVariants: React.FC<ProductVariantsProps> = ({ formData, setFormData }) => {
  // 1. Data Normalization (Single Source of Truth)
  const customVariants = formData.customVariants || []; 
  const basePrice = Number(formData.basePrice) || 0;

  // 2. Total Price Calculation
  const totalPrice = useMemo(() => {
    const variantsTotal = customVariants.reduce(
      (acc: number, curr: any) => acc + (Number(curr.extraPrice) || 0), 
      0
    );
    return basePrice + variantsTotal;
  }, [basePrice, customVariants]);

  // 3. Master Update Function
  const updateVariants = useCallback((next: any[]) => {
    setFormData("customVariants", next);
  }, [setFormData]);

  // 4. Toggle Predefined Options
  const toggleOption = (label: string) => {
    const exists = customVariants.find((v: any) => v.name === label);
    
    if (exists) {
      // Remove it if it exists
      updateVariants(customVariants.filter((v: any) => v.name !== label));
    } else {
      // Add it as a new variant entry
      updateVariants([...customVariants, { name: label, extraPrice: 0 }]);
    }
  };

  const addBlankVariant = () => {
    updateVariants([...customVariants, { name: "", extraPrice: 0 }]);
  };

  const updateVariantDetail = (index: number, field: "name" | "extraPrice", value: string) => {
    const next = [...customVariants];
    next[index] = { ...next[index], [field]: value };
    updateVariants(next);
  };

  const removeVariant = (index: number) => {
    updateVariants(customVariants.filter((_: any, i: number) => i !== index));
  };

  return (
    <section className="max-w-4xl mx-auto p-8 bg-white rounded-3xl shadow-xl border border-gray-100 space-y-10">
      
      {/* Header & Base Price */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-100">
        <div>
          <h3 className="text-2xl font-black text-gray-900 tracking-tight">Product Variants</h3>
          <p className="text-gray-500">Add options and define surcharges in one place.</p>
        </div>
        {/* <div className="bg-blue-50/50 px-4 py-3 rounded-2xl border border-blue-100 flex items-center gap-4">
          <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Base Price</span>
          <div className="flex items-center gap-1 font-bold text-blue-600">
            <span>$</span>
            <input 
              type="number"
              value={formData.basePrice || ""}
              onChange={(e) => setFormData("basePrice", e.target.value)}
              className="bg-transparent w-20 outline-none focus:ring-0"
              placeholder="0.00"
            />
          </div>
        </div> */}
      </div>

      {/* Selection Grid (Quick-Add) */}
      <div className="space-y-6">
        {(Object.keys(VARIANT_CATEGORIES) as (keyof typeof VARIANT_CATEGORIES)[]).map((cat) => (
          <div key={cat} className="space-y-3">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{cat}</h4>
            <div className="flex flex-wrap gap-2">
              {VARIANT_CATEGORIES[cat].map((opt) => {
                const isActive = customVariants.some((v: any) => v.name === opt);
                return (
                  <button
                    key={opt}
                    onClick={() => toggleOption(opt)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border-2 ${
                      isActive 
                      ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200 scale-105" 
                      : "bg-white border-gray-100 text-gray-400 hover:border-gray-300 hover:text-gray-600"
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Management Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-800">
            <AdjustmentsHorizontalIcon className="w-5 h-5 text-blue-500" />
            <h4 className="font-bold">Price Adjustments</h4>
          </div>
          <button 
            onClick={addBlankVariant}
            className="flex items-center gap-1 px-4 py-2 text-sm font-bold text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
          >
            <PlusIcon className="w-4 h-4" />
            Custom Option
          </button>
        </div>

        <div className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shadow-inner">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100/50 text-[10px] uppercase tracking-widest text-gray-500">
              <tr>
                <th className="px-6 py-4 font-bold">Label</th>
                <th className="px-6 py-4 font-bold text-right">Extra Cost ($)</th>
                <th className="w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <AnimatePresence mode="popLayout">
                {customVariants.map((variant: any, idx: number) => (
                  <motion.tr 
                    key={idx} 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, x: -20 }} 
                    className="bg-white hover:bg-blue-50/20 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <input 
                        type="text"
                        value={variant.name}
                        onChange={(e) => updateVariantDetail(idx, "name", e.target.value)}
                        placeholder="Option name..."
                        className="bg-transparent border-none focus:ring-0 w-full font-semibold text-gray-700 outline-none"
                      />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center bg-gray-50 rounded-lg px-3 py-1.5 border border-transparent group-hover:border-gray-200 transition-all">
                        <span className="text-gray-400 text-xs mr-2">+</span>
                        <input 
                          type="number"
                          value={variant.extraPrice}
                          onChange={(e) => updateVariantDetail(idx, "extraPrice", e.target.value)}
                          className="bg-transparent border-none p-0 focus:ring-0 text-right font-black text-blue-600 w-20"
                        />
                      </div>
                    </td>
                    <td className="px-4">
                      <button 
                        onClick={() => removeVariant(idx)} 
                        className="p-2 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>

              {customVariants.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-gray-400 text-sm italic">
                    No variants added. Click a button above or create a custom one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Footer */}
      <div className="bg-gray-900 rounded-[2rem] p-8 text-white flex flex-col md:flex-row justify-between items-center gap-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-3xl" />
        
        <div className="relative z-10 space-y-1 text-center md:text-left">
          <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.3em]">Final Calculation</p>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black">{totalPrice.toFixed(2)}</span>
            <span className="text-gray-500 text-sm font-bold uppercase tracking-widest"></span>
          </div>
        </div>
        
        <div className="relative z-10 flex flex-wrap justify-center md:justify-end gap-2 max-w-sm">
          {customVariants.map((v: any, i: number) => (
            <div key={i} className="text-[10px] font-bold bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-blue-200">
              {v.name || 'Unnamed'}: +${Number(v.extraPrice) || 0}
            </div>
          ))}
          {customVariants.length === 0 && <span className="text-gray-600 text-xs">No active modifiers</span>}
        </div>
      </div>
    </section>
  );
};

export default ProductVariants;