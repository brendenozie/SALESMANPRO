// components/FeaturedListings.tsx
"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

// Dummy Data (Replace with real data fetched from your API)
const featuredCarsForSale = [
  {
    id: "sale-1",
    name: "2023 Mercedes-Benz C-Class",
    price: "$48,999",
    imageUrl:
      "https://images.unsplash.com/photo-1594392237937-2309f7a9d0ce?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    alt: "Mercedes-Benz C-Class",
    mileage: "12,500 miles",
    location: "Nairobi",
  },
  {
    id: "sale-2",
    name: "2022 Tesla Model 3",
    price: "$42,500",
    imageUrl:
      "https://images.unsplash.com/photo-1616712134548-d3c299c8f654?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    alt: "Tesla Model 3",
    mileage: "8,200 miles",
    location: "Mombasa",
  },
  {
    id: "sale-3",
    name: "2021 Toyota RAV4",
    price: "$28,750",
    imageUrl:
      "https://images.unsplash.com/photo-1549495146-ce745c117d98?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    alt: "Toyota RAV4",
    mileage: "25,000 miles",
    location: "Kisumu",
  },
  {
    id: "sale-4",
    name: "2020 Ford F-150",
    price: "$39,000",
    imageUrl:
      "https://images.unsplash.com/photo-1627918451996-51d02c817290?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    alt: "Ford F-150",
    mileage: "35,000 miles",
    location: "Nakuru",
  },
];

const featuredCarsForRent = [
  {
    id: "rent-1",
    name: "Compact Car Rental",
    price: "$50/day",
    imageUrl:
      "https://images.unsplash.com/photo-1502877338535-766e133d3c63?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    alt: "Compact rental car",
    type: "Toyota Yaris or similar",
    available: "Immediately",
  },
  {
    id: "rent-2",
    name: "SUV Adventure Rental",
    price: "$90/day",
    imageUrl:
      "https://images.unsplash.com/photo-1503376780353-75505cd9662f?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    alt: "SUV rental car",
    type: "Nissan X-Trail or similar",
    available: "Immediately",
  },
  {
    id: "rent-3",
    name: "Luxury Sedan Rental",
    price: "$150/day",
    imageUrl:
      "https://images.unsplash.com/photo-1558981359-219d63c639c3?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    alt: "Luxury sedan rental car",
    type: "BMW 5 Series or similar",
    available: "Next week",
  },
];

// Framer Motion variants for animations
const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  hover: { scale: 1.03, transition: { duration: 0.2 } },
};

// Next.js Image loader function
const imageLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

export default function FeaturedListings() {
  const [activeTab, setActiveTab] = useState("sale"); // 'sale' or 'rent'

  const currentListings =
    activeTab === "sale" ? featuredCarsForSale : featuredCarsForRent;

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-gray-50 to-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 drop-shadow-sm"
        >
          Your Next Journey Starts Here
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg md:text-xl text-gray-600 mb-12 max-w-3xl mx-auto"
        >
          Explore our handpicked selection of top-rated cars for sale and exceptional rental deals.
        </motion.p>

        {/* Tab / Toggle for Buy vs Rent */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="inline-flex bg-white p-2 rounded-full shadow-lg mb-12 border border-gray-100"
        >
          <button
            onClick={() => setActiveTab("sale")}
            className={`px-8 py-3 rounded-full text-lg font-semibold transition-all duration-300 ${
              activeTab === "sale"
                ? "bg-blue-600 text-white shadow-md"
                : "text-gray-800 hover:bg-gray-100"
            }`}
          >
            Cars for Sale
          </button>
          <button
            onClick={() => setActiveTab("rent")}
            className={`px-8 py-3 rounded-full text-lg font-semibold transition-all duration-300 ${
              activeTab === "rent"
                ? "bg-blue-600 text-white shadow-md"
                : "text-gray-800 hover:bg-gray-100"
            }`}
          >
            Cars for Rent
          </button>
        </motion.div>

        {/* Listings Grid */}
        <motion.div
          key={activeTab} // Key changes to re-trigger AnimatePresence on tab switch
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {currentListings.map((car) => (
            <motion.div
              key={car.id}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              whileHover="hover"
              viewport={{ once: true, amount: 0.3 }}
              className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 overflow-hidden group border border-gray-100"
            >
              <div className="relative w-full h-48 sm:h-56 overflow-hidden">
                <Image
                  src={car.imageUrl}
                  alt={car.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  className="object-cover object-center transform group-hover:scale-105 transition-transform duration-500 ease-out"
                  loader={imageLoader}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <span className="absolute bottom-3 left-4 text-white text-xl font-bold">
                  {car.price}
                </span>
              </div>
              <div className="p-5 text-left">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {car.name}
                </h3>
                {activeTab === "sale" && (
                  <>
                    <p className="text-gray-600 text-sm mb-1">
                      <span className="font-semibold">Mileage:</span>{" "}
                      {car.mileage}
                    </p>
                    <p className="text-gray-600 text-sm">
                      <span className="font-semibold">Location:</span>{" "}
                      {car.location}
                    </p>
                  </>
                )}
                {activeTab === "rent" && (
                  <>
                    <p className="text-gray-600 text-sm mb-1">
                      <span className="font-semibold">Type:</span> {car.type}
                    </p>
                    <p className="text-gray-600 text-sm">
                      <span className="font-semibold">Availability:</span>{" "}
                      {car.available}
                    </p>
                  </>
                )}
                <Link
                  href={`/${activeTab === "sale" ? "car" : "rental"}/${car.id}`}
                  className="mt-6 inline-flex items-center justify-center w-full px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  View Details
                  <ArrowRightIcon className="ml-2 -mr-1 h-5 w-5" />
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16"
        >
          <Link
            href={activeTab === "sale" ? "/cars" : "/rentals"}
            className="inline-flex items-center px-8 py-4 border border-transparent text-xl font-bold rounded-full shadow-lg text-blue-600 bg-white hover:bg-gray-50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            View All {activeTab === "sale" ? "Cars" : "Rentals"}
            <ArrowRightIcon className="ml-3 h-6 w-6" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}