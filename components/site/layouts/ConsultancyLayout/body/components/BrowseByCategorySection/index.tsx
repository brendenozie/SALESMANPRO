'use client';

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { IStoreCategory, StoreForm, ISubcategory, MarketListingForm } from "@/types/typings";
import clsx from "clsx";
import {
  BookOpenIcon,
  UserIcon,
  FireIcon,
  TagIcon,
  SparklesIcon,
} from "@heroicons/react/24/solid";

// --- Animation Variants (Kept from original) ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};
const itemVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 100, damping: 10 },
  },
};

// Loader for Next.js Image
const customLoader = ({ src, width, quality }: any) =>
  `${src}?w=${width}&q=${quality || 75}`;

// --- Program Card Component (Adapted from EbookCard) ---
const ProgramCard = ({
  id,
  name,
  finalPrice,
  images,
  description,
  badge,
  author,
  category,
  storeSlug, // Changed 'slug' to 'storeSlug' to avoid confusion with program's slug
  programSlug,
}: {
  id: string;
  name: string;
  finalPrice?: number | null;
  images?: string[];
  description?: string | null;
  badge?: "New Arrival" | "Hot Deal" | "Featured";
  author?: string | null;
  category?: string | null;
  storeSlug: string;
  programSlug: string;
}) => {
  const defaultImage = "https://placehold.co/600x800/808080/FFFFFF?text=Program+Cover";

  // Link to the specific listing page: /site/[storeSlug]/listing/[id]
  const linkHref = `/site/${storeSlug}/listing/${id}`;

  return (
    <Link href={linkHref} passHref>
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
                : "bg-gradient-to-r from-indigo-500 to-purple-600"
            )}
          >
            {badge === "New Arrival" && <SparklesIcon className="w-4 h-4" />}
            {badge === "Hot Deal" && <FireIcon className="w-4 h-4" />}
            {badge === "Featured" && <TagIcon className="w-4 h-4" />}
            {badge}
          </motion.span>
        )}

        {/* Cover Image */}
        <div className="relative w-full aspect-[3/4] overflow-hidden">
          <Image
            src={images?.[0] || defaultImage}
            alt={name}
            loader={customLoader}
            fill
            className="object-cover transform transition duration-500 group-hover:scale-110 brightness-95 group-hover:brightness-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-40 group-hover:opacity-60 transition-opacity duration-300" />
        </div>

        {/* Details */}
        <div className="p-6 space-y-3">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-2">
            {name}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 min-h-[2.5rem]">
            {description || "A transformative program designed for rapid growth and lasting results."}
          </p>

          <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mt-2">
            <UserIcon className="w-5 h-5 text-gray-400" />
            <span>{author || "The Coach"}</span>
          </div>

          <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
            <BookOpenIcon className="w-5 h-5 text-gray-400" />
            <span>{category || "Online Program"}</span>
          </div>

          {/* Price */}
          <p className="text-2xl font-extrabold text-orange-600 dark:text-orange-400 pt-2">
            {finalPrice?.toLocaleString("en-US", {
              style: "currency",
              currency: "USD", // Assuming USD, change as necessary
              minimumFractionDigits: finalPrice % 1 === 0 ? 0 : 2,
            }) || "Free"}
          </p>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="mt-4 w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 rounded-xl font-semibold text-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
          >
            View Program
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


