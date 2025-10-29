'use client';

import React, { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { 
  ArrowRightIcon, 
  XMarkIcon, 
  CalendarDaysIcon,
  EyeIcon, 
  ClockIcon // Added for Duration display
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
    transition: { type: "spring", stiffness: 150, damping: 12 },
  },
};

// Loader for Next.js Image
const customLoader = ({ src, width, quality }: any) =>
  `${src}?w=${width}&q=${quality || 75}`;

// =========================================================
// --- START: UPDATED Program Card Component ---
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
    sellingPrice, // Used for price comparison/discount
    images, 
    description, 
    badge, 
    author, 
    category, 
    pricingTiers, // Added to leverage tier data
    // isAvailable, // Added for availability check
  } = item;

  let isAvailable = true; // Default to true

  // --- Data Extraction from Pricing Tiers ---
  const firstTier = pricingTiers?.[0];
  const tierName = firstTier?.name || "Program Details";
  const tierDuration = firstTier?.duration || "N/A";
  // Use up to 3 specific features from the tier features array
  const tierFeatures = firstTier?.features?.slice(0, 3) || []; 

  const hasDiscount = sellingPrice && finalPrice && sellingPrice > finalPrice;

  const defaultImage = "https://placehold.co/600x800/808080/FFFFFF?text=Program+Cover";

  // Stronger, more vibrant blue/indigo gradient
  const buttonClass = "bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800";
  const linkHref = `#`; //`/site/${storeSlug}/publicspeaking/products/${id}`; // Use a real link if available

  return (
    <motion.div variants={itemVariants}>
      <motion.div
        // Bolder shadow and lift on hover
        whileHover={{ y: isAvailable ? -10 : 0, boxShadow: isAvailable ? "0 25px 50px rgba(0,0,0,0.18)" : "0 10px 20px rgba(0,0,0,0.05)" }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className={clsx(
            "relative bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden group border border-gray-100 dark:border-gray-700 h-full flex flex-col transition-all duration-300",
            {
                // Subtle background gradient on hover for available items
                "hover:bg-gradient-to-br hover:from-white/90 hover:to-blue-50/90 dark:hover:from-gray-700 dark:hover:to-gray-800": isAvailable,
                // Visual cue for unavailable items
                "opacity-80 grayscale": !isAvailable
            }
        )}
      >
        
        {/* Badge & Image Container */}
        <Link href={linkHref} passHref>
          <div className="relative w-full aspect-[3/4] overflow-hidden flex-shrink-0 cursor-pointer">
            
            {/* Badge - STICKY AND ELEVATED */}
            {(badge || !isAvailable) && (
              <span
                className={clsx(
                  "absolute top-4 right-4 px-4 py-1.5 rounded-full text-xs font-bold text-white z-10 flex items-center gap-1 uppercase tracking-wider shadow-md",
                  badge === "New Arrival"
                    ? "bg-gradient-to-r from-green-500 to-teal-600"
                    : badge === "Hot Deal"
                    ? "bg-gradient-to-r from-red-500 to-orange-600"
                    : badge === "Featured"
                    ? "bg-gradient-to-r from-blue-500 to-indigo-600"
                    : !isAvailable
                    ? "bg-gray-600" // Use gray for Unavailable status
                    : "bg-gradient-to-r from-blue-500 to-indigo-600"
                )}
              >
                {!isAvailable && <XMarkIcon className="w-3 h-3" />}
                {!isAvailable ? "Unavailable" : badge}
              </span>
            )}
            
            <Image
              src={images?.[0] || defaultImage}
              alt={name}
              loader={customLoader}
              fill
              // More noticeable scale on hover for image
              className="object-cover transform transition duration-500 group-hover:scale-[1.08]"
            />
            {/* Overlay for text contrast on image - MADE STRONGER */}
            <div className="absolute inset-0 bg-black/40 transition-opacity duration-300 group-hover:bg-black/60" />
            {/* Stronger gradient from the bottom of the image */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent" />

          </div>
        </Link>

        {/* Details Section */}
        <div className="p-6 space-y-4 flex flex-col flex-grow">
          
          {/* Title - Moved up for immediate impact */}
          <Link href={linkHref} passHref>
            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors leading-snug">
              {name}
            </h3>
          </Link>
          
          {/* Subtitle / Tier Name - NEW: Use specific tier name */}
          <p className="text-sm font-semibold uppercase text-blue-600 dark:text-blue-400 -mt-2">
            {tierName}
          </p>

          {/* Enhanced Price Block (Duration, Price, Discount) */}
          <div className="flex items-center justify-between py-3 border-y border-gray-100 dark:border-gray-700/50">
            {/* Duration */}
            <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 dark:text-gray-400">
                <ClockIcon className="w-4 h-4 text-blue-500" />
                <span>{tierDuration}</span>
            </div>
            
            {/* Price & Discount */}
            <div className="flex items-baseline gap-3">
                {hasDiscount && (
                    <p className="text-xl font-medium text-gray-400 line-through">
                        {sellingPrice?.toLocaleString("en-KE", { style: "currency", currency: "KES", minimumFractionDigits: 0 })}
                    </p>
                )}
                <p className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">
                    {finalPrice && finalPrice > 0 ? finalPrice.toLocaleString("en-KE", { 
                        style: "currency", 
                        currency: "KES", 
                        minimumFractionDigits: 0,
                    }) : "FREE"}
                </p>
            </div>
          </div>
          
          {/* Metadata Bar (Author/Category) - CLEANER PRESENTATION */}
          <div className="flex justify-between items-center text-sm pt-1">
            <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
              <UserIcon className="w-4 h-4 text-blue-500" />
              <span className="font-medium truncate">{author || "Thrive Academy"}</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
              <BookOpenIcon className="w-4 h-4 text-blue-500" />
              <span className="font-medium truncate">{category || "Life Skills Program"}</span>
            </div>
          </div>
          
          {/* Key Features List (NEW: Using specific module titles) */}
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2 min-h-[5.5rem] flex-grow pt-3">
            {tierFeatures.length > 0 ? (
              tierFeatures.map((feature: string, index: number) => ( 
                <div key={index} className="flex items-start gap-2">
                  <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="line-clamp-1">{feature}</span>
                </div>
              ))
            ) : (
              <p className="line-clamp-3">
                {description || "A transformative program designed for rapid growth and lasting results."}
              </p>
            )}
          </div>

          {/* Booking/Detail Buttons (Availability Controlled CTA) */}
          <div className="mt-auto w-full pt-4 space-y-2"> 
            {/* Primary CTA: Enroll/Book Now (Modal Trigger) */}
            <motion.button
              onClick={() => isAvailable ? onSelect(item) : undefined}
              whileHover={isAvailable ? { scale: 1.02 } : {}}
              whileTap={isAvailable ? { scale: 0.98 } : {}}
              disabled={!isAvailable}
              // Stronger button shadow and larger size, with disabled style
              className={clsx(
                "w-full text-white py-4 rounded-xl font-bold text-base transition-all duration-300 flex items-center justify-center gap-2",
                isAvailable 
                    ? buttonClass + " shadow-lg shadow-blue-500/50 hover:shadow-xl hover:shadow-blue-500/60"
                    : "bg-gray-400 cursor-not-allowed shadow-none"
              )}
            >
              {isAvailable ? "Enroll/Book Now" : "Waitlist/Unavailable"}
              {isAvailable ? <CalendarDaysIcon className="w-5 h-5" /> : <XMarkIcon className="w-5 h-5" />}
            </motion.button>
            
            {/* Secondary CTA: View Details (Link) - Uncomment if you have a detail page */}
            {/* <Link href={linkHref} passHref>
              <motion.a
                className="w-full text-blue-600 dark:text-blue-400 border border-blue-500/50 dark:border-blue-400/50 
                           py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 
                           flex items-center justify-center gap-2 hover:bg-blue-50 dark:hover:bg-gray-700"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                View Full Program Details
                <EyeIcon className="w-4 h-4" />
              </motion.a>
            </Link> */}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
// =========================================================
// --- END: UPDATED Program Card Component ---
// =========================================================


// --- Main Programs Section Component (Kept for context, no changes needed) ---
type ProgramsSectionProps = {
  listings: MarketListingForm[];
  storeSlug: string;
};

export default function ProgramsSection({ listings, storeSlug }: ProgramsSectionProps) {
  const [selected, setSelected] = useState<MarketListingForm | null>(null);
  
  // Using sample data if 'listings' is empty (Sample data remains the same)
  const thriveAcademyPrograms: MarketListingForm[] = [
    {
      id: "stepping-out-core", name: "Stepping Out: Core Life Skills Program", 
      description: "A structured, 11-module life skills program to help students transition smoothly from high school to college and beyond.",
      longDescription: "Our core 11-module program covers: \n • Modules 1–2: Self Discovery & Learning Styles \n • Module 3: Emotional Intelligence \n • Modules 4–5: Managing Time, Space & Finances \n • Module 6: Developing Great Habits \n • Module 7: Decision Making & Problem Solving \n • Module 8: Building Healthy Relationships \n • Module 9: Health & Stress Management \n • Module 10: Career Development Portfolio \n • Module 11: My Life Map & Success",
      keyBenefits: ["Gain Self-Awareness & Clarity", "Master Time & Resource Management", "Build Emotional Intelligence"],
      finalPrice: 12500, images: ["https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=800"], 
      author: "Thrive Academy", category: "Life Skills", badge: "Featured", isAvailable: true, 
      productCategoryId: 'cat-life-skills', subCategory: null, tags: ["Senior School", "College", "Life Skills"], brand: null,
      option: [], color: [], size: [], weight: [], quantity: 100, buyingPrice: 0, sellingPrice: 12500, pricingTiers: [
        {name: "Core 11-Module Program", price: 12500, features: ["Modules 1-2: Self Discovery", "Module 3: Emotional Intelligence", "Module 4-5: Managing Time & Finances"], isFeatured: false, duration: "3 Months"}
      ], isOnOffer: false,
      isFlashDeal: false, isNewArrival: false, isDiscounted: false, isFeatured: true, amenities: [], delivery: false, paymentOption: "Online", status: "PUBLISHED"
    } as any,
    {
      id: "stepping-out-speaking", name: "Foundational Public Speaking Mastery", 
      description: "An optional 12-module extension (C/o ACPS) to master public speaking, presentation, and effective communication.",
      longDescription: "This 12-module extension course (Modules 12-24, C/o ACPS) is designed to build confidence and mastery in communication. Participants will learn to craft compelling messages, manage stage fright, and deliver presentations with impact and clarity.",
      keyBenefits: ["Strengthen Communication Skills", "Build Public Speaking Confidence", "Enhance Problem-Solving"],
      finalPrice: 12500, images: ["https://images.unsplash.com/photo-1543269664-7e9c9b1d686f?q=80&w=800"], 
      author: "Thrive Academy (C/o ACPS)", category: "Communication", badge: "New Arrival", isAvailable: false, // Made unavailable to test new logic
      productCategoryId: 'cat-communication', subCategory: null, tags: ["Public Speaking", "Communication", "Leadership"], brand: null,
      option: [], color: [], size: [], weight: [], quantity: 100, buyingPrice: 0, sellingPrice: 12500, pricingTiers: [
        {name: "12-Module Extension", price: 12500, features: ["Module 12: Crafting Compelling Messages", "Module 13: Overcoming Stage Fright", "Module 14: Delivery with Impact"], isFeatured: false, duration: "2 Months"}
      ], isOnOffer: false,
      isFlashDeal: false, isNewArrival: true, isDiscounted: false, isFeatured: false, amenities: [], delivery: false, paymentOption: "Online", status: "PUBLISHED"
    } as any,
    {
      id: "stepping-out-bundle", name: "The Complete 'Stepping Out' Bundle Package", 
      description: "The full 24-module package: Combine Life Skills + Public Speaking for maximum impact.",
      longDescription: "Get the complete 24-module experience. This bundle includes the 11-module 'Stepping Out' Life Skills program *plus* the 12-module 'Foundational Public Speaking' course. It's the ultimate package for students preparing to lead and succeed.",
      keyBenefits: ["Full 24-Module Access", "Life Skills & Leadership", "Discounted Bundle Price"],
      finalPrice: 24000, images: ["https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800"], 
      author: "Thrive Academy", category: "Bundle Package", badge: "Hot Deal", isAvailable: true, 
      productCategoryId: 'cat-bundle', subCategory: null, tags: ["Bundle", "Life Skills", "Public Speaking"], brand: null,
      option: [], color: [], size: [], weight: [], quantity: 100, buyingPrice: 0, sellingPrice: 28000, discount: 4000, // Price difference for discount test
      pricingTiers: [
        {name: "Full 24-Module Bundle", price: 24000, features: ["Life Skills (11 Modules)", "Public Speaking (12 Modules)", "Certificate of Completion"], isFeatured: true, duration: "5 Months"}
      ], isOnOffer: true, isFlashDeal: false, isNewArrival: false, isDiscounted: true, isFeatured: true,
      amenities: [], delivery: false, paymentOption: "Online", status: "PUBLISHED"
    } as any,
  ];

  const rawListings = listings && listings.length > 0 ? listings : thriveAcademyPrograms;
  const programsToShow = rawListings.slice(0, 3); 

  return (
    <section id="programs" className="py-20 md:py-28 bg-gray-50 dark:bg-gray-950 relative overflow-hidden">
      
      {/* Background Effect: Subtle blue glow/gradient for depth */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-blue-50/50 dark:bg-indigo-900/10 [mask-image:radial-gradient(ellipse_at_top_left,transparent_50%,#fff)] dark:[mask-image:radial-gradient(ellipse_at_top_left,transparent_50%,#000)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        
        {/* Section Heading (Updated with stronger focus) */}
        <motion.h2
          // Larger, more impactful font size for the title
          className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white mb-4 leading-tight"
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
          // Bolder subtext for stronger value proposition
          className="max-w-3xl mx-auto text-xl md:text-2xl font-medium text-gray-700 dark:text-gray-300 mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ delay: 0.2 }}
        >
          Empowering students for **life, learning, and leadership**. We equip young people with the mindset, habits, and tools they need to **thrive** through transitions with confidence and purpose.
        </motion.p>
        
        {/* Program Cards Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12" // Increased gap for airiness
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

        {/* View All Programs Button - STYLED FOR MAXIMUM POP */}
        <motion.div
          className="text-center mt-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ delay: 0.3, duration: 0.7 }}
        >
          <Link href={`/site/${storeSlug}/listings`} passHref>
            <motion.a
              className="inline-flex items-center justify-center px-12 py-4 text-xl font-bold rounded-full shadow-2xl
                        text-white bg-gradient-to-br from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800
                        focus:outline-none focus:ring-4 focus:ring-blue-400/70 transition-all duration-300 transform hover:scale-[1.04]
                        shadow-blue-500/50" // Bolder shadow
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
            // Added max-h-full and overflow-y-auto for responsiveness
            className="relative bg-white rounded-3xl max-w-4xl w-full mx-auto z-50 shadow-2xl p-6 sm:p-8 lg:p-10 transform dark:bg-gray-900 max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors z-50 p-1 bg-white dark:bg-gray-800 rounded-full shadow-md"
              onClick={() => setSelected(null)}
              aria-label="Close booking form"
            >
              <XMarkIcon className="w-7 h-7" />
           </button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Side: Image + Details Summary */}
              <div className="space-y-6 md:order-1">
                {/* More pronounced image on modal */}
                <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden shadow-2xl">
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

                {/* Summary Box - Added visual border/background for contrast */}
                <div className="p-5 border border-blue-300 dark:border-blue-700/50 rounded-xl bg-blue-50 dark:bg-gray-800 space-y-4">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                    Program Summary
                  </h3>
                  <div className="flex items-center justify-between text-lg border-t border-blue-200 dark:border-blue-700/30 pt-4">
                    <p className="font-semibold text-gray-800 dark:text-gray-200">
                      Investment: 
                    </p>
                    <span className="text-blue-600 dark:text-blue-400 text-3xl font-extrabold">
                        {selected.finalPrice?.toLocaleString("en-KE", {
                          style: "currency",
                          currency: "KES",
                          minimumFractionDigits: 0,
                        })}
                    </span>
                  </div>
                  
                  <p className="mt-4 text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                    {(selected as any).longDescription || selected.description || 'No detailed program description available. Complete the form to inquire about availability.'}
                  </p>
                </div>
              </div>
              
              {/* Right Side: Booking Form */}
              <div className="space-y-6 flex flex-col justify-start md:order-2">
                <div className="pb-4 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">
                        Secure Your Enrollment
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-base mt-2">
                        Complete the form below to book your spot in the **{selected.name}** program.
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