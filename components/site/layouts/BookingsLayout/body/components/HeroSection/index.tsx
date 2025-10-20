"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Import Heroicons for a cleaner look
import {
  StarIcon,
  MagnifyingGlassIcon,
  CalendarDaysIcon,
  ClockIcon,
} from "@heroicons/react/24/solid";

// We'll assume these types and contexts exist for a complete example
import { useStoreContext } from "@/contexts/StoreContext";
import { MarketListingForm } from "@/types/typings";

const loader = ({ src, width, quality }: any) =>
  `${src}?w=${width}&q=${quality || 75}`;

// Revised hero text for a more dynamic feel
const heroText = "Effortlessly book your next service with vetted local pros.";

export default function Hero() {
  const { storeFormData } = useStoreContext();

  // Provided sample data in case storeFormData is empty
  const defaultFormData = {
    name: "The Booking Hub",
    description:
      "Connect with verified professionals and book services with ease. From personal care to home repair, we've got you covered.",
    // Swapped to a slightly more vibrant, less busy background image
    bannerUrl:
      "https://images.unsplash.com/photo-1555548680-77a28e3a2b3b?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    marketplaceListings: [
      {
        id: "1",
        name: "Hair Stylist",
        isAvailable: true,
        finalPrice: 75,
        images: [
          "https://images.unsplash.com/photo-1596461404986-e88e404b4c73?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        ],
      },
      {
        id: "2",
        name: "Electrician",
        isAvailable: true,
        finalPrice: 150,
        images: [
          "https://images.unsplash.com/photo-1581094042850-25e40733d31b?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        ],
      },
      {
        id: "3",
        name: "Plumber",
        isAvailable: true,
        finalPrice: 120,
        images: [
          "https://images.unsplash.com/photo-1587569145888-0f1e8e8f8c7e?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        ],
      },
      {
        id: "4",
        name: "Lawn Care Service",
        isAvailable: true,
        finalPrice: 80,
        images: [
          "https://images.unsplash.com/photo-1555548680-77a28e3a2b3b?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        ],
      },
    ],
  };

  const {
    name = defaultFormData.name,
    description = defaultFormData.description,
    bannerUrl = defaultFormData.bannerUrl,
    marketplaceListings =
      (defaultFormData.marketplaceListings as unknown as MarketListingForm[]) ||
      [],
  }: {
    name: string;
    description: string;
    bannerUrl: string;
    marketplaceListings: MarketListingForm[];
  } = storeFormData || ({} as any);

  const [searchTerm, setSearchTerm] = useState("");
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());

  const inputRef = useRef<HTMLInputElement | null>(null);
  const dropdownRef = useRef<HTMLUListElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Filter listings based on search term
  const filteredListings = useMemo(() => {
    return (marketplaceListings ?? [])
      .filter((item) =>
        item.name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .map((item) => ({
        id: item.id,
        name: item.name,
        isAvailable: item.isAvailable,
        price: item.finalPrice,
        images: item.images, // Keep the original images array for safety
        imageUrl: item.images?.[0] ?? null,
      }))
      .slice(0, 5); // Limit to 5 for a clean dropdown
  }, [searchTerm, marketplaceListings]);

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setActiveIndex(-1); // Close dropdown when clicking outside
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = () => {
    alert(
      `Searching "${searchTerm}" on ${date.toLocaleDateString()} at ${time.toLocaleTimeString()}`
    );
  };

  return (
    <section className="relative h-screen w-full flex flex-col items-center justify-center text-white overflow-hidden">
      {/* Background Image: High-impact full-screen background */}
      {bannerUrl && (
        <Image
          src={bannerUrl}
          loader={loader}
          alt="Professional services banner"
          fill
          className="object-cover object-center"
          priority
        />
      )}
      {/* Dark Overlay for contrast and readability */}
      <div className="absolute inset-0 bg-gray-900/40 backdrop-brightness-75"></div>

      {/* Main Hero Content (Title/Subtitle) */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mb-20">
        <motion.h1
          className="text-5xl md:text-7xl font-extrabold tracking-tight"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {name}
        </motion.h1>
        <motion.p
          className="mt-4 text-xl md:text-2xl font-light text-gray-200"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {heroText}
        </motion.p>
      </div>

      {/* Booking Form Bar: Sleek Glassmorphism Design */}
      <motion.div
        className="relative z-10 w-full px-4 md:px-8 max-w-6xl mt-auto mb-10"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <div className="flex flex-col md:flex-row items-center bg-white/70 backdrop-blur-md rounded-2xl p-3 md:p-4 shadow-2xl border border-white/30 space-y-3 md:space-y-0 md:space-x-4">
          {/* 1. Search Input with Autocomplete */}
          <div className="relative flex-grow w-full md:w-auto">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
            <input
              id="search"
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setActiveIndex(0);
              }}
              onKeyDown={(e) => {
                if (filteredListings.length === 0) return;
                if (e.key === "ArrowDown") {
                  setActiveIndex(
                    (prev) => (prev + 1) % filteredListings.length
                  );
                  e.preventDefault();
                } else if (e.key === "ArrowUp") {
                  setActiveIndex(
                    (prev) =>
                      (prev - 1 + filteredListings.length) %
                      filteredListings.length
                  );
                  e.preventDefault();
                } else if (e.key === "Enter") {
                  if (filteredListings[activeIndex]) {
                    setSearchTerm(filteredListings[activeIndex].name);
                    setActiveIndex(-1);
                  }
                }
              }}
              className="w-full pl-12 pr-4 py-3 text-gray-800 rounded-xl bg-white/80 border border-transparent focus:outline-none focus:ring-2 focus:ring-teal-500 transition placeholder-gray-500"
              placeholder="What service do you need?"
            />

            {/* Autocomplete Dropdown */}
            {searchTerm && filteredListings.length > 0 && activeIndex !== -1 && (
              <ul
                ref={dropdownRef}
                className="absolute z-20 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden max-h-48 overflow-y-auto"
              >
                {filteredListings.map((item, index) => (
                  <li
                    key={item.id}
                    onClick={() => {
                      setSearchTerm(item.name);
                      setActiveIndex(-1);
                    }}
                    className={`flex items-center gap-3 p-3 cursor-pointer transition ${
                      index === activeIndex
                        ? "bg-teal-500/10"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    {item.imageUrl && (
                      <Image
                        src={item.imageUrl}
                        loader={loader}
                        alt={item.name}
                        width={32}
                        height={32}
                        className="rounded-lg object-cover"
                      />
                    )}
                    <span className="text-gray-800 font-medium">
                      {item.name}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* 2. Date Picker (Styling for better integration) */}
          <div className="relative w-full md:w-48">
            <CalendarDaysIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 pointer-events-none" />
            <DatePicker
              selected={date}
              onChange={(d) => d && setDate(d)}
              dateFormat="MMM d, yyyy"
              placeholderText="Select Date"
              className="w-full pl-12 pr-4 py-3 text-gray-800 rounded-xl bg-white/80 border border-transparent focus:outline-none focus:ring-2 focus:ring-teal-500 transition cursor-pointer"
            />
          </div>

          {/* 3. Time Picker (Styling for better integration) */}
          <div className="relative w-full md:w-36">
            <ClockIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 pointer-events-none" />
            <DatePicker
              selected={time}
              onChange={(t) => t && setTime(t)}
              showTimeSelect
              showTimeSelectOnly
              timeIntervals={30}
              dateFormat="h:mm aa"
              placeholderText="Select Time"
              className="w-full pl-12 pr-4 py-3 text-gray-800 rounded-xl bg-white/80 border border-transparent focus:outline-none focus:ring-2 focus:ring-teal-500 transition cursor-pointer"
            />
          </div>

          {/* 4. CTA Button */}
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 10px 20px rgba(0, 150, 136, 0.4)" }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSearch}
            className="w-full md:w-auto flex-shrink-0 bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-8 rounded-xl text-lg shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
          >
            <MagnifyingGlassIcon className="h-5 w-5" />
            Search
          </motion.button>
        </div>
      </motion.div>
    </section>
  );
}