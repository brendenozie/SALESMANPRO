"use client";

import React from 'react';
import { motion } from 'framer-motion';
import {
    HeartIcon,
    ClockIcon,
    MapPinIcon,
    ArrowRightIcon,
    UserCircleIcon // Using a user icon for the company/instructor
} from '@heroicons/react/24/outline';

// Framer Motion variants for a more dynamic feel
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.8 },
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

// Course data interface to match your provided structure
interface Course {
    id: string;
    title: string;
    description: string;
    imageUrl: string | null;
    credits: number;
    code: string;
    rating: number | null;
    price: number;
    duration: string;
    status: string;
    companyId: string;
    departmentId: string | null;
    createdAt: string;
    updatedAt: string;
}

// Placeholder data using the new course structure
const dummyCourses: Course[] = [
    {
        id: '68930d82f3c63cdfd45db3b3',
        title: 'Beginner Yoga & Mindfulness',
        description: 'A gentle introduction to yoga postures, breathing techniques, and meditation to reduce stress.',
        imageUrl: "https://placehold.co/600x400/1e293b/d1d5db?text=Yoga+Class",
        credits: 0,
        code: 'YOGA-101',
        rating: 4.8,
        price: 50,
        duration: '60 Minutes',
        status: 'ACTIVE',
        companyId: '683581bba1bdf6ca3624b541',
        departmentId: null,
        createdAt: '2025-08-06T08:08:34.257Z',
        updatedAt: '2025-08-06T08:08:34.257Z'
    },
    {
        id: '9f5a7c2e1b8a4f9d5e6b2c8a',
        title: 'High-Intensity Interval Training',
        description: 'Maximize your calorie burn and improve cardiovascular health with this dynamic, full-body workout.',
        imageUrl: "https://placehold.co/600x400/22c55e/f0fdf4?text=HIIT+Class",
        credits: 0,
        code: 'HIIT-201',
        rating: 4.9,
        price: 75,
        duration: '45 Minutes',
        status: 'ACTIVE',
        companyId: '683581bba1bdf6ca3624b541',
        departmentId: null,
        createdAt: '2025-08-07T09:15:20.120Z',
        updatedAt: '2025-08-07T09:15:20.120Z'
    },
    {
        id: 'c3b2f8a1e9d6c7b5a4d3f2e1',
        title: 'Strength & Conditioning',
        description: 'Build functional strength and endurance with a mix of weightlifting and bodyweight exercises.',
        imageUrl: "https://placehold.co/600x400/0f172a/f8fafc?text=Weight+Training",
        credits: 0,
        code: 'STR-301',
        rating: null,
        price: 100,
        duration: '90 Minutes',
        status: 'ACTIVE',
        companyId: '683581bba1bdf6ca3624b541',
        departmentId: null,
        createdAt: '2025-08-08T10:30:45.980Z',
        updatedAt: '2025-08-08T10:30:45.980Z'
    },
    {
        id: 'd8e4f5a3b2c1d9e8f7a6b5c4',
        title: 'Virtual Pilates for Core',
        description: 'Strengthen your core and improve flexibility with precise, low-impact movements from home.',
        imageUrl: "https://placehold.co/600x400/dc2626/fef2f2?text=Pilates+Online",
        credits: 0,
        code: 'PIL-101',
        rating: 4.5,
        price: 65,
        duration: '50 Minutes',
        status: 'ACTIVE',
        companyId: '683581bba1bdf6ca3624b541',
        departmentId: null,
        createdAt: '2025-08-09T11:40:00.560Z',
        updatedAt: '2025-08-09T11:40:00.560Z'
    },
];

export default function ListingsGrid({ courses = dummyCourses }: { courses?: Course[] }) {
    return (
        <section className="py-16 px-4 md:px-8 bg-gray-950 relative">
            <div className="max-w-7xl mx-auto">
                <motion.h2
                    className="mb-12 text-4xl md:text-5xl font-extrabold text-center text-white leading-tight"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                >
                    Explore Our <span className="text-purple-500">Curated Courses</span> ✨
                </motion.h2>

                <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                >
                    {courses.map((course) => (
                        <motion.div
                            key={course.id}
                            className="group relative bg-gray-900 rounded-3xl overflow-hidden shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 transform hover:-translate-y-2 cursor-pointer border border-gray-800"
                            variants={itemVariants}
                            whileHover={{ scale: 1.02 }}
                        >
                            {/* Image with overlay and badge */}
                            <div className="relative h-60 w-full overflow-hidden">
                                <img
                                    src={course.imageUrl || `https://placehold.co/600x400/111827/9ca3af?text=No+Image`}
                                    alt={course.title}
                                    className="object-cover w-full h-full group-hover:scale-110 transform transition-transform duration-500 ease-in-out"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent" />

                                {/* Price Badge */}
                                <div className="absolute top-4 left-4 z-10">
                                  <motion.span
                                      className="px-4 py-2 text-sm font-bold rounded-full bg-purple-600 text-white shadow-lg"
                                      initial={{ opacity: 0, scale: 0.5 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      transition={{ duration: 0.3, delay: 0.3 }}
                                  >
                                      ${course.price.toLocaleString()}
                                  </motion.span>
                                </div>
                                
                                {/* Favorite button */}
                                <motion.button
                                    className="absolute top-4 right-4 z-10 p-2 rounded-full bg-gray-800/70 backdrop-blur-sm text-gray-300 hover:text-white hover:bg-purple-600 transition-all duration-200"
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    whileTap={{ scale: 0.9 }}
                                    aria-label="Add to favorites"
                                >
                                    <HeartIcon className="h-5 w-5" />
                                </motion.button>
                            </div>

                            {/* Content Area */}
                            <div className="p-6 flex flex-col space-y-3">
                                <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors duration-200">{course.title}</h3>
                                <p className="text-sm text-gray-400 leading-snug">{course.description}</p>

                                {/* Metadata Icons */}
                                <div className="flex items-center text-gray-500 text-sm gap-4">
                                    {course.duration && (
                                        <div className="flex items-center">
                                            <ClockIcon className="h-4 w-4 mr-1 text-purple-400" />
                                            <span>{course.duration}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center">
                                        <UserCircleIcon className="h-4 w-4 mr-1 text-purple-400" />
                                        <span>{course.companyId}</span>
                                    </div>
                                </div>

                                {/* Rating (if available) */}
                                {course.rating && (
                                    <div className="flex items-center text-sm font-bold text-yellow-400">
                                        <span className="mr-1">⭐</span>
                                        <span>{course.rating.toFixed(1)}</span>
                                    </div>
                                )}

                                <div className="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between">
                                    <motion.button
                                        className="px-6 py-3 bg-purple-600 text-white rounded-full text-base font-semibold hover:bg-purple-700 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
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
                        href="/all-programs"
                        className="inline-flex items-center justify-center px-8 py-4 bg-gray-800 text-white text-lg font-semibold rounded-full shadow-lg hover:bg-gray-700 transition-all duration-300 transform hover:-translate-y-1"
                    >
                        View All Programs
                        <ArrowRightIcon className="h-5 w-5 ml-3" />
                    </a>
                </motion.div>
            </div>
        </section>
    );
}
