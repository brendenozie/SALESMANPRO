"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import {
    HeartIcon, // For 'Add to Favorites' or 'Like'
    ClockIcon, // For duration
    UserIcon, // For instructor
    MapPinIcon, // For location
    TagIcon, // For price or type
    ArrowRightIcon
} from '@heroicons/react/24/outline'; // Using outline for a lighter look, consider solid if you prefer boldness

// Loader function (keep as is)
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
    `${src}?w=${width}&q=${quality || 75}`;

// Framer Motion variants (keep as is, or slightly tweak for this section)
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1, // Slightly faster stagger for cards
            delayChildren: 0.2,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.8 }, // Fade in from slightly below, with a subtle scale up
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

// Placeholder for Listing Item structure (you'll get this from your data)
interface ListingItem {
    id: string;
    name: string;
    imageUrl: string;
    instructor: string;
    price: number;
    badge?: 'New' | 'Popular' | 'Limited'; // Added 'Limited' as a potential badge
    duration?: number; // Added duration
    location?: string; // Added location
    description?: string; // Added a short description
}

// Dummy data for demonstration
const dummyListings: ListingItem[] = [
    {
        id: '1',
        name: 'Morning Yoga Flow',
        imageUrl: '/images/yoga-flow.jpg', // Ensure you have these images in your public folder
        instructor: 'Emily Davis',
        price: 25,
        badge: 'Popular',
        duration: 60,
        location: 'Studio A',
        description: 'Start your day with invigorating stretches and mindful breathing.'
    },
    {
        id: '2',
        name: 'High-Intensity Cardio Blast',
        imageUrl: '/images/cardio-blast.jpg',
        instructor: 'Marcus Thorne',
        price: 35,
        badge: 'New',
        duration: 45,
        location: 'Main Gym',
        description: 'Maximize your burn with this dynamic, full-body cardio workout.'
    },
    {
        id: '3',
        name: 'Strength & Conditioning',
        imageUrl: '/images/strength-conditioning.jpg',
        instructor: 'Coach Ben',
        price: 40,
        badge: 'Limited',
        duration: 75,
        location: 'Weight Room',
        description: 'Build muscle and endurance with expert-led weight training.'
    },
    {
        id: '4',
        name: 'Mindful Meditation Session',
        imageUrl: '/images/meditation.jpg',
        instructor: 'Sarah Lee',
        price: 20,
        duration: 30,
        location: 'Zen Room',
        description: 'Find inner peace and reduce stress in this calming session.'
    },
    {
        id: '5',
        name: 'Pilates Core Sculpt',
        imageUrl: '/images/pilates.jpg',
        instructor: 'Olivia Chen',
        price: 30,
        duration: 50,
        location: 'Studio B',
        description: 'Strengthen your core and improve flexibility with precise movements.'
    },
    {
        id: '6',
        name: 'Virtual Dance Fitness',
        imageUrl: '/images/dance-fitness.jpg',
        instructor: 'Javier Garcia',
        price: 18,
        badge: 'Popular',
        duration: 45,
        location: 'Online',
        description: 'Dance your way to fitness from the comfort of your home!'
    },
    {
        id: '7',
        name: 'Nutritional Coaching Workshop',
        imageUrl: '/images/nutrition-coaching.jpg',
        instructor: 'Dr. Anya Sharma',
        price: 60,
        duration: 90,
        location: 'Online Webinar',
        description: 'Learn sustainable eating habits for a healthier lifestyle.'
    },
    {
        id: '8',
        name: 'Outdoor Bootcamp Challenge',
        imageUrl: '/images/bootcamp.jpg',
        instructor: 'Captain Alex',
        price: 45,
        badge: 'New',
        duration: 60,
        location: 'Park Grounds',
        description: 'Take your workout outdoors with this challenging bootcamp!'
    },
];

