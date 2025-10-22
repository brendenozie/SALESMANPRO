'use client';

import React, { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { MarketListingForm } from "@/types/typings";
import clsx from "clsx";
import {
  BookOpenIcon,
  UserIcon,
  FireIcon,
  TagIcon,
  SparklesIcon,
  XMarkIcon, // Added for modal close button
} from "@heroicons/react/24/solid";
import BookingForm from "../BookingForm";
// import BookingForm from "./components/BookingForm"; // Assuming this path is correct

const loader = ({ src, width, quality }: any) =>
  `${src}?w=${width}&q=${quality || 75}`;

// --- Ebook Card (Updated to include booking onClick) ---
const EbookCard = ({
  item, // Pass the full item object
  slug,
  onSelect, // New prop for handling selection
}: {
  item: MarketListingForm;
  slug: string;
  onSelect: (item: MarketListingForm) => void;
}) => {
  const { id, name, finalPrice, images, description, badge, author, category } =
    item;

  return (
    <motion.div
      whileHover={{ y: -8, boxShadow: "0 15px 30px rgba(0,0,0,0.15)" }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden group border border-gray-100 dark:border-gray-700 flex flex-col"
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

      {/* Cover Image - Use Link to Listing Details */}
      <Link href={`/site/${slug}/listing/${id}`} passHref>
        <div className="relative w-full aspect-[3/4] overflow-hidden">
          <Image
            src={
              images?.[0] ||
              "https://placehold.co/600x800/EEE/31343C?text=No+Cover"
            }
            alt={name}
            loader={loader}
            fill
            className="object-cover transform transition duration-500 group-hover:scale-110 brightness-95 group-hover:brightness-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-40 group-hover:opacity-60 transition-opacity duration-300" />
        </div>
      </Link>

      {/* Details */}
      <div className="p-6 space-y-3 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-2">
          {name}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 flex-grow">
          {description || "No description available."}
        </p>

        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mt-2">
          <UserIcon className="w-5 h-5 text-gray-400" />
          <span>{author || "Unknown Author"}</span>
        </div>

        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
          <BookOpenIcon className="w-5 h-5 text-gray-400" />
          <span>{category || "E-Book"}</span>
        </div>

        <p className="text-2xl font-extrabold text-orange-600 dark:text-orange-400">
          {finalPrice?.toLocaleString("en-KE", {
            style: "currency",
            currency: "KES",
          }) || "Free"}
        </p>

        {/* Action Button: Book Now (triggers modal) */}
        <motion.button
          onClick={() => onSelect(item as MarketListingForm)} // Use onSelect prop
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="mt-4 w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 rounded-xl font-semibold text-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
        >
          Book Now
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

// --- Fallback Sample Data (unchanged) ---
const sampleEbooks = [
  // ... (your existing sampleEbooks data) ...
  {
    id: "1",
    name: "Master Your Mindset: The Key to Success",
    description:
      "A powerful guide to overcoming self-doubt and developing unstoppable confidence.",
    finalPrice: 899,
    images: [
      "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&q=80",
    ],
    author: "Sample Author",
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
    author: "Sample Author",
    category: "Finance",
    badge: "Hot Deal",
  },
  {
    id: "3",
    name: "The Art of Effective Communication",
    description:
      "Unlock the secrets to persuasive speaking and deep, meaningful connections.",
    finalPrice: 799,
    images: [
      "https://images.unsplash.com/photo-1522204502310-209ac7ad3e26?w=800&q=80",
    ],
    author: "Sample Author",
    category: "Leadership",
    badge: "New Arrival",
  },
] as MarketListingForm[];

// --- Main Component (Updated for state and modal) ---
export default function FeaturedEbooks({
  listings,
  slug,
}: {
  listings: MarketListingForm[];
  slug: string;
}) {
  // Use local state to manage the selected item for the modal
  const [selected, setSelected] = useState<MarketListingForm | null>(null);

  // Use props data, falling back to sample data if props are empty
  const currentListings =
    listings && listings.length > 0 ? listings : sampleEbooks;

  return (
    <section className="bg-gray-50 dark:bg-gray-950 py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading (unchanged) */}
        <motion.h2
          className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-gray-50 text-center mb-16 relative z-10"
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          Explore Our{" "}
          <span className="text-orange-600 dark:text-orange-400">
            Featured
          </span>{" "}
          E-Books
          <span className="block w-32 h-1 bg-orange-500 mx-auto mt-4 rounded-full" />
        </motion.h2>

        {/* Listings Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {currentListings.map((item) => (
            <EbookCard
              key={item.id}
              item={item} // Pass the full item
              slug={slug}
              onSelect={setSelected} // Pass the state setter function
            />
          ))}
        </motion.div>
      </div>

      {/* Booking Modal (Copied and adapted from ServicesSection) */}
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
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 via-transparent to-transparent"></div>
              </div>
              <div className="space-y-6 flex flex-col justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 leading-tight">
                    {selected.name}
                  </h2>
                  <p className="mt-2 text-md text-gray-700 leading-relaxed">
                    {selected.description || "No detailed description available."}
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-6 text-lg">
                    <p className="font-semibold text-gray-800">
                      Price:{" "}
                      <span className="text-orange-600 text-xl font-bold">
                        KES {(selected.finalPrice || 0).toFixed(2)}
                      </span>
                    </p>
                    <span className="inline-flex items-center gap-1.5 text-green-600 font-medium">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Available
                    </span>
                  </div>
                  <BookingForm service={selected} />
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </section>
  );
}