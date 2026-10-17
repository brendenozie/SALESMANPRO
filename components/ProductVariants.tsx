'use client';

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  PlusIcon, 
  AdjustmentsHorizontalIcon,
  TrashIcon,
  SparklesIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";
import { VariantOptionItem } from "@/types/typings";

interface ProductVariantsProps {
  formData: Record<string, any>;
  setFormData: (name: string, value: any) => void;
}

const DEFAULT_CATEGORIES = ["color", "size", "material", "weight"] as const;

// Color swatches mapping for visual richness
const COLOR_HEX_MAP: Record<string, string> = {
  black: "#111827",
  white: "#F9FAFB",
  red: "#EF4444",
  blue: "#3B82F6",
  green: "#10B981",
  gold: "#F59E0B",
  yellow: "#EAB308",
  silver: "#9CA3AF",
  gray: "#6B7280",
  grey: "#6B7280",
  purple: "#8B5CF6",
  pink: "#EC4899",
  orange: "#F97316",
  navy: "#1E3A8A",
  brown: "#78350F",
  beige: "#F5F5DC",
};

// Context-aware presets based on category keywords
const PRESET_TEMPLATES: Record<string, Record<string, string[]>> = {
  apparel: {
    color: ["Black", "White", "Navy", "Red", "Gray"],
    size: ["XS", "S", "M", "L", "XL", "2XL", "3XL"],
    material: ["100% Cotton", "Polyester", "Linen", "Silk", "Wool", "Denim"],
  },
  footwear: {
    color: ["Black", "White", "Brown", "Navy", "Gray"],
    size: ["US 7", "US 8", "US 8.5", "US 9", "US 9.5", "US 10", "US 11", "US 12"],
    material: ["Genuine Leather", "Suede", "Canvas", "Mesh", "Synthetic"],
  },
  electronics: {
    color: ["Midnight Black", "Space Gray", "Silver", "Gold", "Alpine Blue"],
    storage: ["64GB", "128GB", "256GB", "512GB", "1TB"],
    ram: ["4GB", "8GB", "16GB", "32GB"],
  },
  groceries: {
    weight: ["250g", "500g", "1kg", "2kg", "5kg", "10kg"],
    packaging: ["Bottle", "Pouch", "Box", "Tin", "Pack of 6", "Pack of 12"],
  },
  general: {
    color: ["Black", "White", "Blue", "Red", "Silver", "Gold"],
    size: ["Small", "Medium", "Large", "Extra Large"],
    material: ["Cotton", "Leather", "Metal", "Plastic", "Wood"],
    weight: ["Light", "Medium", "Heavy"],
  },
};

