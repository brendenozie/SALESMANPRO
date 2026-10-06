'use client';

import React, { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import {
  CalendarDaysIcon, // Relevant for programs/courses
  SparklesIcon,
  FireIcon,
  TagIcon,
  XMarkIcon, // For closing the modal
  ClockIcon,
} from "@heroicons/react/24/solid";
import { MarketListingForm } from "@/types/typings";
import ProgramsBookingForm from "../ProgramsBookingForm"; // Re-using the time-based form

// Image loader
const customLoader = ({ src, width, quality }: any) =>
  `${src}?w=${width}&q=${quality || 75}`;

// --- Sample Data for Programs (Fallback) ---
const samplePrograms: MarketListingForm[] = [
  {
    id: "p1",
    name: "30-Day Fitness Challenge",
    description: "A comprehensive program including weekly coaching and personalized meal plans to kickstart your fitness journey.",
    finalPrice: 199.00,
    images: ["https://images.unsplash.com/photo-1571019613454-1cb2f99b231b?w=800&q=80"],
    isAvailable: true,
    category: "Health & Fitness",
    // Adding program-specific meta fields
    duration: "4 Weeks",
    productCategoryId: "",
    subCategory: undefined,
    tags: [],
    color: [],
    size: [],
    weight: [],
    material: [],
    quantity: 0,
    buyingPrice: 0,
    sellingPrice: 0,
    pricingTiers: [],
    isOnOffer: false,
    isFlashDeal: false,
    isNewArrival: false,
    isDiscounted: false,
    isFeatured: false,
    bedrooms: [],
    studios: [],
    features: [],
    bookingSlots: undefined,
    requiredClientInfo: undefined,
    amenities: [],
    delivery: false,
    paymentOption: "",
    status: "DRAFT",
    location: null
  },
  {
    id: "p2",
    name: "Advanced React & Next.js Workshop",
    description: "Live interactive sessions focusing on state management, server components, and performance optimization.",
    finalPrice: 499.00,
    images: ["https://images.unsplash.com/photo-1542831371-29b0101efc71?w=800&q=80"],
    isAvailable: true,
    category: "Software Development",
    duration: "5 Days",
    badge: "Hot Deal" as any,
    productCategoryId: "",
    subCategory: undefined,
    tags: [],
    color: [],
    size: [],
    weight: [],
    material: [],
    quantity: 0,
    buyingPrice: 0,
    sellingPrice: 0,
    pricingTiers: [],
    isOnOffer: false,
    isFlashDeal: false,
    isNewArrival: false,
    isDiscounted: false,
    isFeatured: false,
    bedrooms: [],
    studios: [],
    features: [],
    bookingSlots: undefined,
    requiredClientInfo: undefined,
    amenities: [],
    delivery: false,
    paymentOption: "",
    status: "DRAFT",
    location: null
  },
  {
    id: "p3",
    name: "Beginner Photography Course",
    description: "Learn the fundamentals of composition, lighting, and editing. Access to a private community forum included.",
    finalPrice: 99.00,
    images: ["https://images.unsplash.com/photo-1544367520-edbfb952c1e6?w=800&q=80"],
    isAvailable: false, // Example: Enrollment closed
    category: "Creative Arts",
    duration: "8 Weeks",
    badge: "New Arrival" as any,
    productCategoryId: "",
    subCategory: undefined,
    tags: [],
    color: [],
    size: [],
    weight: [],
    material: [],
    quantity: 0,
    buyingPrice: 0,
    sellingPrice: 0,
    pricingTiers: [],
    isOnOffer: false,
    isFlashDeal: false,
    isNewArrival: false,
    isDiscounted: false,
    isFeatured: false,
    bedrooms: [],
    studios: [],
    features: [],
    bookingSlots: undefined,
    requiredClientInfo: undefined,
    amenities: [],
    delivery: false,
    paymentOption: "",
    status: "DRAFT",
    location: null
  },
];


// --- ProgramCard Component (Adapted from VehicleCard) ---
const ProgramCard = ({
  item,
  slug,
  onSelect,
}: {
  item: MarketListingForm & {
    badge?: "New Arrival" | "Hot Deal" | "Featured";
    duration?: string;
  };
  slug: string;
  onSelect: (item: MarketListingForm) => void;
}) => {
  const { id, name, finalPrice, images, description, badge, category, duration, isAvailable } = item;

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  const buttonClass = isAvailable 
    ? "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
    : "bg-gray-400 cursor-not-allowed";

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -8, boxShadow: "0 15px 30px rgba(0,0,0,0.15)" }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden group border border-gray-100 dark:border-gray-700 flex flex-col"
    >
      {/* Badge */}
      {badge && (
        <span
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
        </span>
      )}

      {/* Image */}
      <div className="relative w-full aspect-video overflow-hidden">
        <Image decoding="async"
          src={
            images?.[0] ||
            "https://placehold.co/600x400/EEE/31343C?text=Course+Image"
          }
          alt={name}
          layout="fill"
          objectFit="cover"
          className="transform transition duration-500 group-hover:scale-110 brightness-90 group-hover:brightness-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-40 group-hover:opacity-60 transition-opacity duration-300" />
      </div>

      {/* Details */}
      <div className="p-6 space-y-3 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
          {name}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 flex-grow">
            {description || 'Comprehensive training program.'}
        </p>

        <p className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">
          {finalPrice?.toLocaleString("en-KE", {
            style: "currency",
            currency: "KES",
          }) || "Free"}
        </p>

        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 gap-3">
          <CalendarDaysIcon className="w-5 h-5 text-gray-400" />
          <span>{category || "Program"}</span>
          {duration && (
            <>
              <span className="dot-separator">•</span>
              <ClockIcon className="w-5 h-5 text-gray-400" />
              <span>{duration}</span>
            </>
          )}
        </div>

        {/* Action Button: Triggers booking modal */}
        <motion.button
          onClick={() => isAvailable && onSelect(item)} // Only allow selection if available
          disabled={!isAvailable}
          whileHover={{ scale: isAvailable ? 1.02 : 1 }}
          whileTap={{ scale: isAvailable ? 0.98 : 1 }}
          className={clsx(
            "mt-4 w-full text-white py-3 rounded-xl font-semibold text-lg shadow-md transition-all duration-300 flex items-center justify-center gap-2",
            buttonClass
          )}
        >
          {isAvailable ? "Enroll/Book Now" : "Enrollment Closed"}
          {isAvailable && (
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
          )}
        </motion.button>
      </div>
    </motion.div>
  );
};


