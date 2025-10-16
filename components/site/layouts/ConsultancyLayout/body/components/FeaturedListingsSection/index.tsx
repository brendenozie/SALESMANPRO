"use client";

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
} from "@heroicons/react/24/solid";

const loader = ({ src, width, quality }: any) =>
  `${src}?w=${width}&q=${quality || 75}`;

// --- Ebook Card ---
const EbookCard = ({
  id,
  name,
  finalPrice,
  images,
  description,
  badge,
  author,
  category,
  slug,
}: {
  id: string;
  name: string;
  finalPrice?: number | null;
  images?: string[];
  description?: string | null;
  badge?: "New Arrival" | "Hot Deal" | "Featured";
  author?: string | null;
  category?: string | null;
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

        {/* Details */}
        <div className="p-6 space-y-3">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-2">
            {name}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
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

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="mt-4 w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 rounded-xl font-semibold text-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
          >
            View Book
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

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

// --- Fallback Sample Data ---
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
    author: "John Mwangi",
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
    author: "Mary Atieno",
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
    author: "David Ouma",
    category: "Leadership",
    badge: "New Arrival",
  },
] as MarketListingForm[];

// --- Main Component ---
export default function FeaturedEbooks({
  listings,
  slug,
}: {
  listings: MarketListingForm[];
  slug: string;
}) {
  const [activeTab, setActiveTab] = useState("featured");
  const currentListings =
    listings && listings.length > 0 ? listings : sampleEbooks;

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
              id={item.id}
              name={item.name}
              finalPrice={item.finalPrice}
              images={item.images}
              description={item.description}
              badge={(item.badge as any) || "Featured"}
              author={item.author || "Unknown"}
              category={item.category || "E-Book"}
              slug={slug}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
