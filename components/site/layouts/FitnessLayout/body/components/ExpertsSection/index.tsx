"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import {
    StarIcon, // For rating/expertise
    AcademicCapIcon, // For certifications
    ChatBubbleLeftRightIcon, // For direct contact
    LightBulbIcon, // For specialization/innovation
    ArrowRightIcon
} from '@heroicons/react/24/solid'; // Using solid icons for impact

// Loader function (keep as is)
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
    `${src}?w=${width}&q=${quality || 75}`;

// Framer Motion variants (adjusted for this section's context)
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15, // Slightly faster stagger for experts
            delayChildren: 0.2,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 60, rotateX: -10 }, // Fade in from below, subtle 3D rotation
    visible: {
        opacity: 1,
        y: 0,
        rotateX: 0,
        transition: {
            duration: 0.7, // Slower for more impact
            ease: "easeOut",
            damping: 12, // For a subtle spring effect
            stiffness: 100,
        },
    },
};

// Placeholder for Expert Item structure
interface ExpertItem {
    id: string;
    name: string;
    photo: string;
    specialty: string;
    experience: number;
    bioShort: string; // A short, engaging bio
    certifications?: string[]; // List of certifications
    rating?: number; // Optional rating for experts
    focusAreas?: string[]; // Specific areas of focus
}

// Dummy data for demonstration
const dummyExperts: ExpertItem[] = [
    {
        id: 'exp1',
        name: 'Dr. Anya Sharma',
        photo: '/images/expert-anya-sharma.jpg', // Ensure these images exist
        specialty: 'Clinical Nutritionist & Wellness Coach',
        experience: 12,
        bioShort: 'Empowering individuals to achieve optimal health through personalized nutrition plans and holistic wellness.',
        certifications: ['RDN', 'CWC', 'Integrative Nutrition'],
        rating: 4.9,
        focusAreas: ['Weight Management', 'Gut Health', 'Mindful Eating'],
    },
    {
        id: 'exp2',
        name: 'Coach Marcus "The Beast" Thorne',
        photo: '/images/expert-marcus-thorne.jpg',
        specialty: 'High-Performance Trainer & Sports Conditioning',
        experience: 9,
        bioShort: 'Transforms athletes and fitness enthusiasts with cutting-edge strength and conditioning programs.',
        certifications: ['CSCS', 'NASM-CPT', 'Olympic Weightlifting Lv2'],
        rating: 4.8,
        focusAreas: ['Strength Training', 'Endurance', 'Injury Prevention'],
    },
    {
        id: 'exp3',
        name: 'Emily Davis, E-RYT 500',
        photo: '/images/expert-emily-davis.jpg',
        specialty: 'Yoga & Mindfulness Instructor',
        experience: 15,
        bioShort: 'Guides students through transformative yoga practices, fostering inner peace and physical harmony.',
        certifications: ['E-RYT 500', 'Mindfulness Coach'],
        rating: 5.0,
        focusAreas: ['Vinyasa', 'Restorative Yoga', 'Meditation'],
    },
    {
        id: 'exp4',
        name: 'Javier Garcia',
        photo: '/images/expert-javier-garcia.jpg',
        specialty: 'Dance Fitness & Zumba Instructor',
        experience: 7,
        bioShort: 'Bringing the joy of movement and high-energy dance workouts to all levels.',
        certifications: ['Zumba Certified', 'AFAA Group Ex'],
        rating: 4.7,
        focusAreas: ['Cardio Dance', 'Latin Rhythms', 'Fun Workouts'],
    },
];

