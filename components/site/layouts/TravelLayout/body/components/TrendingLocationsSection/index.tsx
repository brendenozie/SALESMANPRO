"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  MapPinIcon, // For explore overlay
  HomeModernIcon, // For listings count
  CurrencyDollarIcon, // For average price
  ArrowRightIcon, // For explore
} from "@heroicons/react/24/solid";
import { IDestination } from "@/types/typings";
import { useStoreContext } from "@/contexts/StoreContext";
// import { useStoreFormData } from "@/stores/storeFormData"; // assuming you have a hook to access global form data

// --- Utilities (consistent with other sections) ---
const customLoader = ({ src, width, quality }: any) =>
  `${src}?w=${width}&q=${quality || 75}`;

const blurSvg = `data:image/svg+xml;base64,${btoa(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <rect width="100" height="100" fill="#e0e0e0" />
    <circle cx="50" cy="50" r="20" fill="#bdbdbd" />
  </svg>
`)}`;

const containerVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
};

// --- Fallback Sample Data ---
const fallbackTrending: {
  id: string;
  name: string;
  image: string;
  listingsCount: number;
  avgPrice: number;
}[] = [
  {
    id: "loc1",
    name: "Kyoto, Japan",
    image:
      "https://images.unsplash.com/photo-1545562083-d73b08767ef2?q=80&w=2940&auto=format&fit=crop",
    listingsCount: 150,
    avgPrice: 1800,
  },
  {
    id: "loc2",
    name: "Santorini, Greece",
    image:
      "https://images.unsplash.com/photo-1533105079780-fd80139b8700?q=80&w=2940&auto=format&fit=crop",
    listingsCount: 90,
    avgPrice: 2200,
  },
  {
    id: "loc3",
    name: "Banff, Canada",
    image:
      "https://images.unsplash.com/photo-1506953823976-5271ccbfb894?q=80&w=2940&auto=format&fit=crop",
    listingsCount: 120,
    avgPrice: 1500,
  },
];

// --- TrendingCard ---
function TrendingCard({
  loc,
}: {
  loc: {
    id: string;
    name: string;
    image: string;
    listingsCount: number;
    avgPrice: number;
  };
}) {
  return (
    <Link href={`/destinations/${loc.id}`} passHref>
      <motion.div
        whileHover={{ scale: 1.05, boxShadow: "0px 20px 40px rgba(0,0,0,0.25)" }}
        transition={{ type: "spring", stiffness: 250, damping: 20 }}
        className="relative flex-shrink-0 w-72 h-96 rounded-3xl overflow-hidden shadow-xl cursor-pointer group border border-gray-100"
      >
        {/* Background Image */}
        <Image
          src={loc.image}
          alt={loc.name}
          layout="fill"
          objectFit="cover"
          className="transform transition-transform duration-500 group-hover:scale-110"
          loader={customLoader}
          placeholder="blur"
          blurDataURL={blurSvg}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

        {/* Content */}
        <div className="absolute bottom-6 left-6 right-6 text-white z-10">
          <h3 className="text-3xl font-extrabold mb-1 drop-shadow-lg leading-tight">
            {loc.name}
          </h3>
          <div className="flex items-center text-sm text-gray-200 mb-1">
            <HomeModernIcon className="h-4 w-4 mr-1 text-indigo-300" />
            <span>{loc.listingsCount}+ amazing trips</span>
          </div>
          <div className="flex items-center text-sm text-gray-200">
            <CurrencyDollarIcon className="h-4 w-4 mr-1 text-indigo-300" />
            <span>Avg. ${loc.avgPrice.toLocaleString()} / trip</span>
          </div>
        </div>

        {/* Hover Overlay */}
        <motion.div
          initial={{ opacity: 0, y: "100%" }}
          whileHover={{ opacity: 1, y: "0%" }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="absolute inset-0 bg-indigo-600 bg-opacity-80 flex flex-col items-center justify-center text-white text-xl font-bold p-4 transform translate-y-full group-hover:translate-y-0"
        >
          <MapPinIcon className="h-10 w-10 mb-2" />
          <span>Explore Destination</span>
          <ArrowRightIcon className="h-6 w-6 mt-2" />
        </motion.div>
      </motion.div>
    </Link>
  );
}

// --- Main Component ---
export default function TrendingLocations() {

    const { storeFormData } = useStoreContext();
    
  // const { des =  } = storeFormData; // custom store hook
  const { destinations = [] } = storeFormData || {};

  const scrollRef = React.useRef<HTMLDivElement | null>(null);

  // Normalize data: prefer store data, else fallback
  const normalizedData =
    destinations && destinations.length > 0
      ? destinations.map((d: IDestination) => ({
          id: d.id,
          name: `${d.name}, ${d.country}`,
          image: d.bannerImage || d.images?.[0] || fallbackTrending[0].image,
          listingsCount: Math.floor(Math.random() * 200) + 50, // TODO: replace with real count
          avgPrice: Math.floor(Math.random() * 2500) + 800, // TODO: replace with real avg price
        }))
      : fallbackTrending;

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section id="destinations" className="py-16 px-4 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <motion.h2
          className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 text-center leading-tight"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
        >
          Trending Destinations
        </motion.h2>
        <motion.p
          className="text-lg text-gray-600 mb-12 text-center max-w-3xl mx-auto"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Discover where everyone's heading! Explore our most popular and
          sought-after travel spots.
        </motion.p>

        <div className="relative">
          {/* Scroll buttons (desktop only) */}
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-white rounded-full p-3 shadow-lg z-20 hidden md:block hover:bg-gray-100 transition"
            aria-label="Scroll left"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-6 h-6 text-gray-700"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5L8.25 12l7.5-7.5"
              />
            </svg>
          </button>
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-white rounded-full p-3 shadow-lg z-20 hidden md:block hover:bg-gray-100 transition"
            aria-label="Scroll right"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-6 h-6 text-gray-700"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 4.5l7.5 7.5-7.5 7.5"
              />
            </svg>
          </button>

          {/* Scrollable container */}
          <motion.div
            ref={scrollRef}
            className="flex space-x-6 overflow-x-auto pb-6 px-2 md:px-0 hide-scrollbar scroll-smooth"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {normalizedData.map((loc) => (
              <motion.div key={loc.id} variants={itemVariants}>
                <TrendingCard loc={loc} />
              </motion.div>
            ))}
          </motion.div>
        </div>

        <style jsx>{`
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
      </div>
    </section>
  );
}
