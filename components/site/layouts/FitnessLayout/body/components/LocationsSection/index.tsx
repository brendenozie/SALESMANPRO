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
// LocationsSection: scrollable “Trending Studios & Locations” carousel
// ----------------------------------------------------------------------------
export default function  LocationsSection({ locations }:any) {
  return (
    <section className="py-12 px-4 md:px-8">
      <h2 className="mb-6 text-3xl font-bold text-center">Trending Studios & Locations</h2>
      <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
        {locations.map((loc:any) => (
          <motion.a
            key={loc.id}
            href={`#/locations/${loc.id}`}
            className="relative flex-shrink-0 w-64 h-40 rounded-2xl overflow-hidden shadow-md group"
            whileHover={{ scale: 1.03 }}
          >
            <Image
              src={loc.image}
              alt={loc.name}
              layout="fill"
              objectFit="cover"
              className="group-hover:brightness-75 transition"
              loader={loader}
            />
            <div className="absolute inset-0 bg-black bg-opacity-30" />
            <div className="absolute bottom-4 left-4 text-white">
              <h3 className="text-lg font-semibold">{loc.name}</h3>
              <p className="text-sm">{loc.programs} programs</p>
              <p className="text-sm">⭐ {loc.rating.toFixed(1)}</p>
            </div>
          </motion.a>
        ))}
      </div>
    </section>
  );
}