// ----------------------------------------------------------------------------
// ExpertsSection: Transformed for intuitive, engaging, captivating, and beautiful design
// ----------------------------------------------------------------------------
export default function ExpertsSection({ experts = dummyExperts }: { experts?: ExpertItem[] }) {
    return (
        <section className="py-20 bg-gradient-to-br from-purple-50 to-indigo-100 relative overflow-hidden"> {/* Deeper, richer gradient */}
            {/* Optional: Background abstract shapes */}
            <div className="absolute top-0 left-0 w-48 h-48 bg-primary-light opacity-10 rounded-full mix-blend-multiply filter blur-xl animate-blob" />
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-primary-accent opacity-10 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000" />

            <div className="max-w-7xl mx-auto px-4 md:px-8">
                <motion.h2
                    className="mb-16 text-4xl md:text-5xl font-extrabold text-center text-gray-900 leading-tight"
                    initial={{ opacity: 0, y: -30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    viewport={{ once: true, amount: 0.5 }}
                >
                    Meet Our <span className="text-primary-dark">World-Class Coaches & Experts</span> 🧠
                </motion.h2>

                <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10" // Increased gap for visual breathing room
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                >
                    {experts.map((exp) => (
                        <motion.div
                            key={exp.id}
                            className="bg-white rounded-3xl shadow-xl hover:shadow-2xl overflow-hidden flex flex-col items-center text-center p-8 transition-all duration-300 transform border border-gray-100 group relative" // Enhanced styling, border
                            whileHover={{ y: -7 }} // More pronounced lift on hover
                            variants={itemVariants} // Apply individual item animation
                        >
                            {/* Profile Image with Ring and Hover Effect */}
                            <div className="relative w-32 h-32 mb-6 md:mb-8 transform group-hover:scale-105 transition-transform duration-300"> {/* Larger image area, subtle scale on group hover */}
                                <Image
                                    src={exp.photo}
                                    alt={exp.name}
                                    fill
                                    className="rounded-full object-cover object-center ring-4 ring-primary-light ring-offset-4 ring-offset-white" // Circular, vibrant ring
                                    loader={loader}
                                    sizes="128px" // Specific size for avatar optimization
                                    priority={exp.rating && exp.rating >= 4.9} // Prioritize top-rated experts
                                />
                                {exp.rating && (
                                    <span className="absolute bottom-0 right-0 -mr-2 -mb-2 px-3 py-1 bg-yellow-400 text-gray-800 text-sm font-bold rounded-full shadow-md flex items-center">
                                        <StarIcon className="h-4 w-4 mr-1 text-yellow-700" /> {exp.rating.toFixed(1)}
                                    </span>
                                )}
                            </div>

                            {/* Expert Details */}
                            <h3 className="text-2xl font-extrabold text-gray-900 mb-2 leading-tight">{exp.name}</h3>
                            <p className="text-base font-semibold text-primary-dark mb-2">{exp.specialty}</p> {/* Highlight specialty */}
                            <p className="text-sm text-gray-600 mb-4 line-clamp-3">{exp.bioShort}</p> {/* Short bio with clamp */}

                            <div className="flex flex-wrap justify-center gap-2 mb-4">
                                {exp.focusAreas?.map((area, index) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full border border-gray-200"
                                    >
                                        {area}
                                    </span>
                                ))}
                            </div>

                            <div className="text-sm text-gray-500 mb-6">
                                <span className="font-semibold text-gray-700">{exp.experience}</span> years experience
                                {exp.certifications && exp.certifications.length > 0 && (
                                    <>
                                        {' | '}
                                        <span className="flex items-center justify-center gap-1 text-primary-light">
                                            <AcademicCapIcon className="h-4 w-4" />
                                            {exp.certifications.length} Certifications
                                        </span>
                                    </>
                                )}
                            </div>

                            {/* Call to Action Button */}
                            <motion.button
                                className="mt-auto px-8 py-3 bg-primary-dark text-white rounded-full font-semibold hover:bg-primary-hover transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2 w-full" // Full width button, robust styling
                                whileTap={{ scale: 0.95 }}
                                aria-label={`Schedule a consultation with ${exp.name}`}
                            >
                                <ChatBubbleLeftRightIcon className="h-5 w-5" />
                                <span>Schedule a Call</span>
                            </motion.button>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Call to action for becoming an expert or viewing more */}
                <motion.div
                    className="text-center mt-20"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    viewport={{ once: true, amount: 0.5 }}
                >
                    <a
                        href="/join-our-team" // Link to a "Join Our Team" or "Expert Directory" page
                        className="inline-flex items-center justify-center px-8 py-4 bg-gray-900 text-white text-lg font-semibold rounded-full shadow-lg hover:bg-gray-700 transition-all duration-300 transform hover:-translate-y-1"
                    >
                        Want to Become an Expert? Explore Opportunities
                        <ArrowRightIcon className="h-5 w-5 ml-3" />
                    </a>
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

// For the background blobs (optional, but adds a lot):
// Add this to your `tailwind.config.js` under `extend.keyframes` and `extend.animation`
// (You might need to install `tailwindcss-animate` if you haven't, or define these manually)

// In tailwind.config.js plugins array:
// require('tailwindcss-animate'),

// Keyframes:
// blob: {
//   '0%': { transform: 'translate(0px, 0px) scale(1)' },
//   '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
//   '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
//   '100%': { transform: 'translate(0px, 0px) scale(1)' },
// },

// Animation:
// animation: {
//   blob: 'blob 7s infinite cubic-bezier(0.6, 0.01, 0.4, 1)',
// },
*/