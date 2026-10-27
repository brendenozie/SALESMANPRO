"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  XMarkIcon,
  SparklesIcon,
  CheckBadgeIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
  TagIcon,
  BuildingStorefrontIcon,
} from "@heroicons/react/24/outline";
import GhubaImageUploader from "./GhubaImageUploader";

export interface CategoryOption {
  id: string;
  name: string;
  slug: string;
  subcategories: string[];
  brands: string[];
  icon?: string | null;
}

interface GhubaQuickListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  companyId?: string;
  storeCategory?: string;
  currentActiveCount: number;
  listingLimit: number;
}

export default function GhubaQuickListingModal({
  isOpen,
  onClose,
  onSuccess,
  companyId,
  storeCategory,
  currentActiveCount,
  listingLimit,
}: GhubaQuickListingModalProps) {
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>("");
  const [subCategoryName, setSubCategoryName] = useState<string>("");
  const [isCustomSubCategory, setIsCustomSubCategory] = useState(false);
  const [customSubCategory, setCustomSubCategory] = useState("");
  const [brand, setBrand] = useState<string>("");
  const [isCustomBrand, setIsCustomBrand] = useState(false);
  const [customBrand, setCustomBrand] = useState("");

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("1");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [limitExceeded, setLimitExceeded] = useState(false);

  // 1. Fetch real product & store categories from backend database
  useEffect(() => {
    let isMounted = true;
    async function loadCategories() {
      try {
        const res = await fetch("/api/ghuba/seller/categories");
        if (!res.ok) throw new Error("Failed to load categories");
        const data = await res.json();
        if (isMounted && data.categories && Array.isArray(data.categories) && data.categories.length > 0) {
          setCategories(data.categories);

          // Find initial matched category based on seller's store category
          let matched = data.categories[0];
          if (storeCategory) {
            const cleanStoreCat = storeCategory.toLowerCase();
            const found = data.categories.find((c: CategoryOption) =>
              c.name.toLowerCase().includes(cleanStoreCat) || cleanStoreCat.includes(c.name.toLowerCase())
            );
            if (found) matched = found;
          }

          setSelectedCategoryName(matched.name);
          if (matched.subcategories && matched.subcategories.length > 0) {
            setSubCategoryName(matched.subcategories[0]);
          }
          if (matched.brands && matched.brands.length > 0) {
            setBrand(matched.brands[0]);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch categories, using fallbacks:", err);
      } finally {
        if (isMounted) setIsLoadingCategories(false);
      }
    }

    if (isOpen) {
      loadCategories();
    }
    return () => {
      isMounted = false;
    };
  }, [isOpen, storeCategory]);

  // Current active category object
  const activeCategory = useMemo(() => {
    return categories.find((c) => c.name === selectedCategoryName) || categories[0] || null;
  }, [categories, selectedCategoryName]);

  // Handle changing primary category: update available subcategories and brands
  const handleCategoryChange = (newCatName: string) => {
    setSelectedCategoryName(newCatName);
    setIsCustomSubCategory(false);
    setCustomSubCategory("");
    setIsCustomBrand(false);
    setCustomBrand("");

    const targetCat = categories.find((c) => c.name === newCatName);
    if (targetCat) {
      if (targetCat.subcategories && targetCat.subcategories.length > 0) {
        setSubCategoryName(targetCat.subcategories[0]);
      } else {
        setSubCategoryName("");
      }
      if (targetCat.brands && targetCat.brands.length > 0) {
        setBrand(targetCat.brands[0]);
      } else {
        setBrand("");
      }
    }
  };

  if (!isOpen) return null;

  const isAtLimit = currentActiveCount >= listingLimit;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Please enter a product title.");
      return;
    }
    if (!price || Number(price) <= 0) {
      setError("Please enter a valid price in KES.");
      return;
    }
    if (images.length === 0) {
      setError("Please upload at least 1 image of your item.");
      return;
    }

    const finalSubCategory = isCustomSubCategory
      ? customSubCategory.trim()
      : subCategoryName.trim();

    const finalBrand = isCustomBrand
      ? customBrand.trim()
      : brand.trim();

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/ghuba/seller/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: title.trim(),
          price: Number(price),
          stock: Number(stock) || 1,
          category: selectedCategoryName || activeCategory?.name || "General Retail",
          productCategoryId: activeCategory?.id || undefined,
          subCategoryName: finalSubCategory || undefined,
          brand: finalBrand || undefined,
          description: description.trim(),
          images,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 403) {
          setLimitExceeded(true);
        }
        throw new Error(data.error || "Failed to create listing.");
      }

      // Reset and close
      setTitle("");
      setPrice("");
      setStock("1");
      setDescription("");
      setImages([]);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden my-8 z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                <SparklesIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  Add Marketplace Listing
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">
                    Synced with Ghuba Search
                  </span>
                </h3>
                <p className="text-xs text-zinc-500">
                  {currentActiveCount} of {listingLimit} free slots used
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          {isAtLimit || limitExceeded ? (
            <div className="p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
                <ExclamationTriangleIcon className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h4 className="text-lg font-bold text-zinc-900 dark:text-white">
                  Marketplace Capacity Reached ({currentActiveCount}/{listingLimit})
                </h4>
                <p className="text-xs text-zinc-500 max-w-md mx-auto">
                  You have reached the 10-item limit for the free Ghuba tier. Upgrade to SalesmanPro Starter to publish unlimited items, launch a dedicated store website, and unlock counter POS.
                </p>
              </div>
              <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href="/api/auth/handover?target=https://salesmanpro.store/stores"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold text-sm shadow-md transition-all active:scale-95"
                >
                  Upgrade to SalesmanPro Starter
                  <ArrowRightIcon className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold text-sm transition-colors"
                >
                  Manage Existing Listings
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {error && (
                <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-xs text-red-600 dark:text-red-400 font-medium">
                  {error}
                </div>
              )}

              {/* Product Title */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Item Name / Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Nike Air Max 90 - Black/White (Size 42)"
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm text-zinc-900 dark:text-white"
                />
              </div>

              {/* Category (Unified Database Product Categories) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                    Product Category *
                  </label>
                  {isLoadingCategories && (
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 animate-pulse font-medium">
                      Loading synchronized categories...
                    </span>
                  )}
                </div>
                <select
                  value={selectedCategoryName}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  disabled={isLoadingCategories}
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm text-zinc-900 dark:text-white font-medium"
                >
                  {categories.map((cat) => (
                    <option key={cat.id || cat.name} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subcategory & Brand (Synchronized with Ghuba Search Filters) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Subcategory */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                      Subcategory
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsCustomSubCategory(!isCustomSubCategory)}
                      className="text-[11px] text-amber-600 dark:text-amber-400 hover:underline font-medium"
                    >
                      {isCustomSubCategory ? "Select from list" : "+ Custom"}
                    </button>
                  </div>

                  {isCustomSubCategory ? (
                    <input
                      type="text"
                      value={customSubCategory}
                      onChange={(e) => setCustomSubCategory(e.target.value)}
                      placeholder="e.g. Leather Boots, Earbuds..."
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm text-zinc-900 dark:text-white"
                    />
                  ) : (
                    <select
                      value={subCategoryName}
                      onChange={(e) => setSubCategoryName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm text-zinc-900 dark:text-white"
                    >
                      {(activeCategory?.subcategories || ["General", "Accessories"]).map((sub) => (
                        <option key={sub} value={sub}>
                          {sub}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Brand */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                      Brand / Manufacturer
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsCustomBrand(!isCustomBrand)}
                      className="text-[11px] text-amber-600 dark:text-amber-400 hover:underline font-medium"
                    >
                      {isCustomBrand ? "Select popular brand" : "+ Custom"}
                    </button>
                  </div>

                  {isCustomBrand ? (
                    <input
                      type="text"
                      value={customBrand}
                      onChange={(e) => setCustomBrand(e.target.value)}
                      placeholder="e.g. Nike, Apple, Samsung..."
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm text-zinc-900 dark:text-white"
                    />
                  ) : (
                    <select
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm text-zinc-900 dark:text-white"
                    >
                      {(activeCategory?.brands || ["Generic", "Local Brand"]).map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Price & Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Price (KES) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="1"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. 3500"
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm text-zinc-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="1"
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm text-zinc-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your item, condition, materials, sizes, or special features..."
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm text-zinc-900 dark:text-white"
                />
              </div>

              {/* Image Uploader with direct-to-S3 client */}
              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <GhubaImageUploader
                  images={images}
                  onChange={setImages}
                  maxImages={5}
                  companyId={companyId}
                />
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-full text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-full bg-amber-500 hover:bg-amber-600 text-zinc-950 text-sm font-bold shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                      Publishing to Ghuba...
                    </>
                  ) : (
                    "Publish to Ghuba"
                  )}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
