"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  StarIcon,
  ClockIcon,
  TagIcon,
} from "@heroicons/react/24/solid";

// --- Utilities --- //
const customLoader = ({ src, width, quality }: any) =>
  `${src}?w=${width}&q=${quality || 75}`;

const blurSvg = `data:image/svg+xml;base64,${btoa(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <rect width="100" height="100" fill="#e0e0e0" />
    <circle cx="50" cy="50" r="20" fill="#bdbdbd" />
  </svg>
`)}`;

// --- Animation Variants --- //
const containerVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 100, damping: 15 },
  },
};

// --- Dummy Listings --- //
const listingSamples = [
  {
    id: "1",
    title: "Enchanting Bali Retreat",
    description: "Discover serene temples, lush rice paddies, and vibrant culture.",
    thumbnail:
      "https://images.unsplash.com/photo-1536152470817-f90694154373?q=80&w=2940&auto=format&fit=crop",
    price: 1200,
    duration: "7 Days",
    rating: 4.8,
    activities: ["Culture", "Relaxation", "Nature"],
    badge: "Popular",
  },
  {
    id: "2",
    title: "Alaskan Wilderness Adventure",
    description: "Experience majestic glaciers, abundant wildlife, and breathtaking landscapes.",
    thumbnail:
      "https://images.unsplash.com/photo-1506953823976-5271ccbfb894?q=80&w=2940&auto=format&fit=crop",
    price: 2500,
    duration: "10 Days",
    rating: 4.9,
    activities: ["Wildlife", "Hiking", "Cruising"],
    badge: "New",
  },
  {
    id: "3",
    title: "Parisian Romantic Escape",
    description: "Indulge in art, cuisine, and the timeless charm of the City of Lights.",
    thumbnail:
      "https://images.unsplash.com/photo-1502602898662-a318aa667858?q=80&w=2940&auto=format&fit=crop",
    price: 950,
    duration: "5 Days",
    rating: 4.7,
    activities: ["City Tour", "Food", "History"],
    badge: "Hot Deal",
  },
];

// --- Star Rating --- //
const StarRating = ({ rating }: { rating: number }) => {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 !== 0;
  const empty = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <div className="flex items-center">
      {[...Array(fullStars)].map((_, i) => (
        <StarIcon key={`full-${i}`} className="h-5 w-5 text-yellow-400" />
      ))}
      {hasHalf && (
        <div className="relative">
          <StarIcon className="h-5 w-5 text-yellow-400" />
          <div className="absolute top-0 right-0 w-1/2 overflow-hidden">
            <StarIcon className="h-5 w-5 text-gray-300" />
          </div>
        </div>
      )}
      {[...Array(empty)].map((_, i) => (
        <StarIcon key={`empty-${i}`} className="h-5 w-5 text-gray-300" />
      ))}
      <span className="ml-2 text-gray-700 font-semibold text-sm">
        {rating.toFixed(1)}
      </span>
    </div>
  );
};

// --- Card --- //
function ListingCard({ listing = listingSamples }: { listing: any }) {
  return (
    <motion.div
      whileHover={{ y: -8, boxShadow: "0px 18px 30px rgba(0,0,0,0.18)" }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100 transform hover:scale-[1.01] transition-transform duration-300"
    >
      {/* Image */}
      <div className="relative h-56 w-full">
        <Image
          src={listing.thumbnail || "https://images.unsplash.com/photo-1536152470817-f90694154373?q=80&w=2940&auto=format&fit=crop"}
          alt={listing.title}
          fill
          className="object-cover transform hover:scale-105 transition-transform duration-500 ease-in-out"
          loader={customLoader}
          placeholder="blur"
          blurDataURL={blurSvg}
        />
        {listing.badge && (
          <span
            className={`absolute top-4 left-4 px-4 py-1.5 text-xs font-bold rounded-full uppercase tracking-wide
              ${listing.badge === "New"
                ? "bg-green-500 text-white"
                : listing.badge === "Popular"
                ? "bg-blue-500 text-white"
                : listing.badge === "Hot Deal"
                ? "bg-red-500 text-white animate-pulse"
                : listing.badge === "Luxury"
                ? "bg-yellow-500 text-gray-900"
                : "bg-gray-700 text-white"
              }`}
          >
            {listing.badge}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col justify-between h-[calc(100%-14rem)]">
        <div>
          <h3 className="text-xl font-extrabold text-gray-900 mb-2 leading-tight">
            {listing.title || listing.name}
          </h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {listing.description}
          </p>
          <div className="flex items-center justify-between mb-3">
            <p className="text-indigo-600 font-bold text-2xl">
              ${listing.finalPrice.toLocaleString()}
            </p>
            <StarRating rating={4.9} />
            {/* listing.rating */}
          </div>
          <div className="flex flex-wrap text-gray-700 text-sm gap-x-4 gap-y-2 mb-4">
            <span className="flex items-center gap-1">
              <ClockIcon className="h-4 w-4 text-indigo-500" />
              {listing.duration}
            </span>
            <span className="flex items-center gap-1">
              <TagIcon className="h-4 w-4 text-indigo-500" />
              {/* {listing.activities.join(", ")} */}
              {["Wildlife", "Hiking", "Cruising"].join(", ")}
            </span>
          </div>
        </div>

        <Link href={`/trips/${listing.id}`} passHref>
          <motion.button
            className="w-full bg-indigo-600 text-white py-3 rounded-full font-semibold hover:bg-indigo-700 transition duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            View Details
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3"
              />
            </svg>
          </motion.button>
        </Link>
      </div>
    </motion.div>
  );
}

// --- Section --- //
export default function ListingsSection( {listings, slug }: any) {

  return (
    <section id="tours" className="py-16 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <motion.h2
          className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 text-center leading-tight"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
        >
          Our Top Travel Experiences
        </motion.h2>
        <motion.p
          className="text-lg text-gray-600 mb-12 text-center max-w-3xl mx-auto"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Discover hand-picked journeys, from thrilling adventures to serene escapes, designed for every explorer.
        </motion.p>
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {listings.map((listing : any) => (
            <motion.div key={listing.id} variants={itemVariants}>
              <ListingCard listing={listing} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