// ----------------------------------------------------------------------------
// ListingsGrid: Transformed for intuitive, engaging, and visually stunning design
// ----------------------------------------------------------------------------
export default function ListingsGrid({ listings = dummyListings }: { listings?: ListingItem[] }) {
    return (
        <section className="py-16 px-4 md:px-8 bg-gradient-to-br from-gray-50 to-gray-100 relative"> {/* Enhanced background gradient */}
            <div className="max-w-7xl mx-auto">
                <motion.h2
                    className="mb-12 text-4xl md:text-5xl font-extrabold text-center text-gray-900 leading-tight"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                >
                    Explore Our <span className="text-primary-dark">Featured Programs</span> ✨
                </motion.h2>

                <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8" // Increased gap
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible" // Animate when in view
                    viewport={{ once: true, amount: 0.2 }} // Only animate once when 20% in view
                >
                    {listings.map((item) => (
                        <motion.div
                            key={item.id}
                            className="group relative bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer border border-gray-100" // More pronounced rounded corners, stronger shadow, subtle lift and border
                            variants={itemVariants} // Apply item animation
                            whileHover={{ scale: 1.02 }} // Subtle scale on hover for individual cards
                        >
                            {/* Image with overlay and badge */}
                            <div className="relative h-60 w-full overflow-hidden"> {/* Increased height */}
                                <Image
                                    src={item.imageUrl}
                                    alt={item.name}
                                    fill
                                    className="object-cover group-hover:scale-110 transform transition-transform duration-500 ease-in-out" // More dramatic hover scale on image
                                    loader={loader}
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // Optimize image loading
                                    priority={item.badge === 'Popular' || item.badge === 'New'} // Prioritize loading for popular/new items
                                />
                                {/* Gradient overlay for better text readability and visual depth */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                                {/* Badge */}
                                {item.badge && (
                                    <span
                                        className={`absolute top-4 left-4 px-3 py-1 text-xs font-bold rounded-full shadow-md z-10 ${
                                            item.badge === "New"
                                                ? "bg-green-600 text-white" // Brighter green for 'New'
                                                : item.badge === "Popular"
                                                ? "bg-primary text-white" // Use primary color for 'Popular'
                                                : item.badge === "Limited"
                                                ? "bg-red-500 text-white" // Distinct color for 'Limited'
                                                : "bg-gray-700 text-white"
                                        }`}
                                    >
                                        {item.badge}
                                    </span>
                                )}

                                {/* Favorite button (optional) */}
                                <motion.button
                                    className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/70 backdrop-blur-sm text-gray-700 hover:text-red-500 hover:bg-white transition-all duration-200"
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    whileTap={{ scale: 0.9 }}
                                    aria-label="Add to favorites"
                                >
                                    <HeartIcon className="h-5 w-5" />
                                </motion.button>
                            </div>

                            {/* Content Area */}
                            <div className="p-6 flex flex-col space-y-3"> {/* Increased padding, slightly more space */}
                                <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-dark transition-colors duration-200">{item.name}</h3>
                                <p className="text-sm text-gray-600 leading-snug">{item.description}</p> {/* Added description */}

                                <div className="flex items-center text-gray-500 text-sm">
                                    <UserIcon className="h-4 w-4 mr-1 text-primary-light" />
                                    <span>{item.instructor}</span>
                                </div>
                                {item.duration && (
                                    <div className="flex items-center text-gray-500 text-sm">
                                        <ClockIcon className="h-4 w-4 mr-1 text-primary-light" />
                                        <span>{item.duration} minutes</span>
                                    </div>
                                )}
                                {item.location && (
                                    <div className="flex items-center text-gray-500 text-sm">
                                        <MapPinIcon className="h-4 w-4 mr-1 text-primary-light" />
                                        <span>{item.location}</span>
                                    </div>
                                )}

                                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between"> {/* Separator line */}
                                    <span className="text-2xl font-extrabold text-primary-dark">{`$${item.price.toLocaleString()}`}</span>
                                    <motion.button
                                        className="px-6 py-3 bg-primary-dark text-white rounded-full text-base font-semibold hover:bg-primary-hover transition-all duration-300 transform hover:scale-105 flex items-center space-x-2" // More prominent button, rounded, larger
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <span>Book Now</span>
                                        <ArrowRightIcon className="h-4 w-4" />
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Call to action for more listings */}
                <motion.div
                    className="text-center mt-16"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    viewport={{ once: true, amount: 0.5 }}
                >
                    <a
                        href="/all-programs" // Link to your full programs page
                        className="inline-flex items-center justify-center px-8 py-4 bg-gray-900 text-white text-lg font-semibold rounded-full shadow-lg hover:bg-gray-700 transition-all duration-300 transform hover:-translate-y-1"
                    >
                        View All Programs
                        <ArrowRightIcon className="h-5 w-5 ml-3" />
                    </a>
                </motion.div>
            </div>
        </section>
    );
}