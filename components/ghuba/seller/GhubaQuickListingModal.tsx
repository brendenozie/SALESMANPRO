"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  XMarkIcon,
  SparklesIcon,
  CheckBadgeIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import GhubaImageUploader from "./GhubaImageUploader";

const POPULAR_CATEGORIES = [
  "Fashion & Apparel",
  "Shoes & Sneakers",
  "Phones & Electronics",
  "Beauty & Personal Care",
  "Furniture & Decor",
  "Food & Groceries",
  "Auto Accessories & Parts",
  "Sports & Fitness",
  "Books & Stationery",
  "Services",
  "General Retail",
];

interface GhubaQuickListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  companyId?: string;
  currentActiveCount: number;
  listingLimit: number;
}

export default function GhubaQuickListingModal({
  isOpen,
  onClose,
  onSuccess,
  companyId,
  currentActiveCount,
  listingLimit,
}: GhubaQuickListingModalProps) {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("1");
  const [category, setCategory] = useState(POPULAR_CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [limitExceeded, setLimitExceeded] = useState(false);

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

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/ghuba/seller/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: title.trim(),
          price: Number(price),
          stock: Number(stock) || 1,
          category,
          description: description.trim(),
          images, // Presigned S3 CDN URLs uploaded through the new media utility
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
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                  Add Marketplace Item
                </h3>
                <p className="text-xs text-zinc-500">
                  Listing slot: <span className="font-semibold text-amber-600 dark:text-amber-400">{currentActiveCount} of {listingLimit}</span> free slots used
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
              <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
                <ExclamationTriangleIcon className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold text-zinc-900 dark:text-white">
                Marketplace Limit Reached (10/10 Items)
              </h4>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
                Your free Ghuba marketplace tier includes up to 10 active listings. To publish more products, unlock a standalone online store, and access POS inventory sync, upgrade to SalesmanPro.
              </p>
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 text-left max-w-md mx-auto space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-zinc-900 dark:text-white">
                  <CheckBadgeIcon className="w-4 h-4 text-emerald-500" />
                  Starter Plan: 25 Listings + POS + M-Pesa receipts
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-zinc-900 dark:text-white">
                  <CheckBadgeIcon className="w-4 h-4 text-emerald-500" />
                  Pro Plan: 200 Listings + Custom Domain
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-zinc-900 dark:text-white">
                  <CheckBadgeIcon className="w-4 h-4 text-emerald-500" />
                  Growth Plan: Unlimited Listings + Multi-Branch
                </div>
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

              {/* Category */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm text-zinc-900 dark:text-white"
                >
                  {POPULAR_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
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

              {/* Image Uploader with new direct-to-S3 client */}
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
                      Publishing...
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
