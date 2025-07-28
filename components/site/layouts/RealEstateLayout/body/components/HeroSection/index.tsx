"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  PlayCircleIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/solid";
import {
  MapPinIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import { StoreForm } from "@/types/typings";

const loader = ({ src, width, quality }: any) =>
  `${src}?w=${width}&q=${quality || 75}`;

const variants = {
  fadeInUp: {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  },
  scaleUp: {
    hidden: { scale: 0.9, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { duration: 0.7, ease: "easeOut" } },
  },
};

type HeroSectionProps = {
  store: StoreForm | null;
  onSearch: (filters: { location: string; minPrice: string; maxPrice: string }) => void;
};

export default function HeroSection({ store, onSearch }: HeroSectionProps) {
  // Dynamic hero data with fallbacks
  const title =
    store.themeSettings?.heroHeadline ||
    `Discover Your Dream Home.`;
  const subtitle =
    store.themeSettings?.heroSubheading ||
    `Seamlessly search for properties by location and price range. Your ideal living space awaits.`;
  const banner =
    store.bannerUrl || "/images/realestate-hero.jpg";

  // Default filter values from themeSettings or empty
  const [location, setLocation] = useState(
    store.themeSettings?.heroDefaultFilters?.location || ""
  );
  const [minPrice, setMinPrice] = useState(
    store.themeSettings?.heroDefaultFilters?.minPrice || ""
  );
  const [maxPrice, setMaxPrice] = useState(
    store.themeSettings?.heroDefaultFilters?.maxPrice || ""
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ location, minPrice, maxPrice });
  };

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden bg-gray-100 dark:bg-gray-950">
      {/* Background */}
      <div className="absolute inset-0">
        <Image
          src={banner}
          alt={store.name || "Real Estate Hero"}
          layout="fill"
          objectFit="cover"
          priority
          className="opacity-70 dark:opacity-40 filter brightness-90 saturate-120"
          loader={loader}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-emerald-800/80 dark:to-teal-950/80" />
        <div className="absolute inset-0 bg-gradient-to-t from-transparent to-black/20" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl text-center px-4 sm:px-6 lg:px-8 space-y-8">
        <motion.h1
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold leading-tight text-white drop-shadow-2xl tracking-tight"
          variants={variants.fadeInUp}
          initial="hidden"
          animate="visible"
        >
          {title.split("|").map((chunk : any , i : any) =>
            i === 1 ? (
              <span
                key={i}
                className="text-amber-300"
              >
                {chunk}
              </span>
            ) : (
              <React.Fragment key={i}>{chunk}</React.Fragment>
            )
          )}
        </motion.h1>

        <motion.p
          className="mt-4 text-lg md:text-xl font-light text-gray-200 max-w-3xl mx-auto drop-shadow-md"
          variants={variants.fadeInUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2 }}
        >
          {subtitle}
        </motion.p>

        <motion.form
          onSubmit={handleSubmit}
          className="mt-10 grid grid-cols-1 md:grid-cols-4 gap-5 p-8 rounded-3xl shadow-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-3xl border border-white/20 dark:border-gray-700/50"
          variants={variants.scaleUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.4 }}
          aria-label="Search properties form"
        >
          <div className="relative col-span-full md:col-span-1">
            <MapPinIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <input
              type="text"
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              aria-label="Location"
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 border border-gray-200 dark:border-gray-700 focus:ring-4 focus:ring-amber-400/50 transition hover:scale-[1.01]"
            />
          </div>

          <div className="relative col-span-full md:col-span-1">
            <CurrencyDollarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <input
              type="number"
              placeholder="Min Price"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              aria-label="Minimum price"
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 border border-gray-200 dark:border-gray-700 focus:ring-4 focus:ring-amber-400/50 transition hover:scale-[1.01]"
            />
          </div>

          <div className="relative col-span-full md:col-span-1">
            <CurrencyDollarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <input
              type="number"
              placeholder="Max Price"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              aria-label="Maximum price"
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 border border-gray-200 dark:border-gray-700 focus:ring-4 focus:ring-amber-400/50 transition hover:scale-[1.01]"
            />
          </div>

          <motion.button
            type="submit"
            className="col-span-full md:col-span-1 flex items-center justify-center space-x-3 px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg hover:shadow-xl focus:ring-4 focus:ring-amber-400/70 transition hover:scale-[1.02] active:scale-[0.98]"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            aria-label="Search listings"
          >
            <MagnifyingGlassIcon className="w-6 h-6" />
            <span>{store.themeSettings?.heroButtonText || "Search Now"}</span>
          </motion.button>
        </motion.form>

        <motion.div
          className="mt-8"
          variants={variants.fadeInUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.6 }}
        >
          <Link href="/how-it-works"  className="inline-flex items-center space-x-3 text-lg font-medium text-white hover:text-amber-300 transition">
              <PlayCircleIcon className="w-8 h-8 text-amber-400" />
              <span>
                {store.themeSettings?.heroGuideText || "Watch Video Guide"}
              </span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
