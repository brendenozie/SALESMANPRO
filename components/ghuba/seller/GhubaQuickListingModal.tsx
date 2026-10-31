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
  EyeIcon,
  CheckIcon,
  ShoppingBagIcon,
  ShieldCheckIcon,
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

  // Wizard Step State: 1 = Category & Type, 2 = Details & Pricing, 3 = Media & Preview
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
      let serverError = "";

      if (contentType.includes("application/json")) {
        data = await res.json().catch(() => ({}));
        if (!res.ok) {
          serverError = data.error || data.message || `Server error (${res.status})`;
        }
      } else {
        const textResponse = await res.text().catch(() => "");
        console.error("[GhubaListingModal] Non-JSON response:", res.status, textResponse.slice(0, 300));

        if (res.status === 401) {
          serverError = "Authentication session expired. Please sign in again.";
        } else if (res.status === 404) {
          serverError = "Store profile not found. Please complete store onboarding first.";
        } else if (res.status === 403) {
          setLimitExceeded(true);
          serverError = "Marketplace listing limit reached. Upgrade to add more items.";
        } else {
          const titleMatch = textResponse.match(/<title>(.*?)<\/title>/i);
          const errorSnippet = titleMatch ? titleMatch[1] : textResponse.slice(0, 120).replace(/<[^>]*>/g, "").trim();
          serverError = errorSnippet ? `Server error (${res.status}): ${errorSnippet}` : `Server returned error (${res.status}). Please try again.`;
        }
      }

      if (!res.ok) {
        if (res.status === 403) {
          setLimitExceeded(true);
        }
        throw new Error(serverError || data.error || (isEditing ? "Failed to update listing." : "Failed to create listing."));
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepsMeta = [
    { number: 1, title: "Category & Type", icon: TagIcon },
    { number: 2, title: "Details & Price", icon: CubeIcon },
    { number: 3, title: "Media & Preview", icon: PhotoIcon },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 overflow-hidden">
        {/* Full-bleed Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity"
        />

        {/* Modal Sheet / Dialog */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.98 }}
          transition={{ duration: 0.24, ease: "easeOut" }}
          className="relative w-full sm:max-w-3xl lg:max-w-4xl h-[94dvh] sm:h-auto sm:max-h-[90vh] bg-white dark:bg-zinc-900 rounded-t-[2rem] sm:rounded-3xl shadow-2xl border-t sm:border border-zinc-200/80 dark:border-zinc-800 flex flex-col z-10 overflow-hidden"
        >
          {/* Top Grab Bar (Mobile Bottom-Sheet Cue) */}
          <div className="sm:hidden flex justify-center pt-2.5 pb-1 bg-zinc-50 dark:bg-zinc-900">
            <div className="w-12 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
          </div>

          {/* Sticky Header */}
          <div className="flex-none px-4 sm:px-8 py-3.5 sm:py-4 border-b border-zinc-100 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-amber-400/20 to-amber-600/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold shadow-xs shrink-0 ring-1 ring-amber-500/20">
                {isEditing ? <PencilSquareIcon className="w-5 h-5 sm:w-6 sm:h-6" /> : <SparklesIcon className="w-5 h-5 sm:w-6 sm:h-6" />}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-black text-zinc-900 dark:text-white truncate">
                    {isEditing ? "Edit Marketplace Listing" : "Add Marketplace Listing"}
                  </h3>
                  {!isEditing && (
                    <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                      Ghuba Direct
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-500 font-medium truncate">
                  {isEditing
                    ? "Update item pricing, category & media assets"
                    : `${currentActiveCount} of ${listingLimit} free slots used`}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              aria-label="Close dialog"
              className="p-2 sm:p-2.5 rounded-2xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shrink-0"
            >
              <XMarkIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* Stepper Navigation Bar */}
          {!isAtLimit && !limitExceeded && (
            <div className="flex-none px-4 sm:px-8 py-3 bg-zinc-50/80 dark:bg-zinc-900/60 border-b border-zinc-100 dark:border-zinc-800/80">
              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                {stepsMeta.map((s) => {
                  const isPassed = currentStep > s.number;
                  const isCurrent = currentStep === s.number;
                  const Icon = s.icon;
                  return (
                    <button
                      key={s.number}
                      type="button"
                      disabled={!isPassed && !isCurrent}
                      onClick={() => isPassed && setCurrentStep(s.number as any)}
                      className={`group text-left transition-all flex flex-col gap-1.5 ${
                        isPassed ? "cursor-pointer" : "cursor-default"
                      }`}
                    >
                      {/* Step Progress Line */}
                      <div
                        className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                          isPassed
                            ? "bg-emerald-500 dark:bg-emerald-400 shadow-xs"
                            : isCurrent
                            ? "bg-amber-500 shadow-xs ring-2 ring-amber-500/30"
                            : "bg-zinc-200 dark:bg-zinc-800"
                        }`}
                      />
                      {/* Step Label */}
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[11px] sm:text-xs font-black uppercase tracking-wider flex items-center gap-1 ${
                            isCurrent
                              ? "text-amber-600 dark:text-amber-400"
                              : isPassed
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-zinc-400 dark:text-zinc-600"
                          }`}
                        >
                          {isPassed ? (
                            <CheckIcon className="w-3.5 h-3.5 stroke-[3]" />
                          ) : (
                            <span>{s.number}.</span>
                          )}
                          <span className="truncate">{s.title}</span>
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Limit Reached View */}
          {isAtLimit || limitExceeded ? (
            <div className="flex-1 overflow-y-auto p-6 sm:p-12 text-center flex flex-col items-center justify-center space-y-5">
              <div className="w-20 h-20 rounded-3xl bg-amber-500/10 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-lg border border-amber-500/20">
                <ExclamationTriangleIcon className="w-10 h-10" />
              </div>
              <div className="space-y-2 max-w-md">
                <h4 className="text-xl font-black text-zinc-900 dark:text-white">
                  Marketplace Capacity Reached ({currentActiveCount}/{listingLimit})
                </h4>
                <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed">
                  You have reached the maximum free limit for Ghuba. Upgrade to SalesmanPro to unlock unlimited listings, customized store web portals, wholesale pricing tiers, and real-time counter POS.
                </p>
              </div>
              <div className="pt-2 flex flex-col sm:flex-row gap-3 w-full max-w-xs justify-center">
                <a
                  href="/api/auth/handover?target=https://salesmanpro.store/stores"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-zinc-950 font-black text-sm shadow-lg shadow-amber-500/25 transition-all active:scale-95"
                >
                  <span>Upgrade Store</span>
                  <ArrowRightIcon className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold text-sm transition-colors"
                >
                  Manage Listings
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
              {/* Scrollable Form Body */}
              <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-5 sm:py-6 space-y-6">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/60 text-xs sm:text-sm text-red-600 dark:text-red-400 font-semibold shadow-xs flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2">
                      <ExclamationTriangleIcon className="w-5 h-5 shrink-0 text-red-500" />
                      <span>{error}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setError(null)}
                      className="p-1 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 text-red-500 shrink-0"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </motion.div>
                )}

                {/* ================= STEP 1: CATEGORY & PRODUCT TYPE ================= */}
                {currentStep === 1 && (
                  <div className="space-y-6 animate-fadeIn">
                    {/* Item Type Switch Cards */}
                    <div className="space-y-2">
                      <label className="block text-xs font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                        Select Product Type
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setItemType("physical")}
                          className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 relative overflow-hidden ${
                            itemType === "physical"
                              ? "bg-amber-500/10 dark:bg-amber-500/15 border-amber-500 ring-2 ring-amber-500/30 text-zinc-950 dark:text-white"
                              : "bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-600 dark:text-zinc-400"
                          }`}
                        >
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                              itemType === "physical"
                                ? "bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20"
                                : "bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300"
                            }`}
                          >
                            <CubeIcon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-extrabold text-zinc-900 dark:text-white">Physical Product</span>
                              {itemType === "physical" && <CheckBadgeIcon className="w-5 h-5 text-amber-500 shrink-0" />}
                            </div>
                            <p className="text-xs text-zinc-500 mt-0.5 leading-snug">
                              Physical merchandise, shoes, apparel, electronics, foods or hardware shipped to buyers.
                            </p>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setItemType("digital")}
                          className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 relative overflow-hidden ${
                            itemType === "digital"
                              ? "bg-amber-500/10 dark:bg-amber-500/15 border-amber-500 ring-2 ring-amber-500/30 text-zinc-950 dark:text-white"
                              : "bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-600 dark:text-zinc-400"
                          }`}
                        >
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                              itemType === "digital"
                                ? "bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20"
                                : "bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300"
                            }`}
                          >
                            <DocumentArrowDownIcon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-extrabold text-zinc-900 dark:text-white">Digital Download</span>
                              {itemType === "digital" && <CheckBadgeIcon className="w-5 h-5 text-amber-500 shrink-0" />}
                            </div>
                            <p className="text-xs text-zinc-500 mt-0.5 leading-snug">
                              E-books, guides, PDF materials, courses, software or digital tickets delivered instantly online.
                            </p>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Taxonomy Category Picker */}
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
                            <TagIcon className="w-4 h-4 text-amber-500" />
                            Marketplace Taxonomy
                          </h4>
                          <p className="text-xs text-zinc-500">
                            Choose where buyers will discover your listing in the Ghuba catalog.
                          </p>
                        </div>
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
                    </div>
                  </div>
                )}

                {/* ================= STEP 2: DETAILS & PRICING ================= */}
                {currentStep === 2 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="space-y-1">
                      <h4 className="text-sm font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
                        <CubeIcon className="w-4 h-4 text-amber-500" />
                        Item Specifications & Pricing
                      </h4>
                      <p className="text-xs text-zinc-500">
                        Set your product title, brand, selling price in KES, and stock availability.
                      </p>
                    </div>

                    {/* Item Title Input */}
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                        Item Title <span className="text-amber-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder={
                          itemType === "physical"
                            ? "e.g. Nike Air Max 90 - Black/White (Size 42)"
                            : "e.g. Full-Stack Web Development Handbook (2026 Edition PDF)"
                        }
                        className="w-full px-4 py-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-semibold text-zinc-900 dark:text-white shadow-xs placeholder:text-zinc-400"
                      />
                    </div>

                    {/* Brand / Manufacturer Input */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                          Brand / Manufacturer
                        </label>
                        <button
                          type="button"
                          onClick={() => setIsCustomBrand(!isCustomBrand)}
                          className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-bold"
                        >
                          {isCustomBrand ? "Pick popular brand" : "+ Custom Brand / Artisan"}
                        </button>
                      </div>

                      {isCustomBrand ? (
                        <input
                          type="text"
                          value={customBrand}
                          onChange={(e) => setCustomBrand(e.target.value)}
                          placeholder="e.g. Nike, Apple, Samsung, Local Artisan..."
                          className="w-full px-4 py-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-semibold text-zinc-900 dark:text-white shadow-xs"
                        />
                      ) : (
                        <select
                          value={brand}
                          onChange={(e) => setBrand(e.target.value)}
                          className="w-full px-4 py-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-semibold text-zinc-900 dark:text-white shadow-xs"
                        >
                          {(activeCategory?.brands || ["Generic", "Local Brand"]).map((b) => (
                            <option key={b} value={b}>
                              {b}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    {/* Price & Stock Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Price (KES) */}
                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                          Selling Price <span className="text-amber-500">*</span>
                        </label>
                        <div className="relative rounded-2xl shadow-xs">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                            <span className="text-xs font-black text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg">
                              KES
                            </span>
                          </div>
                          <input
                            type="number"
                            required
                            min="1"
                            step="1"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder="e.g. 2500"
                            className="w-full pl-18 pr-4 py-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-amber-500 text-base sm:text-sm font-black text-zinc-900 dark:text-white"
                          />
                        </div>
                      </div>

                      {/* Stock Quantity */}
                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                          {itemType === "digital" ? "Inventory Status" : "Stock Quantity"}
                        </label>
                        {itemType === "digital" ? (
                          <div className="px-4 py-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-400 font-extrabold flex items-center gap-2 shadow-xs">
                            <CheckBadgeIcon className="w-5 h-5" />
                            <span>Unlimited Digital Inventory</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setStock((prev) => String(Math.max(0, (parseInt(prev) || 0) - 1)))}
                              className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-black text-lg flex items-center justify-center hover:bg-zinc-200 dark:hover:bg-zinc-700 active:scale-95 transition-all shrink-0 border border-zinc-200 dark:border-zinc-700"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min="0"
                              value={stock}
                              onChange={(e) => setStock(e.target.value)}
                              placeholder="1"
                              className="w-full px-4 py-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-amber-500 text-base sm:text-sm font-bold text-center text-zinc-900 dark:text-white shadow-xs"
                            />
                            <button
                              type="button"
                              onClick={() => setStock((prev) => String((parseInt(prev) || 0) + 1))}
                              className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-black text-lg flex items-center justify-center hover:bg-zinc-200 dark:hover:bg-zinc-700 active:scale-95 transition-all shrink-0 border border-zinc-200 dark:border-zinc-700"
                            >
                              +
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Description Textarea */}
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                        Product Description
                      </label>
                      <textarea
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe your item, key specifications, condition, package inclusions, or download contents..."
                        className="w-full px-4 py-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-medium text-zinc-900 dark:text-white shadow-xs placeholder:text-zinc-400"
                      />
                    </div>
                  </div>
                )}

                {/* ================= STEP 3: MEDIA & LIVE PREVIEW ================= */}
                {currentStep === 3 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="space-y-1">
                      <h4 className="text-sm font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
                        <PhotoIcon className="w-4 h-4 text-amber-500" />
                        Photos, Video & Live Preview
                      </h4>
                      <p className="text-xs text-zinc-500">
                        Upload high quality cover photos and media, then verify how your item appears to buyers.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                      {/* Uploader Column */}
                      <div className="lg:col-span-7 space-y-4">
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
                      </div>

                      {/* Live Preview Card Column */}
                      <div className="lg:col-span-5 space-y-3">
                        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                          <EyeIcon className="w-4 h-4 text-amber-500" />
                          <span>Shopper Live Preview</span>
                        </div>

                        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/60 overflow-hidden shadow-md">
                          {/* Card Thumbnail Image */}
                          <div className="aspect-video w-full bg-zinc-200 dark:bg-zinc-800 relative flex items-center justify-center overflow-hidden">
                            {images.length > 0 ? (
                              <img
                                src={images[0]}
                                alt="Listing Preview"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="text-center p-4 text-zinc-400 dark:text-zinc-600">
                                <PhotoIcon className="w-10 h-10 mx-auto mb-1 stroke-1" />
                                <span className="text-xs font-medium">Upload photo to preview</span>
                              </div>
                            )}

                            {/* Badge Tag */}
                            <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-black text-white flex items-center gap-1">
                              <ShieldCheckIcon className="w-3.5 h-3.5 text-amber-400" />
                              <span>{selectedCategoryName || "General"}</span>
                            </div>
                          </div>

                          {/* Card Body */}
                          <div className="p-4 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <h5 className="font-extrabold text-sm text-zinc-900 dark:text-white line-clamp-1">
                                {title || "Untitled Product"}
                              </h5>
                            </div>

                            <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                              {description || "No description provided yet."}
                            </p>

                            <div className="pt-2 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800">
                              <div>
                                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Price</span>
                                <span className="text-base font-black text-amber-600 dark:text-amber-400">
                                  KES {Number(price || 0).toLocaleString()}
                                </span>
                              </div>
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                <CheckBadgeIcon className="w-3.5 h-3.5" />
                                {itemType === "digital" ? "Instant Delivery" : `${stock || 1} in stock`}
                              </span>
                            </div>
                          </div>
                        </div>

                        <p className="text-[11px] text-zinc-400 dark:text-zinc-500 leading-normal italic px-1">
                          Verified marketplace listings are visible on Ghuba search, store web storefronts, and WhatsApp automated catalogs.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ================= STICKY FOOTER ACTIONS ================= */}
              <div className="flex-none px-4 sm:px-8 py-3.5 sm:py-4 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-3">
                {/* Back or Cancel */}
                {currentStep === 1 ? (
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 sm:px-5 py-3 rounded-2xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs sm:text-sm font-bold transition-colors"
                  >
                    Cancel
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setCurrentStep((prev) => (prev > 1 ? ((prev - 1) as any) : 1))}
                    className="px-4 sm:px-5 py-3 rounded-2xl text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs sm:text-sm font-extrabold flex items-center gap-1.5 transition-colors border border-zinc-200 dark:border-zinc-700"
                  >
                    <ArrowLeftIcon className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                )}

                {/* Progress / Step indicator on Mobile */}
                <div className="hidden sm:block text-xs font-semibold text-zinc-400">
                  Step {currentStep} of 3
                </div>

                {/* Forward / Submit Action */}
                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="px-6 sm:px-8 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-zinc-950 text-xs sm:text-sm font-black shadow-lg shadow-amber-500/25 transition-all active:scale-95 flex items-center gap-2"
                  >
                    <span>{currentStep === 1 ? "Continue to Details" : "Continue to Media"}</span>
                    <ArrowRightIcon className="w-4 h-4 stroke-[2.5]" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 sm:px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-zinc-950 text-xs sm:text-sm font-black shadow-lg shadow-amber-500/30 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                        <span>{isEditing ? "Saving Changes..." : "Publishing..."}</span>
                      </>
                    ) : (
                      <>
                        <CheckBadgeIcon className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
                        <span>{isEditing ? "Save Changes" : "Publish to Ghuba"}</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
