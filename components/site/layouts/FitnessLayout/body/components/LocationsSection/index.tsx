"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRightIcon } from "@heroicons/react/24/solid";
import { MapPinIcon, StarIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { useStoreContext } from "@/contexts/StoreContext";
import { ICompanyLocation } from "@/types/typings";
import Image from "next/image";

// Framer Motion Animation Presets
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  },
};

interface LocationItemProps {
  id: string;
  name: string;
  image: string;
  programs: number;
  rating: number;
  description: string;
  index: number;
  primaryColor: string;
}

const LocationItem = ({ id, name, image, programs, rating, description, index, primaryColor }: LocationItemProps) => (
  <motion.a
    href={`/locations/${id}`}
    variants={cardVariants}
    whileHover={{ y: -6 }}
    className="group relative flex-shrink-0 w-[82vw] sm:w-[400px] md:w-[440px] h-[560px] sm:h-[600px] rounded-[2.5rem] overflow-hidden bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/50 shadow-sm hover:shadow-2xl snap-center transition-all duration-500"
  >
    {/* Immersive Cover Image */}
    <div className="absolute inset-0 z-0">
      <Image
        src={image}
        alt={name}
        loader={({ src }) => src}
        fill
        className="object-cover scale-100 group-hover:scale-105 transition-transform duration-1000 ease-out"
      />
      {/* Smart Light/Dark Dual-Tone Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 dark:via-neutral-950/20 to-neutral-900/20 opacity-90 dark:opacity-85 group-hover:opacity-80 transition-opacity duration-500" />
    </div>
    
    {/* Top Header Card Analytics */}
    <div className="absolute top-6 left-6 right-6 sm:top-8 sm:left-8 sm:right-8 z-10 flex justify-between items-start">
      <div className="flex flex-col">
        <span className="font-black text-3xl sm:text-4xl italic tracking-tighter leading-none" style={{ color: primaryColor }}>
          0{index + 1}
        </span>
        <span className="text-[9px] font-bold text-white/50 uppercase tracking-[0.25em] mt-1.5">
          ID: {id.slice(-4)}
        </span>
      </div>
      
      <div 
        className="p-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20 transition-all duration-300"
        style={{ '--hover-bg': primaryColor } as React.CSSProperties}
      >
        <ArrowUpRightIcon className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
      </div>
    </div>

    {/* Bottom Content Metadata Block */}
    <div className="absolute bottom-6 left-6 right-6 sm:bottom-8 sm:left-8 sm:right-8 z-10">
      <div className="space-y-4">
        {/* Chips Row */}
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex items-center px-3 py-1 bg-black/40 backdrop-blur-md border border-white/10 rounded-full">
            <StarIcon className="w-3 h-3 text-amber-400 mr-1 fill-amber-400" />
            <span className="text-[10px] font-bold text-white">{rating.toFixed(1)}</span>
          </div>
          <div className="px-3 py-1 bg-black/40 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-bold text-white uppercase tracking-wider">
            {programs} Programs
          </div>
        </div>

        {/* Dynamic Multi-line Title Layout */}
        <h3 className="text-3xl sm:text-4xl font-black text-white uppercase italic tracking-tighter leading-[0.9]">
          {name.split(" ").map((word: string, i: number) => (
            <span key={i} className="block">{word}</span>
          ))}
        </h3>
        
        <p className="text-neutral-300 text-xs sm:text-sm font-medium line-clamp-2 max-w-[90%] tracking-wide">
          {description}
        </p>

        {/* Dynamic Studio Action Footnote */}
        <div className="flex items-center space-x-2 pt-2 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <MapPinIcon className="w-4 h-4" style={{ color: primaryColor }} />
          <span className="text-[10px] font-bold uppercase tracking-widest text-white">View Studio Details</span>
        </div>
      </div>
    </div>
  </motion.a>
);

const dummyLocations = [
  {
    id: "loc1",
    name: "Urban Core Fitness",
    image: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=2670&auto=format&fit=crop",
    programs: 45,
    rating: 4.8,
    description: "Cutting-edge equipment and dynamic group classes in the city center.",
  },
  {
    id: "loc2",
    name: "Zenith Yoga Wellness",
    image: "https://images.unsplash.com/photo-1599447421416-3414500d18a5?q=80&w=2670&auto=format&fit=crop",
    programs: 30,
    rating: 4.9,
    description: "A serene sanctuary for mind, body, and soul. Perfect for mindfulness.",
  },
  {
    id: "loc3",
    name: "The Boxing Den",
    image: "https://images.unsplash.com/photo-1591117207239-7ad59a0a79b9?q=80&w=2670&auto=format&fit=crop",
    programs: 20,
    rating: 4.7,
    description: "Unleash your inner fighter with high-energy boxing and HIIT sessions.",
  },
];

