"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { MapPinIcon, StarIcon, FireIcon, ArrowRightIcon } from '@heroicons/react/24/solid'; // Using solid icons for punch

// Loader function (keep as is)
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
    `${src}?w=${width}&q=${quality || 75}`;

// Framer Motion variants (adjusted for this section's context)
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1, // Faster stagger for items in a carousel
            delayChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, x: -50 }, // Slide in from the left
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.5,
            ease: "easeOut",
        },
    },
};

// Placeholder for Location Item structure
interface LocationItem {
    id: string;
    name: string;
    image: string;
    programs: number;
    rating: number;
    description?: string; // Added description
    isNew?: boolean; // New flag for a 'New' badge
}

// Dummy data for demonstration
const dummyLocations: LocationItem[] = [
    {
        id: 'loc1',
        name: 'Urban Core Fitness',
        image: '/images/studio-urban-core.jpg', // Ensure these images exist
        programs: 45,
        rating: 4.8,
        description: 'Cutting-edge equipment and dynamic group classes in the city center.',
        isNew: true,
    },
    {
        id: 'loc2',
        name: 'Zenith Yoga & Wellness',
        image: '/images/studio-zenith-yoga.jpg',
        programs: 30,
        rating: 4.9,
        description: 'A serene sanctuary for mind, body, and soul. Perfect for mindfulness.',
    },
    {
        id: 'loc3',
        name: 'The Boxing Den',
        image: '/images/studio-boxing-den.jpg',
        programs: 20,
        rating: 4.7,
        description: 'Unleash your inner fighter with high-energy boxing and HIIT sessions.',
    },
    {
        id: 'loc4',
        name: 'Pilates Haven Studio',
        image: '/images/studio-pilates-haven.jpg',
        programs: 28,
        rating: 4.6,
        description: 'Precision Pilates focusing on core strength and flexibility.',
        isNew: true,
    },
    {
        id: 'loc5',
        name: 'CrossFit Inferno',
        image: '/images/studio-crossfit.jpg',
        programs: 35,
        rating: 4.5,
        description: 'Push your limits with intense CrossFit workouts and a strong community.',
    },
    {
        id: 'loc6',
        name: 'Aqua Fitness Oasis',
        image: '/images/studio-aqua.jpg',
        programs: 15,
        rating: 4.7,
        description: 'Low-impact, high-results water workouts for all fitness levels.',
    },
];

// ----------------------------------------------------------------------------
// LocationsSection: Transformed into an intuitive, engaging, and innovative design
// ----------------------------------------------------------------------------
export default function LocationsSection({ locations = dummyLocations }: { locations?: LocationItem[] }) {
    return (
        <section className="py-16 bg-white overflow-hidden"> {/* Increased padding, subtle background */}
            <div className="max-w-7xl mx-auto px-4 md:px-8">
                <motion.h2
                    className="mb-12 text-4xl md:text-5xl font-extrabold text-center text-gray-900 leading-tight"
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    viewport={{ once: true, amount: 0.5 }}
                >
                    Discover Our <span className="text-primary-dark">Trending Studios</span> Near You 🔥
                </motion.h2>

                {/* Carousel Container */}
                <motion.div
                    className="flex overflow-x-auto pb-6 -mx-4 md:-mx-8 scrollbar-hide snap-x snap-mandatory lg:justify-center" // Padded for edge items, hides scrollbar, enables snap
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.1 }}
                >
                    {locations.map((loc) => (
                        <motion.a
                            key={loc.id}
                            href={`/locations/${loc.id}`} // Using actual links
                            className="relative flex-shrink-0 w-[calc(100vw-32px)] sm:w-80 md:w-96 lg:w-80 h-[260px] md:h-[300px] mx-2 md:mx-4 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group snap-center border border-gray-100" // Increased size, roundness, shadow, hover effect, snap-center
                            variants={itemVariants}
                            whileHover={{ scale: 1.02 }}
                        >
                            {/* Image with subtle hover effect and gradient overlay */}
                            <Image
                                src={loc.image}
                                alt={loc.name}
                                fill
                                className="object-cover group-hover:scale-110 transform transition-transform duration-700 ease-in-out" // Slower, smoother image zoom
                                loader={loader}
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" // Image optimization
                                priority={loc.isNew || loc.rating > 4.8} // Prioritize loading based on "new" or high rating
                            />
                            {/* Darker gradient overlay for better text contrast */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                            {/* Content Block */}
                            <div className="absolute bottom-0 left-0 p-6 text-white w-full"> {/* Increased padding */}
                                <h3 className="text-2xl font-extrabold mb-1 leading-tight">{loc.name}</h3> {/* Larger, bolder name */}
                                {loc.description && (
                                    <p className="text-sm text-gray-200 mb-3 line-clamp-2">{loc.description}</p> // Added description with line clamp
                                )}
                                <div className="flex items-center text-sm font-medium space-x-4">
                                    <span className="flex items-center text-primary-light"> {/* Primary light for icons */}
                                        <MapPinIcon className="h-4 w-4 mr-1" />
                                        {loc.programs} Programs
                                    </span>
                                    <span className="flex items-center text-yellow-400"> {/* Yellow for stars */}
                                        <StarIcon className="h-4 w-4 mr-1" />
                                        {loc.rating.toFixed(1)}
                                    </span>
                                </div>
                            </div>

                            {/* "New" Badge (if applicable) */}
                            {loc.isNew && (
                                <span className="absolute top-4 right-4 px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full shadow-md z-10">
                                    NEW
                                </span>
                            )}

                            {/* Arrow overlay for better interaction (optional, but innovative) */}
                            <motion.div
                                className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" // Hidden by default, appears on hover
                                initial={{ opacity: 0 }}
                                whileHover={{ opacity: 1 }}
                            >
                                <motion.div
                                    className="p-3 bg-white text-primary-dark rounded-full shadow-lg"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
                                >
                                    <ArrowRightIcon className="h-6 w-6" />
                                </motion.div>
                            </motion.div>
                        </motion.a>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}

// Remember to update your tailwind.config.js with these colors if you haven't already:
/*
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6366F1', // A nice vibrant indigo
          light: '#818CF8',
          dark: '#4F46E5', // Slightly darker for accents/buttons
          hover: '#4338CA', // Even darker for hover states
          accent: '#A78BFA', // A brighter accent for highlights
        },
      },
    },
  },
  plugins: [],
}
*/