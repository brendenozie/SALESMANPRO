"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { StarIcon, TvIcon, UsersIcon } from '@heroicons/react/24/solid'; // Changed to solid icons for better visibility
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { PlayCircleIcon } from '@heroicons/react/24/solid';
import clsx from 'clsx'; // Utility for conditional classes

// --- Component and Type Definitions remain the same ---
// Define types based on your transformCompanyToStoreForm and Prisma schema
export type Course = {
  id: string; // Assuming an ID for each course
  title: string;
  description: string;
  imageUrl: string; // Changed from 'image' to 'imageUrl' for clarity and consistency
  gradeLevel?: string; // Changed from 'grade' to 'gradeLevel'
  averageRating?: number; // Changed from 'rating' to 'averageRating', now a number
  enrolledStudents?: number; // Changed from 'students' to 'enrolledStudents', now a number
  // Add other fields from your Course model if relevant for display
  ctaText?: string; // e.g., "Enroll Now"
  ctaLink?: string; // Link to the course details page
};


// --- Optimized image loader and error handler remain the same ---
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};
const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  e.currentTarget.onerror = null;
  e.currentTarget.src = "https://placehold.co/600x350/A0A0A0/FFFFFF?text=Course+Image";
};

// Placeholder for useStoreContext (or import actual context)
import { useStoreContext } from '@/contexts/StoreContext'; 
// import { Course } from '@prisma/client';