export default function LocationsSection() {
  const { storeFormData } = useStoreContext();
  const primaryColor = storeFormData?.themeSettings?.primaryColor || "#f97316";
  const { CompanyLocation = [] } = storeFormData || {};
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const normalizedLocations = CompanyLocation?.length > 0
    ? CompanyLocation.map((cl: ICompanyLocation, i: number) => ({
        id: cl.id,
        name: cl.displayName || cl.location?.name || "Unnamed Location",
        image: cl.location?.imageUrl || dummyLocations[i % 3].image,
        programs: Math.floor(Math.random() * 35) + 15,
        rating: 4.6 + Math.random() * 0.4,
        description: cl.addressLine1Override || cl.location?.description || dummyLocations[i % 3].description,
      }))
    : dummyLocations;

  const handleScroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      const offset = direction === "left" ? -clientWidth * 0.6 : clientWidth * 0.6;
      scrollContainerRef.current.scrollTo({ left: scrollLeft + offset, behavior: "smooth" });
    }
  };

  return (
    <section className="py-24 sm:py-32 bg-neutral-50 dark:bg-neutral-950 transition-colors duration-500 overflow-hidden border-t border-neutral-200/60 dark:border-neutral-900 relative">
      
      {/* Decorative Structural Glow Orbs */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-[0.04] dark:opacity-[0.03] blur-[150px] rounded-full pointer-events-none" 
        style={{ backgroundColor: primaryColor }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="font-black tracking-[0.3em] uppercase text-xs"
              style={{ color: primaryColor }}
            >
              Elite Footprint
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-5xl sm:text-6xl lg:text-8xl font-black text-neutral-900 dark:text-white italic tracking-tighter uppercase leading-[0.85] transition-colors"
            >
              Our Global <br /> <span className="text-neutral-300 dark:text-neutral-800 transition-colors">Studios</span>
            </motion.h2>
          </div>
          
          <div className="hidden md:block h-[1px] flex-1 bg-neutral-200 dark:bg-neutral-800 mx-10 mb-4 transition-colors" />

          <div className="flex flex-col sm:flex-row sm:items-center gap-6 md:gap-0">
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="max-w-[280px] text-neutral-500 dark:text-neutral-400 font-semibold text-xs sm:text-sm leading-relaxed uppercase tracking-tight transition-colors"
            >
              Access our signature facilities across the globe with a single, synchronized membership. 
            </motion.p>
            
            {/* Desktop Carousel Navigation Utilities */}
            <div className="flex space-x-2 sm:ml-6 md:ml-8">
              <button 
                onClick={() => handleScroll("left")}
                className="p-3 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 shadow-sm transition-all"
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </button>
              <button 
                onClick={() => handleScroll("right")}
                className="p-3 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 shadow-sm transition-all"
              >
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Horizontal Interactive Touch Carousel */}
      <motion.div
        ref={scrollContainerRef}
        className="flex space-x-6 sm:space-x-8 px-4 sm:px-6 md:px-[calc((100vw-1200px)/2)] lg:px-[calc((100vw-1280px)/2)] overflow-x-auto scrollbar-none snap-x snap-mandatory"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        {normalizedLocations.map((loc, index) => (
          <LocationItem 
            key={loc.id} 
            {...loc} 
            index={index} 
            primaryColor={primaryColor} 
          />
        ))}
        {/* Invisible Carousel Terminal Anchor */}
        <div className="flex-shrink-0 w-4 sm:w-8" />
      </motion.div>

      {/* Bottom Interface Utility Prompt */}
      <div className="mt-16 flex justify-center space-x-4 items-center px-4">
        <div className="h-[1px] w-12 sm:w-20 bg-neutral-200 dark:bg-neutral-800 transition-colors" />
        <span className="text-[9px] font-bold text-neutral-400 dark:text-neutral-600 uppercase tracking-[0.4em] text-center">
          Swipe or Click Arrow to Navigate
        </span>
        <div className="h-[1px] w-12 sm:w-20 bg-neutral-200 dark:bg-neutral-800 transition-colors" style={{ backgroundColor: primaryColor }} />
      </div>

      {/* Tailored Custom Global Pseudo Injection Rules */}
      <style jsx global>{`
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-none {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .group:hover var(--hover-bg) {
          background-color: var(--hover-bg);
        }
      `}</style>
    </section>
  );
}