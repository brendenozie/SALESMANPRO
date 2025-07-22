"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
// If you have custom datepicker styles, import them here:
// import '../styles/custom-datepicker.css';
import { useStoreContext } from "@/contexts/StoreContext";
import { StarIcon } from "@heroicons/react/24/solid";
import { MarketplaceListingForm } from "@/types/typings"; // Corrected type name from MarketListingForm

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

// More inviting and benefit-driven hero text
const heroText = [
  "Discover & Book Top Professionals ✨",
  "Your Perfect Service, Just a Tap Away 📱",
  "Effortless Appointments, Exceptional Results ✅",
];

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

  // Memoize filteredServices for performance and correct dependency
  const filteredServices = React.useMemo(() => {
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
        // averageRating: item.averageRating ?? null, // Uncomment if available in your type
      }));
  }, [searchTerm, marketplaceListings]);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setActiveIndex(-1); // Close dropdown when clicking outside
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    // Reveal form slightly faster for better responsiveness
    const t = setTimeout(() => setShowForm(true), 500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayedText(heroText[textIndex].slice(0, charIndex + 1));
      if (charIndex === heroText[textIndex].length) {
        setTimeout(() => {
          setCharIndex(0);
          setTextIndex((prev) => (prev + 1) % heroText.length);
        }, 2000); // Increased delay between full sentences
      } else {
        setCharIndex((prev) => prev + 1);
      }
    }, 80); // Slightly faster typing speed
    return () => clearInterval(interval);
  }, [charIndex, textIndex]);


  const handleSearch = () => {
    // You'd typically navigate or filter results here
    alert(`Searching "${searchTerm}" on ${date.toLocaleDateString()} at ${time.toLocaleTimeString()}`);
  };

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-white text-gray-900 flex items-center justify-center">
      {bannerUrl && (
        <div className="absolute inset-0 z-0">
          <Image
            src={bannerUrl}
            loader={loader}
            alt="Banner"
            fill
            className="object-cover object-center opacity-60" // Kept opacity for a soft background
            priority
          />
          {/* Subtle light gradient overlay for text contrast on image */}
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent"></div>
        </div>
      )}

      <div className="relative z-10 container mx-auto px-6 py-20 md:py-32 lg:py-48 flex flex-col md:flex-row items-center justify-center gap-16 md:gap-20">
        {/* Left: Text Content */}
        <motion.div
          className="min-w-full md:min-w-[30rem] max-w-xl space-y-8 text-center md:text-left"
          initial={{ opacity: 0, x: -50 }} // Slide in from left
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1 className="text-5xl md:text-6xl font-black leading-tight text-gray-900 tracking-tight">
            {name || "Your Go-To Booking Platform"} {/* Fallback if name is empty */}
          </h1>
          <p className="text-2xl font-light text-teal-700"> {/* Adjusted teal for better contrast on light background */}
            {displayedText}
          </p>
          {description && (
            <motion.p
              className="text-lg md:text-xl text-gray-700 leading-relaxed" // Adjusted text color, removed drop-shadow for light mode
              initial={{ opacity: 0, x: -30 }} // Slight delay for description
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            >
              {description}
            </motion.p>
          )}
        </motion.div>

        {/* Right: Booking Form */}
        {showForm && (
          <motion.div
            className="w-full max-w-md bg-white p-8 rounded-3xl shadow-lg border border-gray-200 transition-all duration-300 hover:shadow-xl hover:shadow-teal-500/20" // Light background, adjusted shadow and border for light mode
            initial={{ opacity: 0, x: 50 }} // Slide in from right
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
          >
            <div className="space-y-6">
              {/* Search Input with Dropdown */}
              <div className="relative">
                <label htmlFor="search" className="block text-sm font-semibold text-gray-700 mb-1"> {/* Changed label color for light mode */}
                  Search for a Professional
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
                        setActiveIndex(-1); // Close dropdown on selection
                      }
                    }
                  }}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 transition border border-gray-200" // Light background for input, added border
                  placeholder="e.g., Hair Stylist, Electrician" // More specific examples
                />

                {filteredServices.length > 0 && searchTerm.length > 0 && activeIndex !== -1 && ( // Only show if search term is active and not explicitly closed
                  <ul
                    ref={dropdownRef}
                    className="absolute left-0 right-0 mt-2 max-h-60 overflow-y-auto bg-white rounded-xl shadow-lg z-50 text-gray-900 border border-gray-200"
                  >
                    {filteredServices.slice(0, 6).map((item, index) => (
                      <li
                        key={item.id}
                        onClick={() => {
                          setSearchTerm(item.name);
                          setActiveIndex(-1);
                        }}
                        className={`px-4 py-3 cursor-pointer transition flex items-center gap-3 ${
                          index === activeIndex ? 'bg-teal-100' : 'hover:bg-teal-50'
                        }`}
                      >
                        {item.imageUrl && (
                            <Image
                              src={item.imageUrl}
                              loader={loader}
                              alt={item.name}
                              width={32} // Slightly larger image in dropdown
                              height={32}
                              className="rounded-full object-cover border border-gray-200"
                            />
                        )}
                        <span>{item.name}</span>
                        {/* Example for displaying average rating if available (requires data) */}
                        {/* {item.averageRating && (
                          <span className="flex items-center text-yellow-500 text-sm ml-auto">
                            <StarIcon className="w-4 h-4 mr-1" /> {item.averageRating.toFixed(1)}
                          </span>
                        )} */}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-semibold w-full text-gray-700 mb-1">When do you need it?</label> {/* Changed label color for light mode */}
                <DatePicker
                  selected={date}
                  onChange={(d) => d && setDate(d)}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 transition border border-gray-200" // Light background for input, added border
                  dateFormat="MMM d, yyyy"
                />
              </div>

              {/* Time */}
              <div>
                <label className="block text-sm w-full font-semibold text-gray-700 mb-1">At what time?</label> {/* Changed label color for light mode */}
                <DatePicker
                  selected={time}
                  onChange={(t) => t && setTime(t)}
                  showTimeSelect
                  showTimeSelectOnly
                  timeIntervals={30}
                  dateFormat="h:mm aa"
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 transition border border-gray-200" // Light background for input, added border
                />
              </div>

              {/* CTA */}
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0 8px 25px rgba(0, 200, 150, 0.4)" }} // Still works well for light mode
                whileTap={{ scale: 0.98 }}
                onClick={handleSearch}
                className="w-full bg-teal-500 hover:bg-teal-600 text-white px-5 py-3 rounded-xl font-semibold text-lg shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Book Your Service
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}