"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Import Heroicons
import {
  MagnifyingGlassIcon,
  CalendarDaysIcon,
  ClockIcon,
  ChevronDownIcon, // Added for dropdown visual cue
} from "@heroicons/react/24/outline"; // Changed to outline for a lighter feel
import { MarketListingForm } from "@/types/typings";

// We'll assume these types and contexts exist for a complete example
// NOTE: Make sure to include the type definition for MarketListingForm
// and the useStoreContext hook in your project for this to work.
// import { useStoreContext } from "@/contexts/StoreContext";
// import { MarketListingForm } from "@/types/typings";

// --- Sample Data & Types (Added for self-contained, runnable example) ---
// Define a placeholder type for the Marketplace Listing
// type MarketListingForm = {
//   id: string;
//   name: string;
//   isAvailable: boolean;
//   finalPrice: number;
//   images: string[];
// };

// Placeholder context hook
const useStoreContext = () => ({
  storeFormData: null, // Assume no data for this example
});
// ------------------------------------------------------------------------


const loader = ({ src, width, quality }: any) =>
  `${src}?w=${width}&q=${quality || 75}`;

// Dynamic Hero Text
const heroText = "Effortlessly book your next service with vetted local pros.";

interface HeroProps {
    name: string | undefined | null;
    description: string | undefined | null;
    bannerUrl: string | undefined | null;
    marketplaceListings: MarketListingForm[] | undefined | null;
}

