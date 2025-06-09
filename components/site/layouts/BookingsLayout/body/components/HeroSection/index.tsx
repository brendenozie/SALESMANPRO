"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useStoreContext } from "@/contexts/StoreContext";

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function HeroV1() {
  const { storeFormData } = useStoreContext();
  const {
    name,
    description,
    bannerUrl,
    marketplaceListings = [],
  } = storeFormData;

  // Form state
  const [searchTerm, setSearchTerm] = useState("");
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showForm, setShowForm] = useState(false);

  // Map featured services
  const featured = marketplaceListings.map((svc) => ({
    id: svc.id,
    name: svc.title,
    price: Number(svc.finalPrice || 0),
    imageUrl: svc.images[0],
  }));

  // Reveal booking form
  useEffect(() => {
    const t = setTimeout(() => setShowForm(true), 1200);
    return () => clearTimeout(t);
  }, []);

  const handleSearch = () => {
    alert(
      `Searching "${searchTerm}" on ${date.toLocaleDateString()} at ${time.toLocaleTimeString()}`
    );
  };

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Parallax BG Image */}
      {bannerUrl && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${bannerUrl})` }}
          data-scroll
          data-scroll-speed="0.3"
        />
      )}

      {/* Layered Orbs */}
      <motion.div
        className="absolute w-72 h-72 bg-pink-300 rounded-full opacity-15 blur-2xl top-[20%] left-[10%]"
        animate={{ x: [0, -30, 0], y: [0, 30, 0] }}
        transition={{ duration: 18, repeat: Infinity }}
      />
      <motion.div
        className="absolute w-80 h-80 bg-indigo-300 rounded-full opacity-10 blur-3xl top-[60%] right-[15%]"
        animate={{ x: [0, 40, 0], y: [0, -40, 0] }}
        transition={{ duration: 20, repeat: Infinity }}
      />

      {/* Content & Glassmorphic Overlay */}
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-center h-full px-6 bg-white/5 backdrop-blur-md">
        {/* Left: Title & Desc */}
        <motion.div
          className="text-center md:text-left max-w-2xl space-y-6"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <h1 className="text-5xl md:text-7xl font-extrabold text-white">
            {name}
          </h1>
          {description && (
            <motion.p
              className="text-lg md:text-xl text-white/90 max-w-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 1 }}
            >
              {description}
            </motion.p>
          )}
        </motion.div>

        {/* Right: Booking Form */}
        {showForm && (
          <motion.div
            className="mt-10 md:mt-0 md:ml-12 bg-white/30 backdrop-blur-lg p-6 rounded-2xl shadow-xl w-full max-w-md"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 1 }}
          >
            <div className="space-y-6">
              {/* Floating Label Input */}
              <div className="relative">
                <input
                  id="search"
                  type="text"
                  placeholder=" "
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="peer w-full px-4 pt-6 pb-2 rounded-lg bg-white/80 text-gray-900 focus:outline-none"
                />
                <label
                  htmlFor="search"
                  className="absolute left-4 top-2 text-gray-500 text-sm transition-all peer-placeholder-shown:top-6 peer-focus:top-2 peer-focus:text-xs peer-focus:text-teal-400"
                >
                  Search Providers
                </label>
              </div>

              {/* Date Picker */}
              <div className="relative">
                <DatePicker
                  selected={date}
                  onChange={(d) => d && setDate(d)}
                  placeholderText=" "
                  className="peer w-full px-4 pt-6 pb-2 rounded-lg bg-white/80 text-gray-900 focus:outline-none"
                  dateFormat="MMM d, yyyy"
                  calendarClassName="rounded-lg p-2 shadow-lg bg-white"
                />
                <label
                  className="absolute left-4 top-2 text-gray-500 text-sm transition-all peer-focus:top-2 peer-focus:text-xs peer-focus:text-teal-400"
                >
                  Pick a Date
                </label>
              </div>

              {/* Time Picker */}
              <div className="relative">
                <DatePicker
                  selected={time}
                  onChange={(t) => t && setTime(t)}
                  showTimeSelect
                  showTimeSelectOnly
                  timeIntervals={30}
                  placeholderText=" "
                  className="peer w-full px-4 pt-6 pb-2 rounded-lg bg-white/80 text-gray-900 focus:outline-none"
                  dateFormat="h:mm aa"
                  calendarClassName="rounded-lg p-2 shadow-lg bg-white"
                />
                <label
                  className="absolute left-4 top-2 text-gray-500 text-sm transition-all peer-focus:top-2 peer-focus:text-xs peer-focus:text-teal-400"
                >
                  Pick a Time
                </label>
              </div>

              {/* Search Button */}
              <button
                onClick={handleSearch}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white px-4 py-3 rounded-lg font-semibold shadow-md transition hover:scale-102 hover:shadow-lg"
              >
                Find Available Slots
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Featured Services Cards */}
      {showForm && (
        <motion.div
          className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto px-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.6 }}
        >
          {featured.slice(0, 3).map((svc) => (
            <button
              key={svc.id}
              className="bg-white/90 hover:bg-white backdrop-blur-sm rounded-xl shadow-lg overflow-hidden flex flex-col transition"
              onClick={() => setSearchTerm(svc.name)}
            >
              <div className="relative w-full h-40">
                <Image
                  loader={loader}
                  src={svc.imageUrl}
                  alt={svc.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4 text-left">
                <h3 className="font-semibold text-gray-900">{svc.name}</h3>
                <p className="mt-1 text-teal-600 font-bold">${svc.price}</p>
              </div>
            </button>
          ))}
        </motion.div>
      )}
    </section>
  );
}
