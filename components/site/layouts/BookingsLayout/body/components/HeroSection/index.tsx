"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
// If you have custom datepicker styles, import them here:
// import '../styles/custom-datepicker.css';

// Import Heroicons for a cleaner look
import { StarIcon, MagnifyingGlassIcon } from "@heroicons/react/24/solid";

// We'll assume these types and contexts exist for a complete example
import { useStoreContext } from "@/contexts/StoreContext";

const loader = ({ src, width, quality }:any) => `${src}?w=${width}&q=${quality || 75}`;

// Simplified hero text for a cleaner look
const heroText = "Your Next Service, Just a Click Away.";

export default function Hero() {
  const { storeFormData } = useStoreContext();

  // Provided sample data in case storeFormData is empty
  const defaultFormData = {
    name: "The Booking Hub",
    description: "Connect with verified professionals and book services with ease. From personal care to home repair, we've got you covered.",
    bannerUrl: "https://images.unsplash.com/photo-1542626991-cbc9322c34d4?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    marketplaceListings: [
      { id: "1", name: "Hair Stylist", isAvailable: true, finalPrice: 75, images: ["https://images.unsplash.com/photo-1596461404986-e88e404b4c73?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"] },
      { id: "2", name: "Electrician", isAvailable: true, finalPrice: 150, images: ["https://images.unsplash.com/photo-1581094042850-25e40733d31b?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"] },
      { id: "3", name: "Plumber", isAvailable: true, finalPrice: 120, images: ["https://images.unsplash.com/photo-1587569145888-0f1e8e8f8c7e?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"] },
      { id: "4", name: "Lawn Care Service", isAvailable: true, finalPrice: 80, images: ["https://images.unsplash.com/photo-1555548680-77a28e3a2b3b?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"] },
    ],
  };

  const {
    name = defaultFormData.name,
    description = defaultFormData.description,
    bannerUrl = defaultFormData.bannerUrl,
    marketplaceListings = defaultFormData.marketplaceListings
  } = storeFormData || {};

  const [searchTerm, setSearchTerm] = useState("");
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());

  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Memoize filteredServices for performance and correct dependency
  const filteredServices = useMemo(() => {
    return marketplaceListings
      ?.filter((item) =>
        item.name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .map((item) => ({
        id: item.id,
        name: item.name,
        isAvailable: item.isAvailable,
        price: item.finalPrice,
        imageUrl: item.images?.[0] ?? null,
      }))
      .slice(0, 5); // Limit to 5 results for a cleaner dropdown
  }, [searchTerm, marketplaceListings]);

  useEffect(() => {
    const handleClickOutside = (event:any) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setActiveIndex(-1); // Close dropdown when clicking outside
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = () => {
    alert(`Searching "${searchTerm}" on ${date.toLocaleDateString()} at ${time.toLocaleTimeString()}`);
  };

  return (
    <section className="relative h-screen w-full flex items-center justify-center text-gray-900 overflow-hidden">
      {/* Background with subtle overlay */}
      {bannerUrl && (
        <>
          <Image
            src={bannerUrl}
            loader={loader}
            alt="Professional services banner"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm"></div>
        </>
      )}

      {/* Main Content: Centered Card */}
      <div className="relative z-10 p-4 md:p-8 w-full max-w-lg mx-auto">
        <motion.div
          className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl border border-gray-200"
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="text-center space-y-4 mb-8">
            <h1 className="text-3xl md:text-4xl font-extrabold text-teal-600">
              {name}
            </h1>
            <p className="text-xl text-gray-700">
              {heroText}
            </p>
          </div>

          {/* Booking Form */}
          <div className="space-y-6">
            {/* Search Input with Autocomplete */}
            <div className="relative">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 sr-only">Search for a Service</label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400" />
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
                        setActiveIndex(-1);
                      }
                    }
                  }}
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                  placeholder="e.g., Hair Stylist, Electrician"
                />
              </div>

              {/* Autocomplete Dropdown */}
              {searchTerm && filteredServices.length > 0 && activeIndex !== -1 && (
                <ul
                  ref={dropdownRef}
                  className="absolute z-20 w-full mt-2 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden max-h-48 overflow-y-auto"
                >
                  {filteredServices.map((item, index) => (
                    <li
                      key={item.id}
                      onClick={() => {
                        setSearchTerm(item.name);
                        setActiveIndex(-1);
                      }}
                      className={`flex items-center gap-3 p-3 cursor-pointer transition ${index === activeIndex ? 'bg-teal-100' : 'hover:bg-teal-50'}`}
                    >
                      {item.imageUrl && (
                        <Image
                          src={item.imageUrl}
                          loader={loader}
                          alt={item.name}
                          width={40}
                          height={40}
                          className="rounded-full object-cover"
                        />
                      )}
                      <span className="text-gray-800 font-medium">{item.name}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Date and Time Pickers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <DatePicker
                  selected={date}
                  onChange={(d) => d && setDate(d)}
                  dateFormat="MMM d, yyyy"
                  className="w-full px-4 py-4 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <DatePicker
                  selected={time}
                  onChange={(t) => t && setTime(t)}
                  showTimeSelect
                  showTimeSelectOnly
                  timeIntervals={30}
                  dateFormat="h:mm aa"
                  className="w-full px-4 py-4 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                />
              </div>
            </div>

            {/* CTA Button */}
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: "0 12px 25px rgba(0, 150, 136, 0.4)" }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSearch}
              className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-4 rounded-xl text-lg shadow-lg transition-all duration-300"
            >
              Find & Book Now
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}