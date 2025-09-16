"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { MarketListingForm } from "@/types/typings";
import clsx from "clsx";
import {
  HomeModernIcon,
  SparklesIcon,
  FireIcon,
  TagIcon,
} from "@heroicons/react/24/solid";


// --- VehicleCard Component (Design stays same) ---
const VehicleCard = ({
  id,
  name,
  finalPrice,
  images,
  description,
  badge,
  type,
  mileage,
  slug,
}: {
  id: string;
  name: string;
  finalPrice?: number | null;
  images?: string[];
  description?: string | null;
  badge?: "New Arrival" | "Hot Deal" | "Featured";
  type?: string;
  mileage?: number;
  slug: string;
}) => {
  return (
    <Link href={`/site/${slug}/listing/${id}`} passHref>
      <motion.div
        whileHover={{ y: -8, boxShadow: "0 15px 30px rgba(0,0,0,0.15)" }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden cursor-pointer group border border-gray-100 dark:border-gray-700"
      >
        {/* Badge */}
        {badge && (
          <motion.span
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className={clsx(
              "absolute top-4 left-4 px-4 py-1.5 rounded-full text-sm font-bold text-white z-10 flex items-center gap-1",
              badge === "New Arrival"
                ? "bg-gradient-to-r from-green-500 to-emerald-600"
                : badge === "Hot Deal"
                ? "bg-gradient-to-r from-red-500 to-orange-600"
                : "bg-gradient-to-r from-blue-500 to-indigo-600"
            )}
          >
            {badge === "New Arrival" && <SparklesIcon className="w-4 h-4" />}
            {badge === "Hot Deal" && <FireIcon className="w-4 h-4" />}
            {badge === "Featured" && <TagIcon className="w-4 h-4" />}
            {badge}
          </motion.span>
        )}

        {/* Image */}
        <div className="relative w-full aspect-video overflow-hidden">
          <Image
            src={
              images?.[0] ||
              "https://placehold.co/600x400/EEE/31343C?text=No+Image"
            }
            alt={name}
            layout="fill"
            objectFit="cover"
            loader={customLoader}
            className="transform transition duration-500 group-hover:scale-110 brightness-90 group-hover:brightness-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-40 group-hover:opacity-60 transition-opacity duration-300" />
        </div>

        {/* Details */}
        <div className="p-6 space-y-3">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
            {name}
          </h3>
          <p className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">
            {finalPrice?.toLocaleString("en-KE", {
              style: "currency",
              currency: "KES",
            }) || "N/A"}
          </p>
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 gap-3">
            <HomeModernIcon className="w-5 h-5 text-gray-400" />
            <span>{type || "Listing"}</span>
            {mileage && (
              <>
                <span className="dot-separator">•</span>
                <span>{mileage.toLocaleString()} km</span>
              </>
            )}
          </div>
          <motion.button
            whileHover={{ scale: 1.02, backgroundColor: "#2563EB" }}
            whileTap={{ scale: 0.98 }}
            className="mt-4 w-full bg-blue-600 text-white py-3 rounded-xl font-semibold text-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
          >
            View Details
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </motion.button>
        </div>
      </motion.div>
    </Link>
  );
};


// --- Icons (Vehicle-specific) ---
const DoorsIcon = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
    strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25a2.25 2.25 0 012.25 
    2.25v3.75a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 
    15.75h2.25a2.25 2.25 0 002.25-2.25v-3.75a2.25 2.25 0 00-2.25-2.25H6a2.25 
    2.25 0 00-2.25 2.25v3.75z" />
  </svg>
);

const MileageIcon = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
    strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" 
      d="M6 13.5V3.75m0 9.75a4.5 4.5 0 016 0m-6 
      0h6m-6 0V.75m6 12.75V3.75m0 9.75a4.5 4.5 0 
      006 0m-6 0h-6m6 0h6" />
  </svg>
);

const LocationIcon = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
    strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" 
      d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" 
      d="M12 18.75a7.5 7.5 0 005.558-1.264 
      7.5 7.5 0 00-4.023-3.704c.02-.516.048-.93.074-1.356A1.5 
      1.5 0 0013.082 10.5H10.918a1.5 1.5 0 
      00-1.502 1.264 7.5 7.5 0 00-4.023 
      3.704A7.5 7.5 0 0012 18.75z" />
  </svg>
);

// --- Image Loader ---
const customLoader = ({ src, width, quality }: any) =>
  `${src}?w=${width}&q=${quality || 75}`;

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 100, damping: 10 },
  },
};

export default function FeaturedListings({
  listings,
  slug,
}: {
  listings: MarketListingForm[];
  slug: string;
}) {
  const [activeTab, setActiveTab] = useState("sale");

  // 🔹 Filter by active tab (adjust logic to match your schema)
  const currentListings = listings;
  // .filter((item) => {
    // Assuming 'type' property indicates sale or rent. Adjust this logic
    // based on how you distinguish between sale and rent in your MarketListingForm type.
    // For example, if you have a 'forSale: boolean' field:
    // if (activeTab === "sale") return item.forSale;
    // if (activeTab === "rent") return !item.forSale;

    // Placeholder logic: Assuming a 'category' field or similar.
    // You'll need to define this in your MarketListingForm type.
  //   if (activeTab === "sale") {
  //     return item.category === "sale"; // Or item.type === 'house' for sale
  //   } else if (activeTab === "rent") {
  //     return item.category === "rent"; // Or item.type === 'apartment' for rent
  //   }
  //   return false; // Default to no listings if tab is unexpected
  // });
  
  // If no listings are available for the current tab
  if (!currentListings || currentListings.length === 0) {
    return (
      <section className="bg-gray-50 dark:bg-gray-950 py-16 text-center text-gray-700 dark:text-gray-300">
        <p className="text-xl">
          No featured {activeTab} listings available at the moment. Please check
          back soon!
        </p>
      </section>
    );
  }

  return (
    <section className="bg-gray-50 dark:bg-gray-950 py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <motion.h2
          className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-gray-50 text-center mb-16 relative z-10"
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          Explore Our{" "}
          <span className="text-amber-500 dark:text-amber-400">
            {activeTab === "sale" ? "Featured" : "Rental"}
          </span>{" "}
          Vehicles
          <span className="block w-32 h-1 bg-emerald-600 mx-auto mt-4 rounded-full" />{" "}
          {/* Accent line */}
        </motion.h2>

        {/* Toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-full shadow-lg p-2 flex">
            <button
              onClick={() => setActiveTab("sale")}
              className={`px-8 py-3 rounded-full font-semibold ${
                activeTab === "sale"
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              For Sale
            </button>
            <button
              onClick={() => setActiveTab("rent")}
              className={`px-8 py-3 rounded-full font-semibold ${
                activeTab === "rent"
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              For Rent
            </button>
          </div>
        </div>

        {/* Listings Grid */}
        
        <motion.div
          key={activeTab}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {currentListings.map((item) => (
            <VehicleCard
              key={item.id}
              id={item.id}
              name={item.name}
              finalPrice={item.finalPrice}
              images={item.images}
              description={item.description}
              badge={"Featured"} // 🔹 You can map actual status field here if available
              type={item.category || "Vehicle"}
              mileage={0}
              //item.area || undefined}
              slug={slug}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
