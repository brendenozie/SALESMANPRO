"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  MagnifyingGlassIcon,
  CalendarDaysIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { useStoreContext } from "@/contexts/StoreContext";
import { MarketListingForm, HeroSlide } from "@/types/typings";

// --- Loader helper ---
const loader = ({ src, width, quality }: any) =>
  `${src}?w=${width}&q=${quality || 75}`;

// --- Default fallback hero content ---
const defaultHeroData = {
  name: "Your Service Hub",
  description:
    "Book trusted professionals with ease. Choose from verified services and enjoy peace of mind.",
  bannerUrl:
    "https://images.unsplash.com/photo-1517436336340-27a3c3c78897?q=80&w=2940&auto=format&fit=crop",
  marketplaceListings: [],
};

export interface HeroProps {
  name?: string | null;
  description?: string | null;
  bannerUrl?: string | null;
  heroSlides?: HeroSlide[] | null;
  marketplaceListings?: MarketListingForm[] | null;
}

export default function Hero({
  name,
  description,
  bannerUrl,
  heroSlides,
  marketplaceListings,
}: HeroProps) {

  // 🧠 Prefer heroSlides[0], else fallback through props → context → defaults
  const heroData = useMemo(() => {
    let firstSlide: Partial<HeroSlide> = heroSlides?.[0] ?? {};

    return {
      name:
        firstSlide.headline ||
        name ||
        defaultHeroData.name,
      description:
        firstSlide.subline ||
        description ||
        defaultHeroData.description ,
      bannerUrl:
        firstSlide.imageUrl ||
        bannerUrl ||
        defaultHeroData.bannerUrl,
      marketplaceListings:
        marketplaceListings?.length
          ? marketplaceListings
          : defaultHeroData.marketplaceListings,
    };
  }, [name, description, bannerUrl, heroSlides, marketplaceListings]);

  // --- Booking bar local state ---
  const [searchTerm, setSearchTerm] = useState("");
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const inputRef = useRef<HTMLInputElement | null>(null);
  const dropdownRef = useRef<HTMLUListElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(-1);

  // --- Filter listings for autocomplete ---
  const filteredListings = useMemo(() => {
    return heroData.marketplaceListings
      ?.filter((item) =>
        item.name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      ?.slice(0, 5)
      ?.map((item) => ({
        id: item.id,
        name: item.name,
        imageUrl: item.images?.[0] ?? null,
      }));
  }, [heroData.marketplaceListings, searchTerm]);

  // --- Close dropdown on outside click ---
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = useCallback(() => {
    alert(
      `Searching for "${searchTerm || "all services"}" on ${date.toLocaleDateString()} at ${time.toLocaleTimeString()}`
    );
  }, [searchTerm, date, time]);

  // --- UI ---
  return (
    <section className="relative min-h-screen w-full flex flex-col items-center justify-end text-white overflow-hidden pb-16 md:pb-24">
      {/* BACKGROUND IMAGE */}
      {heroData.bannerUrl && (
        <Image
          src={heroData.bannerUrl}
          loader={loader}
          alt="Hero background"
          fill
          priority
          className="object-cover object-center scale-105 motion-safe:animate-[zoom-in-slow_25s_ease-out_forwards]"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/40 to-transparent" />

      {/* TEXT CONTENT */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto mb-16 md:mb-24 pt-20 md:pt-0">
        <motion.h1
          className="text-5xl md:text-8xl font-extrabold tracking-tight text-shadow-lg"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {heroData.name}
        </motion.h1>
        <motion.p
          className="mt-4 text-xl md:text-3xl font-light italic text-teal-300 drop-shadow-md"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          {heroData.description}
        </motion.p>
      </div>

      {/* BOOKING BAR */}
      <motion.div
        className="relative z-20 w-full px-4 md:px-8 max-w-7xl"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <div className="flex flex-col md:flex-row items-center bg-white/85 backdrop-blur-xl rounded-3xl p-4 md:p-5 shadow-3xl border border-white/40 space-y-4 md:space-y-0 md:space-x-5">
          {/* Search Input */}
          <div className="relative flex-grow w-full md:w-auto min-w-[280px]">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-teal-600" />
            <input
              ref={inputRef}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search a service..."
              className="w-full pl-14 pr-6 py-4 text-gray-900 rounded-xl bg-white border border-gray-200 focus:ring-4 focus:ring-teal-500/40 focus:border-teal-500 text-lg font-medium transition-all"
            />
            {searchTerm && filteredListings?.length > 0 && (
              <ul
                ref={dropdownRef}
                className="absolute z-30 w-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden max-h-56 overflow-y-auto"
              >
                {filteredListings.map((item, i) => (
                  <motion.li
                    key={item.id}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15 }}
                    onClick={() => {
                      setSearchTerm(item.name);
                      setActiveIndex(-1);
                    }}
                    className={`flex items-center gap-3 p-3 cursor-pointer ${
                      i === activeIndex
                        ? "bg-teal-500/10"
                        : "hover:bg-teal-50"
                    }`}
                  >
                    {item.imageUrl && (
                      <Image
                        src={item.imageUrl}
                        loader={loader}
                        alt={item.name}
                        width={36}
                        height={36}
                        className="rounded-full object-cover ring-2 ring-teal-500/30"
                      />
                    )}
                    <span className="text-gray-800 font-semibold">
                      {item.name}
                    </span>
                  </motion.li>
                ))}
              </ul>
            )}
          </div>

          {/* Date Picker */}
          <div className="relative w-full md:w-52">
            <CalendarDaysIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-teal-600 pointer-events-none" />
            <DatePicker
              selected={date}
              onChange={(d) => d && setDate(d)}
              dateFormat="EEE, MMM d"
              className="w-full pl-14 pr-4 py-4 text-gray-900 rounded-xl bg-white border border-gray-200 focus:ring-4 focus:ring-teal-500/40 focus:border-teal-500 text-lg"
            />
          </div>

          {/* Time Picker */}
          <div className="relative w-full md:w-40">
            <ClockIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-teal-600 pointer-events-none" />
            <DatePicker
              selected={time}
              onChange={(t) => t && setTime(t)}
              showTimeSelect
              showTimeSelectOnly
              timeIntervals={30}
              dateFormat="h:mm aa"
              className="w-full pl-14 pr-4 py-4 text-gray-900 rounded-xl bg-white border border-gray-200 focus:ring-4 focus:ring-teal-500/40 focus:border-teal-500 text-lg"
            />
          </div>

          {/* Search Button */}
          <motion.button
            whileHover={{
              scale: 1.05,
              boxShadow: "0 0 0 10px rgba(20, 184, 166, 0.2)",
            }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSearch}
            className="w-full md:w-auto bg-teal-600 hover:bg-teal-700 text-white font-extrabold py-4 px-10 rounded-xl text-xl uppercase tracking-wider shadow-lg transition-all"
          >
            <MagnifyingGlassIcon className="h-6 w-6 inline-block mr-2" />
            Search
          </motion.button>
        </div>

        <p className="mt-4 text-center text-sm text-gray-200 drop-shadow-md">
          <span className="font-semibold">Tip:</span> Start typing to see available
          services near you.
        </p>
      </motion.div>
    </section>
  );
}
