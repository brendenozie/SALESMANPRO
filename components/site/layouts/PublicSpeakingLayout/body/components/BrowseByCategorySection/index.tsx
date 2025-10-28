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
  CheckIcon, // 👈 Added for the new benefits list
} from "@heroicons/react/24/solid";
import { MarketListingForm } from "@/types/typings"; // Assuming this path is correct
import clsx from "clsx";

// Import the Booking Form
import ProgramsBookingForm from "../ProgramsBookingForm"; // Adjust path if needed

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

// --- START: UPDATED Program Card Component ---
const ProgramCard = ({
  item,
  storeSlug,
  onSelect,
}: {
  item: MarketListingForm & {
    badge?: "New Arrival" | "Hot Deal" | "Featured";
    author?: string | null;
    keyBenefits?: string[]; // 👈 Added for the new design
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
    isAvailable,
    pricingTiers,
    keyBenefits // 👈 Destructure the new prop
  } = item;
  
  const defaultImage = "https://placehold.co/600x800/808080/FFFFFF?text=Program+Cover";

  // 🎨 UPDATED: New blue/indigo color palette
  const buttonClass = "bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800";
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
                  // 🎨 UPDATED: Use a color from the new palette
                ? "bg-gradient-to-r from-red-500 to-orange-600" // Kept Hot Deal as red
                : "bg-gradient-to-r from-blue-500 to-indigo-600" // Featured is now blue
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
        <div className="p-6 space-y-4 flex flex-col flex-grow">
          <Link href={linkHref} passHref>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors">
              {name}
          _ </h3>
          </Link>

          {/* 📇 UPDATED: Replaced description <p> with key benefits list */}
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2 min-h-[5.5rem] flex-grow">
            {(keyBenefits && keyBenefits.length > 0) ? (
              keyBenefits.slice(0, 3).map((benefit: string) => ( // Show top 3 benefits
                <div key={benefit} className="flex items-center gap-2">
                  <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="line-clamp-1">{benefit}</span>
                </div>
              ))
            ) : (
              <p className="line-clamp-3"> {/* Fallback to description if no benefits */}
                {description || "A transformative program designed for rapid growth and lasting results."}
              </p>
            )}
          </div>
          {/* End of updated section */}

          <div className="flex items-center justify-between mt-2">
            {(pricingTiers && pricingTiers.length > 0) ? (pricingTiers.map((tier) => (
              <div key={tier.id} className="flex flex-col">
                {(tier.features && tier.features.length > 0) && (tier.features.map((feature:string) => (
                  <span key={feature} className="text-sm text-gray-600 dark:text-gray-400">{feature}</span>
                )))}
              </div>
            ))) : (
              <div className="flex flex-col">
                
              </div>
            )}
          </div>

          <div className="pt-2">
            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
              <UserIcon className="w-5 h-5 text-gray-400" />
              <span>{author || "Thrive Academy"}</span>
            </div>

            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mt-2">
              <BookOpenIcon className="w-5 h-5 text-gray-400" />
              <span>{category || "Life Skills Program"}</span>
            </div>
          </div>


          {/* Price */}
          <p className="text-3xl font-extrabold text-gray-800 dark:text-white pt-2">
            {finalPrice?.toLocaleString("en-KE", {
              style: "currency",
              currency: "KES",
              minimumFractionDigits: finalPrice % 1 === 0 ? 0 : 2,
            }) || "Free"}
          </p>

          {/* Booking Button (triggers modal) */}
          <div className="mt-auto w-full pt-4"> {/* Use mt-auto to push button to bottom */}
            <motion.button
              onClick={() => onSelect(item)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={clsx(
                "w-full text-white py-3 rounded-xl font-semibold text-lg shadow-md transition-all duration-300 flex items-center justify-center gap-2",
                buttonClass // 🎨 Using the new blue button class
              )}
            >
              {"Enroll/Book Now"}
              <CalendarDaysIcon className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
// --- END: UPDATED Program Card Component ---


// --- START: UPDATED DATA (with keyBenefits & longDescription) ---
const thriveAcademyPrograms: MarketListingForm[] = [
  {
    id: "stepping-out-core",
    name: "Stepping Out: Life Skills Program",
    description: "A structured, 11-module life skills program to help students transition smoothly from high school to college and beyond.",
    longDescription: "Our core 11-module program covers: \n • Modules 1–2: Self Discovery & Learning Styles \n • Module 3: Emotional Intelligence \n • Modules 4–5: Managing Time, Space & Finances \n • Module 6: Developing Great Habits \n • Module 7: Decision Making & Problem Solving \n • Module 8: Building Healthy Relationships \n • Module 9: Health & Stress Management \n • Module 10: Career Development Portfolio \n • Module 11: My Life Map & Success",
    keyBenefits: [
      "Gain Self-Awareness & Clarity",
      "Master Time & Resource Management",
      "Build Emotional Intelligence",
    ],
    finalPrice: 12500,
    images: ["https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=800"], // Placeholder: Graduation/Students
    author: "Thrive Academy",
    category: "Life Skills",
    badge: "Featured",
    isAvailable: true,
    productCategoryId: 'cat-life-skills',
    // --- Fill other required fields from MarketListingForm with defaults ---
    subCategory: null, tags: ["Senior School", "College", "Life Skills"], brand: null,
    option: [], color: [], size: [], weight: [], quantity: 100,
    buyingPrice: 0, sellingPrice: 12500, pricingTiers: [], isOnOffer: false,
    isFlashDeal: false, isNewArrival: false, isDiscounted: false, isFeatured: true,
    amenities: [], delivery: false, paymentOption: "Online", status: "PUBLISHED"
  } as any, // Use 'as any' to allow custom props like keyBenefits
  {
    id: "stepping-out-speaking",
    name: "Foundational Public Speaking",
    description: "An optional 12-module extension (C/o ACPS) to master public speaking, presentation, and effective communication.",
    longDescription: "This 12-module extension course (Modules 12-24, C/o ACPS) is designed to build confidence and mastery in communication. Participants will learn to craft compelling messages, manage stage fright, and deliver presentations with impact and clarity.",
    keyBenefits: [
      "Strengthen Communication Skills",
      "Build Public Speaking Confidence",
      "Enhance Problem-Solving",
    ],
    finalPrice: 12500,
    images: ["https://images.unsplash.com/photo-1543269664-7e9c9b1d686f?q=80&w=800"], // Placeholder: Public Speaking
    author: "Thrive Academy (C/o ACPS)",
    category: "Communication",
    badge: "New Arrival",
    isAvailable: true,
    productCategoryId: 'cat-communication',
    // --- Fill other required fields from MarketListingForm with defaults ---
    subCategory: null, tags: ["Public Speaking", "Communication", "Leadership"], brand: null,
    option: [], color: [], size: [], weight: [], quantity: 100,
    buyingPrice: 0, sellingPrice: 12500, pricingTiers: [], isOnOffer: false,
    isFlashDeal: false, isNewArrival: true, isDiscounted: false, isFeatured: false,
    amenities: [], delivery: false, paymentOption: "Online", status: "PUBLISHED"
  } as any,
  {
    id: "stepping-out-bundle",
    name: "The Complete 'Stepping Out' Bundle",
    description: "The full 24-module package: Combine Life Skills + Public Speaking.",
    longDescription: "Get the complete 24-module experience. This bundle includes the 11-module 'Stepping Out' Life Skills program *plus* the 12-module 'Foundational Public Speaking' course. It's the ultimate package for students preparing to lead and succeed.",
    keyBenefits: [
      "Full 24-Module Access",
      "Life Skills & Leadership",
      "Discounted Bundle Price",
    ],
    finalPrice: 24000, // Example bundle price
    images: ["https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800"], // Placeholder: Students collaborating
    author: "Thrive Academy",
    category: "Bundle Package",
    badge: "Hot Deal",
    isAvailable: true,
    productCategoryId: 'cat-bundle',
    // --- Fill other required fields from MarketListingForm with defaults ---
    subCategory: null, tags: ["Bundle", "Life Skills", "Public Speaking"], brand: null,
    option: [], color: [], size: [], weight: [], quantity: 100,
    buyingPrice: 0, sellingPrice: 24000,  discount: 1000, // KSh. 25k original, KSh. 1k off
    pricingTiers: [], isOnOffer: true, isFlashDeal: false, isNewArrival: false, 
    isDiscounted: true, isFeatured: true,
    amenities: [], delivery: false, paymentOption: "Online", status: "PUBLISHED"
  } as any,
];
// --- END: UPDATED DATA ---


// --- Main Programs Section Component ---
type ProgramsSectionProps = {
  listings: MarketListingForm[]; // Directly pass the list of programs
  storeSlug: string; // Required for linking
};

export default function ProgramsSection({ listings, storeSlug }: ProgramsSectionProps) {
  const [selected, setSelected] = useState<MarketListingForm | null>(null);
  
  const rawListings = listings && listings.length > 0 ? listings : thriveAcademyPrograms;
  const programsToShow = rawListings.slice(0, 3); 

  return (
    <section id="programs" className="py-20 md:py-28 bg-gray-50 dark:bg-gray-950 relative overflow-hidden">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        
        {/* 🎨 UPDATED: Section Heading */}
        <motion.h2
          className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white mb-6"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8 }}
        >
          Our Transformative{" "}
          {/* 🎨 UPDATED: New blue/indigo color palette */}
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
          Empowering students for life, learning, and leadership. We equip young people
          with the mindset, habits, and tools they need to thrive through transitions with confidence and purpose.
        </motion.p>
        {/* --- END: UPDATED SECTION HEADING --- */}


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
              item={program as any} // Use 'as any' to pass custom props
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
          {/* 🎨 UPDATED: Button colors (if you uncomment it)
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
          </Link> */}
        </motion.div>
      </div>

      {/* --- Booking Modal --- */}
      {selected && (
        <motion.div
           className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div
            className="fixed inset-0 bg-gray-900 bg-opacity-70 backdrop-blur-sm" // Added backdrop-blur
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
                  
                  {/* 📑 UPDATED: Use longDescription for more detail */}
                  {/* The 'whitespace-pre-line' class respects line breaks (\n) in the string */}
                  <p className="mt-2 text-md text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                    {(selected as any).longDescription || selected.description || 'No detailed program description available.'}
                  </p>
             </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-6 text-lg">
                    <p className="font-semibold text-gray-800 dark:text-gray-200">
    ------------------Price: 
                          <span className="text-blue-600 dark:text-blue-400 text-xl font-bold ml-2">
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