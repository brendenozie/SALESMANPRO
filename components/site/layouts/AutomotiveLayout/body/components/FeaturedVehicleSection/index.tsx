"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image"; // For optimized images
import Link from "next/link"; // For navigation
import clsx from "clsx"; // A utility for conditionally joining class names
import {  HomeModernIcon, SparklesIcon, FireIcon, TagIcon } from "@heroicons/react/24/solid"; // Solid icons for badges/types

// Mocking the image loader for demonstration purposes (keep this if you use it globally)
const customLoader = ({ src, width, quality }: any) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

// --- Dummy Data ---
// Extend VehicleCardProps to include ID for mapping
interface VehicleCardProps {
  id: string; // Unique ID for each vehicle
  make: string;
  model: string;
  year: number;
  price: number;
  image: string;
  type: "Car" | "Motorcycle" | "SUV" | "Truck" | "Property"; // More specific types
  mileage?: number; // Optional for properties
  badge?: "New Arrival" | "Hot Deal" | "Featured"; // More descriptive badges
  link: string; // Link to the detail page
}

const dummyVehicles: VehicleCardProps[] = [
  {
    id: "v1",
    make: "Mercedes-Benz",
    model: "C-Class",
    year: 2023,
    price: 55000,
    image: "https://images.unsplash.com/photo-1616788898197-28d8b9f7a7f4?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    type: "Car",
    mileage: 8500,
    badge: "New Arrival",
    link: "/vehicles/mercedes-c-class",
  },
  {
    id: "v2",
    make: "Tesla",
    model: "Model 3",
    year: 2022,
    price: 48000,
    image: "https://images.unsplash.com/photo-1605559424843-9e4c227ab1f2?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    type: "Car",
    mileage: 12000,
    badge: "Hot Deal",
    link: "/vehicles/tesla-model-3",
  },
  {
    id: "v3",
    make: "Harley-Davidson",
    model: "Fat Bob",
    year: 2021,
    price: 18500,
    image: "https://images.unsplash.com/photo-1558981403-c5f98990497f?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    type: "Motorcycle",
    mileage: 5000,
    link: "/vehicles/harley-fat-bob",
  },
  {
    id: "v4",
    make: "Toyota",
    model: "RAV4",
    year: 2024,
    price: 36000,
    image: "https://images.unsplash.com/photo-1621323330691-1c5c1b6a7e0d?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    type: "SUV",
    mileage: 1500,
    badge: "Featured",
    link: "/vehicles/toyota-rav4",
  },
  {
    id: "p1",
    make: "Modern",
    model: "Villa",
    year: 2020,
    price: 1200000,
    image: "https://images.unsplash.com/photo-1580582932707-52c5df7ff0bc?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    type: "Property",
    link: "/properties/modern-villa",
  },
  {
    id: "p2",
    make: "Downtown",
    model: "Apartment",
    year: 2018,
    price: 450000,
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    type: "Property",
    link: "/properties/downtown-apt",
  },
];

// Assuming storeFormData is available from a context or prop if this section is part of a larger page
const dummyStoreFormData = {
  name: "Premium Listings",
};

