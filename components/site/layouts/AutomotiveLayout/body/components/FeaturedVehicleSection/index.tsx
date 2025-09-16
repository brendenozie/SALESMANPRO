"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import {
  HomeModernIcon,
  SparklesIcon,
  FireIcon,
  TagIcon,
} from "@heroicons/react/24/solid";
import { MarketListingForm } from "@/types/typings"; // ✅ your saved data type

// Image loader
const customLoader = ({ src, width, quality }: any) =>
  `${src}?w=${width}&q=${quality || 75}`;

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

// --- FeaturedVehicleSection ---
export default function FeaturedVehicleSection({
  listings,
  slug,
}: {
  listings: MarketListingForm[];
  slug: string;
}) {
  if (!listings || listings.length === 0) {
    return (
      <section className="py-16 text-center text-gray-500">
        <p>No premium listings available at the moment.</p>
      </section>
    );
  }

  return (
    <section className="py-16 sm:py-24 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.h2
          className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-gray-50 mb-12 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          Premium Listings
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {listings.map((item) => (
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
        </div>
      </div>
    </section>
  );
}