// --- Transformed Course Card Component ---
const CourseCard = ({ course, primaryColor, accentColor, cardItemVariants }: { course: Course, primaryColor: string, accentColor: string, cardItemVariants: any }) => {

    // Helper to render rating stars
    const renderRating = (rating: number) => {
        const fullStars = Math.floor(rating);
        const stars = [];
        for (let i = 0; i < 5; i++) {
            stars.push(
                <StarIcon 
                    key={i} 
                    className={clsx('w-4 h-4 transition-colors duration-300', {
                        'text-yellow-400': i < fullStars, // Use a consistent yellow for stars
                        'text-gray-300': i >= fullStars
                    })} 
                />
            );
        }
        return (
            <div className="flex items-center">
                {stars}
                <span className="ml-2 text-sm font-bold text-gray-800 dark:text-gray-200">
                    {rating.toFixed(1)}
                </span>
            </div>
        );
    };

    return (
        <motion.a
            href={course.ctaLink || '#'}
            target="_blank" // Open in new tab for better UX
            rel="noopener noreferrer"
            key={course.id}
            className="block h-full"
            variants={cardItemVariants}
        >
            <motion.div
                className={clsx(
                    "bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-xl border-4 border-transparent h-full",
                    "transform transition-all duration-300 group cursor-pointer relative"
                )}
                whileHover={{ 
                    scale: 1.05, 
                    boxShadow: `0 15px 30px ${primaryColor}40`,
                    border: '4px solid', // Re-apply border style on hover
                    borderColor: primaryColor // Set border color on hover
                }}
                whileTap={{ scale: 0.98 }}
            >
                {/* 1. Image & Tag-Ribbon */}
                <div className="relative w-full h-56 overflow-hidden">
                    <Image
                        src={course.imageUrl || 'https://placehold.co/600x350/A0A0A0/FFFFFF?text=Course+Image'}
                        alt={course.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        loader={loader}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        onError={handleImageError}
                    />
                    
                    {/* Tag-Ribbon (e.g., Grade Level) */}
                    {course.gradeLevel && (
                        <div 
                            className="absolute top-0 right-0 p-2 transform -translate-x-1/2 -translate-y-1/2"
                        >
                            <div 
                                className="px-4 py-1 text-sm font-bold text-white rounded-full shadow-lg" 
                                style={{ backgroundColor: accentColor }}
                            >
                                {course.gradeLevel}
                            </div>
                        </div>
                    )}

                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <PlayCircleIcon 
                            className="w-16 h-16 text-white text-opacity-80 group-hover:text-opacity-100 transition-transform duration-300 hover:scale-110" 
                            style={{ color: accentColor }} 
                        />
                    </div>
                </div>

                {/* 2. Content */}
                <div className="p-6 flex flex-col h-auto">
                    <h3 className="text-2xl font-extrabold mb-3 text-gray-900 dark:text-white transition-colors duration-300">
                        {course.title}
                    </h3>
                    
                    {/* Info Row: Prominent Stats */}
                    <div className="flex items-center text-sm gap-4 mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
                        {/* Rating */}
                        {course.averageRating !== undefined && renderRating(course.averageRating)}
                        
                        {/* Students */}
                        {course.enrolledStudents !== undefined && (
                            <span className="flex items-center gap-2 font-semibold text-gray-600 dark:text-gray-400">
                                <UsersIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" /> 
                                {course.enrolledStudents.toLocaleString()} Students
                            </span>
                        )}
                    </div>
                    
                    {/* Description */}
                    <p className="text-gray-600 dark:text-gray-400 text-base mb-6 leading-relaxed line-clamp-3 flex-grow">
                        {course.description}
                    </p>
                    
                    {/* CTA Button */}
                    <motion.button
                        whileHover={{ scale: 1.02, boxShadow: `0 5px 20px ${primaryColor}60` }}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full text-white py-3 rounded-lg text-lg font-extrabold 
                                    transition-all duration-300 shadow-lg focus:outline-none focus:ring-4 focus:ring-opacity-75`}
                        style={{
                            backgroundColor: primaryColor,
                            '--tw-ring-color': `${primaryColor} !important` 
                        }}
                    >
                        {course.ctaText || 'Enroll Now'}
                    </motion.button>
                </div>
            </motion.div>
        </motion.a>
    );
}


// Static fallback data for courses
const fallbackCourses: Course[] = [
  {
    id: 'fb-course-1',
    title: 'Introduction to Web Development',
    imageUrl: 'https://placehold.co/600x350/3498DB/FFFFFF?text=Web+Dev',
    description: 'Learn the basics of HTML, CSS, and JavaScript to build your first website.',
    gradeLevel: 'Beginner',
    averageRating: 4.7,
    enrolledStudents: 500,
    ctaText: 'Start Learning',
    ctaLink: '#',
  },
  {
    id: 'fb-course-2',
    title: 'Digital Marketing Essentials',
    imageUrl: 'https://placehold.co/600x350/2ECC71/FFFFFF?text=Digital+Marketing',
    description: 'Understand SEO, social media, and content marketing to grow your online presence.',
    gradeLevel: 'Intermediate',
    averageRating: 4.5,
    enrolledStudents: 300,
    ctaText: 'Discover Course',
    ctaLink: '#',
  },
  {
    id: 'fb-course-3',
    title: 'Graphic Design Masterclass',
    imageUrl: 'https://placehold.co/600x350/9B59B6/FFFFFF?text=Graphic+Design',
    description: 'Unleash your creativity with Photoshop, Illustrator, and InDesign.',
    gradeLevel: 'All Levels',
    averageRating: 4.9,
    enrolledStudents: 400,
    ctaText: 'View Details',
    ctaLink: '#',
  },
];

// --- Main CoursesSection Component ---
export default function CoursesSection({ storeFormData }: any) {
    // const { storeFormData } = useStoreContext();

    const primaryColor = storeFormData?.themeSettings?.primaryColor || '#fd2121';
    const accentColor = storeFormData?.themeSettings?.secondaryColor || '#FFC107'; 

    // Determine which courses to render: dynamic or fallback
    const coursesToRender = storeFormData?.courses && Array.isArray(storeFormData?.courses) && storeFormData.courses.length > 0
        ? storeFormData.courses
        : fallbackCourses;

    // ... (Animation variants remain the same) ...
    const containerVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 70,
                damping: 10,
                when: "beforeChildren",
                staggerChildren: 0.2
            },
        },
    };
    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 15
            },
        },
    };
    const cardItemVariants = {
        hidden: { opacity: 0, scale: 0.9 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 12
            },
        },
    };

    return (
        <div className="font-sans bg-gray-50 dark:bg-gray-900">
            {/* Main Courses Section */}
            <motion.section
                className="py-20 px-4 sm:px-6 lg:px-8 text-center"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={containerVariants}
            >
                {/* Heading */}
                <motion.div
                    className="mb-14 max-w-4xl mx-auto"
                    variants={itemVariants}
                >
                    <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-gray-900 dark:text-white leading-tight">
                        Our <span style={{ color: primaryColor }}>Flagship</span> Programs
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                        Discover a diverse range of programs crafted to ignite your passion and accelerate your career. Each course is designed for excellence and taught by industry experts.
                    </p>
                </motion.div>

                {/* Courses Grid */}
                <div className="grid gap-12 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
                    {coursesToRender.map((course: any) => (
                        <CourseCard 
                            key={course.id}
                            course={course}
                            primaryColor={primaryColor}
                            accentColor={accentColor}
                            cardItemVariants={cardItemVariants}
                        />
                    ))}
                </div>

                {/* Call to Action for More Courses */}
                <motion.div variants={itemVariants} className="mt-16">
                    <a
                        href="/all-courses" // Link to the full course catalog
                        className={`inline-flex items-center text-lg font-bold py-3 px-8 rounded-lg transition-colors duration-300 border-2`}
                        style={{ color: primaryColor, borderColor: primaryColor }}
                    >
                        View All {coursesToRender.length}+ Courses
                        <ChevronRightIcon className="w-5 h-5 ml-2" />
                    </a>
                </motion.div>

            </motion.section>
        </div>
    );
}