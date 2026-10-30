"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  MagnifyingGlassIcon,
  SparklesIcon,
  CheckIcon,
  ChevronUpDownIcon,
  XMarkIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

export interface CategoryOption {
  id: string;
  name: string;
  slug: string;
  subcategories: string[];
  brands: string[];
  icon?: string | null;
}

interface GhubaCategoryPickerProps {
  categories: CategoryOption[];
  selectedCategoryName: string;
  onSelectCategory: (categoryName: string) => void;
  subCategoryName: string;
  onSelectSubcategory: (subcat: string) => void;
  isCustomSubCategory: boolean;
  setIsCustomSubCategory: (isCustom: boolean) => void;
  customSubCategory: string;
  onCustomSubCategoryChange: (value: string) => void;
  storeCategory?: string;
  itemTitle?: string;
  isLoading?: boolean;
}

export default function GhubaCategoryPicker({
  categories,
  selectedCategoryName,
  onSelectCategory,
  subCategoryName,
  onSelectSubcategory,
  isCustomSubCategory,
  setIsCustomSubCategory,
  customSubCategory,
  onCustomSubCategoryChange,
  storeCategory,
  itemTitle = "",
  isLoading = false,
}: GhubaCategoryPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter categories by search query
  const filteredCategories = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return categories;
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.subcategories.some((sub) => sub.toLowerCase().includes(q))
    );
  }, [categories, searchQuery]);

  // Active category object
  const activeCategory = useMemo(() => {
    return categories.find((c) => c.name === selectedCategoryName) || categories[0] || null;
  }, [categories, selectedCategoryName]);

  // Store recommended categories
  const recommendedCategories = useMemo(() => {
    if (!storeCategory) return [];
    const cleanStoreCat = storeCategory.toLowerCase();
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(cleanStoreCat) ||
        cleanStoreCat.includes(c.name.toLowerCase())
    );
  }, [categories, storeCategory]);

  // Smart suggestion based on title keywords
  const titleSuggestion = useMemo(() => {
    const lowerTitle = itemTitle.toLowerCase().trim();
    if (lowerTitle.length < 3) return null;

    for (const cat of categories) {
      for (const sub of cat.subcategories) {
        const subWords = sub.toLowerCase().split(/[\s/&-]+/);
        for (const word of subWords) {
          if (word.length >= 4 && lowerTitle.includes(word)) {
            if (cat.name !== selectedCategoryName || sub !== subCategoryName) {
              return { categoryName: cat.name, subCategoryName: sub };
            }
          }
        }
      }

      const catWords = cat.name.toLowerCase().split(/[\s/&-]+/);
      for (const word of catWords) {
        if (word.length >= 4 && lowerTitle.includes(word)) {
          if (cat.name !== selectedCategoryName) {
            return {
              categoryName: cat.name,
              subCategoryName: cat.subcategories[0] || "General",
            };
          }
        }
      }
    }
    return null;
  }, [itemTitle, categories, selectedCategoryName, subCategoryName]);

  const handleApplySuggestion = () => {
    if (titleSuggestion) {
      onSelectCategory(titleSuggestion.categoryName);
      setIsCustomSubCategory(false);
      onSelectSubcategory(titleSuggestion.subCategoryName);
    }
  };

  const availableSubcategories = activeCategory?.subcategories || ["General", "Accessories"];

  return (
    <div className="space-y-4">
      {/* Title-based Smart Suggestion Banner */}
      {titleSuggestion && (
        <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 text-xs shadow-xs">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
            <SparklesIcon className="w-4 h-4 shrink-0 text-amber-500" />
            <span>
              Smart match: <strong className="font-bold">{titleSuggestion.categoryName}</strong> →{" "}
              {titleSuggestion.subCategoryName}
            </span>
          </div>
          <button
            type="button"
            onClick={handleApplySuggestion}
            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-zinc-950 font-extrabold text-[11px] transition-all shadow-xs shrink-0 active:scale-95"
          >
            Apply Match
          </button>
        </div>
      )}

      {/* Primary Category Searchable Combobox */}
      <div className="relative" ref={dropdownRef}>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
            Product Category *
          </label>
          {storeCategory && (
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Store Niche: <span className="font-semibold text-amber-600 dark:text-amber-400">{storeCategory}</span>
            </span>
          )}
        </div>

        {/* Selected Display Trigger */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-left text-sm text-zinc-900 dark:text-white font-semibold flex items-center justify-between hover:border-amber-500 dark:hover:border-amber-500 transition-all shadow-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <span className="truncate">
            {selectedCategoryName || "Select product category..."}
          </span>
          <ChevronUpDownIcon className="w-5 h-5 text-zinc-400 shrink-0 ml-2" />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 z-30 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden max-h-80 flex flex-col backdrop-blur-xl">
            {/* Search Input */}
            <div className="p-3 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-2 bg-zinc-50/50 dark:bg-zinc-900/50">
              <MagnifyingGlassIcon className="w-4 h-4 text-zinc-400 shrink-0 ml-1" />
              <input
                type="text"
                autoFocus
                placeholder="Search categories (e.g. Shoes, Electronics)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-2 py-1.5 text-xs bg-transparent border-0 focus:outline-none text-zinc-900 dark:text-white placeholder-zinc-400 font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Category List */}
            <div className="overflow-y-auto p-2 space-y-1">
              {!searchQuery && recommendedCategories.length > 0 && (
                <div className="pb-2 mb-2 border-b border-zinc-100 dark:border-zinc-800">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    Recommended for your store
                  </div>
                  {recommendedCategories.map((cat) => (
                    <button
                      key={"rec-" + cat.name}
                      type="button"
                      onClick={() => {
                        onSelectCategory(cat.name);
                        setIsOpen(false);
                      }}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition-colors ${
                        selectedCategoryName === cat.name
                          ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold"
                          : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
                      }`}
                    >
                      <span>{cat.name}</span>
                      {selectedCategoryName === cat.name && (
                        <CheckIcon className="w-4 h-4 text-amber-500 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              )}

              {filteredCategories.length === 0 ? (
                <div className="p-6 text-center text-xs text-zinc-500">
                  No matching category found for &quot;{searchQuery}&quot;
                </div>
              ) : (
                filteredCategories.map((cat) => (
                  <button
                    key={cat.id || cat.name}
                    type="button"
                    onClick={() => {
                      onSelectCategory(cat.name);
                      setIsOpen(false);
                    }}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-left text-xs font-medium flex items-center justify-between transition-colors ${
                      selectedCategoryName === cat.name
                        ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold"
                        : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
                    }`}
                  >
                    <span>{cat.name}</span>
                    {selectedCategoryName === cat.name && (
                      <CheckIcon className="w-4 h-4 text-amber-500 shrink-0" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Subcategory Interactive Pill Selector */}
      <div className="pt-1">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
            Subcategory
          </label>
          <span className="text-[11px] text-zinc-400">Tap to select or add custom</span>
        </div>

        {/* Chips container */}
        <div className="flex flex-wrap gap-2">
          {availableSubcategories.map((sub) => {
            const isSelected = !isCustomSubCategory && subCategoryName === sub;
            return (
              <button
                key={sub}
                type="button"
                onClick={() => {
                  setIsCustomSubCategory(false);
                  onSelectSubcategory(sub);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shadow-xs ${
                  isSelected
                    ? "bg-amber-500 text-zinc-950 font-extrabold scale-105 shadow-md"
                    : "bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-700/60"
                }`}
              >
                {sub}
              </button>
            );
          })}

          {/* + Custom Subcategory Toggle */}
          <button
            type="button"
            onClick={() => setIsCustomSubCategory(!isCustomSubCategory)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shadow-xs ${
              isCustomSubCategory
                ? "bg-amber-500 text-zinc-950 font-extrabold shadow-md"
                : "border border-dashed border-zinc-300 dark:border-zinc-700 text-amber-600 dark:text-amber-400 hover:border-amber-500 bg-zinc-50 dark:bg-zinc-900/40"
            }`}
          >
            <PlusIcon className="w-3.5 h-3.5" />
            <span>Custom Subcategory</span>
          </button>
        </div>

        {/* Custom Subcategory Input Field if toggled */}
        {isCustomSubCategory && (
          <div className="mt-3">
            <input
              type="text"
              autoFocus
              value={customSubCategory}
              onChange={(e) => onCustomSubCategoryChange(e.target.value)}
              placeholder="e.g. Leather Boots, Earbuds, Smart Ring..."
              className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs font-semibold text-zinc-900 dark:text-white shadow-xs"
            />
          </div>
        )}
      </div>
    </div>
  );
}