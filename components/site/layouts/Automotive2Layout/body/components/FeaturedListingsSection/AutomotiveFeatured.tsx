"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { MarketListingForm } from "@/types/typings";
import clsx from "clsx";
import {
  SparklesIcon,
  TagIcon,
  ArrowRightIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/solid";
import AutomotiveCard from "../AutomotiveCard";

/* -------------------------------------------------------------------------- */
/* Background Mesh Pattern */
/* -------------------------------------------------------------------------- */
const GridPattern = () => (
  <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none text-slate-900 dark:text-amber-400">
    <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="featured-grid" width="32" height="32" patternUnits="userSpaceOnUse">
          <path d="M0 32L32 0H16L0 16M32 32V16L16 32" stroke="currentColor" strokeWidth="1" fill="none" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#featured-grid)" />
    </svg>
  </div>
);

/* -------------------------------------------------------------------------- */
/* Skeleton Loader */
/* -------------------------------------------------------------------------- */
function VehicleCardSkeleton() {
  return (
    <div className="animate-pulse bg-white dark:bg-[#0F141C] border border-slate-200 dark:border-slate-800 rounded-3xl p-4 h-[420px] flex flex-col justify-between shadow-sm dark:shadow-none transition-colors">
      <div>
        <div className="h-48 bg-slate-200 dark:bg-slate-800/80 rounded-2xl mb-4" />
        <div className="h-4 bg-slate-200 dark:bg-slate-800/80 rounded w-3/4 mb-3" />
        <div className="h-3 bg-slate-200 dark:bg-slate-800/80 rounded w-1/2 mb-6" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="h-12 bg-slate-200 dark:bg-slate-800/80 rounded-xl" />
        <div className="h-12 bg-slate-200 dark:bg-slate-800/80 rounded-xl" />
        <div className="h-12 bg-slate-200 dark:bg-slate-800/80 rounded-xl" />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Component Props Interface */
/* -------------------------------------------------------------------------- */
interface AutomotiveFeaturedProps {
  listings: MarketListingForm[];
  isLoading: boolean;
  error?: any;
  slug?: string;
  transactionType: "SALE" | "RENT";
  onTransactionChange: (type: "SALE" | "RENT") => void;
}

export default function AutomotiveFeatured({
  listings,
  isLoading,
  error,
  transactionType,
  onTransactionChange,
}: AutomotiveFeaturedProps) {
  const filteredListings = listings || [];

  return (
    <section className="relative py-20 md:py-28 bg-slate-50 dark:bg-[#080B10] text-slate-900 dark:text-white border-t border-slate-200 dark:border-slate-800/80 overflow-hidden transition-colors duration-300">
      <GridPattern />

      {/* Ambient Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-amber-500/10 dark:bg-amber-500/5 blur-[160px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header & Segmented Control */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 md:mb-16 gap-6 border-b border-slate-200 dark:border-slate-800/80 pb-8 transition-colors">
          
          {/* Titles */}
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-3">
              <SparklesIcon className="w-4 h-4 text-amber-500" />
              <span>Hand Picked Inventory</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
              Featured <span className="text-amber-500">Commercial Fleets</span>
            </h2>
          </div>

          {/* Segmented Control Switcher */}
          <div className="bg-slate-200/80 dark:bg-[#0F141C] p-1.5 rounded-full border border-slate-300 dark:border-slate-800 flex relative shadow-inner transition-colors">
            {(["SALE", "RENT"] as const).map((tab) => {
              const isActive = transactionType === tab;
              return (
                <button
                  key={tab}
                  onClick={() => onTransactionChange(tab)}
                  className={clsx(
                    "relative z-10 px-7 py-2.5 text-xs font-black uppercase tracking-wider transition-colors duration-300 rounded-full cursor-pointer",
                    isActive
                      ? "text-slate-950"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeFeaturedTab"
                      className="absolute inset-0 bg-amber-500 rounded-full shadow-md"
                      transition={{ type: "spring", stiffness: 400, damping: 28 }}
                    />
                  )}
                  <span className="relative z-20">For {tab === "SALE" ? "Sale" : "Lease / Rent"}</span>
                </button>
              );
            })}
          </div>

        </div>

        {/* Dynamic Content Display */}
        <div className="min-h-[450px]">
          <AnimatePresence mode="wait">
            
            {/* 1. Loading State */}
            {isLoading ? (
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
            ) : error ? (
              
              /* 2. Error State */
              <motion.div
                key="error-state"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col items-center justify-center py-20 text-center bg-white/60 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 backdrop-blur-sm shadow-sm dark:shadow-none transition-colors"
              >
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 dark:text-rose-400 mb-4">
                  <ExclamationTriangleIcon className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold uppercase text-slate-900 dark:text-white tracking-wide">
                  Unable to load featured listings
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
                  Please try refreshing the page or check back shortly.
                </p>
              </motion.div>
            ) : filteredListings.length === 0 ? (
              
              /* 3. Empty State */
              <motion.div
                key="empty-state"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col items-center justify-center py-20 text-center bg-white/60 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 backdrop-blur-sm shadow-sm dark:shadow-none transition-colors"
              >
                <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 mb-4 transition-colors">
                  <TagIcon className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold uppercase text-slate-900 dark:text-white tracking-wide">
                  No Commercial Vehicles Available
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 max-w-sm">
                  We currently do not have featured listings available for {transactionType.toLowerCase()}. Check back soon for updated yard arrivals!
                </p>
              </motion.div>
            ) : (
              
              /* 4. Loaded Listings Grid */
              <motion.div
                key={`grid-${transactionType}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, staggerChildren: 0.05 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {filteredListings.slice(0, 6).map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.96 }}
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

        {/* View Full Inventory Action Button */}
        {!isLoading && !error && filteredListings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-16 text-center"
          >
            <Link
              href={`/automotive/listings?transactionType=${transactionType}`}
              className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-extrabold text-xs uppercase tracking-wider rounded-full border border-slate-300 dark:border-slate-700/80 hover:border-amber-500/50 transition-all duration-300 shadow-sm hover:shadow-amber-500/10 group"
            >
              <span>Explore Full Inventory</span>
              <ArrowRightIcon className="w-4 h-4 text-amber-500 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        )}

      </div>
    </section>
  );
}