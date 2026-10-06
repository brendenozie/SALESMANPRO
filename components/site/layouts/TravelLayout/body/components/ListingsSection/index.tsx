"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  StarIcon,
  ClockIcon,
  MapPinIcon,
  HeartIcon as HeartSolid,
} from "@heroicons/react/24/solid";
import { HeartIcon as HeartOutline, ArrowRightIcon } from "@heroicons/react/24/outline";
import TravelCard from "../TravelCard";

// --- Utilities --- //
const customLoader = ({ src, width, quality }: any) =>
  `${src}?w=${width}&q=${quality || 75}`;

// --- Sample Data (Robust & normalized) --- //
const defaultListings = [
  {
    id: "1",
    title: "Sanctuary in Ubud",
    name: "Sanctuary in Ubud",
    location: "Bali, Indonesia",
    description: "Immerse yourself in the spiritual heart of Bali. Private villas surrounded by lush jungle and ancient temples.",
    thumbnail: "https://images.unsplash.com/photo-1536152470817-f90694154373?q=80&w=2940&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1536152470817-f90694154373?q=80&w=2940&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2940&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2940&auto=format&fit=crop",
    ],
    finalPrice: 1290,
    price: 1290,
    duration: "7 Days",
    rating: 4.92,
    reviews: 128,
    badge: "Best Seller",
    category: "Relaxation",
  },
  {
    id: "2",
    title: "Glaciers of Denali",
    location: "Alaska, USA",
    description: "A rugged expedition through the frozen north. Helicopter tours, grizzly spotting, and luxury cabin stays.",
    thumbnail: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=3540&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=3540&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2940&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2940&auto=format&fit=crop",
    ],
    finalPrice: 2450,
    price: 2450,
    duration: "10 Days",
    rating: 4.85,
    reviews: 84,
    badge: "Adventure",
    category: "Wildlife",
  },
  {
    id: "3",
    title: "Kyoto Cherry Blossom",
    location: "Kyoto, Japan",
    description: "Walk the philosopher's path during Sakura season. Tea ceremonies, historic shrines, and culinary mastery.",
    thumbnail: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=3540&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=3540&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2940&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2940&auto=format&fit=crop",
    ],
    finalPrice: 1850,
    price: 1850,
    duration: "8 Days",
    rating: 4.95,
    reviews: 310,
    badge: "Trending",
    category: "Culture",
  },
  {
    id: "4",
    title: "Amalfi Coast Drive",
    location: "Positano, Italy",
    description: "Experience the dolce vita. Cliffside dining, lemon groves, and a classic convertible tour of the coast.",
    thumbnail: "https://images.unsplash.com/photo-1533414417583-f0eb64df94e9?q=80&w=3540&auto=format&fit=crop",
    price: 2100,
    duration: "6 Days",
    rating: 4.88,
    reviews: 190,
    badge: "Luxury",
    category: "Romance",
  },
];

// --- Utilities --- //
const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);

// --- Components --- //

