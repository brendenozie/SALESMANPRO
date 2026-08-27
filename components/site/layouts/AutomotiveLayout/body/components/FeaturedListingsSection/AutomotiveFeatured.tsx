"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { MarketListingForm } from "@/types/typings";
import clsx from "clsx";
import { SparklesIcon, TagIcon, ArrowRightIcon } from "@heroicons/react/24/solid";
import AutomotiveCard from "../AutomotiveCard"; // Assuming you have this or use your VehicleCard

/* --- Skeleton Loader --- */
function VehicleCardSkeleton() {
  return (
    <div className="animate-pulse bg-white/50 dark:bg-gray-800/50 backdrop-blur-md border border-gray-100 dark:border-gray-700 rounded-3xl p-4 h-[420px]">
      <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-2xl mb-4" />
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-6" />
      <div className="grid grid-cols-3 gap-2">
        <div className="h-14 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        <div className="h-14 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        <div className="h-14 bg-gray-200 dark:bg-gray-700 rounded-xl" />
      </div>
    </div>
  );
}

export default function AutomotiveFeatured({
  listings,
  isLoading,
  error,
  slug,
  transactionType,
  onTransactionChange,
}: {
  listings: MarketListingForm[];
  isLoading: boolean;
  error: any;
  slug: string;
  transactionType: "SALE" | "RENT";
  onTransactionChange: (type: "SALE" | "RENT") => void;
}) {
  const filteredListings = listings || [];

  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-950 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header & Toggle Container */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-8">
          {/* Left: Titles */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <SparklesIcon className="w-5 h-5 text-amber-500" />
              <span className="text-sm font-bold uppercase tracking-wider text-amber-600 dark:text-amber-500">
                Hand Picked
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white leading-tight">
              Featured Vehicles
            </h2>
          </div>

          {/* Right: Premium Segmented Control */}
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl p-1.5 rounded-full shadow-sm border border-gray-200/50 dark:border-gray-700/50 flex relative">
            {(["SALE", "RENT"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => onTransactionChange(tab)}
                className={clsx(
                  "relative z-10 px-8 py-3 text-sm font-bold transition-all duration-300 rounded-full",
                  transactionType === tab
                    ? "text-white"
                    : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                )}
              >
                {transactionType === tab && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute inset-0 bg-blue-600 rounded-full shadow-lg"
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  />
                )}
                <span className="relative z-20">For {tab === "SALE" ? "Sale" : "Rent"}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Content Area with Fluid Transitions */}
        <div className="min-h-[450px]">
          <AnimatePresence mode="wait">
            {isLoading ? (
              // 1. Loading State
              <motion.div
                key="loading-state"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {Array.from({ length: 6 }).map((_, i) => (
                  <VehicleCardSkeleton key={`skeleton-${i}`} />
                ))}
              </motion.div>
            ) : filteredListings.length === 0 ? (
              // 2. Empty State
              <motion.div
                key="empty-state"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
                  <TagIcon className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  No Vehicles Found
                </h3>
                <p className="text-gray-500 mt-2 max-w-sm">
                  We currently don't have any featured vehicles for {transactionType.toLowerCase()}. Check back later!
                </p>
              </motion.div>
            ) : (
              // 3. Loaded Grid State
              <motion.div
                key={`grid-${transactionType}`} // Forces animation re-run when tab changes
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, staggerChildren: 0.05 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {filteredListings.slice(0, 6).map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <AutomotiveCard item={item} /> 
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* View All Button */}
        {!isLoading && filteredListings.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-16 text-center"
          >
            <Link href={`/automotive/listings?transactionType=${transactionType}`} passHref legacyBehavior>
              <a className="inline-flex items-center justify-center px-8 py-4 border border-gray-300 dark:border-gray-700 rounded-full text-base font-bold text-gray-700 dark:text-gray-200 bg-white/50 dark:bg-gray-900/50 backdrop-blur-md hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/10">
                View Full Inventory
                <ArrowRightIcon className="ml-2 w-4 h-4" />
              </a>
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}