// --- Fallback Sample Data (representing MarketListingForm) ---
const fallbackPrograms: MarketListingForm[] = [
  {
    id: "prog-exec",
    name: "90-Day Executive Leadership Intensive",
    description: "Accelerate your career with a structured, high-impact coaching plan focused on strategic influence.",
    finalPrice: 4997,
    images: ["https://images.unsplash.com/photo-1542435503-92161aa8387e?q=80&w=800"],
    author: "The Coach",
    category: "Executive Coaching",
    badge: "Featured",
    duration: undefined,
    productCategoryId: "",
    subCategory: undefined,
    tags: [],
    option: [],
    color: [],
    size: [],
    weight: [],
    material: [],
    quantity: 0,
    buyingPrice: 0,
    sellingPrice: 0,
    pricingTiers: [],
    isAvailable: false,
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
    id: "prog-mind",
    name: "Mindset Mastery: Overcoming Self-Doubt",
    description: "An affordable, self-paced digital course to permanently rewire negative thought patterns.",
    finalPrice: 199,
    images: ["https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=800"],
    author: "The Coach",
    category: "Personal Development",
    badge: "Hot Deal",
    duration: undefined,
    productCategoryId: "",
    subCategory: undefined,
    tags: [],
    option: [],
    color: [],
    size: [],
    weight: [],
    material: [],
    quantity: 0,
    buyingPrice: 0,
    sellingPrice: 0,
    pricingTiers: [],
    isAvailable: false,
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
    id: "prog-team",
    name: "High-Performance Team Workshop Kit",
    description: "A comprehensive toolkit for managers to run powerful team-building and alignment sessions.",
    finalPrice: 899,
    images: ["https://images.unsplash.com/photo-1522204502310-209ac7ad3e26?q=80&w=800"],
    author: "The Coach",
    category: "Team Coaching",
    badge: "New Arrival",
    duration: undefined,
    productCategoryId: "",
    subCategory: undefined,
    tags: [],
    option: [],
    color: [],
    size: [],
    weight: [],
    material: [],
    quantity: 0,
    buyingPrice: 0,
    sellingPrice: 0,
    pricingTiers: [],
    isAvailable: false,
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


// --- Main Programs Section Component ---
type ProgramsSectionProps = {
  listings: MarketListingForm[]; // Directly pass the list of programs
  storeSlug: string; // Required for linking
};

export default function ProgramsSection({ listings, storeSlug }: ProgramsSectionProps) {
  
  // Use passed listings, otherwise use fallback data
  const rawListings = listings && listings.length > 0 ? listings : fallbackPrograms;
  
  // Limit to 3 for the 3-column grid, prioritizing the most relevant (often the first ones)
  const programsToShow = rawListings.slice(0, 3); 

  return (
    <section id="programs" className="py-20 md:py-28 bg-gray-50 dark:bg-gray-950 relative overflow-hidden">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        
        {/* Section Heading */}
        <motion.h2
          className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white mb-6"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8 }}
        >
          My Featured{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">
            Programs & Courses
          </span>
        </motion.h2>

        <motion.p
          className="max-w-3xl mx-auto text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ delay: 0.2 }}
        >
          Transform your future with my best-selling digital and coaching programs. Structured guidance for maximum impact.
        </motion.p>

        {/* Program Cards Grid - Now using the detailed ProgramCard */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" // Use 3 columns for better detail display
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {programsToShow.map((program) => (
            <ProgramCard
              key={program.id}
              id={program.id}
              name={program.name}
              finalPrice={program.finalPrice}
              images={program.images}
              description={program.description}
              badge={(program.badge as any) || "Featured"}
              author={program.author || "The Coach"}
              category={program.category || "Online Course"}
              programSlug={program.id}
              storeSlug={storeSlug}
            />
          ))}
        </motion.div>

        {/* View All Programs Button */}
        <motion.div
          className="text-center mt-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ delay: 0.3, duration: 0.7 }}
        >
          <Link href={`/site/${storeSlug}/listings`} passHref>
            <motion.a
              className="inline-flex items-center justify-center px-10 py-4 text-lg font-bold rounded-full shadow-xl
                          text-white bg-gradient-to-br from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700
                          focus:outline-none focus:ring-4 focus:ring-orange-400/70 transition-all duration-300 transform hover:scale-[1.04]"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              View All Programs
              <ArrowRightIcon className="ml-2 -mr-1 w-6 h-6" />
            </motion.a>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}