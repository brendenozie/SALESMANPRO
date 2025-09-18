"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRightIcon } from '@heroicons/react/24/solid';
import { FireIcon, StarIcon } from '@heroicons/react/24/outline';

// Custom Tailwind colors for a vibrant theme
const tailwindColors = {
    primary: '#6366F1',
    'primary-light': '#818CF8',
    'primary-dark': '#4F46E5',
    'primary-accent': '#A78BFA',
};

// Framer Motion variants for a more dynamic entrance
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.2,
        },
    },
};

const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.6,
            ease: "easeOut",
        },
    },
};

// Placeholder for Location Item structure
const LocationItem = ({
    id,
    name,
    image,
    programs,
    rating,
    description,
    isNew,
}) => (
    <motion.a
        key={id}
        href={`/locations/${id}`}
        className="relative flex-shrink-0 w-[280px] sm:w-[320px] h-[350px] mx-4 rounded-3xl overflow-hidden shadow-2xl hover:shadow-primary-accent/40 transition-all duration-500 transform snap-center border border-gray-200"
        variants={cardVariants}
        whileHover={{
            scale: 1.05,
            rotate: 1,
            y: -10,
            boxShadow: '0 25px 50px -12px rgba(99, 102, 241, 0.5)',
            transition: { type: "spring", stiffness: 300, damping: 20 },
        }}
    >
        {/* Image with subtle hover effect and gradient overlay */}
        <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-110 transform transition-transform duration-700 ease-in-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-opacity duration-500" />

        {/* Content Block */}
        <div className="absolute bottom-0 left-0 p-6 text-white w-full">
            <h3 className="text-3xl font-extrabold mb-1 leading-tight">{name}</h3>
            {description && (
                <p className="text-sm text-gray-200 mb-3 line-clamp-2">{description}</p>
            )}
            <div className="flex items-center text-sm font-medium space-x-4">
                <span className="flex items-center text-primary-light">
                    <FireIcon className="h-4 w-4 mr-1" />
                    {programs} Programs
                </span>
                <span className="flex items-center text-yellow-400">
                    <StarIcon className="h-4 w-4 mr-1 fill-current" />
                    {rating.toFixed(1)}
                </span>
            </div>
        </div>

        {/* "New" Badge (if applicable) */}
        {isNew && (
            <span className="absolute top-4 right-4 px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full shadow-md z-10 animate-pulse">
                NEW
            </span>
        )}

        {/* Hover Arrow Overlay */}
        <motion.div
            className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity duration-300 pointer-events-none"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
        >
            <motion.div
                className="p-4 bg-white text-primary-dark rounded-full shadow-lg"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
            >
                <ArrowRightIcon className="h-8 w-8" />
            </motion.div>
        </motion.div>
    </motion.a>
);

const dummyLocations = [
    {
        id: 'loc1',
        name: 'Urban Core Fitness',
        image: 'https://placehold.co/600x400/818CF8/FFFFFF?text=Urban+Core',
        programs: 45,
        rating: 4.8,
        description: 'Cutting-edge equipment and dynamic group classes in the city center.',
        isNew: true,
    },
    {
        id: 'loc2',
        name: 'Zenith Yoga & Wellness',
        image: 'https://placehold.co/600x400/A78BFA/FFFFFF?text=Zenith+Yoga',
        programs: 30,
        rating: 4.9,
        description: 'A serene sanctuary for mind, body, and soul. Perfect for mindfulness.',
    },
    {
        id: 'loc3',
        name: 'The Boxing Den',
        image: 'https://placehold.co/600x400/4F46E5/FFFFFF?text=Boxing+Den',
        programs: 20,
        rating: 4.7,
        description: 'Unleash your inner fighter with high-energy boxing and HIIT sessions.',
    },
    {
        id: 'loc4',
        name: 'Pilates Haven Studio',
        image: 'https://placehold.co/600x400/6366F1/FFFFFF?text=Pilates+Haven',
        programs: 28,
        rating: 4.6,
        description: 'Precision Pilates focusing on core strength and flexibility.',
        isNew: true,
    },
    {
        id: 'loc5',
        name: 'CrossFit Inferno',
        image: 'https://placehold.co/600x400/818CF8/FFFFFF?text=CrossFit+Inferno',
        programs: 35,
        rating: 4.5,
        description: 'Push your limits with intense CrossFit workouts and a strong community.',
    },
    {
        id: 'loc6',
        name: 'Aqua Fitness Oasis',
        image: 'https://placehold.co/600x400/A78BFA/FFFFFF?text=Aqua+Fitness',
        programs: 15,
        rating: 4.7,
        description: 'Low-impact, high-results water workouts for all fitness levels.',
    },
];

// ----------------------------------------------------------------------------
// LocationsSection: Transformed into an intuitive, engaging, and innovative design
// ----------------------------------------------------------------------------
export default function LocationsSection({ locations = dummyLocations }) {
    return (
        <section className="py-16 bg-gradient-to-br from-white to-gray-50 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 md:px-8">
                <motion.h2
                    className="mb-12 text-4xl md:text-5xl font-extrabold text-center text-gray-900 leading-tight"
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    viewport={{ once: true, amount: 0.5 }}
                >
                    Discover Our <span className="text-primary-dark">Trending Studios</span> Near You <FireIcon className="h-8 w-8 inline-block text-orange-500 animate-bounce" />
                </motion.h2>

                {/* Carousel Container */}
                <motion.div
                    className="flex overflow-x-auto pb-6 -mx-4 md:-mx-8 scrollbar-hide snap-x snap-mandatory lg:justify-center"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.1 }}
                >
                    {locations.map((loc) => (
                        <LocationItem key={loc.id} {...loc} />
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
