"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useStoreContext } from "@/contexts/StoreContext";
import { StarIcon } from "@heroicons/react/24/solid";
import { MarketplaceListingForm } from "@/types/typings";

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

const heroText = ["Your Trusted Booking Partner", "Book Experts On-Demand", "Seamless Scheduling"];

export default function Hero() {
  const { storeFormData } = useStoreContext();
  const { name, description, bannerUrl, marketplaceListings = [] } = storeFormData;

  const [searchTerm, setSearchTerm] = useState("");
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLUListElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
 

  let filteredServices : any[] = [];

  useEffect(() => {
    filteredServices = marketplaceListings
    ?.filter((item) =>
      item.name?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .map((item) => ({
      id: item.id,
      name: item.name,
      isAvailable: item.isAvailable,
      price: item.finalPrice,
      imageUrl: item.images?.[0] ?? null,
    }));
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setActiveIndex(-1);
      }
    };
  
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setShowForm(true), 1000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayedText(heroText[textIndex].slice(0, charIndex + 1));
      if (charIndex === heroText[textIndex].length) {
        setTimeout(() => {
          setCharIndex(0);
          setTextIndex((prev) => (prev + 1) % heroText.length);
        }, 1500);
      } else {
        setCharIndex((prev) => prev + 1);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [charIndex, textIndex]);

  const handleSearch = () => {
    alert(`Searching \"${searchTerm}\" on ${date.toLocaleDateString()} at ${time.toLocaleTimeString()}`);
  };

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-gray-900 text-white">
      {bannerUrl && (
        <div className="absolute inset-0 z-0">
          <Image
            src={bannerUrl}
            loader={loader}
            alt="Banner"
            fill
            className="object-cover object-center opacity-40"
            priority
          />
        </div>
      )}

    <div className="relative z-10 container mx-auto px-6 pt-48 pb-28 flex flex-col md:flex-row items-center justify-center gap-16 md:gap-20">
      {/* Left: Text Content */}
      <motion.div
        className=" min-w-[30rem] max-w-xl space-y-8 text-center md:text-left"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-5xl md:text-6xl font-black leading-tight text-white drop-shadow-xl tracking-tight">
          {name}
        </h1>
        <p className="text-2xl font-light text-teal-300 animate-pulse">{displayedText}</p>
        {description && (
          <p className="text-lg md:text-xl text-white/90 drop-shadow-md leading-relaxed">
            {description}
          </p>
        )}
      </motion.div>

      {/* Right: Booking Form */}
      {showForm && (
        <motion.div
          className="w-full max-w-md bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl p-8 rounded-3xl shadow-2xl border border-white/20 ring-1 ring-white/10 transition-all"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="space-y-6">
            {/* Search Input with Dropdown */}
            <div className="relative">
              <label htmlFor="search" className="block text-sm font-semibold text-white/80 mb-1">
                Search Providers
              </label>
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
                  if (filteredServices.length === 0) return;

                  if (e.key === "ArrowDown") {
                    setActiveIndex((prev) => (prev + 1) % filteredServices.length);
                    e.preventDefault();
                  } else if (e.key === "ArrowUp") {
                    setActiveIndex((prev) => (prev - 1 + filteredServices.length) % filteredServices.length);
                    e.preventDefault();
                  } else if (e.key === "Enter") {
                    if (filteredServices[activeIndex]) {
                      setSearchTerm(filteredServices[activeIndex].name);
                    }
                  }
                }}
                className="w-full px-4 py-3 rounded-xl bg-white/80 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                placeholder="e.g., Plumber, Makeup Artist"
              />

              {filteredServices.length > 0 && (
                <ul
                  ref={dropdownRef}
                  className="absolute left-0 right-0 mt-2 max-h-60 overflow-y-auto bg-white rounded-xl shadow-lg z-50 text-gray-900"
                >
                  {filteredServices.slice(0, 6).map((item, index) => (
                    <li
                      key={item.id}
                      onClick={() => {
                        setSearchTerm(item.name);
                        setActiveIndex(-1);
                      }}
                      className={`px-4 py-3 cursor-pointer transition ${
                        index === activeIndex ? 'bg-teal-100' : 'hover:bg-teal-50'
                      }`}
                    >
                      {item.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-semibold  w-full text-white/80 mb-1">Pick a Date</label>
              <DatePicker
                selected={date}
                onChange={(d) => d && setDate(d)}
                className="w-full px-4 py-3 rounded-xl bg-white/80 text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                dateFormat="MMM d, yyyy"
              />
            </div>

            {/* Time */}
            <div>
              <label className="block text-sm w-full font-semibold text-white/80 mb-1">Pick a Time</label>
              <DatePicker
                selected={time}
                onChange={(t) => t && setTime(t)}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={30}
                dateFormat="h:mm aa"
                className="w-full px-4 py-3 rounded-xl bg-white/80 text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
              />
            </div>

            {/* CTA */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleSearch}
              className="w-full bg-teal-500 hover:bg-teal-600 text-white px-5 py-3 rounded-xl font-semibold text-lg shadow-lg transition-all duration-200"
            >
              Book Slot
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
    </section>
  );
}
