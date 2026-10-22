"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  BuildingStorefrontIcon,
  SparklesIcon,
  CheckBadgeIcon,
  PhoneIcon,
  MapPinIcon,
  ArrowRightIcon,
  ShoppingBagIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import GhubaImageUploader from "./GhubaImageUploader";

const RETAIL_CATEGORIES = [
  "Fashion & Apparel",
  "Shoes & Footwear",
  "Electronics & Gadgets",
  "Beauty & Cosmetics",
  "Home Decor & Furniture",
  "Food, Snacks & Groceries",
  "Automotive & Motor Accessories",
  "Baby & Kids Essentials",
  "Art, Crafts & Gifts",
  "General Merchandise",
];

interface GhubaSellerOnboardingViewProps {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
  };
  onStoreCreated: (store: any) => void;
}

export default function GhubaSellerOnboardingView({
  user,
  onStoreCreated,
}: GhubaSellerOnboardingViewProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState(RETAIL_CATEGORIES[0]);
  const [contactPhone, setContactPhone] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [logoImages, setLogoImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || name.trim().length < 2) {
      setError("Please provide a store name (at least 2 characters).");
      return;
    }
    if (!contactPhone.trim()) {
      setError("Please provide your contact phone / M-Pesa number.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/ghuba/seller/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          category,
          contactPhone: contactPhone.trim(),
          contactEmail: user.email,
          address: address.trim() || undefined,
          description: description.trim() || undefined,
          logoUrl: logoImages[0] || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create store.");
      }

      onStoreCreated(data.store);
    } catch (err: any) {
      setError(err?.message || "Failed to onboard store.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Hero Welcome */}
      <div className="text-center space-y-3 mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
          <SparklesIcon className="w-4 h-4" />
          Start Selling on Ghuba Marketplace
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
          Welcome, {user.name || "Merchant"}! Let&apos;s Set Up Your Store
        </h1>
        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto">
          Reach thousands of verified Kenyan buyers. Get started with <span className="font-bold text-amber-600 dark:text-amber-400">10 free marketplace listings</span>, in-app order alerts, and instant M-Pesa settlements.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Form */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl space-y-6"
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-xs text-red-600 dark:text-red-400 font-medium">
                  {error}
                </div>
              )}

              {/* Store Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Store or Business Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                    <BuildingStorefrontIcon className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Trendy Nairobi Footwear"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm text-zinc-900 dark:text-white font-medium"
                  />
                </div>
                {name && (
                  <p className="text-xs text-zinc-500 mt-1.5 pl-1">
                    Your public Ghuba link:{" "}
                    <span className="font-mono text-amber-600 dark:text-amber-400 font-semibold">
                      ghuba.shop/store/{name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}
                    </span>
                  </p>
                )}
              </div>

              {/* Primary Category */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Primary Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm text-zinc-900 dark:text-white font-medium"
                >
                  {RETAIL_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Phone & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Contact Phone / M-Pesa *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                      <PhoneIcon className="w-5 h-5" />
                    </div>
                    <input
                      type="tel"
                      required
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="e.g. 0712 345 678"
                      className="w-full pl-11 pr-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm text-zinc-900 dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Location / Area
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                      <MapPinIcon className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. Nairobi CBD, Imenti House"
                      className="w-full pl-11 pr-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm text-zinc-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                  About Your Business (Optional)
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell buyers what you sell, your specialties, and return policies..."
                  className="w-full px-4 py-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm text-zinc-900 dark:text-white"
                />
              </div>

              {/* Logo Upload with new uploadClient */}
              <div className="pt-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
                  Store Logo or Photo (Optional)
                </label>
                <GhubaImageUploader
                  images={logoImages}
                  onChange={setLogoImages}
                  maxImages={1}
                />
              </div>

              {/* Submit */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 rounded-full bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                      Setting Up Your Store...
                    </>
                  ) : (
                    <>
                      Launch My Ghuba Store
                      <ArrowRightIcon className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>

        {/* Right Feature Panel */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-amber-500/10 border border-amber-500/20 space-y-4">
            <h3 className="font-bold text-base text-zinc-900 dark:text-white flex items-center gap-2">
              <ShieldCheckIcon className="w-5 h-5 text-amber-500" />
              What You Get On Ghuba
            </h3>
            <ul className="space-y-3 text-xs text-zinc-700 dark:text-zinc-300">
              <li className="flex items-start gap-2.5">
                <CheckBadgeIcon className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>10 Free Marketplace Listings:</strong> Put your best products in front of Kenyan shoppers.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckBadgeIcon className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Direct M-Pesa & Card Checkout:</strong> Instant mobile customer payments.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckBadgeIcon className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Verified Nairobi Delivery:</strong> Optional integrated rider dispatch to your buyers.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckBadgeIcon className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>SalesmanPro Growth Engine:</strong> Unlock a custom domain, physical store POS, and unlimited catalog when you grow.</span>
              </li>
            </ul>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 space-y-2">
            <div className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
              <ShoppingBagIcon className="w-4 h-4 text-amber-500" />
              Seamless In-Domain Experience
            </div>
            <p>
              Manage your products, orders, and customer inquiries directly on <strong>ghuba.shop</strong>. You only switch to SalesmanPro when you want to build a custom website or connect barcode POS hardware.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
