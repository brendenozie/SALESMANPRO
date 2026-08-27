'use client';

import React, { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon, XMarkIcon, CalendarDaysIcon } from "@heroicons/react/24/outline";
import { MarketListingForm } from "@/types/typings";
import clsx from "clsx";
import {
  BookOpenIcon,
  UserIcon,
  FireIcon,
  TagIcon,
  SparklesIcon,
} from "@heroicons/react/24/solid";

// Import the Booking Form (assuming it's in a path relative to where this component lives)
import ProgramsBookingForm from "../ProgramsBookingForm"; // Adjust path if needed, assuming it's sibling for now

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

// --- Program Card Component (UPDATED to use onSelect) ---
const ProgramCard = ({
  item, // Changed individual props to single 'item' object for simpler payload
  storeSlug,
  onSelect,
}: {
  item: MarketListingForm & {
    badge?: "New Arrival" | "Hot Deal" | "Featured";
    author?: string | null;
  };
  storeSlug: string;
  onSelect: (item: MarketListingForm) => void;
}) => {
  const { id, name, finalPrice, images, description, badge, author, category, isAvailable } = item;
  const defaultImage = "https://placehold.co/600x800/808080/FFFFFF?text=Program+Cover";

  // const buttonClass = isAvailable 
  //   ? "bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
  //   : "bg-gray-400 cursor-not-allowed";

  const buttonClass = "bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700";

  // Use Link only for "View Details" to maintain SEO, but the Booking Button triggers the modal.
  const linkHref = `/site/${storeSlug}/listing/${id}`;

  return (
    <motion.div variants={itemVariants}>
      <motion.div
        whileHover={{ y: -8, boxShadow: "0 15px 30px rgba(0,0,0,0.15)" }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden group border border-gray-100 dark:border-gray-700 h-full flex flex-col"
      >
        {/* Badge */}
        {badge && (
          <motion.span
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
        <Link href={linkHref} passHref>
          <div className="relative w-full aspect-[3/4] overflow-hidden flex-shrink-0 cursor-pointer">
            <Image
              src={images?.[0] || defaultImage}
              alt={name}
              loader={customLoader}
              fill
              className="object-cover transform transition duration-500 group-hover:scale-110 brightness-95 group-hover:brightness-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-40 group-hover:opacity-60 transition-opacity duration-300" />
          </div>
        </Link>

        {/* Details */}
        <div className="p-6 space-y-3 flex flex-col flex-grow">
          <Link href={linkHref} passHref>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-2 cursor-pointer hover:text-orange-600 transition-colors">
              {name}
            </h3>
          </Link>
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 min-h-[2.5rem] flex-grow">
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
            {finalPrice?.toLocaleString("en-KE", {
              style: "currency",
              currency: "KES",
              minimumFractionDigits: finalPrice % 1 === 0 ? 0 : 2,
            }) || "Free"}
          </p>

          {/* Booking Button (triggers modal) */}
          <div className="mt-4 w-full">
            <motion.button
              onClick={() => onSelect(item)} // Only allow selection if available isAvailable && 
              // disabled={!isAvailable}
              whileHover={{ scale: isAvailable ? 1.03 : 1 }}
              whileTap={{ scale: isAvailable ? 0.97 : 1 }}
              className={clsx(
                "w-full text-white py-3 rounded-xl font-semibold text-lg shadow-md transition-all duration-300 flex items-center justify-center gap-2",
                buttonClass
              )}
            >
              {/* {isAvailable ? "Enroll/Book Now" : "Enrollment Closed"}
              {isAvailable && <CalendarDaysIcon className="w-5 h-5" />} */}
              {"Enroll/Book Now"}
              <CalendarDaysIcon className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};


// --- Fallback Sample Data (representing MarketListingForm) ---
const fallbackPrograms: MarketListingForm[] = [
  // ... (Keeping the sample data as it was well-defined, updated isAvailable to true for some for demo)
  {
    id: "prog-exec",
    name: "90-Day Executive Leadership Intensive",
    description: "Accelerate your career with a structured, high-impact coaching plan focused on strategic influence.",
    finalPrice: 4997,
    images: ["https://images.unsplash.com/photo-1542435503-92161aa8387e?q=80&w=800"],
    author: "The Coach",
    category: "Executive Coaching",
    badge: "Featured",
    isAvailable: true, // Set to true for demo
    // ... rest of the fields
  } as MarketListingForm,
  {
    id: "prog-mind",
    name: "Mindset Mastery: Overcoming Self-Doubt",
    description: "An affordable, self-paced digital course to permanently rewire negative thought patterns.",
    finalPrice: 199,
    images: ["https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=800"],
    author: "The Coach",
    category: "Personal Development",
    badge: "Hot Deal",
    isAvailable: true, // Set to true for demo
    // ... rest of the fields
  } as MarketListingForm,
  {
    id: "prog-team",
    name: "High-Performance Team Workshop Kit",
    description: "A comprehensive toolkit for managers to run powerful team-building and alignment sessions.",
    finalPrice: 899,
    images: ["https://images.unsplash.com/photo-1522204502310-209ac7ad3e26?q=80&w=800"],
    author: "The Coach",
    category: "Team Coaching",
    badge: "New Arrival",
    isAvailable: false, // Set to false for demo
    // ... rest of the fields
  } as MarketListingForm,
];


// --- Main Programs Section Component (UPDATED with state and modal) ---
type ProgramsSectionProps = {
  listings: MarketListingForm[]; // Directly pass the list of programs
  storeSlug: string; // Required for linking
};

export default function ProgramsSection({ listings, storeSlug }: ProgramsSectionProps) {
  const [selected, setSelected] = useState<MarketListingForm | null>(null);
  
  const rawListings = listings && listings.length > 0 ? listings : fallbackPrograms;
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

        {/* Program Cards Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {programsToShow.map((program) => (
            <ProgramCard
              key={program.id}
              item={program as any}
              storeSlug={storeSlug}
              onSelect={setSelected}
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
          {/* <Link href={`/site/${storeSlug}/listings`} passHref>
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
          </Link> */}
        </motion.div>
      </div>

      {/* -------------------------------------------------- */}
      {/* 🛑 Enrollment/Booking Modal 🛑 (Incorporated here) */}
      {/* -------------------------------------------------- */}
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
            className="relative bg-white rounded-3xl max-w-4xl w-full mx-auto z-50 shadow-2xl p-6 sm:p-8 lg:p-10 transform dark:bg-gray-900"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors z-50"
              onClick={() => setSelected(null)}
              aria-label="Close booking form"
            >
              <XMarkIcon className="w-7 h-7" />
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="relative w-full h-[300px] md:h-auto rounded-xl overflow-hidden shadow-lg">
                <Image
                  src={
                    selected.images?.[0] ||
                    "https://placehold.co/600x800/EEE/31343C?text=Program+Image"
                  }
                  loader={customLoader}
                  alt={selected.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 via-transparent to-transparent"></div>
              </div>
              <div className="space-y-6 flex flex-col justify-start">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                    {selected.name}
                  </h2>
                  <p className="mt-2 text-md text-gray-700 dark:text-gray-300 leading-relaxed">{selected.description || 'No detailed program description available.'}</p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-6 text-lg">
                    <p className="font-semibold text-gray-800 dark:text-gray-200">
                      Price: <span className="text-orange-600 dark:text-orange-400 text-xl font-bold">KES { (selected.finalPrice || 0).toFixed(2) }</span>
                    </p>
                    {(
                    // selected.isAvailable ? (
                      <span className="inline-flex items-center gap-1.5 text-green-600 font-medium">
                        <CalendarDaysIcon className="w-5 h-5" />
                        Enrollment Open
                      </span>
                    // ) : (
                    //   <span className="inline-flex items-center gap-1.5 text-red-600 font-medium">
                    //     <XMarkIcon className="w-5 h-5" />
                    //     Enrollment Closed
                    //   </span>
                    )}
                  </div>
                  {/* The imported time-based BookingForm is used here */}
                  <ProgramsBookingForm service={selected} slug={storeSlug || ''}/> 
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

    </section>
  );
}