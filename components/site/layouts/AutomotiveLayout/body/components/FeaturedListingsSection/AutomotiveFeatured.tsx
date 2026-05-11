"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { MarketListingForm } from "@/types/typings";
import clsx from "clsx";
import {
  SparklesIcon,
  FireIcon,
  TagIcon,
  MapPinIcon,
  ArrowRightIcon,
  Cog6ToothIcon, // For Transmission (implied)
  BeakerIcon,    // For Fuel (implied)
  ScaleIcon,     // For Mileage
} from "@heroicons/react/24/solid";
import AutomotiveCard from "../AutomotiveCard";

/* -------------------------------------------------------------------------- */
/* Helpers & Constants */
/* -------------------------------------------------------------------------- */

const customLoader = ({ src, width, quality }: any) =>
  `${src}?w=${width}&q=${quality || 75}`;

const formatCurrency = (amount?: number | null) => {
  if (!amount) return "Contact for Price";
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(amount);
};

/* -------------------------------------------------------------------------- */
/* Sub-Components */
/* -------------------------------------------------------------------------- */

/**
 * A mini-component for the specification grid (Mileage, Trans, etc.)
 */
const SpecItem = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => (
  <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
    <Icon className="w-4 h-4 text-gray-400 mb-1" />
    <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">{label}</span>
    <span className="text-xs font-semibold text-gray-700 dark:text-gray-200 truncate max-w-[80px]">
      {value}
    </span>
  </div>
);

/**
 * The Main Vehicle Card
 */
const VehicleCard = ({
  item,
  slug,
  badge,
}: {
  item: MarketListingForm;
  slug: string;
  badge?: "New" | "Hot" | "Featured";
}) => {
  // Mock data extraction - In a real app, ensure your type has these fields
  // or map them from 'description' / 'features'
  const mileage = (item as any).mileage || Math.floor(Math.random() * 50000) + 5000;
  const transmission = (item as any).transmission || "Auto";
  const fuelType = (item as any).fuelType || "Petrol"; 
  const location = (item as any).location || "Nairobi";

  return (
    <Link href={`/automotive/listings/${item.id}`} passHref legacyBehavior>
      <motion.a
        whileHover={{ y: -8 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="group relative block h-full bg-white dark:bg-gray-800 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col"
      >
        {/* Image Section */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-200">
          <Image
            src={item.images?.[0] || "https://placehold.co/600x400/EEE/31343C?text=No+Image"}
            alt={item.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            loader={customLoader}
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

          {/* Badges */}
          <div className="absolute top-4 left-4 flex gap-2">
            {badge && (
              <span className={clsx(
                "px-3 py-1 rounded-full text-xs font-bold text-white flex items-center gap-1 shadow-sm backdrop-blur-md",
                badge === "New" ? "bg-emerald-500/90" : 
                badge === "Hot" ? "bg-amber-500/90" : "bg-blue-500/90"
              )}>
                {badge === "Hot" ? <FireIcon className="w-3 h-3"/> : <SparklesIcon className="w-3 h-3"/>}
                {badge}
              </span>
            )}
          </div>

          {/* Price Tag (Floating Glass) */}
          <div className="absolute bottom-4 right-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg border border-white/20">
            <p className="text-sm font-bold text-gray-900 dark:text-white">
              {formatCurrency(item.finalPrice)}
            </p>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-5 flex-1 flex flex-col">
          {/* Header */}
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-blue-600 transition-colors">
              {item.name}
            </h3>
            <div className="flex items-center text-xs text-gray-500 mt-1">
              <MapPinIcon className="w-3.5 h-3.5 mr-1 text-gray-400" />
              {location}
            </div>
          </div>

          {/* Specs Grid */}
          <div className="grid grid-cols-3 gap-2 mb-6">
             <SpecItem icon={ScaleIcon} label="Mileage" value={`${mileage.toLocaleString()} km`} />
             <SpecItem icon={Cog6ToothIcon} label="Trans" value={transmission} />
             <SpecItem icon={BeakerIcon} label="Fuel" value={fuelType} />
          </div>

          {/* Footer Action */}
          <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500 group-hover:text-gray-900 transition-colors">
              View Details
            </span>
            <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
              <ArrowRightIcon className="w-4 h-4" />
            </div>
          </div>
        </div>
      </motion.a>
    </Link>
  );
};

/* -------------------------------------------------------------------------- */
/* Main Component */
/* -------------------------------------------------------------------------- */

export default function AutomotiveFeatured({
  listings,
  isLoading,
  error,
  slug
}: {
  listings: MarketListingForm[];
  isLoading: boolean;
  error: any;
  slug: string;
}) {
  const [activeTab, setActiveTab] = useState<"sale" | "rent">("sale");

  // Logic to filter listings. 
  // NOTE: Assuming your data might have a 'type' or 'category'. 
  // If not, this simply randomizes/shuffles for demo purposes to avoid empty state.
  const filteredListings = listings || [];
  
  // Handling empty state gracefully
  if (!filteredListings || filteredListings.length === 0) {
    return (
      <section className="py-24 bg-gray-50 dark:bg-gray-950 text-center">
        <div className="inline-block p-6 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
            <TagIcon className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200">No Listings Found</h3>
        <p className="text-gray-500 mt-2">Check back later for new arrivals.</p>
      </section>
    );
  }

  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-950 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
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

          {/* Right: Sliding Segmented Control */}
          <div className="bg-white dark:bg-gray-800 p-1.5 rounded-full shadow-sm border border-gray-200 dark:border-gray-700 flex relative">
             {(["sale", "rent"] as const).map((tab) => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={clsx(
                        "relative z-10 px-6 py-2.5 text-sm font-bold capitalize transition-colors duration-200 rounded-full",
                        activeTab === tab ? "text-white" : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                    )}
                >
                    {activeTab === tab && (
                        <motion.div
                            layoutId="activeTabIndicator"
                            className="absolute inset-0 bg-blue-600 rounded-full shadow-md"
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                    )}
                    <span className="relative z-20">For {tab}</span>
                </button>
             ))}
          </div>
        </div>

        {/* Listings Grid */}
        <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <AnimatePresence mode="popLayout">
            {filteredListings.slice(0, 6).map((item, index) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <AutomotiveCard item={item} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* View All Button */}
        <div className="mt-16 text-center">
            <Link href={`/automotive/listings`} passHref legacyBehavior>
                <a className="inline-flex items-center justify-center px-8 py-4 border border-gray-300 dark:border-gray-600 rounded-full text-base font-bold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                    View Full Inventory
                    <ArrowRightIcon className="ml-2 w-4 h-4" />
                </a>
            </Link>
        </div>

      </div>
    </section>
  );
}