// --- FeaturedProgramsSection Main Component ---
export default function FeaturedProgramsSection({
  listings,
  slug,
}: {
  listings: MarketListingForm[];
  slug: string;
}) {
  const [selected, setSelected] = useState<MarketListingForm | null>(null);

  // Use props data, falling back to sample data if props are empty
  const currentListings =
    listings && listings.length > 0 ? listings : samplePrograms;
    
  // Animation variants setup (container)
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };


  if (currentListings.length === 0) {
    return (
      <section className="py-16 text-center text-gray-500">
        <p>No program listings available at the moment.</p>
      </section>
    );
  }

  return (
    <section id="programs" className="py-16 sm:py-24 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.h2
          className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-gray-50 mb-12 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          Featured Training <span className="text-blue-600 dark:text-blue-400">Programs</span>
        </motion.h2>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          {currentListings.map((item) => (
            <ProgramCard
              key={item.id}
              item={item as any} // Cast to include custom fields if necessary
              slug={slug}
              onSelect={setSelected}
            />
          ))}
        </motion.div>
      </div>

      {/* Booking Modal (Re-using modal structure from ServicesSection) */}
      {selected && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div
            className="fixed inset-0 bg-gray-900 bg-opacity-70"
            onClick={() => setSelected(null)}
          />

          <motion.div
            className="relative bg-white rounded-3xl max-w-4xl w-full mx-auto z-50 shadow-2xl p-6 sm:p-8 lg:p-10 transform"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors z-50"
              onClick={() => setSelected(null)}
              aria-label="Close"
            >
              <XMarkIcon className="w-7 h-7" />
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="relative w-full h-[300px] md:h-auto rounded-xl overflow-hidden shadow-lg">
                <Image decoding="async"
                  src={
                    selected.images?.[0] ||
                    "https://placehold.co/600x800/EEE/31343C?text=Program+Image"
                  }
                  alt={selected.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 via-transparent to-transparent"></div>
              </div>
              <div className="space-y-6 flex flex-col justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 leading-tight">
                    {selected.name}
                  </h2>
                  <p className="mt-2 text-md text-gray-700 leading-relaxed">{selected.description || 'No detailed program description available.'}</p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-6 text-lg">
                    <p className="font-semibold text-gray-800">
                      Price: <span className="text-blue-600 text-xl font-bold">KES { (selected.finalPrice || 0).toFixed(2) }</span>
                    </p>
                    {/* Assuming Programs have an 'isAvailable' field */}
                    {selected.isAvailable ? (
                      <span className="inline-flex items-center gap-1.5 text-green-600 font-medium">
                        <CalendarDaysIcon className="w-5 h-5" />
                        Enrollment Open
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-red-600 font-medium">
                        <XMarkIcon className="w-5 h-5" />
                        Enrollment Closed
                      </span>
                    )}
                  </div>
                  {/* The original time-based BookingForm is used here */}
                  <ProgramsBookingForm service={selected} slug={slug || ''} /> 
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </section>
  );
}