export default function Hero({name, description, bannerUrl, marketplaceListings }: HeroProps) {


  // 🌟 ENHANCEMENT: Provided sample data with a more cinematic banner and diverse service images.
  const defaultFormData = {
    name: "The Service Hub", // A slightly punchier name
    description: "Connect with verified professionals and book services with ease. From personal care to home repair, we've got you covered.",
    // A high-impact, moodier image for better contrast with the booking bar
    bannerUrl: "https://images.unsplash.com/photo-1517436336340-27a3c3c78897?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    marketplaceListings: [
      { id: "1", name: "Hair Stylist", isAvailable: true, finalPrice: "75", images: ["https://images.unsplash.com/photo-1596461404986-e88e404b4c73?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"] },
      { id: "2", name: "Electrician", isAvailable: true, finalPrice: "150", images: ["https://images.unsplash.com/photo-1581094042850-25e40733d31b?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"] },
      { id: "3", name: "Plumber", isAvailable: true, finalPrice: "120", images: ["https://images.unsplash.com/photo-1587569145888-0f1e8e8f8c7e?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"] },
      { id: "4", name: "Lawn Care Service", isAvailable: true, finalPrice: "80", images: ["https://images.unsplash.com/photo-1591871638656-e910609315d1?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"] },
      { id: "5", name: "Massage Therapist", isAvailable: true, finalPrice: "100", images: ["https://images.unsplash.com/photo-1570172619660-f192b950886f?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"] },
    ],
  };

  name = name || defaultFormData.name;
  description = description || defaultFormData.description;
  bannerUrl = bannerUrl || defaultFormData.bannerUrl;
  let marketplaceListingsToShow  = marketplaceListings || defaultFormData.marketplaceListings;

  const [searchTerm, setSearchTerm] = useState("");
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());

  const inputRef = useRef<HTMLInputElement | null>(null);
  const dropdownRef = useRef<HTMLUListElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Filter listings based on search term
  const filteredListings = useMemo(() => {
    return (marketplaceListingsToShow ?? [])
      .filter((item) => item.name?.toLowerCase().includes(searchTerm.toLowerCase()))
      .map((item) => ({
        id: item.id,
        name: item.name,
        imageUrl: item.images?.[0] ?? null,
      }))
      .slice(0, 5); // Limit to 5 for a clean dropdown
  }, [searchTerm, marketplaceListingsToShow]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setActiveIndex(-1); // Close dropdown
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = () => {
    // 🌟 ENHANCEMENT: Use a more prominent visual feedback than a simple alert in a real app
    alert(
      `Searching for "${searchTerm || 'all services'}" on ${date.toLocaleDateString()} at ${time.toLocaleTimeString()}`
    );
  };

  return (
    // 🌟 VISUAL: Use min-h-screen to ensure the hero section is full-height on all screens
    <section className="relative min-h-screen w-full flex flex-col items-center justify-end text-white overflow-hidden pb-16 md:pb-24">
      
      {/* Background Image: High-impact full-screen background with a dramatic parallax feel */}
      {bannerUrl && (
        <Image
          src={bannerUrl}
          loader={loader}
          alt="Professional services banner"
          fill
          className="object-cover object-center transform scale-105 motion-safe:animate-[zoom-in-slow_25s_ease-out_forwards]"
          style={{ objectFit: 'cover' }}
          priority
        />
      )}
      {/* 🌟 VISUAL: Dark Gradient Overlay for optimal contrast and depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>

      {/* Main Hero Content (Title/Subtitle) */}
      {/* Adjusted positioning to be above the booking bar */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto mb-16 md:mb-24 pt-20 md:pt-0">
        <motion.h1
          className="text-5xl md:text-8xl font-black tracking-tight text-shadow-lg" // Black font weight for impact
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {name}
        </motion.h1>
        <motion.p
          className="mt-4 text-xl md:text-3xl font-light italic text-teal-300 drop-shadow-md" // Light, italic, and a contrasting color
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        >
          {heroText}
        </motion.p>
      </div>

      {/* Booking Form Bar: Sleek Glassmorphism Design with stronger focus effect */}
      <motion.div
        className="relative z-20 w-full px-4 md:px-8 max-w-7xl"
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
      >
        <div className="flex flex-col md:flex-row items-center bg-white/85 backdrop-blur-xl rounded-3xl p-4 md:p-5 shadow-3xl border-2 border-white/50 space-y-4 md:space-y-0 md:space-x-5">
          
          {/* 1. Search Input with Autocomplete */}
          <div className="relative flex-grow w-full md:w-auto min-w-[300px]">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-teal-600" />
            <input
              id="search"
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setActiveIndex(0);
              }}
              onFocus={() => {
                if(filteredListings.length > 0) setActiveIndex(0);
              }}
              onKeyDown={(e) => {
                if (filteredListings.length === 0) return;
                if (e.key === "ArrowDown") {
                  setActiveIndex((prev) => (prev + 1) % filteredListings.length);
                  e.preventDefault();
                } else if (e.key === "ArrowUp") {
                  setActiveIndex((prev) => (prev - 1 + filteredListings.length) % filteredListings.length);
                  e.preventDefault();
                } else if (e.key === "Enter") {
                  if (filteredListings[activeIndex]) {
                    setSearchTerm(filteredListings[activeIndex].name);
                    setActiveIndex(-1);
                    handleSearch(); // Auto-search on selection
                  }
                }
              }}
              // 🌟 STYLE: Increased padding and font size, stronger focus ring
              className="w-full pl-14 pr-6 py-4 text-gray-900 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-4 focus:ring-teal-500/50 focus:border-teal-500 transition-all duration-300 placeholder-gray-500 font-medium text-lg shadow-sm"
              placeholder="What service do you need?"
            />

            {/* Autocomplete Dropdown */}
            {searchTerm && filteredListings.length > 0 && activeIndex !== -1 && (
              <ul
                ref={dropdownRef}
                className="absolute z-30 w-full mt-3 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden max-h-60 overflow-y-auto transform transition-opacity duration-300 ease-out"
                style={{ top: '100%' }} // Position dropdown below the input
              >
                {filteredListings.map((item, index) => (
                  <motion.li
                    key={item.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    onClick={() => {
                      setSearchTerm(item.name);
                      setActiveIndex(-1);
                      inputRef.current?.focus(); // Keep focus for potential Enter press or immediate search
                    }}
                    className={`flex items-center gap-4 p-3 cursor-pointer transition-all duration-150 border-b border-gray-100 last:border-b-0 ${
                      index === activeIndex
                        ? "bg-teal-500/15 text-teal-800"
                        : "hover:bg-teal-50"
                    }`}
                  >
                    {item.imageUrl && (
                      <Image
                        src={item.imageUrl}
                        loader={loader}
                        alt={item.name}
                        width={40}
                        height={40}
                        className="rounded-full object-cover ring-2 ring-teal-500/30"
                      />
                    )}
                    <span className="text-gray-800 font-semibold">{item.name}</span>
                  </motion.li>
                ))}
              </ul>
            )}
          </div>

          {/* 2. Date Picker (Mobile-friendly width) */}
          <div className="relative w-full md:w-52 flex-shrink-0">
            <CalendarDaysIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-teal-600 pointer-events-none" />
            <DatePicker
              selected={date}
              onChange={(d) => d && setDate(d)}
              dateFormat="EEE, MMM d" // More compact and informative format
              placeholderText="Select Date"
              // 🌟 STYLE: Consistent styling with the search input
              className="w-full pl-14 pr-4 py-4 text-gray-900 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-4 focus:ring-teal-500/50 focus:border-teal-500 transition-all duration-300 cursor-pointer font-medium text-lg shadow-sm"
              popperPlacement="bottom-start" // Ensure better mobile placement
            />
          </div>

          {/* 3. Time Picker (Mobile-friendly width) */}
          <div className="relative w-full md:w-40 flex-shrink-0">
            <ClockIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-teal-600 pointer-events-none" />
            <DatePicker
              selected={time}
              onChange={(t) => t && setTime(t)}
              showTimeSelect
              showTimeSelectOnly
              timeIntervals={30}
              dateFormat="h:mm aa"
              placeholderText="Select Time"
              // 🌟 STYLE: Consistent styling
              className="w-full pl-14 pr-4 py-4 text-gray-900 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-4 focus:ring-teal-500/50 focus:border-teal-500 transition-all duration-300 cursor-pointer font-medium text-lg shadow-sm"
              popperPlacement="bottom-start" // Ensure better mobile placement
            />
          </div>

          {/* 4. CTA Button (Primary Action) */}
          <motion.button
            // 🌟 ANIMATION: More pronounced, intentional animation
            whileHover={{ scale: 1.05, boxShadow: "0 0 0 10px rgba(20, 184, 166, 0.2)", transition: { duration: 0.3 } }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSearch}
            // 🌟 STYLE: Vibrant color, large button for primary action
            className="w-full md:w-auto flex-shrink-0 bg-teal-600 hover:bg-teal-700 text-white font-extrabold py-4 px-10 rounded-xl text-xl uppercase tracking-wider shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
          >
            <MagnifyingGlassIcon className="h-6 w-6" />
            Search
          </motion.button>
        </div>
        {/* 🌟 VISUAL: Subtle instruction text for better UX */}
        <p className="mt-4 text-center text-sm text-gray-200 drop-shadow-md">
          <span className="font-semibold">Tip:</span> Start typing to see available services. Select your date and time to narrow down local pros!
        </p>
      </motion.div>
    </section>
  );
}