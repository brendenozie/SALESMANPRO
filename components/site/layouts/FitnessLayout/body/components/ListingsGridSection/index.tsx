"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image'; // Import Image from next/image
import { ArrowRightIcon, ScaleIcon, CurrencyDollarIcon, LightBulbIcon, UsersIcon } from '@heroicons/react/24/solid';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
    `${src}?w=${width}&q=${quality || 75}`;

// Framer Motion variants for staggered animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

// New variants for the feature icons
const iconVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "backOut",
    },
  },
};

 
// ----------------------------------------------------------------------------
// ListingsGrid: shows featured programs from storeFormData.listings
// ----------------------------------------------------------------------------
export default function  ListingsGrid({ listings }:any) {
  return (
    <section className="py-12 px-4 md:px-8 bg-gray-50">
      <h2 className="mb-8 text-3xl font-bold text-center">Featured Programs</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {listings.map((item:any) => (
          <motion.div
            key={item.id}
            className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
            whileHover={{ y: -5 }}
          >
            <div className="relative h-56 w-full">
              <Image
                src={item.imageUrl}
                alt={item.name}
                layout="fill"
                objectFit="cover"
                className="group-hover:scale-105 transform transition-transform"
                loader={loader}
              />
              {item.badge && (
                <span
                  className={`absolute top-3 left-3 px-2 py-1 text-xs font-semibold rounded-full ${
                    item.badge === "New"
                      ? "bg-green-500 text-white"
                      : item.badge === "Popular"
                      ? "bg-blue-500 text-white"
                      : "bg-red-500 text-white"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </div>

            <div className="p-4 flex flex-col space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
              <p className="text-sm text-gray-600">Instructor: {item.instructor}</p>
              <div className="mt-auto flex items-center justify-between">
                <span className="text-primary font-bold">{`$${item.price.toLocaleString()}`}</span>
                <button className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-dark transition">
                  Book Now
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}