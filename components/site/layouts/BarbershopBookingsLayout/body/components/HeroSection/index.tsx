"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
// Using Heroicons as requested
import {
  MagnifyingGlassIcon,
  CalendarDaysIcon,
  ClockIcon,
  MapPinIcon,
  ChevronRightIcon,
  StarIcon,
  SparklesIcon
} from "@heroicons/react/24/solid"; 
import { useStoreContext } from "@/contexts/StoreContext";
import { MarketListingForm, HeroSlide } from "@/types/typings";
import { useRouter } from "next/navigation";

const loader = ({ src, width, quality }: any) => `${src}?w=${width}&q=${quality || 75}`;

export default function Hero({ name, description, bannerUrl, heroSlides, marketplaceListings }: any) {
  const { storeFormData } = useStoreContext();
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#D4AF37'; // Gold default
  const [searchTerm, setSearchTerm] = useState("");
  const [date, setDate] = useState(new Date());
  const [timeSlot, setTimeSlot] = useState<string>("");
  const [isFocused, setIsFocused] = useState(false);
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const router = useRouter();

  // --- Animation Variants ---
  const floatingVariant = {
    animate: {
      y: [0, -10, 0],
      transition: { duration: 5, repeat: Infinity, ease: "easeInOut" }
    }
  };

  return (
    <section className="relative h-[100vh] w-full flex flex-col items-center justify-center overflow-hidden bg-[#0a0a0a]">
      
      {/* 1. BACKGROUND VISUALS */}
      <div className="absolute inset-0 z-0">
        <Image
          src={heroSlides?.[0]?.imageUrl || bannerUrl || "/barber-bg.jpg"}
          loader={loader}
          alt="Luxury Barber"
          fill
          priority
          className="object-cover object-center opacity-60 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/20 to-[#0a0a0a]" />
      </div>

      {/* 2. FLOATING UI ELEMENTS (The "Pro" Touch) */}
      <div className="absolute inset-0 z-10 hidden lg:block pointer-events-none">
        {/* Review Card */}
        <motion.div 
          variants={floatingVariant}
          animate="animate"
          className="absolute bottom-[20%] left-[10%] p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl w-64 shadow-2xl"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="h-8 w-8 rounded-full bg-gray-400 border border-white/20" />
            <div>
              <p className="text-white text-xs font-bold">John Doe</p>
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => <StarIcon key={i} className="h-3 w-3 text-yellow-500" />)}
              </div>
            </div>
          </div>
          <p className="text-gray-300 text-[11px] leading-relaxed">
            "The attention to detail here is unmatched. Finally found a barber who knows their business."
          </p>
        </motion.div>

        {/* Price/Bundle Badge */}
        <motion.div 
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="absolute top-[25%] right-[12%] flex items-center gap-3 bg-[#C5A267] p-1 pr-4 rounded-full shadow-xl"
        >
          <div className="bg-black/20 p-2 rounded-full">
            <SparklesIcon className="h-5 w-5 text-white" />
          </div>
          <div className="text-black">
            <p className="text-[10px] font-bold uppercase tracking-tighter leading-none">Monthly Care</p>
            <p className="text-lg font-black">$95</p>
          </div>
        </motion.div>
      </div>

      {/* 3. MAIN CONTENT */}
      <div className="relative z-20 w-full max-w-6xl px-6 flex flex-col items-center">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-8xl font-light text-white leading-tight">
            Getting you <span className="font-serif italic text-[#C5A267]">handsome</span> <br /> 
            <span className="font-bold tracking-tighter">is our goal</span>
          </h1>
          <p className="mt-6 text-gray-400 text-lg md:text-xl max-w-xl mx-auto font-light leading-relaxed">
            Experience the perfect cut tailored to your dreams at the barbershop that defines modern style.
          </p>
        </motion.div>

        {/* 4. THE REFINED BOOKING BAR */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full max-w-4xl"
        >
          <div className={`
            grid grid-cols-1 md:grid-cols-12 items-center bg-white rounded-3xl md:rounded-full p-2 shadow-2xl transition-all duration-500
            ${isFocused ? 'ring-8 ring-white/10' : ''}
          `}>
            
            {/* Service Search */}
            <div className="md:col-span-5 flex items-center px-6 py-3 border-b md:border-b-0 md:border-r border-gray-100">
              <MagnifyingGlassIcon className="h-5 w-5 text-[#C5A267] mr-3" />
              <div className="flex flex-col flex-grow">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Service</span>
                <input 
                  type="text"
                  placeholder="Haircut, Beard Trim..."
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  className="bg-transparent border-none p-0 text-gray-900 focus:ring-0 font-semibold placeholder:text-gray-300"
                />
              </div>
            </div>

            {/* Date Selection */}
            <div className="md:col-span-3 flex items-center px-6 py-3 border-b md:border-b-0 md:border-r border-gray-100">
              <CalendarDaysIcon className="h-5 w-5 text-[#C5A267] mr-3" />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">When</span>
                <DatePicker
                  selected={date}
                  onChange={(d) => d && setDate(d)}
                  className="bg-transparent border-none p-0 text-gray-900 focus:ring-0 font-semibold w-full cursor-pointer"
                  dateFormat="MMM dd, yyyy"
                />
              </div>
            </div>

            {/* Action Button */}
            <div className="md:col-span-4 p-1">
              <button 
                className="w-full h-14 md:h-16 rounded-2xl md:rounded-full bg-black text-[#C5A267] font-bold uppercase tracking-widest text-sm hover:bg-[#111] transition-all flex items-center justify-center gap-3 active:scale-95"
              >
                Book Appointment
                <ChevronRightIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Quick Links */}
        <div className="mt-8 flex gap-6 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
          <span className="hover:text-[#C5A267] cursor-pointer transition-colors">Our Services</span>
          <span className="text-white/10">|</span>
          <span className="hover:text-[#C5A267] cursor-pointer transition-colors">View Gallery</span>
          <span className="text-white/10">|</span>
          <span className="hover:text-[#C5A267] cursor-pointer transition-colors">Contact Us</span>
        </div>

      </div>
    </section>
  );
}