// --- VehicleCard Component (Enhanced) ---
const VehicleCard: React.FC<VehicleCardProps> = ({
  make,
  model,
  year,
  price,
  image,
  type,
  mileage,
  badge,
  link,
}) => {
  return (
    <Link href={link} passHref>
      <motion.div
        whileHover={{ y: -8, boxShadow: "0 15px 30px rgba(0,0,0,0.15)" }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden cursor-pointer group border border-gray-100 dark:border-gray-700"
      >
        {/* Badge */}
        {badge && (
          <motion.span
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className={clsx(
              "absolute top-4 left-4 px-4 py-1.5 rounded-full text-sm font-bold text-white z-10 flex items-center gap-1",
              badge === "New Arrival"
                ? "bg-gradient-to-r from-green-500 to-emerald-600"
                : badge === "Hot Deal"
                ? "bg-gradient-to-r from-red-500 to-orange-600"
                : "bg-gradient-to-r from-blue-500 to-indigo-600"
            )}
          >
            {badge === "New Arrival" && <SparklesIcon className="w-4 h-4" />}
            {badge === "Hot Deal" && <FireIcon className="w-4 h-4" />}
            {badge === "Featured" && <TagIcon className="w-4 h-4" />}
            {badge}
          </motion.span>
        )}

        {/* Image */}
        <div className="relative w-full aspect-video overflow-hidden">
          <Image
            src={image}
            alt={`${make} ${model}`}
            layout="fill"
            objectFit="cover"
            loader={customLoader}
            className="transform transition duration-500 group-hover:scale-110 brightness-90 group-hover:brightness-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-40 group-hover:opacity-60 transition-opacity duration-300" />
        </div>

        {/* Details */}
        <div className="p-6 space-y-3">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
            {year} {make} {model}
          </h3>
          <p className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">
            ${price.toLocaleString()}
          </p>
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 gap-3">
            {type === "Property" ? (
              <HomeModernIcon className="w-5 h-5 text-gray-400" />
            ) : (
              <HomeModernIcon className="w-5 h-5 text-gray-400" />
            )}
            <span>{type}</span>
            {mileage !== undefined && (
              <>
                <span className="dot-separator">•</span>
                <span>{mileage.toLocaleString()} miles</span>
              </>
            )}
          </div>
          <motion.button
            whileHover={{ scale: 1.02, backgroundColor: "#2563EB" }}
            whileTap={{ scale: 0.98 }}
            className="mt-4 w-full bg-blue-600 text-white py-3 rounded-xl font-semibold text-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
          >
            View Details
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              ></path>
            </svg>
          </motion.button>
        </div>
      </motion.div>
    </Link>
  );
};

// --- FeaturedVehicleSection Component (Enhanced) ---
interface FeaturedVehicleSectionProps {
  bannerUrl?: string; // This prop doesn't seem used, but keeping for consistency
}

const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

const filterButtonVariants = {
  active: {
    backgroundColor: ["#3B82F6", "#2563EB"], // Animate color change
    color: "#ffffff",
    scale: 1.05,
    boxShadow: "0px 8px 15px rgba(0,0,0,0.2)",
    transition: { type: "spring", stiffness: 300, damping: 15 },
  },
  inactive: {
    backgroundColor: ["#E5E7EB", "#F9FAFB"], // Animate color change
    color: "#4B5563",
    scale: 1,
    boxShadow: "0px 2px 5px rgba(0,0,0,0.1)",
    transition: { type: "spring", stiffness: 300, damping: 15 },
  },
};

export default function FeaturedVehicleSection({
  bannerUrl,
}: FeaturedVehicleSectionProps) {
  const [isVehicleActive, setIsVehicleActive] = useState(true); // State for toggling between Vehicles and Properties

  const filteredItems = isVehicleActive
    ? dummyVehicles.filter((item) => item.type !== "Property")
    : dummyVehicles.filter((item) => item.type === "Property");

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={sectionVariants}
      className="py-16 px-4 md:px-8 lg:px-16 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-950 relative overflow-hidden"
    >
      {/* Background patterns/blobs for visual interest */}
      <div className="absolute top-0 left-0 w-80 h-80 bg-blue-200 dark:bg-blue-800 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-200 dark:bg-indigo-800 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob-reverse"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mb-10"
        >
          <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white leading-tight mb-3">
            Explore Our Curated Listings 💎
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Discover a wide range of premium vehicles and exceptional properties.
          </p>
        </motion.div>

        {/* Buy/Rent Toggle Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex justify-center mb-12 space-x-4 p-2 bg-gray-100 dark:bg-gray-800 rounded-full shadow-inner max-w-sm mx-auto"
        >
          <motion.button
            onClick={() => setIsVehicleActive(true)}
            variants={filterButtonVariants}
            animate={isVehicleActive ? "active" : "inactive"}
            className="px-6 py-3 rounded-full text-lg font-semibold transition-all duration-300 flex-1 flex items-center justify-center gap-2"
          >
            <HomeModernIcon className="w-5 h-5" /> Vehicles
          </motion.button>
          <motion.button
            onClick={() => setIsVehicleActive(false)}
            variants={filterButtonVariants}
            animate={!isVehicleActive ? "active" : "inactive"}
            className="px-6 py-3 rounded-full text-lg font-semibold transition-all duration-300 flex-1 flex items-center justify-center gap-2"
          >
            <HomeModernIcon className="w-5 h-5" /> Properties
          </motion.button>
        </motion.div>

        {/* Listings Grid */}
        <motion.div
          key={isVehicleActive ? "vehicles" : "properties"} // Key for AnimatePresence re-render
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
              },
            },
          }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <motion.div
                key={item.id}
                variants={{
                  hidden: { opacity: 0, y: 50, scale: 0.95 },
                  visible: { opacity: 1, y: 0, scale: 1 },
                }}
                transition={{ type: "spring", stiffness: 100, damping: 10 }}
              >
                <VehicleCard {...item} />
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="lg:col-span-3 text-center text-gray-600 dark:text-gray-400 text-xl py-10"
            >
              No listings found for this category.
            </motion.div>
          )}
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-16"
        >
          <Link href={isVehicleActive ? "/all-vehicles" : "/all-properties"} passHref>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 8px 20px rgba(37,99,235,0.4)" }}
              whileTap={{ scale: 0.98 }}
              className="px-10 py-4 bg-blue-600 text-white text-lg font-bold rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 ease-in-out transform flex items-center justify-center mx-auto gap-2"
            >
              View All {isVehicleActive ? "Vehicles" : "Properties"}
              <svg
                className="ml-2 w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                ></path>
              </svg>
            </motion.button>
          </Link>
        </motion.div>
      </div>
      {/* Required for the customLoader prop in Image component */}
      <style jsx global>{`
        .dot-separator {
          /* Add specific styling for the dot if needed, or define in Tailwind config */
          font-size: 1.2em; /* Makes the dot a bit larger */
          line-height: 1;
        }
      `}</style>
    </motion.section>
  );
}