const Badge = ({ text }: { text: string }) => {
  let colors = "bg-gray-900 text-white";
  if (text === "Best Seller") colors = "bg-amber-400 text-amber-950";
  if (text === "Trending") colors = "bg-rose-500 text-white";
  if (text === "Luxury") colors = "bg-purple-600 text-white";
  if (text === "Adventure") colors = "bg-emerald-600 text-white";

  return (
    <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm ${colors}`}>
      {text}
    </span>
  );
};

function ListingCard({ listing }: { listing: typeof defaultListings[0] }) {
  const [isLiked, setIsLiked] = useState(false);

  return (
    <motion.div
      className="group relative bg-white rounded-3xl overflow-hidden border border-gray-100 flex flex-col h-full"
      whileHover={{ y: -8 }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* --- Image Section --- */}
      <div className="relative h-72 w-full overflow-hidden">
        {/* Image with Zoom Effect */}
        <div className="absolute inset-0 transform transition-transform duration-700 ease-out group-hover:scale-110">
          <Image decoding="async"
            src={listing.images?.[0] || listing.thumbnail || "https://images.unsplash.com/photo-1533414417583-f0eb64df94e9?q=80&w=3540&auto=format&fit=crop"}
            alt={listing.title || listing.name || "Thumbnail"}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        
        {/* Gradient Overlay for Text Contrast if needed, currently using clean style */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Top Badges */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
          <Badge text={listing.badge} />
          
          <button
            onClick={(e) => {
              e.preventDefault();
              setIsLiked(!isLiked);
            }}
            className="p-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 hover:bg-white transition-colors duration-300 group/heart"
          >
            {isLiked ? (
              <HeartSolid className="h-5 w-5 text-rose-500" />
            ) : (
              <HeartOutline className="h-5 w-5 text-white group-hover/heart:text-rose-500 transition-colors" />
            )}
          </button>
        </div>

        {/* Price Tag - Floating Glass */}
        <div className="absolute bottom-4 right-4">
            <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-2xl shadow-lg text-gray-900 font-bold text-sm">
                {formatCurrency(listing.finalPrice || listing.price)}
                <span className="text-gray-500 font-normal text-xs ml-1">/ pp</span>
            </div>
        </div>
      </div>

      {/* --- Content Section --- */}
      <div className="p-6 flex flex-col flex-grow">
        {/* Location & Rating Row */}
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center text-xs font-semibold text-indigo-600 uppercase tracking-wide">
            <MapPinIcon className="h-3 w-3 mr-1" />
            {listing.location}
          </div>
          <div className="flex items-center gap-1">
            <StarIcon className="h-4 w-4 text-amber-400" />
            <span className="text-sm font-bold text-gray-800">{listing.rating}</span>
            <span className="text-xs text-gray-400">({listing.reviews})</span>
          </div>
        </div>

        {/* Title */}
        <Link href={`/trips/${listing.id}`} className="block group-hover:text-indigo-600 transition-colors duration-300">
          <h3 className="text-2xl font-serif font-bold text-gray-900 mb-2 leading-tight">
            {listing.title || listing.name}
          </h3>
        </Link>

        {/* Description */}
        <p className="text-gray-500 text-sm line-clamp-2 mb-6 leading-relaxed">
          {listing.description}
        </p>

        {/* Footer (Duration & Button) */}
        <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center text-gray-500 text-sm font-medium">
            <ClockIcon className="h-4 w-4 mr-1.5 text-gray-400" />
            {listing.duration}
          </div>

          <Link href={`/travel/listings/${listing.id}`} passHref>
            <span className="flex items-center text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
              View Trip
              <ArrowRightIcon className="h-4 w-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-300" />
            </span>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

// --- Main Section --- //
export default function ListingsSection({ listings, title, subtitle, name, description }: any) {
  // Use passed data or fallback to internal samples
  const activeListings = listings && listings.length > 0 ? listings : defaultListings;

  return (
    <section className="py-20 px-4 sm:px-6 bg-gray-50 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-50/50 to-transparent pointer-events-none" />
      <div className="absolute top-20 right-0 -mr-20 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob pointer-events-none" />
      <div className="absolute top-40 left-0 -ml-20 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000 pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.span 
             initial={{ opacity: 0, y: 10 }}
             whileInView={{ opacity: 1, y: 0 }}
             className="text-indigo-600 font-bold tracking-wider uppercase text-sm mb-2 block"
          >
            Curated Experiences
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6 leading-[1.1]"
          >
            {title || name || "Find Your Next Great Adventure"}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-600 leading-relaxed"
          >
            {subtitle || description || "Explore hand-picked itineraries designed to immerse you in local culture, breathtaking nature, and unforgettable moments."}
          </motion.p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {activeListings.map((listing: any) => (
            <TravelCard key={listing.id} listing={listing} />
          ))}
        </div>

        {/* Bottom Action */}
        <div className="mt-16 text-center">
            <Link
                href="/travel/listings"
                className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-gray-900 hover:bg-gray-800 transition-all hover:scale-105 active:scale-95"
            >
                View All Destinations
            </Link>
        </div>
      </div>
    </section>
  );
}