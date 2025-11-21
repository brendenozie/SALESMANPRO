"use client";

import React from "react";
import { motion } from "framer-motion";
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
  Cog6ToothIcon, // Implied for Transmission
  BeakerIcon,    // Implied for Fuel
  ScaleIcon,     // Implied for Mileage
} from "@heroicons/react/24/solid";

// --- Helpers ---

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

// --- Sub-Components ---

/**
 * SpecItem: Displays a single technical detail with an icon
 */
const SpecItem = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => (
  <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-gray-50 dark:bg-gray-700/40 border border-gray-100 dark:border-gray-700">
    <Icon className="w-4 h-4 text-gray-400 mb-1" />
    <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">{label}</span>
    <span className="text-xs font-bold text-gray-700 dark:text-gray-200 truncate max-w-[80px]">
      {value}
    </span>
  </div>
);

/**
 * VehicleCard: A high-impact, spec-rich card component
 */
const VehicleCard = ({
  item,
  slug,
  badge,
}: {
  item: MarketListingForm;
  slug: string;
  badge?: "New Arrival" | "Hot Deal" | "Featured";
}) => {
  // Mocking technical data if not present in your specific form type
  // In a real scenario, ensure these exist on MarketListingForm or map them
  const mileage = (item as any).mileage || Math.floor(Math.random() * 80000) + 5000;
  const transmission = (item as any).transmission || "Automatic";
  const fuel = (item as any).fuelType || "Petrol";
  const location = (item as any).location || "Nairobi Showroom";

  return (
    <Link href={`/listing/${item.id}`} passHref legacyBehavior>
      <motion.a
        whileHover={{ y: -8 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="group relative block h-full bg-white dark:bg-gray-800 rounded-[2rem] shadow-lg hover:shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col"
      >
        {/* Image Area */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-200">
          <Image
            src={
              item.images?.[0] ||
              "https://placehold.co/800x600/EEE/31343C?text=Vehicle"
            }
            alt={item.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            loader={customLoader}
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

          {/* Badge (Top Left) */}
          <div className="absolute top-4 left-4">
            {badge && (
              <span
                className={clsx(
                  "px-3 py-1.5 rounded-full text-xs font-bold text-white flex items-center gap-1.5 shadow-lg backdrop-blur-md border border-white/20",
                  badge === "New Arrival" ? "bg-emerald-500/90" :
                  badge === "Hot Deal" ? "bg-rose-500/90" : "bg-indigo-500/90"
                )}
              >
                {badge === "New Arrival" && <SparklesIcon className="w-3.5 h-3.5" />}
                {badge === "Hot Deal" && <FireIcon className="w-3.5 h-3.5" />}
                {badge === "Featured" && <TagIcon className="w-3.5 h-3.5" />}
                {badge}
              </span>
            )}
          </div>

          {/* Price Capsule (Bottom Right - Floating Glass) */}
          <div className="absolute bottom-4 right-4 bg-white/95 dark:bg-gray-900/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-xl border border-white/20">
            <p className="text-sm font-extrabold text-gray-900 dark:text-white">
              {formatCurrency(item.finalPrice)}
            </p>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-5 flex-1 flex flex-col">
          {/* Header */}
          <div className="mb-5">
            <div className="flex items-center text-xs text-gray-500 mb-1">
              <MapPinIcon className="w-3.5 h-3.5 mr-1 text-gray-400" />
              {location}
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {item.name}
            </h3>
          </div>

          {/* Tech Specs Grid */}
          <div className="grid grid-cols-3 gap-2 mb-6">
             <SpecItem icon={ScaleIcon} label="Mileage" value={`${(mileage/1000).toFixed(0)}k km`} />
             <SpecItem icon={Cog6ToothIcon} label="Trans" value={transmission} />
             <SpecItem icon={BeakerIcon} label="Fuel" value={fuel} />
          </div>

          {/* Footer / CTA */}
          <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <span className="text-sm font-bold text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
              View Specs
            </span>
            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
              <ArrowRightIcon className="w-4 h-4" />
            </div>
          </div>
        </div>
      </motion.a>
    </Link>
  );
};

// --- Main Section ---

export default function FeaturedVehicleSection({
  listings,
  slug,
}: {
  listings: MarketListingForm[];
  slug: string;
}) {
  if (!listings || listings.length === 0) {
    return (
      <section className="py-20 bg-gray-50 dark:bg-gray-950 text-center">
        <div className="inline-block p-4 rounded-full bg-gray-200 dark:bg-gray-800 mb-4">
          <TagIcon className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-500 font-medium">No featured vehicles available right now.</p>
      </section>
    );
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <section id="listings" className="relative py-24 bg-gray-50 dark:bg-gray-950 overflow-hidden">
      {/* Abstract Background Decor */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent" />
      <div className="absolute -left-20 top-40 w-72 h-72 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -right-20 bottom-40 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl"
          >
             <div className="flex items-center gap-2 mb-3">
               <span className="h-px w-8 bg-indigo-500"></span>
               <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Premium Inventory</span>
             </div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
              Featured <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">Arrivals</span>
            </h2>
          </motion.div>

          <motion.div
             initial={{ opacity: 0, x: 20 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
          >
             <Link href={`/listings`} className="hidden md:inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-indigo-600 transition-colors">
                View Full Catalog <ArrowRightIcon className="w-4 h-4" />
             </Link>
          </motion.div>
        </div>

        {/* Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {listings.map((item, index) => (
            <motion.div key={item.id} variants={itemVariants}>
              <VehicleCard
                item={item}
                slug={slug}
                // Cyclical badging for demo purposes
                badge={index === 0 ? "New Arrival" : index === 1 ? "Hot Deal" : "Featured"}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Mobile View All Button */}
        <div className="mt-12 text-center md:hidden">
            <Link href={`/listings`} className="inline-flex items-center justify-center w-full px-6 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-font-bold text-gray-900 dark:text-white shadow-sm">
               View Full Catalog
            </Link>
        </div>

      </div>
    </section>
  );
}