'use client';

import React, { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { MarketListingForm } from "@/types/typings"; // Assuming this is correct
import clsx from "clsx";
import {
  BookOpenIcon,
  UserIcon,
  FireIcon,
  TagIcon,
  SparklesIcon,
  XMarkIcon,
  ArrowDownTrayIcon, // Changed BookOpenIcon to a more suitable icon for purchase/download
} from "@heroicons/react/24/solid";
import BookingForm from "../BookingForm"; // Keep the booking form for consistency with previous sections

const loader = ({ src, width, quality }: any) =>
  `${src}?w=${width}&q=${quality || 75}`;

// --- Ebook Card (Enhanced Aesthetics and CTA) ---
const EbookCard = ({
  item,
  slug,
  onSelect,
}: {
  item: MarketListingForm;
  slug: string;
  onSelect: (item: MarketListingForm) => void;
}) => {
  const { id, name, finalPrice, images, description, badge, author, category } =
    item;

  return (
    <motion.div
      whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="relative bg-white rounded-3xl shadow-2xl overflow-hidden group border border-orange-100 flex flex-col h-full"
    >
      {/* Badge */}
      {badge && (
        <motion.span
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className={clsx(
            "absolute top-4 left-4 px-4 py-1.5 rounded-full text-xs font-extrabold uppercase text-white z-10 flex items-center gap-1 shadow-md",
            badge === "New Arrival"
              ? "bg-gradient-to-r from-teal-500 to-cyan-600"
              : badge === "Hot Deal"
              ? "bg-gradient-to-r from-red-500 to-pink-600"
              : "bg-gradient-to-r from-purple-500 to-indigo-600"
          )}
        >
          {badge === "New Arrival" && <SparklesIcon className="w-3 h-3" />}
          {badge === "Hot Deal" && <FireIcon className="w-3 h-3" />}
          {badge === "Featured" && <TagIcon className="w-3 h-3" />}
          {badge}
        </motion.span>
      )}

      {/* Cover Image - Link to Listing Details */}
      <Link href={`/listing/${id}`} passHref className="block">
        <div className="relative w-full aspect-[3/4] overflow-hidden">
          <Image
            src={
              images?.[0] ||
              "https://placehold.co/600x800/EEE/31343C?text=No+Cover"
            }
            alt={name}
            loader={loader}
            fill
            className="object-cover transform transition duration-500 group-hover:scale-105 brightness-95 group-hover:brightness-90"
          />
          {/* Visual Overlay for Depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
        </div>
      </Link>

      {/* Details */}
      <div className="p-6 space-y-4 flex flex-col flex-grow">
        <div className="flex-grow">
          <h3 className="text-xl font-extrabold text-gray-900 line-clamp-2 leading-snug group-hover:text-orange-600 transition-colors">
            {name}
          </h3>
          <p className="text-sm text-gray-500 mt-2 line-clamp-2">
            {description || "Unlock new skills and master powerful concepts with this engaging guide."}
          </p>
        </div>

        {/* Meta */}
        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <UserIcon className="w-4 h-4 text-orange-400" />
            <span className="font-medium">{author || "Coach"}</span>
          </div>
          <p className="text-xl font-extrabold text-orange-600">
            {finalPrice === 0 ? "FREE" : finalPrice?.toLocaleString("en-KE", {
                style: "currency",
                currency: "KES",
                minimumFractionDigits: 0
              }) || "Free"}
          </p>
        </div>

        {/* Action Button: Purchase/Download (triggers modal) */}
        <motion.button
          onClick={() => onSelect(item as MarketListingForm)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="mt-4 w-full bg-orange-600 text-white py-3 rounded-full font-bold text-base shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 border-2 border-orange-600 hover:bg-white hover:text-orange-600"
        >
          <ArrowDownTrayIcon className="w-5 h-5" />
          {finalPrice === 0 ? 'Download Now' : 'Get Your Copy'}
        </motion.button>
      </div>
    </motion.div>
  );
};

// --- Animation Variants (unchanged) ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

// --- Fallback Sample Data (Simplified for brevity, assuming the full data exists) ---
const sampleEbooks = [
  {
    id: "1",
    name: "Master Your Mindset: The Key to Success",
    description:
      "A powerful guide to overcoming self-doubt and developing unstoppable confidence.",
    finalPrice: 899,
    images: [
      "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&q=80",
    ],
    author: "Jackie W.",
    category: "Personal Development",
    badge: "Featured",
  },
  {
    id: "2",
    name: "Financial Freedom Simplified",
    description:
      "Learn the practical steps to managing money, saving smart, and investing wisely.",
    finalPrice: 1199,
    images: [
      "https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&q=80",
    ],
    author: "FlourisHUb Team",
    category: "Finance",
    badge: "Hot Deal",
  },
  {
    id: "3",
    name: "The Art of Effective Communication",
    description:
      "Unlock the secrets to persuasive speaking and deep, meaningful connections.",
    finalPrice: 0,
    images: [
      "https://images.unsplash.com/photo-1522204502310-209ac7ad3e26?w=800&q=80",
    ],
    author: "Jackie W.",
    category: "Leadership",
    badge: "New Arrival",
  },
] as MarketListingForm[];

// --- Main Component (Updated for Captivating Visuals) ---
export default function FeaturedEbooks({
  listings,
  slug,
}: {
  listings: MarketListingForm[];
  slug: string;
}) {
  const [selected, setSelected] = useState<MarketListingForm | null>(null);

  const currentListings =
    listings && listings.length > 0 ? listings : sampleEbooks;

  return (
    <section className="bg-gradient-to-br from-orange-50 via-white to-gray-50 py-20 sm:py-32 relative overflow-hidden">
      {/* Decorative Element: Swirl/Circle background graphic */}
      <div className="absolute top-0 left-0 w-full h-full bg-contain bg-no-repeat opacity-5" style={{ backgroundImage: "url('/img/swirl.svg')" }}></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header: More engaging and direct */}
        <div className="text-center mb-16 sm:mb-20">
          <motion.span
            className="text-lg font-semibold text-orange-700 uppercase tracking-wider mb-3 block"
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            The FlourisHUb Library
          </motion.span>
          <motion.h2
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            Unlock Your Potential with Our{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-500">
              Bestselling E-Books
            </span>
          </motion.h2>
        </div>

        {/* Listings Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {currentListings.slice(0, 3).map((item) => ( // Limiting to 3 for featured look
            <EbookCard
              key={item.id}
              item={item}
              slug={slug}
              onSelect={setSelected}
            />
          ))}
        </motion.div>

        {/* View All CTA */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          {/* <Link href={`/market`} passHref>
            <motion.span
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center px-8 py-3 bg-white text-orange-600 border-2 border-orange-600 rounded-full font-bold shadow-lg hover:bg-orange-600 hover:text-white transition-all duration-300 cursor-pointer"
            >
              View All Products & Resources
              <BookOpenIcon className="w-5 h-5 ml-2" />
            </motion.span>
          </Link> */}
        </motion.div>
      </div>

      {/* Booking Modal (Re-styled for E-book Purchase) */}
      {selected && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div
            className="fixed inset-0 bg-gray-900 bg-opacity-80 backdrop-blur-sm"
            onClick={() => setSelected(null)}
          />

          <motion.div
            className="relative bg-white rounded-3xl max-w-4xl w-full mx-auto z-50 shadow-2xl p-6 sm:p-8 lg:p-10 transform"
            initial={{ scale: 0.9, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 50 }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
          >
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 transition-colors z-50 p-1 bg-white rounded-full shadow-md"
              onClick={() => setSelected(null)}
              aria-label="Close"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
            <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-8 items-center">
              {/* Ebook Cover Side */}
              <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden shadow-2xl border-4 border-gray-100 mx-auto max-w-[200px] md:max-w-none">
                <Image
                  src={
                    selected.images?.[0] ||
                    "https://placehold.co/600x800/EEE/31343C?text=No+Cover"
                  }
                  loader={loader}
                  alt={selected.name}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Purchase/Booking Form Side */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-extrabold text-gray-900 leading-tight">
                    Confirm Your Purchase
                  </h2>
                  <p className="mt-2 text-md text-gray-600">
                    You're one step closer to accessing: **{selected.name}**
                  </p>
                </div>
                
                <div className="p-4 bg-orange-50 rounded-lg flex justify-between items-center">
                  <span className="font-semibold text-gray-800">Total Price:</span>
                  <span className="text-orange-700 text-3xl font-extrabold">
                    {selected.finalPrice === 0 ? 'FREE' : selected.finalPrice?.toLocaleString("en-KE", {
                        style: "currency",
                        currency: "KES",
                        minimumFractionDigits: 0
                      })}
                  </span>
                </div>

                {/* Placeholder for Payment/Booking Form */}
                <BookingForm service={selected} slug={slug || ''} />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </section>
  );
}