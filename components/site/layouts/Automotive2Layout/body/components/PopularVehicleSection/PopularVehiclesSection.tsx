"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { MarketListingForm } from "@/types/typings";
import {
  SparklesIcon,
  TagIcon,
  ArrowRightIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/solid";
import AutomotiveCard from "../AutomotiveCard";

/* -------------------------------------------------------------------------- */
/* Background Technical Grid */
/* -------------------------------------------------------------------------- */
const GridPattern = () => (
  <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none text-slate-900 dark:text-amber-400">
    <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="popular-grid" width="32" height="32" patternUnits="userSpaceOnUse">
          <path d="M0 32L32 0H16L0 16M32 32V16L16 32" stroke="currentColor" strokeWidth="1" fill="none" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#popular-grid)" />
    </svg>
  </div>
);

/* -------------------------------------------------------------------------- */
/* Skeleton Card Component */
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
/* Component Interfaces */
/* -------------------------------------------------------------------------- */
interface PopularVehiclesSectionProps {
  listings: MarketListingForm[];
  isLoading?: boolean;
  error?: any;
  slug?: string;
}

/* -------------------------------------------------------------------------- */
/* Main Component */
/* -------------------------------------------------------------------------- */
export default function PopularVehiclesSection({
  listings,
  isLoading = false,
  error = null,
}: PopularVehiclesSectionProps) {
  const displayListings = listings || [];

  // Motion container variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  };

  return (
    <section 
      id="listings" 
      className="relative py-20 md:py-28 bg-slate-50 dark:bg-[#080B10] text-slate-900 dark:text-white border-t border-slate-200 dark:border-slate-800/80 overflow-hidden transition-colors duration-300"
    >
      <GridPattern />

      {/* Ambient Glow Effects */}
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-amber-500/10 dark:bg-amber-500/5 blur-[150px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-0 w-96 h-96 bg-amber-600/10 dark:bg-amber-600/5 blur-[150px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-16 gap-6 border-b border-slate-200 dark:border-slate-800/80 pb-8 transition-colors">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-3">
              <SparklesIcon className="w-3.5 h-3.5 text-amber-500" />
              <span>Commercial Fleet</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-slate-900 dark:text-white leading-tight">
              Popular <span className="text-amber-500">Arrivals</span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Link
              href="/automotive/listings"
              className="hidden md:inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors group"
            >
              <span>Explore Full Catalog</span>
              <ArrowRightIcon className="w-4 h-4 text-amber-500 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>

        {/* Dynamic Display Area */}
        <div className="min-h-[400px]">
          <AnimatePresence mode="wait">
            
            {/* Loading State */}
            {isLoading ? (
              <motion.div
                key="loading-popular"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {Array.from({ length: 6 }).map((_, i) => (
                  <VehicleCardSkeleton key={`skeleton-pop-${i}`} />
                ))}
              </motion.div>
            ) : error ? (

              /* Error State */
              <motion.div
                key="error-popular"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center justify-center py-20 text-center bg-white/60 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 backdrop-blur-sm shadow-sm dark:shadow-none transition-colors"
              >
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 dark:text-rose-400 mb-4">
                  <ExclamationTriangleIcon className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold uppercase text-slate-900 dark:text-white tracking-wide">
                  Failed to load popular vehicles
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
                  We encountered an issue retrieving popular arrivals. Please try again shortly.
                </p>
              </motion.div>
            ) : displayListings.length === 0 ? (

              /* Empty State */
              <motion.div
                key="empty-popular"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center justify-center py-20 text-center bg-white/60 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 backdrop-blur-sm shadow-sm dark:shadow-none transition-colors"
              >
                <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 mb-4 transition-colors">
                  <TagIcon className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold uppercase text-slate-900 dark:text-white tracking-wide">
                  No Popular Listings Available
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 max-w-sm">
                  We currently do not have vehicles matching this showcase section. Check back soon for updated arrivals.
                </p>
              </motion.div>
            ) : (

              /* Listings Grid */
              <motion.div
                key="grid-popular"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
              >
                {displayListings.map((item) => (
                  <motion.div key={item.id} variants={itemVariants}>
                    {/* Note: Ensure AutomotiveCard is also updated to handle light/dark mode internally if it isn't already */}
                    <AutomotiveCard item={item} />
                  </motion.div>
                ))}
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Mobile View All Button */}
        {!isLoading && !error && displayListings.length > 0 && (
          <div className="mt-12 text-center md:hidden">
            <Link
              href="/automotive/listings"
              className="inline-flex items-center justify-center w-full px-6 py-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/80 rounded-2xl font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-white shadow-sm transition-colors"
            >
              <span>View Full Catalog</span>
              <ArrowRightIcon className="w-4 h-4 ml-2 text-amber-500" />
            </Link>
          </div>
        )}

      </div>
    </section>
  );
}