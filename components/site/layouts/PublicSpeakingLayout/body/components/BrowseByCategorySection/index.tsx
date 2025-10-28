'use client';

import React, { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { 
  ArrowRightIcon, 
  XMarkIcon, 
  CalendarDaysIcon 
} from "@heroicons/react/24/outline";
import {
  BookOpenIcon,
  UserIcon,
  FireIcon,
  TagIcon,
  SparklesIcon,
  CheckIcon,
} from "@heroicons/react/24/solid";
import { MarketListingForm } from "@/types/typings"; // Assuming this path is correct
import clsx from "clsx";

// Import the Booking Form (assuming it exists)
import ProgramsBookingForm from "../ProgramsBookingForm"; // Adjust path if needed

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
    transition: { type: "spring", stiffness: 150, damping: 12 }, // Smoother spring
  },
};

// Loader for Next.js Image
const customLoader = ({ src, width, quality }: any) =>
  `${src}?w=${width}&q=${quality || 75}`;

// =========================================================
// --- START: ENHANCED Program Card Component ---
// =========================================================
const ProgramCard = ({
  item,
  storeSlug,
  onSelect,
}: {
  item: MarketListingForm & {
    badge?: "New Arrival" | "Hot Deal" | "Featured";
    author?: string | null;
    keyBenefits?: string[];
  };
  storeSlug: string;
  onSelect: (item: MarketListingForm) => void;
}) => {
  const { 
    id, 
    name, 
    finalPrice, 
    images, 
    description, 
    badge, 
    author, 
    category, 
    keyBenefits 
  } = item;
  
  const defaultImage = "https://placehold.co/600x800/808080/FFFFFF?text=Program+Cover";

  const buttonClass = "bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800";
  const linkHref = `/site/${storeSlug}/publicspeaking/products/${id}`;

  return (
    <motion.div variants={itemVariants}>
      <motion.div
        whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        // 🎨 VISUAL ENHANCEMENT 1: Subtle gradient background on hover
        className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden group border border-gray-100 dark:border-gray-700 h-full flex flex-col 
                   hover:bg-gradient-to-br hover:from-white/95 hover:to-blue-50/95 dark:hover:from-gray-700 dark:hover:to-gray-800 transition-all duration-300"
      >
        
        {/* Badge & Image Container */}
        <Link href={linkHref} passHref>
          <div className="relative w-full aspect-[3/4] overflow-hidden flex-shrink-0 cursor-pointer">
            
            {/* Badge - STICKY AND ELEVATED */}
            {badge && (
              <span
                className={clsx(
                  "absolute top-0 right-0 px-4 py-2 rounded-bl-xl text-xs font-bold text-white z-10 flex items-center gap-1",
                  badge === "New Arrival"
                    ? "bg-gradient-to-r from-green-500 to-emerald-600"
                    : badge === "Hot Deal"
                    ? "bg-gradient-to-r from-red-500 to-orange-600"
                    : "bg-gradient-to-r from-blue-500 to-indigo-600"
                )}
              >
                {badge === "New Arrival" && <SparklesIcon className="w-3 h-3" />}
                {badge === "Hot Deal" && <FireIcon className="w-3 h-3" />}
                {badge === "Featured" && <TagIcon className="w-3 h-3" />}
                {badge}
              </span>
            )}
            
            <Image
              src={images?.[0] || defaultImage}
              alt={name}
              loader={customLoader}
              fill
              className="object-cover transform transition duration-500 group-hover:scale-110"
            />
            {/* 🎨 VISUAL ENHANCEMENT 2: Glassmorphic Overlay on hover */}
            <div className="absolute inset-0 bg-black/30 transition-opacity duration-300 group-hover:bg-black/50" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            
          </div>
        </Link>

        {/* Details Section */}
        <div className="p-6 space-y-4 flex flex-col flex-grow">
          
          {/* 🎨 VISUAL ENHANCEMENT 3: Elevated Price Block - Moved up for prominence */}
          <div className="flex items-baseline justify-between">
            <p className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">
              {finalPrice?.toLocaleString("en-KE", {
                style: "currency",
                currency: "KES",
                minimumFractionDigits: finalPrice % 1 === 0 ? 0 : 2,
              }) || "Free"}
            </p>
          </div>
          
          {/* Metadata Bar (Author/Category) - CLEANER PRESENTATION */}
          <div className="flex justify-between items-center text-sm border-b border-gray-100 dark:border-gray-700 pb-3">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <UserIcon className="w-4 h-4 text-gray-400" />
              <span className="font-medium truncate">{author || "Thrive Academy"}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <BookOpenIcon className="w-4 h-4 text-gray-400" />
              <span className="font-medium truncate">{category || "Life Skills Program"}</span>
            </div>
          </div>
          
          {/* Title */}
          <Link href={linkHref} passHref>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors">
              {name}
            </h3>
          </Link>

          {/* Key Benefits List (remains the same and is effective) */}
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2 min-h-[5.5rem] flex-grow">
            {(keyBenefits && keyBenefits.length > 0) ? (
              keyBenefits.slice(0, 3).map((benefit: string) => ( 
                <div key={benefit} className="flex items-start gap-2">
                  <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{benefit}</span>
                </div>
              ))
            ) : (
              <p className="line-clamp-3">
                {description || "A transformative program designed for rapid growth and lasting results."}
              </p>
            )}
          </div>

          {/* Booking Button (triggers modal) */}
          <div className="mt-auto w-full pt-4"> 
            <motion.button
              onClick={() => onSelect(item)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              // 🎨 VISUAL ENHANCEMENT 4: Stronger button shadow
              className={clsx(
                "w-full text-white py-3.5 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2",
                buttonClass,
                "shadow-lg shadow-blue-500/50 hover:shadow-xl hover:shadow-blue-500/60"
              )}
            >
              {"Enroll/Book Now"}
              <ArrowRightIcon className="w-5 h-5" /> {/* Changed icon for better flow */}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
// =========================================================
// --- END: ENHANCED Program Card Component ---
// =========================================================


// --- Main Programs Section Component (REMAINS LARGELY THE SAME) ---
type ProgramsSectionProps = {
  listings: MarketListingForm[];
  storeSlug: string;
};

export default function ProgramsSection({ listings, storeSlug }: ProgramsSectionProps) {
  const [selected, setSelected] = useState<MarketListingForm | null>(null);
  
  // Using sample data if 'listings' is empty
  const thriveAcademyPrograms: MarketListingForm[] = [
    {
      id: "stepping-out-core", name: "Stepping Out: Life Skills Program", 
      description: "A structured, 11-module life skills program to help students transition smoothly from high school to college and beyond.",
      longDescription: "Our core 11-module program covers: \n • Modules 1–2: Self Discovery & Learning Styles \n • Module 3: Emotional Intelligence \n • Modules 4–5: Managing Time, Space & Finances \n • Module 6: Developing Great Habits \n • Module 7: Decision Making & Problem Solving \n • Module 8: Building Healthy Relationships \n • Module 9: Health & Stress Management \n • Module 10: Career Development Portfolio \n • Module 11: My Life Map & Success",
      keyBenefits: ["Gain Self-Awareness & Clarity", "Master Time & Resource Management", "Build Emotional Intelligence"],
      finalPrice: 12500, images: ["https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=800"], 
      author: "Thrive Academy", category: "Life Skills", badge: "Featured", isAvailable: true, 
      productCategoryId: 'cat-life-skills', subCategory: null, tags: ["Senior School", "College", "Life Skills"], brand: null,
      option: [], color: [], size: [], weight: [], quantity: 100, buyingPrice: 0, sellingPrice: 12500, pricingTiers: [], isOnOffer: false,
      isFlashDeal: false, isNewArrival: false, isDiscounted: false, isFeatured: true, amenities: [], delivery: false, paymentOption: "Online", status: "PUBLISHED"
    } as any,
    {
      id: "stepping-out-speaking", name: "Foundational Public Speaking", 
      description: "An optional 12-module extension (C/o ACPS) to master public speaking, presentation, and effective communication.",
      longDescription: "This 12-module extension course (Modules 12-24, C/o ACPS) is designed to build confidence and mastery in communication. Participants will learn to craft compelling messages, manage stage fright, and deliver presentations with impact and clarity.",
      keyBenefits: ["Strengthen Communication Skills", "Build Public Speaking Confidence", "Enhance Problem-Solving"],
      finalPrice: 12500, images: ["https://images.unsplash.com/photo-1543269664-7e9c9b1d686f?q=80&w=800"], 
      author: "Thrive Academy (C/o ACPS)", category: "Communication", badge: "New Arrival", isAvailable: true, 
      productCategoryId: 'cat-communication', subCategory: null, tags: ["Public Speaking", "Communication", "Leadership"], brand: null,
      option: [], color: [], size: [], weight: [], quantity: 100, buyingPrice: 0, sellingPrice: 12500, pricingTiers: [], isOnOffer: false,
      isFlashDeal: false, isNewArrival: true, isDiscounted: false, isFeatured: false, amenities: [], delivery: false, paymentOption: "Online", status: "PUBLISHED"
    } as any,
    {
      id: "stepping-out-bundle", name: "The Complete 'Stepping Out' Bundle", 
      description: "The full 24-module package: Combine Life Skills + Public Speaking.",
      longDescription: "Get the complete 24-module experience. This bundle includes the 11-module 'Stepping Out' Life Skills program *plus* the 12-module 'Foundational Public Speaking' course. It's the ultimate package for students preparing to lead and succeed.",
      keyBenefits: ["Full 24-Module Access", "Life Skills & Leadership", "Discounted Bundle Price"],
      finalPrice: 24000, images: ["https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800"], 
      author: "Thrive Academy", category: "Bundle Package", badge: "Hot Deal", isAvailable: true, 
      productCategoryId: 'cat-bundle', subCategory: null, tags: ["Bundle", "Life Skills", "Public Speaking"], brand: null,
      option: [], color: [], size: [], weight: [], quantity: 100, buyingPrice: 0, sellingPrice: 24000, discount: 1000, 
      pricingTiers: [], isOnOffer: true, isFlashDeal: false, isNewArrival: false, isDiscounted: true, isFeatured: true,
      amenities: [], delivery: false, paymentOption: "Online", status: "PUBLISHED"
    } as any,
  ];

  const rawListings = listings && listings.length > 0 ? listings : thriveAcademyPrograms;
  const programsToShow = rawListings.slice(0, 3); 

  return (
    <section id="programs" className="py-20 md:py-28 bg-gray-50 dark:bg-gray-950 relative overflow-hidden">
      
      {/* Background Effect: Subtle blue glow/gradient */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-blue-50/50 dark:bg-indigo-900/10 [mask-image:radial-gradient(ellipse_at_top_left,transparent_50%,#fff)] dark:[mask-image:radial-gradient(ellipse_at_top_left,transparent_50%,#000)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        
        {/* Section Heading (Updated with stronger focus) */}
        <motion.h2
          className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white mb-4"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8 }}
        >
          Our Transformative{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            "Stepping Out" Programs
          </span>
        </motion.h2>

        <motion.p
          className="max-w-3xl mx-auto text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ delay: 0.2 }}
        >
          Empowering students for **life, learning, and leadership**. We equip young people with the mindset, habits, and tools they need to **thrive** through transitions with confidence and purpose.
        </motion.p>
        
        {/* Program Cards Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10" // Increased gap
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

        {/* View All Programs Button - UNCOMMENTED AND STYLED */}
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
                          text-white bg-gradient-to-br from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800
                          focus:outline-none focus:ring-4 focus:ring-blue-400/70 transition-all duration-300 transform hover:scale-[1.04]"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              View All Programs
              <ArrowRightIcon className="ml-2 -mr-1 w-6 h-6" />
            </motion.a>
          </Link>
        </motion.div>
      </div>

      {/* --- Booking Modal (Improved structure) --- */}
      {selected && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div
            className="fixed inset-0 bg-gray-900 bg-opacity-70 backdrop-blur-sm"
            onClick={() => setSelected(null)}
          />

          <motion.div
            // 💡 FUNCTIONAL IMPROVEMENT: Added max-h-full and overflow-y-auto for content that might exceed the screen height.
            className="relative bg-white rounded-3xl max-w-4xl w-full mx-auto z-50 shadow-2xl p-6 sm:p-8 lg:p-10 transform dark:bg-gray-900 max-h-full overflow-y-auto"
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
              {/* Left Side: Image + Details Summary */}
              <div className="space-y-6">
                <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden shadow-lg">
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

                {/* Summary Box */}
                <div className="p-4 border border-blue-200 dark:border-blue-900/50 rounded-xl bg-blue-50 dark:bg-gray-800 space-y-3">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                    {selected.name}
                  </h3>
                  <div className="flex items-center gap-6 text-lg">
                    <p className="font-semibold text-gray-800 dark:text-gray-200">
                      Price: 
                      <span className="text-blue-600 dark:text-blue-400 text-2xl font-bold ml-2">
                        {selected.finalPrice?.toLocaleString("en-KE", {
                          style: "currency",
                          currency: "KES",
                          minimumFractionDigits: 0,
                        })}
                      </span>
                    </p>
                    {(
                      <span className="inline-flex items-center gap-1.5 text-green-600 font-medium">
                        <CalendarDaysIcon className="w-5 h-5" />
                        Enrollment Open
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                    {(selected as any).longDescription || selected.description || 'No detailed program description available.'}
                  </p>
                </div>
              </div>
              
              {/* Right Side: Booking Form */}
              <div className="space-y-6 flex flex-col justify-start">
                <div className="pb-4 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">
                        Book Your Spot
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                        Complete the form below to secure your enrollment.
                    </p>
                </div>
                {/* The imported time-based BookingForm is used here */}
                <ProgramsBookingForm service={selected} slug={storeSlug || ''}/> 
              </div>
            </div>
          </motion.div>
       </motion.div>
       )}

    </section>
  );
}