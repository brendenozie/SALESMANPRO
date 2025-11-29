"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, animate } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  MapPinIcon,
  ArrowRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SparklesIcon,
} from "@heroicons/react/24/solid";
import { useStoreContext } from "@/contexts/StoreContext";
// import { IDestination } from "@/types/typings"; // Uncomment if you have this type file

// --- Types (Inline for portability, replace with your global types) ---
interface IDestination {
  id: string;
  name: string;
  country?: string;
  images?: string[];
  // bannerImage?: string;
  description?: string;
}

// --- Utilities ---
const customLoader = ({ src, width, quality }: any) =>
  `${src}?w=${width}&q=${quality || 75}`;

const blurSvg = `data:image/svg+xml;base64,${btoa(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <rect width="100" height="100" fill="#e0e0e0" />
    <circle cx="50" cy="50" r="20" fill="#bdbdbd" />
  </svg>
`)}`;

// --- Fallback Data ---
const fallbackDestinations = [
  {
    id: "loc1",
    name: "Kyoto",
    country: "Japan",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2940&auto=format&fit=crop",
    count: 124,
  },
  {
    id: "loc2",
    name: "Santorini",
    country: "Greece",
    image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=2940&auto=format&fit=crop",
    count: 85,
  },
  {
    id: "loc3",
    name: "Banff",
    country: "Canada",
    image: "https://images.unsplash.com/photo-1506953823976-5271ccbfb894?q=80&w=2940&auto=format&fit=crop",
    count: 62,
  },
  {
    id: "loc4",
    name: "Amalfi",
    country: "Italy",
    image: "https://images.unsplash.com/photo-1533414417583-f0eb64df94e9?q=80&w=2940&auto=format&fit=crop",
    count: 94,
  },
  {
    id: "loc5",
    name: "Cape Town",
    country: "South Africa",
    image: "https://images.unsplash.com/photo-1580060839134-75a5edca2e27?q=80&w=2940&auto=format&fit=crop",
    count: 45,
  },
];

// --- Components ---

const DestinationCard = ({ data }: { data: any }) => {
  return (
    <Link href={`/travel/listings?location=${data.id}`} className="block h-full">
      <motion.div
        className="group relative h-[450px] w-[320px] rounded-[2rem] overflow-hidden cursor-pointer shadow-md hover:shadow-2xl transition-shadow duration-500"
        whileHover={{ y: -10 }}
      >
        {/* Image Layer */}
        <div className="absolute inset-0 bg-gray-200">
          <Image
            src={data.image}
            alt={data.name}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            loader={customLoader}
            placeholder="blur"
            blurDataURL={blurSvg}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw"
          />
        </div>

        {/* Gradient Layer (Cinematic fade) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />

        {/* Text Content */}
        <div className="absolute bottom-0 left-0 w-full p-8 flex flex-col justify-end h-full translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-out">
          
          {/* Country Badge */}
          <div className="overflow-hidden mb-2">
             <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-xs font-bold tracking-widest uppercase text-white">
                {data.country}
             </span>
          </div>

          {/* Title */}
          <h3 className="text-4xl font-serif font-bold text-white mb-1 drop-shadow-lg">
            {data.name}
          </h3>

          {/* Sub-info & CTA - Hidden initially, slides up on hover */}
          <div className="h-0 opacity-0 group-hover:h-auto group-hover:opacity-100 transition-all duration-500 overflow-hidden">
             <div className="pt-4 flex items-center justify-between border-t border-white/30 mt-4">
                <span className="text-sm text-gray-200 font-medium flex items-center gap-2">
                    <SparklesIcon className="h-4 w-4 text-yellow-400" />
                    {data.count || Math.floor(Math.random() * 100) + 20} Experiences
                </span>
                <span className="h-10 w-10 rounded-full bg-white text-gray-900 flex items-center justify-center transform group-hover:rotate-[-45deg] transition-transform duration-500">
                    <ArrowRightIcon className="h-5 w-5" />
                </span>
             </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

interface TrendingLocationsProps {
  destinations?: IDestination[] | undefined | null;
  name?: string;
}

export default function TrendingLocations({ destinations = [], name }: TrendingLocationsProps) {
  // const { storeFormData } = useStoreContext();
  // const { destinations = [] } = storeFormData || {};
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Normalize Data
  const activeDestinations = destinations &&  destinations?.length > 0
      ? destinations?.map((d: any) => ({
          id: d.id,
          name: d.name,
          country: d.country || "Global",
          image:  (d.images && d.images[0]) || fallbackDestinations[0].image, //d.bannerImage ||
          count: Math.floor(Math.random() * 150) + 30, // Mock data if real count doesn't exist
        }))
      : fallbackDestinations;

  // Manual Scroll Logic
  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const { current } = scrollContainerRef;
      const scrollAmount = 340; // Card width + gap
      const targetScroll =
        direction === "left"
          ? current.scrollLeft - scrollAmount
          : current.scrollLeft + scrollAmount;

      current.scrollTo({
        left: targetScroll,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      
      {/* Subtle Background Pattern */}
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-indigo-50 rounded-full blur-3xl opacity-50 pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-orange-50 rounded-full blur-3xl opacity-50 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* --- Header Section --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex items-center gap-2 mb-3"
            >
                <MapPinIcon className="h-5 w-5 text-indigo-600" />
                <span className="text-sm font-bold text-indigo-600 uppercase tracking-wider">
                    {name} Awaits
                </span>
            </motion.div>
            <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-5xl font-serif font-bold text-gray-900 leading-tight"
            >
              Trending Destinations
            </motion.h2>
          </div>

          {/* Custom Navigation Arrows */}
          <motion.div 
             initial={{ opacity: 0, x: 20 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
             className="flex gap-3"
          >
            <button
              onClick={() => scroll("left")}
              className="group p-4 rounded-full border border-gray-200 hover:border-gray-900 hover:bg-gray-900 transition-all duration-300"
              aria-label="Scroll Left"
            >
              <ChevronLeftIcon className="h-6 w-6 text-gray-900 group-hover:text-white transition-colors" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="group p-4 rounded-full border border-gray-200 hover:border-gray-900 hover:bg-gray-900 transition-all duration-300"
              aria-label="Scroll Right"
            >
              <ChevronRightIcon className="h-6 w-6 text-gray-900 group-hover:text-white transition-colors" />
            </button>
          </motion.div>
        </div>

        {/* --- Draggable Carousel --- */}
        <motion.div
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto pb-12 snap-x snap-mandatory hide-scrollbar cursor-grab active:cursor-grabbing"
            whileTap={{ cursor: "grabbing" }}
        >
            {activeDestinations.map((dest: any, index: number) => (
                <motion.div
                    key={dest.id}
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "0px -50px 0px 0px" }} // Animate as they enter view
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="snap-center flex-shrink-0"
                >
                    <DestinationCard data={dest} />
                </motion.div>
            ))}
            
            {/* "See All" Card at the end */}
            <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="snap-center flex-shrink-0 h-[450px] w-[200px] flex items-center justify-center"
            >
                <Link href="/travel/listings" className="group flex flex-col items-center gap-4 text-gray-400 hover:text-indigo-600 transition-colors">
                    <div className="h-16 w-16 rounded-full border-2 border-dashed border-gray-300 group-hover:border-indigo-600 flex items-center justify-center transition-colors">
                        <ArrowRightIcon className="h-6 w-6" />
                    </div>
                    <span className="font-bold text-sm uppercase tracking-wider">View All</span>
                </Link>
            </motion.div>
        </motion.div>

      </div>

      {/* Hide Scrollbar Utility */}
      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}