const ProductVariants: React.FC<ProductVariantsProps> = ({ formData, setFormData }) => {
  // Tab view: "attributes" (individual options) vs "combinations" (matrix)
  const [activeTab, setActiveTab] = useState<"attributes" | "combinations">("attributes");
  
  // Local state for adding custom values and custom category names
  const [newOptionInputs, setNewOptionInputs] = useState<Record<string, string>>({});
  const [customCategoryInput, setCustomCategoryInput] = useState<string>("");
  const [showAddCategory, setShowAddCategory] = useState<boolean>(false);

  // Bulk edit values
  const [bulkPrice, setBulkPrice] = useState<string>("");
  const [bulkQuantity, setBulkQuantity] = useState<string>("");

  // Determine active category profile
  const categoryStr = (
    typeof formData.category === "string"
      ? formData.category
      : (formData.category as any)?.displayName || (formData.category as any)?.name || ""
  ).toLowerCase();

  const presets = useMemo(() => {
    if (categoryStr.includes("cloth") || categoryStr.includes("fashion") || categoryStr.includes("apparel") || categoryStr.includes("shirt")) {
      return PRESET_TEMPLATES.apparel;
    }
    if (categoryStr.includes("shoe") || categoryStr.includes("sneaker") || categoryStr.includes("footwear") || categoryStr.includes("boot")) {
      return PRESET_TEMPLATES.footwear;
    }
    if (categoryStr.includes("phone") || categoryStr.includes("electronic") || categoryStr.includes("laptop") || categoryStr.includes("computer")) {
      return PRESET_TEMPLATES.electronics;
    }
    if (categoryStr.includes("food") || categoryStr.includes("grocer") || categoryStr.includes("snack") || categoryStr.includes("meat")) {
      return PRESET_TEMPLATES.groceries;
    }
    return PRESET_TEMPLATES.general;
  }, [categoryStr]);

  // Current active variant items from unified storage
  const allVariants = useMemo(() => {
    return (formData.option || []) as VariantOptionItem[];
  }, [formData.option]);

  // Dynamic set of all categories currently present (defaults + custom presets + active items)
  const activeCategories = useMemo(() => {
    const set = new Set<string>([...Object.keys(presets), ...DEFAULT_CATEGORIES]);
    allVariants.forEach((v) => {
      if (v.category) set.add(v.category.toLowerCase());
    });
    return Array.from(set);
  }, [presets, allVariants]);

  // Sync fallback flat string arrays for database search compatibility
  const syncFallbackArray = (updatedOptions: VariantOptionItem[], category: string) => {
    const flatStrings = updatedOptions
      .filter((v) => v.category.toLowerCase() === category.toLowerCase())
      .map((v) => v.name);
    setFormData(category, flatStrings);
  };

  // Toggle predefined option
  const toggleOption = (category: string, name: string) => {
    const currentOptions = (formData.option || []) as VariantOptionItem[];
    const existingIndex = currentOptions.findIndex(
      (v) => v.category.toLowerCase() === category.toLowerCase() && v.name.toLowerCase() === name.toLowerCase()
    );

    let updatedOptions: VariantOptionItem[];
    if (existingIndex > -1) {
      updatedOptions = currentOptions.filter((_, i) => i !== existingIndex);
    } else {
      updatedOptions = [
        ...currentOptions,
        {
          category,
          name,
          extraPrice: 0,
          sku: `${(formData.name || "PROD").slice(0, 4).toUpperCase()}-${name.slice(0, 3).toUpperCase()}`,
          quantity: formData.quantity || 10,
        },
      ];
    }

    setFormData("option", updatedOptions);
    syncFallbackArray(updatedOptions, category);
  };

  // Add custom new option to category
  const handleAddNewOption = (category: string) => {
    const name = newOptionInputs[category]?.trim();
    if (!name) return;

    const currentOptions = (formData.option || []) as VariantOptionItem[];
    if (currentOptions.some((v) => v.category.toLowerCase() === category.toLowerCase() && v.name.toLowerCase() === name.toLowerCase())) {
      setNewOptionInputs({ ...newOptionInputs, [category]: "" });
      return;
    }

    const updatedOptions = [
      ...currentOptions,
      {
        category,
        name,
        extraPrice: 0,
        sku: `${(formData.name || "PROD").slice(0, 4).toUpperCase()}-${name.slice(0, 3).toUpperCase()}`,
        quantity: formData.quantity || 10,
      },
    ];

    setFormData("option", updatedOptions);
    syncFallbackArray(updatedOptions, category);
    setNewOptionInputs({ ...newOptionInputs, [category]: "" });
  };

  // Update a single variant property
  const updateVariant = (index: number, updates: Partial<VariantOptionItem>) => {
    const updatedOptions = [...allVariants];
    updatedOptions[index] = { ...updatedOptions[index], ...updates };
    setFormData("option", updatedOptions);
  };

  // Remove variant
  const removeVariant = (index: number) => {
    const removedItem = allVariants[index];
    const updatedOptions = allVariants.filter((_, i) => i !== index);
    setFormData("option", updatedOptions);
    if (removedItem) {
      syncFallbackArray(updatedOptions, removedItem.category);
    }
  };

  // Bulk Apply Price Surcharge
  const applyBulkPrice = () => {
    const num = parseFloat(bulkPrice);
    if (isNaN(num)) return;
    const updated = allVariants.map((v) => ({ ...v, extraPrice: num }));
    setFormData("option", updated);
    setBulkPrice("");
  };

  // Bulk Apply Quantity
  const applyBulkQuantity = () => {
    const num = parseInt(bulkQuantity, 10);
    if (isNaN(num)) return;
    const updated = allVariants.map((v) => ({ ...v, quantity: num }));
    setFormData("option", updated);
    setBulkQuantity("");
  };

  // Auto-generate SKUs for all variants
  const autoGenerateSKUs = () => {
    const baseCode = (formData.name || "ITEM")
      .replace(/[^a-zA-Z0-9]/g, "")
      .slice(0, 4)
      .toUpperCase();

    const updated = allVariants.map((v, idx) => {
      const catCode = v.category.slice(0, 2).toUpperCase();
      const valCode = v.name.replace(/[^a-zA-Z0-9]/g, "").slice(0, 3).toUpperCase();
      return {
        ...v,
        sku: `${baseCode}-${catCode}-${valCode}-${idx + 1}`,
      };
    });
    setFormData("option", updated);
  };

  // Build matrix combination breakdown if multiple categories exist (e.g., Color × Size)
  const combinations = useMemo(() => {
    const grouped: Record<string, string[]> = {};
    allVariants.forEach((v) => {
      const cat = v.category.toLowerCase();
      if (!grouped[cat]) grouped[cat] = [];
      if (!grouped[cat].includes(v.name)) grouped[cat].push(v.name);
    });

    const categories = Object.keys(grouped);
    if (categories.length < 2) return [];

    let combos: string[][] = [[]];
    for (const cat of categories) {
      const values = grouped[cat];
      const next: string[][] = [];
      for (const current of combos) {
        for (const val of values) {
          next.push([...current, val]);
        }
      }
      combos = next;
    }
    return combos;
  }, [allVariants]);

  return (
    <section className="max-w-4xl mx-auto p-6 md:p-8 bg-white rounded-3xl shadow-xl border border-gray-100 space-y-8 font-inter">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h3 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <SparklesIcon className="w-6 h-6 text-indigo-600" />
            Variants, Attributes & Pricing
          </h3>
          <p className="text-gray-500 text-sm mt-0.5">
            Select attribute chips or build multi-option combinations with individual pricing and SKUs.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-gray-100 p-1 rounded-xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab("attributes")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === "attributes"
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <ListBulletIcon className="w-4 h-4" />
            <span>Attributes ({allVariants.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("combinations")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === "combinations"
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Squares2X2Icon className="w-4 h-4" />
            <span>Matrix ({combinations.length > 0 ? combinations.length : allVariants.length})</span>
          </button>
        </div>
      </div>

      {/* ── Attributes Grid (Chip Presets & Custom Values) ── */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activeCategories.map((cat) => {
            const presetList = presets[cat] || PRESET_TEMPLATES.general[cat] || [];
            return (
              <div key={cat} className="p-4 bg-gray-50/80 rounded-2xl border border-gray-200/70 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-500" />
                    {cat}
                  </h4>
                  <span className="text-[11px] text-gray-400 font-medium">
                    {allVariants.filter((v) => v.category.toLowerCase() === cat.toLowerCase()).length} selected
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {/* Preset Buttons */}
                  {presetList.map((opt) => {
                    const isActive = allVariants.some(
                      (v) => v.category.toLowerCase() === cat.toLowerCase() && v.name.toLowerCase() === opt.toLowerCase()
                    );
                    const isColor = cat.toLowerCase() === "color";
                    const colorHex = isColor ? COLOR_HEX_MAP[opt.toLowerCase()] : null;

                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => toggleOption(cat, opt)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                          isActive
                            ? "bg-indigo-600 border-indigo-600 text-white shadow-sm scale-[1.02]"
                            : "bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-100/50"
                        }`}
                      >
                        {colorHex && (
                          <span
                            className="w-3 h-3 rounded-full border border-gray-300 shrink-0"
                            style={{ backgroundColor: colorHex }}
                          />
                        )}
                        <span>{opt}</span>
                      </button>
                    );
                  })}

                  {/* Inline "Add New" Input */}
                  <div className="flex items-center bg-white rounded-xl border border-dashed border-gray-300 focus-within:border-indigo-500 transition px-2 py-1">
                    <input
                      type="text"
                      placeholder="+ Custom..."
                      value={newOptionInputs[cat] || ""}
                      onChange={(e) => setNewOptionInputs({ ...newOptionInputs, [cat]: e.target.value })}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddNewOption(cat))}
                      className="bg-transparent text-xs font-medium outline-none w-20 px-1 text-gray-800 placeholder:text-gray-400"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddNewOption(cat)}
                      className="p-0.5 hover:bg-indigo-600 hover:text-white text-indigo-600 rounded transition"
                      title="Add attribute value"
                    >
                      <PlusIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Custom Attribute Type Button */}
        {!showAddCategory ? (
          <button
            type="button"
            onClick={() => setShowAddCategory(true)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Add Custom Attribute (e.g. Storage, Scent, Flavor)</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 p-3 bg-indigo-50 rounded-xl border border-indigo-200 max-w-md">
            <input
              type="text"
              placeholder="e.g. Storage, Voltage, Scent"
              value={customCategoryInput}
              onChange={(e) => setCustomCategoryInput(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-indigo-200 bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-1"
            />
            <button
              type="button"
              onClick={() => {
                const val = customCategoryInput.trim().toLowerCase();
                if (val) {
                  setNewOptionInputs({ ...newOptionInputs, [val]: "" });
                  setCustomCategoryInput("");
                  setShowAddCategory(false);
                }
              }}
              className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setShowAddCategory(false)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* ── Bulk Actions Bar ── */}
      {allVariants.length > 0 && (
        <div className="p-4 bg-gradient-to-r from-gray-50 via-indigo-50/30 to-gray-50 rounded-2xl border border-indigo-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <AdjustmentsHorizontalIcon className="w-5 h-5 text-indigo-600" />
            <span className="text-xs font-bold text-gray-800">Bulk Adjustments:</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Price Surcharge */}
            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-2 py-1">
              <span className="text-xs text-gray-400 font-semibold">+KES</span>
              <input
                type="number"
                placeholder="Surcharge"
                value={bulkPrice}
                onChange={(e) => setBulkPrice(e.target.value)}
                className="w-18 text-xs font-bold outline-none text-gray-800"
              />
              <button
                type="button"
                onClick={applyBulkPrice}
                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 px-1"
              >
                Apply All
              </button>
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-2 py-1">
              <span className="text-xs text-gray-400 font-semibold">Qty</span>
              <input
                type="number"
                placeholder="Stock"
                value={bulkQuantity}
                onChange={(e) => setBulkQuantity(e.target.value)}
                className="w-16 text-xs font-bold outline-none text-gray-800"
              />
              <button
                type="button"
                onClick={applyBulkQuantity}
                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 px-1"
              >
                Apply All
              </button>
            </div>

            {/* Auto SKU Generator */}
            <button
              type="button"
              onClick={autoGenerateSKUs}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 rounded-lg text-xs font-bold transition shadow-sm"
            >
              <ArrowPathIcon className="w-3.5 h-3.5" />
              <span>Auto-SKU</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Table View: Attributes vs Matrix ── */}
      {activeTab === "attributes" ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-gray-800">Active Attribute Adjustments</h4>
            <span className="text-xs text-gray-400">{allVariants.length} items configured</span>
          </div>

          <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-[10px] uppercase tracking-wider text-gray-500 font-bold border-b border-gray-200">
                <tr>
                  <th className="px-5 py-3">Attribute Option</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">SKU Code</th>
                  <th className="px-5 py-3 text-center">Stock</th>
                  <th className="px-5 py-3 text-right">Price Surcharge (KES)</th>
                  <th className="w-12 px-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <AnimatePresence mode="popLayout">
                  {allVariants.map((v, idx) => (
                    <motion.tr
                      key={`${v.category}-${v.name}-${idx}`}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-5 py-3">
                        <span className="font-semibold text-sm text-gray-800">{v.name}</span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-[10px] font-bold uppercase py-0.5 px-2 bg-indigo-50 text-indigo-700 rounded-md">
                          {v.category}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <input
                          type="text"
                          value={v.sku || ""}
                          placeholder="SKU"
                          onChange={(e) => updateVariant(idx, { sku: e.target.value })}
                          className="w-28 px-2 py-1 text-xs font-mono font-bold bg-gray-50 border border-gray-200 rounded-md focus:bg-white focus:ring-1 focus:ring-indigo-500 outline-none"
                        />
                      </td>
                      <td className="px-5 py-3 text-center">
                        <input
                          type="number"
                          value={v.quantity ?? (formData.quantity || 0)}
                          onChange={(e) => updateVariant(idx, { quantity: parseInt(e.target.value, 10) || 0 })}
                          className="w-20 px-2 py-1 text-xs text-center font-bold bg-gray-50 border border-gray-200 rounded-md focus:bg-white focus:ring-1 focus:ring-indigo-500 outline-none"
                        />
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <span className="text-gray-400 text-xs font-bold">+</span>
                          <input
                            type="number"
                            value={v.extraPrice}
                            onChange={(e) => updateVariant(idx, { extraPrice: parseFloat(e.target.value) || 0 })}
                            className="w-24 px-2 py-1 text-right text-xs font-bold text-indigo-600 bg-gray-50 border border-gray-200 rounded-md focus:bg-white focus:ring-1 focus:ring-indigo-500 outline-none"
                          />
                        </div>
                      </td>
                      <td className="px-3 text-center">
                        <button
                          type="button"
                          onClick={() => removeVariant(idx)}
                          className="text-gray-400 hover:text-red-500 p-1 rounded-md transition"
                          title="Remove option"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>

                {allVariants.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-gray-400 text-sm italic">
                      No active variants. Click on predefined chips above or type custom values to start.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Matrix Combinations View */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-gray-800">Multi-Attribute Combination Matrix</h4>
              <p className="text-xs text-gray-500">
                Generated from selected options across multiple attributes.
              </p>
            </div>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
              {combinations.length} Total Combinations
            </span>
          </div>

          {combinations.length > 0 ? (
            <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm max-h-96 overflow-y-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-[10px] uppercase tracking-wider text-gray-500 font-bold border-b border-gray-200 sticky top-0">
                  <tr>
                    <th className="px-5 py-3">Variant Combination</th>
                    <th className="px-5 py-3">SKU</th>
                    <th className="px-5 py-3 text-center">Calculated Surcharge</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {combinations.map((combo, idx) => {
                    const comboTitle = combo.join(" / ");
                    const sku = `${(formData.name || "PROD").slice(0, 4).toUpperCase()}-${combo
                      .map((c) => c.slice(0, 2).toUpperCase())
                      .join("-")}-${idx + 1}`;
                    
                    // Sum extraPrices of matching component options
                    const extra = combo.reduce((sum, name) => {
                      const matched = allVariants.find((v) => v.name.toLowerCase() === name.toLowerCase());
                      return sum + (matched?.extraPrice || 0);
                    }, 0);

                    return (
                      <tr key={comboTitle} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-3 font-semibold text-sm text-gray-800">
                          {comboTitle}
                        </td>
                        <td className="px-5 py-3">
                          <span className="font-mono text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                            {sku}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-center font-bold text-xs text-indigo-600">
                          {extra > 0 ? `+KES ${extra.toLocaleString()}` : "Base Price"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-sm text-gray-500">
              💡 Select values in at least two different categories (e.g., Color and Size) to generate a multi-attribute matrix.
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default ProductVariants;