"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ILocation } from "@/types/typings";
import { 
  MapPinIcon, 
  ArrowRightIcon, 
  BuildingOffice2Icon,
  GlobeAmericasIcon
} from "@heroicons/react/24/outline";

/* -------------------------------------------------------------------------- */
/* Constants & Commercial Mock Fallbacks */
/* -------------------------------------------------------------------------- */
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2670&auto=format&fit=crop";

const DUMMY_LOCATIONS = [
  {
    id: "nairobi",
    slug: "nairobi-central",
    name: "Nairobi Industrial Area",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2670&auto=format&fit=crop",
    vehicles: 1240,
    avgPrice: 4500000, 
    country: "Kenya",
    city: "Nairobi",
  },
  {
    id: "mombasa",
    slug: "mombasa-port",
    name: "Mombasa Port Depot",
    image: "https://images.unsplash.com/photo-1540155945626-66eacf57fcb9?q=80&w=2664&auto=format&fit=crop",
    vehicles: 950,
    avgPrice: 5200000,
    country: "Kenya",
    city: "Mombasa",
  },
  {
    id: "nakuru",
    slug: "nakuru-hub",
    name: "Nakuru Logistics Hub",
    vehicles: 800,
    avgPrice: 3800000,
    country: "Kenya",
    city: "Nakuru",
    // Tests fallback image when missing
  },
];

const customLoader = ({ src, width, quality }: any) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

/* -------------------------------------------------------------------------- */
/* Animations */
/* -------------------------------------------------------------------------- */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.96 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: "spring", stiffness: 110, damping: 18 }
  },
};

/* -------------------------------------------------------------------------- */
/* Subcomponents */
/* -------------------------------------------------------------------------- */

/**
 * Technical Industrial Grid Pattern
 */
const GridPattern = () => (
  <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
    <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="dot-grid-loc" width="32" height="32" patternUnits="userSpaceOnUse">
          <path d="M0 32L32 0H16L0 16M32 32V16L16 32" stroke="currentColor" strokeWidth="1" fill="none" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dot-grid-loc)" />
    </svg>
  </div>
);

/**
 * Commercial Location Card Component
 */
const LocationCard = ({ loc, slug }: { loc: any; slug: string }) => {
  const [imgError, setImgError] = useState(false);
  const imageUrl = !imgError && loc.image ? loc.image : FALLBACK_IMAGE;

  return (
    <motion.div 
      variants={cardVariants}
      className="group relative h-[400px] w-full rounded-3xl overflow-hidden cursor-pointer bg-slate-800/40 dark:bg-[#0F141C] border border-slate-700/60 dark:border-slate-800 hover:border-amber-500/50 shadow-xl transition-all duration-500"
    >
      <Link href={`/automotive/listings?location=${loc.id || loc.name}`} className="block h-full w-full">
        
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 bg-slate-900">
          <Image
            src={imageUrl}
            alt={loc.name}
            loader={customLoader}
            fill
            className="object-cover transition-transform duration-700 opacity-70 group-hover:opacity-85 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
          {/* Multi-stage gradient for dark theme contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
        </div>

        {/* Top Listing Count Badge */}
        <div className="absolute top-4 right-4 z-20">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-slate-200 text-xs font-bold shadow-md transition-transform duration-300 group-hover:-translate-y-0.5">
            <BuildingOffice2Icon className="w-3.5 h-3.5 text-amber-400" />
            <span>{loc.vehicles?.toLocaleString() || "N/A"} Units</span>
          </div>
        </div>

        {/* Card Content Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-6 z-20 flex flex-col justify-end h-full">
          <div className="transform transition-transform duration-500 translate-y-6 group-hover:translate-y-0">
            
            {/* Location Title */}
            <h3 className="text-2xl font-black uppercase tracking-tight text-white mb-1 group-hover:text-amber-400 transition-colors">
              {loc.name}
            </h3>

            {/* Region / City Info */}
            <div className="flex items-center text-slate-300 text-xs font-semibold mb-4">
              <MapPinIcon className="w-4 h-4 text-amber-500 mr-1 shrink-0" />
              <span>{loc.city ? `${loc.city}, ` : ''}{loc.country || "Region"}</span>
            </div>

            {/* Expanded Info Revealed on Hover */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75 space-y-3">
              <div className="h-px w-full bg-slate-700/60" />
              
              <div className="flex justify-between items-end pt-1">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold">Avg. Inventory Price</p>
                  <p className="text-lg font-black text-amber-400">
                    KES {loc.avgPrice ? (loc.avgPrice / 1000).toFixed(0) + 'k' : 'N/A'}
                  </p>
                </div>

                <div className="h-9 w-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-md group-hover:bg-amber-400 transition-colors">
                  <ArrowRightIcon className="w-4 h-4" />
                </div>
              </div>
            </div>

          </div>
        </div>

      </Link>
    </motion.div>
  );
};

/* -------------------------------------------------------------------------- */
/* Main Component */
/* -------------------------------------------------------------------------- */

interface TrendingLocationsProps {
  locations?: ILocation[];
  slug?: string;
}

export default function TrendingLocations({ locations = [], slug = "" }: TrendingLocationsProps) {
  const displayLocations = locations.length > 0 ? locations : DUMMY_LOCATIONS;

  return (
    <section className="relative py-20 md:py-28 bg-slate-900 dark:bg-[#080B10] text-white border-t border-slate-800 overflow-hidden">
      <GridPattern />
      
      {/* Ambient Radial Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <motion.div 
          className="text-center mb-16 max-w-3xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          <motion.div 
            variants={cardVariants}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-4"
          >
            <GlobeAmericasIcon className="w-4 h-4" />
            <span>Key Regional Hubs</span>
          </motion.div>

          <motion.h2 
            variants={cardVariants}
            className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white mb-4"
          >
            Explore By <span className="text-amber-500">Region</span>
          </motion.h2>

          <motion.p 
            variants={cardVariants}
            className="text-slate-400 text-sm md:text-base font-medium max-w-2xl mx-auto"
          >
            Find heavy-duty commercial equipment and transport fleets in active yards across primary commercial hubs.
          </motion.p>
        </motion.div>

        {/* Locations Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={containerVariants}
        >
          {displayLocations.map((loc: any) => (
            <LocationCard key={loc.id || loc.slug} loc={loc} slug={slug} />
          ))}
        </motion.div>

        {/* Section Footer Action */}
        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <Link href="/automotive/listings" passHref legacyBehavior>
            <a className="group inline-flex items-center justify-center px-8 py-4 text-xs font-extrabold uppercase tracking-wider rounded-xl text-slate-950 bg-amber-500 hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20 active:scale-95">
              <span>View All Regional Yards</span>
              <ArrowRightIcon className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </a>
          </Link>
        </motion.div>

      </div>
    </section>
  );
}