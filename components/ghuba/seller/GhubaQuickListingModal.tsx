"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  XMarkIcon,
  SparklesIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  CubeIcon,
  DocumentArrowDownIcon,
  PencilSquareIcon,
  CheckBadgeIcon,
  TagIcon,
  PhotoIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import GhubaImageUploader from "./GhubaImageUploader";
import GhubaCategoryPicker, { CategoryOption } from "./GhubaCategoryPicker";

export interface ListingItemData {
  id: string;
  productId?: string;
  name: string;
  description?: string;
  sellingPrice: number;
  quantity: number;
  images: any[];
  videos?: any[];
  ebooks?: any[];
  status: string;
  isAvailable: boolean;
  category?: string;
  productCategoryId?: string;
  subCategoryName?: string;
  brand?: string;
  createdAt?: string;
}

interface GhubaQuickListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingListing?: ListingItemData | null;
  companyId?: string;
  storeCategory?: string;
  currentActiveCount: number;
  listingLimit: number;
}

export default function GhubaQuickListingModal({
  isOpen,
  onClose,
  onSuccess,
  editingListing = null,
  companyId,
  storeCategory,
  currentActiveCount,
  listingLimit,
}: GhubaQuickListingModalProps) {
  const isEditing = Boolean(editingListing);

  // Wizard Step State: 1 = Category & Type, 2 = Details & Pricing, 3 = Media Uploads
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>("");
  const [subCategoryName, setSubCategoryName] = useState<string>("");
  const [isCustomSubCategory, setIsCustomSubCategory] = useState(false);
  const [customSubCategory, setCustomSubCategory] = useState("");
  const [brand, setBrand] = useState<string>("");
  const [isCustomBrand, setIsCustomBrand] = useState(false);
  const [customBrand, setCustomBrand] = useState("");

  const [itemType, setItemType] = useState<"physical" | "digital">("physical");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("1");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [ebooks, setEbooks] = useState<string[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [limitExceeded, setLimitExceeded] = useState(false);

  // 1. Fetch categories
  useEffect(() => {
    let isMounted = true;
    async function loadCategories() {
      try {
        const res = await fetch("/api/ghuba/seller/categories", { credentials: "include" });
        if (!res.ok) throw new Error("Failed to load categories");
        const contentType = res.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) {
          throw new Error("Failed to parse category data");
        }
        const data = await res.json();
        if (isMounted && data.categories && Array.isArray(data.categories) && data.categories.length > 0) {
          setCategories(data.categories);

          if (!editingListing) {
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
  }, [isOpen, storeCategory, editingListing]);

  // 2. Pre-fill form when editing
  useEffect(() => {
    if (editingListing && isOpen) {
      setTitle(editingListing.name || "");
      setPrice(String(editingListing.sellingPrice || ""));
      setStock(String(editingListing.quantity ?? "1"));
      setDescription(editingListing.description || "");

      const normalizedImgs = (Array.isArray(editingListing.images) ? editingListing.images : [])
        .map((img: any) => (typeof img === "string" ? img : img?.url || img?.src || ""))
        .filter(Boolean);
      setImages(normalizedImgs);

      const normalizedVids = (Array.isArray(editingListing.videos) ? editingListing.videos : [])
        .map((v: any) => (typeof v === "string" ? v : v?.url || ""))
        .filter(Boolean);
      setVideos(normalizedVids);

      const normalizedDocs = (Array.isArray(editingListing.ebooks) ? editingListing.ebooks : [])
        .map((d: any) => (typeof d === "string" ? d : d?.url || ""))
        .filter(Boolean);
      setEbooks(normalizedDocs);

      if (normalizedDocs.length > 0) {
        setItemType("digital");
      } else {
        setItemType("physical");
      }

      if (editingListing.category) {
        setSelectedCategoryName(editingListing.category);
      }
      if (editingListing.subCategoryName) {
        setSubCategoryName(editingListing.subCategoryName);
      }
      if (editingListing.brand) {
        setBrand(editingListing.brand);
      }
      setCurrentStep(1);
    } else if (!editingListing && isOpen) {
      setTitle("");
      setPrice("");
      setStock("1");
      setDescription("");
      setImages([]);
      setVideos([]);
      setEbooks([]);
      setItemType("physical");
      setIsCustomSubCategory(false);
      setCustomSubCategory("");
      setIsCustomBrand(false);
      setCustomBrand("");
      setCurrentStep(1);
    }
  }, [editingListing, isOpen]);

  const activeCategory = useMemo(() => {
    return categories.find((c) => c.name === selectedCategoryName) || categories[0] || null;
  }, [categories, selectedCategoryName]);

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

  const isAtLimit = !isEditing && currentActiveCount >= listingLimit;

  const handleNextStep = () => {
    setError(null);
    if (currentStep === 1) {
      if (!selectedCategoryName) {
        setError("Please select a product category.");
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!title.trim()) {
        setError("Please enter a product title.");
        return;
      }
      if (!price || Number(price) <= 0) {
        setError("Please enter a valid price in KES.");
        return;
      }
      setCurrentStep(3);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (images.length === 0) {
      setError("Please upload at least 1 image/cover photo.");
      return;
    }

    if (itemType === "digital" && ebooks.length === 0) {
      setError("Please upload the digital file or PDF document.");
      return;
    }

    const finalSubCategory = isCustomSubCategory
      ? customSubCategory.trim()
      : subCategoryName.trim();

    const finalBrand = isCustomBrand ? customBrand.trim() : brand.trim();

    setIsSubmitting(true);
    try {
      const payload = {
        name: title.trim(),
        price: Number(price),
        stock: itemType === "digital" ? 9999 : Number(stock) || 1,
        category: selectedCategoryName || activeCategory?.name || "General Retail",
        productCategoryId: activeCategory?.id || undefined,
        subCategoryName: finalSubCategory || undefined,
        brand: finalBrand || undefined,
        description: description.trim(),
        images,
        videos,
        ebooks,
        itemType,
        companyId: companyId || undefined,
      };

      let res: Response;

      if (isEditing && editingListing) {
        res = await fetch(`/api/ghuba/seller/listings/${editingListing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/ghuba/seller/listings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });
      }

      const contentType = res.headers.get("content-type") || "";
      let data: any = {};

      if (contentType.includes("application/json")) {
        data = await res.json().catch(() => ({}));
      } else {
        const textResponse = await res.text().catch(() => "");
        console.error("[GhubaListingModal] Non-JSON response:", res.status, textResponse.slice(0, 300));

        if (res.status === 401) {
          throw new Error("Authentication session expired. Please sign in again.");
        } else if (res.status === 404) {
          throw new Error("Store profile not found. Please complete store onboarding first.");
        } else if (res.status === 403) {
          setLimitExceeded(true);
          throw new Error("Marketplace listing limit reached. Upgrade to add more items.");
        } else {
          throw new Error(`Server returned error (${res.status}). Please try again.`);
        }
      }

      if (!res.ok) {
        if (res.status === 403) {
          setLimitExceeded(true);
        }
        throw new Error(data.error || (isEditing ? "Failed to update listing." : "Failed to create listing."));
      }

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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden my-6 z-10 flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/80 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold shadow-xs">
                {isEditing ? <PencilSquareIcon className="w-5 h-5" /> : <SparklesIcon className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-base font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
                  {isEditing ? "Edit Marketplace Listing" : "Add Marketplace Listing"}
                </h3>
                <p className="text-xs text-zinc-500 font-medium">
                  {isEditing
                    ? "Update taxonomy, pricing & media assets"
                    : `Step ${currentStep} of 3 • ${currentActiveCount} of ${listingLimit} free slots used`}
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

          {/* Stepper Indicator Bar */}
          {!isAtLimit && !limitExceeded && (
            <div className="grid grid-cols-3 gap-1 px-6 pt-4 bg-zinc-50/40 dark:bg-zinc-900/40">
              <div className="space-y-1">
                <div className={`h-1.5 rounded-full transition-all duration-300 ${currentStep >= 1 ? "bg-amber-500 shadow-xs" : "bg-zinc-200 dark:bg-zinc-800"}`} />
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">1. Category</span>
              </div>
              <div className="space-y-1">
                <div className={`h-1.5 rounded-full transition-all duration-300 ${currentStep >= 2 ? "bg-amber-500 shadow-xs" : "bg-zinc-200 dark:bg-zinc-800"}`} />
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">2. Details & Price</span>
              </div>
              <div className="space-y-1">
                <div className={`h-1.5 rounded-full transition-all duration-300 ${currentStep >= 3 ? "bg-amber-500 shadow-xs" : "bg-zinc-200 dark:bg-zinc-800"}`} />
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">3. Media & Assets</span>
              </div>
            </div>
          )}

          {/* Limit Reached View */}
          {isAtLimit || limitExceeded ? (
            <div className="p-10 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto shadow-sm">
                <ExclamationTriangleIcon className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h4 className="text-lg font-extrabold text-zinc-900 dark:text-white">
                  Marketplace Capacity Reached ({currentActiveCount}/{listingLimit})
                </h4>
                <p className="text-xs text-zinc-500 max-w-md mx-auto leading-relaxed">
                  You have reached the free 10-item limit for Ghuba. Upgrade to SalesmanPro Starter to unlock unlimited listings, custom store web portals, and instant counter POS.
                </p>
              </div>
              <div className="pt-3 flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href="/api/auth/handover?target=https://salesmanpro.store/stores"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-zinc-950 font-extrabold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95"
                >
                  Upgrade to SalesmanPro Starter
                  <ArrowRightIcon className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold text-sm transition-colors"
                >
                  Manage Listings
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {error && (
                <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-xs text-red-600 dark:text-red-400 font-semibold shadow-xs">
                  {error}
                </div>
              )}

              {/* STEP 1: CATEGORY & TAXONOMY PICKER (Separated & Dedicated Step) */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="space-y-1">
                    <h4 className="text-sm font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
                      <TagIcon className="w-4 h-4 text-amber-500" />
                      Select Product Taxonomy
                    </h4>
                    <p className="text-xs text-zinc-500">
                      Choose the primary category and subcategory where buyers will discover your item on Ghuba.
                    </p>
                  </div>

                  <GhubaCategoryPicker
                    categories={categories}
                    selectedCategoryName={selectedCategoryName}
                    onSelectCategory={handleCategoryChange}
                    subCategoryName={subCategoryName}
                    onSelectSubcategory={setSubCategoryName}
                    isCustomSubCategory={isCustomSubCategory}
                    setIsCustomSubCategory={setIsCustomSubCategory}
                    customSubCategory={customSubCategory}
                    onCustomSubCategoryChange={setCustomSubCategory}
                    storeCategory={storeCategory}
                    itemTitle={title}
                    isLoading={isLoadingCategories}
                  />

                  {/* Step 1 Navigation Footer */}
                  <div className="flex items-center justify-end gap-3 pt-6 border-t border-zinc-100 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-5 py-2.5 rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-bold transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-zinc-950 text-xs font-extrabold shadow-md shadow-amber-500/20 transition-all active:scale-95 flex items-center gap-2"
                    >
                      <span>Continue to Details</span>
                      <ArrowRightIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: DETAILS, PRICING & ITEM TYPE */}
              {currentStep === 2 && (
                <div className="space-y-5 animate-fadeIn">
                  <div className="space-y-1">
                    <h4 className="text-sm font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
                      <CubeIcon className="w-4 h-4 text-amber-500" />
                      Item Details & Pricing
                    </h4>
                    <p className="text-xs text-zinc-500">
                      Specify if this is physical merchandise or a digital download, along with your pricing.
                    </p>
                  </div>

                  {/* Item Type Switch */}
                  <div className="flex items-center gap-2 p-1.5 bg-zinc-100 dark:bg-zinc-800/80 rounded-2xl">
                    <button
                      type="button"
                      onClick={() => setItemType("physical")}
                      className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${
                        itemType === "physical"
                          ? "bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white shadow-sm"
                          : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                      }`}
                    >
                      <CubeIcon className="w-4 h-4 text-amber-500" />
                      <span>Physical Product</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setItemType("digital")}
                      className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${
                        itemType === "digital"
                          ? "bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white shadow-sm"
                          : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                      }`}
                    >
                      <DocumentArrowDownIcon className="w-4 h-4 text-amber-500" />
                      <span>Digital / PDF Download</span>
                    </button>
                  </div>

                  {/* Item Title */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Item Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder={
                        itemType === "physical"
                          ? "e.g. Nike Air Max 90 - Black/White (Size 42)"
                          : "e.g. Python Programming Handbook (2026 Edition PDF)"
                      }
                      className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs font-semibold text-zinc-900 dark:text-white shadow-xs"
                    />
                  </div>

                  {/* Brand Selection */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                        Brand / Manufacturer
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsCustomBrand(!isCustomBrand)}
                        className="text-[11px] text-amber-600 dark:text-amber-400 hover:underline font-bold"
                      >
                        {isCustomBrand ? "Select popular brand" : "+ Custom Brand"}
                      </button>
                    </div>

                    {isCustomBrand ? (
                      <input
                        type="text"
                        value={customBrand}
                        onChange={(e) => setCustomBrand(e.target.value)}
                        placeholder="e.g. Nike, Apple, Samsung, Local Artisan..."
                        className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs font-semibold text-zinc-900 dark:text-white shadow-xs"
                      />
                    ) : (
                      <select
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs font-semibold text-zinc-900 dark:text-white shadow-xs"
                      >
                        {(activeCategory?.brands || ["Generic", "Local Brand"]).map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Price & Stock */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
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
                        className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs font-bold text-zinc-900 dark:text-white shadow-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                        {itemType === "digital" ? "Inventory Type" : "Stock Quantity"}
                      </label>
                      {itemType === "digital" ? (
                        <div className="px-4 py-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-400 font-extrabold flex items-center gap-2 shadow-xs">
                          <CheckBadgeIcon className="w-4 h-4" />
                          <span>Unlimited (Digital Asset)</span>
                        </div>
                      ) : (
                        <input
                          type="number"
                          min="1"
                          value={stock}
                          onChange={(e) => setStock(e.target.value)}
                          placeholder="1"
                          className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs font-semibold text-zinc-900 dark:text-white shadow-xs"
                        />
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe your item, key features, condition, or download contents..."
                      className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs font-medium text-zinc-900 dark:text-white shadow-xs"
                    />
                  </div>

                  {/* Step 2 Navigation Footer */}
                  <div className="flex items-center justify-between pt-6 border-t border-zinc-100 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="px-4 py-2.5 rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <ArrowLeftIcon className="w-4 h-4" />
                      <span>Back to Category</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-zinc-950 text-xs font-extrabold shadow-md shadow-amber-500/20 transition-all active:scale-95 flex items-center gap-2"
                    >
                      <span>Continue to Media</span>
                      <ArrowRightIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: MEDIA UPLOADER & PUBLISHING */}
              {currentStep === 3 && (
                <div className="space-y-5 animate-fadeIn">
                  <div className="space-y-1">
                    <h4 className="text-sm font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
                      <PhotoIcon className="w-4 h-4 text-amber-500" />
                      Product Photos & Media Assets
                    </h4>
                    <p className="text-xs text-zinc-500">
                      Upload high-resolution images, video reels, or PDF files to showcase your listing.
                    </p>
                  </div>

                  <GhubaImageUploader
                    images={images}
                    onChange={setImages}
                    videos={videos}
                    onVideosChange={setVideos}
                    documents={ebooks}
                    onDocumentsChange={setEbooks}
                    maxImages={6}
                    allowVideo={true}
                    maxVideos={1}
                    allowDocuments={itemType === "digital"}
                    maxDocuments={2}
                    companyId={companyId}
                    title={itemType === "digital" ? "Cover Photo & PDF Document" : "Product Photos & Video Reel"}
                  />

                  {/* Step 3 Navigation Footer */}
                  <div className="flex items-center justify-between pt-6 border-t border-zinc-100 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="px-4 py-2.5 rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <ArrowLeftIcon className="w-4 h-4" />
                      <span>Back to Details</span>
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-7 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-zinc-950 text-xs font-extrabold shadow-lg shadow-amber-500/25 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                          <span>{isEditing ? "Saving Changes..." : "Publishing to Ghuba..."}</span>
                        </>
                      ) : (
                        <span>{isEditing ? "Save Changes" : "Publish to Ghuba"}</span>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}